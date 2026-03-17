import { formatInatApiParams } from "../../lib/cleanup_params_utils";
import { formatObservationsApiUrl } from "../../lib/inat_api";
import {
  addCommastoNumbers,
  convertObjectArrayToCSVString,
  downloadBlob,
  sleep,
} from "../../lib/utils";
import type { AppStoreType, ObservationsCSVRow } from "../../types/app";
import type { Annotation, ObservationsResult } from "../../types/inat_api";
import {
  fetchAllData,
  formatAPIUrl,
  formatFilename,
  getCountForQuery,
  renderInvalidFormData,
  renderInvalidParams,
} from "./shared_utils";

export const MAX_DOWNLOADS = 200;

export async function downloadAnnotationsHandler(
  formData: FormData,
  appStore: AppStoreType,
  componentContext: HTMLElement,
) {
  let containerEl =
    componentContext.querySelector<HTMLDivElement>("#status-container");
  if (!containerEl) return;

  // form validation
  if (renderInvalidFormData(formData, componentContext, validateFormData)) {
    return;
  }

  if (renderInvalidParams(appStore, componentContext, validateParams)) {
    return;
  }

  let filename = formatFilename(formData);
  if (!filename) return;

  let params = formatInatApiParams(appStore);
  let url = formatObservationsApiUrl(params);

  // check count
  if (await observationsMaxObservationMessage(url, componentContext)) {
    return;
  }

  // fetch and formmat data
  let callback = (totalResults: number | null) => {
    containerEl.innerHTML = "";
    let itemEl = document.createElement("div");
    if (totalResults === null) {
      itemEl.innerText = `Please use searches and filters to lower the observations count to less than ${addCommastoNumbers(MAX_DOWNLOADS)}`;
    } else {
      itemEl.innerText = `${totalResults} records remaining...`;
    }
    containerEl.append(itemEl);
  };
  let records = (await fetchAllData(
    url,
    callback,
  )) as unknown as ObservationsResult[];
  if (!records) return;

  let filteredRecords = filterObservationsByAnnotations(records, appStore);
  let normalizeData = processAnnotationsResults(filteredRecords);

  // create and download csv
  let csvRows = convertObjectArrayToCSVString(normalizeData);

  containerEl.innerHTML = "";
  let divEl = document.createElement("div");
  divEl.innerText = "File is saved your computer.";
  containerEl.appendChild(divEl);
  await sleep(2);
  downloadBlob(csvRows, filename, "text/csv;charset=utf-8;");

  await sleep(5);
  divEl.innerHTML = "";
}

// ==============
// get data
// ==============

export function filterObservationsByAnnotations(
  results: ObservationsResult[],
  appStore: AppStoreType,
) {
  if (
    appStore.observationsApiParams.term_id === undefined &&
    appStore.observationsApiParams.term_id_or_unknown === undefined
  )
    return [];

  // get term ids
  let termIds: number[] = [];
  if (appStore.observationsApiParams.term_id) {
    termIds = termIds.concat(
      appStore.observationsApiParams.term_id
        .toString()
        .split(",")
        .map((id) => Number(id)),
    );
  }
  if (appStore.observationsApiParams.term_id_or_unknown) {
    termIds = termIds.concat(
      appStore.observationsApiParams.term_id_or_unknown
        .toString()
        .split(",")
        .map((id) => Number(id)),
    );
  }

  // get term values ids
  let termValuesIds: number[] = [];
  if (appStore.observationsApiParams.term_value_id) {
    termValuesIds = termValuesIds.concat(
      appStore.observationsApiParams.term_value_id
        .toString()
        .split(",")
        .map((id) => Number(id)),
    );
  }

  let resultsWithAnnotations: ObservationsResult[] = [];
  if (termIds.length > 0) {
    // filter observations by term ids and term value id
    resultsWithAnnotations = results
      .filter((result) => {
        if (result.annotations) {
          return result.annotations.some((annotation) => {
            if (
              termIds.includes(annotation.controlled_attribute_id) &&
              termValuesIds.includes(annotation.controlled_value_id)
            ) {
              return true;
            } else if (
              termIds.includes(annotation.controlled_attribute_id) &&
              termValuesIds.length === 0
            ) {
              return true;
            } else {
              return false;
            }
          });
        } else {
          return false;
        }
      })
      .map((result) => {
        let filteredAnnotation: Annotation[] = [];
        if (result.annotations) {
          filteredAnnotation = result.annotations.filter((annotation) => {
            return (
              (termIds.includes(annotation.controlled_attribute_id) &&
                termValuesIds.includes(annotation.controlled_value_id)) ||
              (termIds.includes(annotation.controlled_attribute_id) &&
                termValuesIds.length === 0)
            );
          });
        }
        return { ...result, annotations: filteredAnnotation };
      });
  }
  return resultsWithAnnotations;
}

