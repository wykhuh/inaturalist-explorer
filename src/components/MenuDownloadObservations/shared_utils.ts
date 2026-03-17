import { identifications as identificationsDemo } from "../../data/api/identifications";
import { observations_fields_annotations } from "../../data/api/observations";
import { sleep } from "../../lib/utils";
import type { AppStoreType } from "../../types/app";
import type {
  IdentificationsAPI,
  IdentificationsResult,
  ObservationsResult,
} from "../../types/inat_api";

export const MAX_DOWNLOADS = 200;

type iNatAPI = {
  total_results: number;
  page: number;
  per_page: number;
  results: IdentificationsResult[] | ObservationsResult[];
};

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
// get data
// ==============

export async function fetchAllData(
  url: string,
  callback: (totalResults: number | null) => void,
) {
  let perPage = 50;
  let lastId = null;
  let looping = true;

  let records: any[] = [];
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
    if (url.includes("/identifications/")) {
      return {
        results: identificationsDemo.results,
        total_results: 1,
      };
    } else {
      return {
        results: observations_fields_annotations.results,
        total_results: 1,
      };
    }
  }

  let response = await fetch(url);
  let data = (await response.json()) as iNatAPI;
  return { results: data.results, total_results: data.total_results };
}

function getIdForLastRow(
  results: IdentificationsResult[] | ObservationsResult[],
) {
  return results[results.length - 1].id;
}

export function renderInvalidFormData(
  formData: FormData,
  componentContext: HTMLElement,
  validateFormFn: any,
) {
  let errors = validateFormFn(formData);
  if (errors.length > 0) {
    let statusEl =
      componentContext.querySelector<HTMLDivElement>("#status-container");
    if (statusEl) {
      statusEl.innerText = errors.join("<br>");
    }
  }

  return errors.length > 0;
}

export function renderInvalidParams(
  appStore: AppStoreType,
  componentContext: HTMLElement,
  validateParamsFn: any,
) {
  let errors = validateParamsFn(appStore);

  if (errors.length > 0) {
    let statusEl =
      componentContext.querySelector<HTMLDivElement>("#status-container");
    if (statusEl) {
      statusEl.innerText = errors.join("<br>");
    }
  }

  return errors.length > 0;
}

export async function getCountForQuery(url: string) {
  if (import.meta.env?.VITE_CACHE === "true") {
    return MAX_DOWNLOADS - 1;
  }

  let response = await fetch(url);
  let json = (await response.json()) as IdentificationsAPI;
  return json.total_results;
}

export function formatFilename(formData: FormData) {
  let filename = formData.get("filename");
  if (!filename) return;

  filename = filename.toString();
  if (!filename.endsWith("csv")) {
    filename = `${filename}.csv`;
  }

  return filename;
}
