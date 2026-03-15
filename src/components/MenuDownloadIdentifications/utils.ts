import { identifications as identificationsDemo } from "../../data/api/identifications";
import { formatInatApiParams } from "../../lib/cleanup_params_utils";
import { formatIdentificationsApiUrl } from "../../lib/inat_api";
import {
  addCommastoNumbers,
  convertObjectArrayToCSVString,
  downloadBlob,
  sleep,
} from "../../lib/utils";
import type { AppStoreType, IdentificationsCSVRow } from "../../types/app";
import type {
  IdentificationsAPI,
  IdentificationsResult,
} from "../../types/inat_api";

export const MAX_DOWNLOADS = 200;

export async function downloadIdentificationsHandler(
  formData: FormData,
  appStore: AppStoreType,
  componentContext: HTMLElement,
) {
  let containerEl =
    componentContext.querySelector<HTMLDivElement>("#status-container");
  if (!containerEl) return;

  // form validation
  if (renderInvalidFormData(formData, componentContext)) {
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
  let records = await fetchAllData(url, callback);
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

// ==============
// get data
// ==============

async function fetchAllData(
  url: string,
  callback: (totalResults: number | null) => void,
) {
  let perPage = 50;
  let lastId = null;
  let looping = true;

  let records: IdentificationsResult[] = [];
  let count = 0;

  while (looping) {
    let updatedUrl = formatAPIUrl(url, perPage, lastId);
    let data = await fetchData(updatedUrl);
    // NOTE: This second check for MAX_DOWNLOADS might be redunant.
    if (data.total_results > MAX_DOWNLOADS) {
      callback(null);
      return;
    }

    if (import.meta.env?.VITE_CACHE === "true") {
      data.total_results = perPage * 2.1 - count * perPage;
    }
    callback(data.total_results);

    records = records.concat(data.results);
    lastId = getIdForLastRow(data.results);

    if (data.total_results <= perPage) {
      looping = false;
    }
    count += 1;
    await sleep(2);
  }
  return records;
}

async function fetchData(url: string) {
  if (import.meta.env?.VITE_CACHE === "true") {
    return {
      results: identificationsDemo.results,
      total_results: 1,
    };
  }

  let response = await fetch(url);
  let data = (await response.json()) as IdentificationsAPI;
  return { results: data.results, total_results: data.total_results };
}

function getIdForLastRow(results: IdentificationsResult[]) {
  return results[results.length - 1].id;
}

export function processIdentificationResults(results: IdentificationsResult[]) {
  let records: IdentificationsCSVRow[] = [];
  results.forEach((result) => {
    let record = {
      identification_id: result.id,
      identification_uuid: result.uuid,
      created_at: result.created_at,
      identifier_login: result.user.login,
      identifier_id: result.user.id,
      body: result.body,
      category: result.category,
      current: result.current,
      own_observation: result.own_observation,
      vision: result.vision,
      disagreement: result.disagreement,
      spam: result.spam,
      hidden: result.hidden,
      current_taxon: result.current_taxon,
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
      record.observation_photo_url = result.observation.photos[0].url.replace(
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
// misc
// ==============

export function formatAPIUrl(
  url: string,
  perPage: number,
  lastId: number | null,
) {
  let urlData = new URL(url);
  urlData.searchParams.delete("order");
  urlData.searchParams.delete("order_by");
  urlData.searchParams.set("per_page", perPage.toString());
  if (lastId !== null) {
    urlData.searchParams.set("id_below", lastId.toString());
  }

  return urlData.toString();
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

function renderInvalidFormData(
  formData: FormData,
  componentContext: HTMLElement,
) {
  let errors = validateFormData(formData);
  if (errors.length > 0) {
    let statusEl =
      componentContext.querySelector<HTMLDivElement>("#status-container");
    if (statusEl) {
      statusEl.innerText = errors.join("<br>");
    }
  }

  return errors.length > 0;
}

export async function identificationMaxObservationMessage(
  url: string,
  componentContext: HTMLElement,
) {
  let perPage = 0;
  let lastId = null;
  let updatedUrl = formatAPIUrl(url as string, perPage, lastId);

  let count = await getIdentificationsCount(updatedUrl);
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

export async function getIdentificationsCount(url: string) {
  if (import.meta.env?.VITE_CACHE === "true") {
    return MAX_DOWNLOADS - 1;
  }

  let response = await fetch(url);
  let json = (await response.json()) as IdentificationsAPI;
  return json.total_results;
}

function formatFilename(formData: FormData) {
  let filename = formData.get("filename");
  if (!filename) return;

  filename = filename.toString();
  if (!filename.endsWith("csv")) {
    filename = `${filename}.csv`;
  }

  return filename;
}