export function processAnnotationsResults(results: ObservationsResult[]) {
  let records: ObservationsCSVRow[] = [];
  results.forEach((result) => {
    let record = {
      observation_id: result.id,
      observation_uuid: result.uuid,
      observation_created_at: result.created_at,
      observation_observed_on: result.observed_on,
      observer_login: result.user.login,
      observer_id: result.user.id,
      observation_quality_grade: result.quality_grade,
      observation_taxon_id: result.taxon.id,
      observation_taxon_name: result.taxon.name,
      observation_taxon_preferred_common_name:
        result.taxon.preferred_common_name,
    } as ObservationsCSVRow;

    record.observation_photos_count = result.photos.length;
    if (result.photos.length > 0) {
      let photo = result.photos[0];
      if (photo && photo.url) {
        record.observation_photo_url = photo.url.replace("square", "large");
        record.observation_photo_license_code = photo.license_code;
        record.observation_photo_attribution = photo.attribution;
      }
    } else {
      record.observation_photo_url = "";
      record.observation_photo_license_code = "";
      record.observation_photo_attribution = "";
    }

    record.observation_sounds_count = result.sounds.length;
    if (result.sounds.length > 0) {
      record.observation_sound_url = result.sounds[0].file_url;
      record.observation_sound_type = result.sounds[0].file_content_type;
      record.observation_sound_license_code = result.sounds[0].license_code;
      record.observation_sound_attribution = result.sounds[0].attribution;
    } else {
      record.observation_sound_url = "";
      record.observation_sound_type = "";
      record.observation_sound_license_code = "";
      record.observation_sound_attribution = "";
    }

    record.annotations_count = result.annotations
      ? result.annotations.length
      : 0;

    if (result.annotations && result.annotations.length > 0) {
      result.annotations.forEach((annotation) => {
        record.annotation_controlled_attribute_id =
          annotation.controlled_attribute_id;
        record.annotation_controlled_value_id = annotation.controlled_value_id;
        record.annotator_id = annotation.user.id;
        record.annotator_login = annotation.user.login;
        record.annotation_uuid = annotation.uuid;
        record.annotation_vote_score = annotation.vote_score;

        // HACK: need to clone record so that the record for each iteration
        // gets the correct annotation
        records.push(structuredClone(record));
      });
    } else {
      records.push(record);
    }
  });
  console.log(records);

  return records;
}

// ==============
// user input validation
// ==============

function validateFormData(formData: FormData) {
  let errors: string[] = [];
  let filename = formData.get("filename");
  if (!filename) {
    errors.push("filename is required");
  }

  return errors;
}

function validateParams(appStore: AppStoreType) {
  let errors: string[] = [];

  if (
    appStore.observationsApiParams.term_id === undefined &&
    appStore.observationsApiParams.term_id_or_unknown === undefined
  ) {
    errors.push("term_id is required");
  }

  return errors;
}

export async function observationsMaxObservationMessage(
  url: string,
  componentContext: HTMLElement,
) {
  let perPage = 0;
  let lastId = null;
  let updatedUrl = formatAPIUrl(url as string, perPage, lastId);

  let count = await getCountForQuery(updatedUrl);
  if (count > MAX_DOWNLOADS) {
    let container =
      componentContext.querySelector<HTMLDivElement>("#status-container");
    if (!container) return;

    container.innerHTML = "";

    container.innerText =
      `The are ${addCommastoNumbers(count)} observations. ` +
      `Please use searches and filters to lower the observations count to less than ${addCommastoNumbers(MAX_DOWNLOADS)}`;

    return true;
  }
}
