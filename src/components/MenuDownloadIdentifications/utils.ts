import { formatInatApiParams } from "../../lib/cleanup_params_utils";
import { formatIdentificationsApiUrl } from "../../lib/inat_api";
import {
  addCommastoNumbers,
  convertObjectArrayToCSVString,
  downloadBlob,
  sleep,
} from "../../lib/utils";
import type { AppStoreType, IdentificationsCSVRow } from "../../types/app";
import type { IdentificationsResult } from "../../types/inat_api";
import {
  fetchAllData,
  formatAPIUrl,
  formatFilename,
  getCountForQuery,
  MAX_DOWNLOADS,
  renderInvalidFormData,
} from "../MenuDownloadObservations/shared_utils";

export async function downloadIdentificationsHandler(
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

  let filename = formatFilename(formData);
  if (!filename) return;

  let params = formatInatApiParams(appStore);
  let url = formatIdentificationsApiUrl(params);

  // check identification count
  if (await identificationMaxObservationMessage(url, componentContext)) {
    return;
  }

  // fetch and formmat data
  let callback = (totalResults: number | null) => {
    containerEl.innerHTML = "";
    let itemEl = document.createElement("div");
    if (totalResults === null) {
      itemEl.innerText = `Please use searches and filters to lower the identifications count to less than ${addCommastoNumbers(MAX_DOWNLOADS)}`;
    } else {
      itemEl.innerText = `${totalResults} records remaining...`;
    }
    containerEl.append(itemEl);
  };
  let records = (await fetchAllData(url, callback)) as IdentificationsResult[];
  if (!records) return;

  let normalizeData = processIdentificationResults(records);

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

export function processIdentificationResults(results: IdentificationsResult[]) {
  let records: IdentificationsCSVRow[] = [];
  results.forEach((result) => {
    let record = {
      identification_id: result.id,
      identification_uuid: result.uuid,
      identification_created_at: result.created_at,
      identifier_login: result.user.login,
      identifier_id: result.user.id,
      identification_body: result.body,
      identification_category: result.category,
      identification_current: result.current,
      identification_current_taxon: result.current_taxon,
      identification_disagreement: result.disagreement,
      identification_hidden: result.hidden,
      identification_own_observation: result.own_observation,
      identification_spam: result.spam,
      identification_vision: result.vision,
    } as IdentificationsCSVRow;

    let identification = result.observation.identifications.find(
      (ident) => ident.id === result.id,
    );
    if (identification) {
      if (identification.taxon) {
        record.identification_taxon_id = identification.taxon.id;
        record.identification_taxon_rank = identification.taxon.rank;
        record.identification_taxon_name = identification.taxon.name;
        record.identification_taxon_preferred_common_name =
          identification.taxon.preferred_common_name;
      }
    }

    record = {
      ...record,
      observation_id: result.observation.id,
      observation_uuid: result.observation.uuid,
      observation_created_at: result.observation.created_at,
      observation_observed_on: result.observation.observed_on,
      observer_login: result.observation.user.login,
      observer_id: result.observation.user.id,
      observation_quality_grade: result.observation.quality_grade,
      observation_taxon_id: result.observation.taxon.id,
      observation_taxon_name: result.observation.taxon.name,
      observation_taxon_preferred_common_name:
        result.observation.taxon.preferred_common_name,
    } as IdentificationsCSVRow;

    record.observation_photos_count = result.observation.photos.length;
    if (result.observation.photos.length > 0) {
      record.observation_photo_url = result.observation.photos[0].url?.replace(
        "square",
        "large",
      );
      record.observation_photo_license_code =
        result.observation.photos[0].license_code;
      record.observation_photo_attribution =
        result.observation.photos[0].attribution;
    } else {
      record.observation_photo_url = "";
      record.observation_photo_license_code = "";
      record.observation_photo_attribution = "";
    }

    record.observation_sounds_count = result.observation.sounds.length;
    if (result.observation.sounds.length > 0) {
      record.observation_sound_url = result.observation.sounds[0].file_url;
      record.observation_sound_type =
        result.observation.sounds[0].file_content_type;
      record.observation_sound_license_code =
        result.observation.sounds[0].license_code;
      record.observation_sound_attribution =
        result.observation.sounds[0].attribution;
    } else {
      record.observation_sound_url = "";
      record.observation_sound_type = "";
      record.observation_sound_license_code = "";
      record.observation_sound_attribution = "";
    }

    records.push(record);
  });
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
    return errors;
  }

  return errors;
}

export async function identificationMaxObservationMessage(
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
      `The are ${addCommastoNumbers(count)} identifications. ` +
      `Please use searches and filters to lower the identifications count to less than ${addCommastoNumbers(MAX_DOWNLOADS)}`;

    return true;
  }
}
