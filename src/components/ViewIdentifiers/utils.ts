import {
  cleanupIdentificationParams,
  cleanupObervationsParams,
} from "../../lib/cleanup_params_utils";
import { renderUser } from "../../lib/render_utils";
import {
  getIdentificationsIdentifiers,
  getObservationsIdentifiers,
} from "../../lib/inat_api";
import { loggerTime } from "../../lib/logger";
import { createPagination } from "../../lib/pagination";
import { createSpinner } from "../../lib/spinner";
import type { ResourceIdentifiersResult } from "../../types/inat_api";
import { updateAppUrl } from "../../lib/utils";
import type { MapStore } from "../../types/app";
import { identifiers } from "../../data/inat_api_cache";
import {
  isIdentificationsCheck,
  isObservationsCheck,
  replaceWithCacheImages,
} from "../../lib/data_utils";

export let perPage = 200;

export async function fetchAndRenderData(
  perPage: number,
  paginationCallback: (
    currentPage: number,
    appStore: MapStore,
  ) => Promise<void>,
  appStore: MapStore,
) {
  let containerEl = document.querySelector(".identifiers-table-container");
  if (!containerEl) return;

  let spinner = createSpinner();
  spinner.start();

  const t1 = performance.now();
  let data = await getAPIData(perPage, appStore);
  const t10 = performance.now();
  loggerTime(`api ${t10 - t1} milliseconds`);

  spinner.stop();

  if (!data) return;
  if (data.results.length == 0) {
    containerEl.innerHTML = "No records found";
    return;
  }

  containerEl.innerHTML = "";

  // HACK: iNat API only returns first 500 record
  let totalCount = Math.min(data.total_results, 500);

  let pagination1 = createPagination(
    data.per_page,
    data.page,
    totalCount,
    appStore,
    paginationCallback,
  );
  containerEl.appendChild(pagination1);

  let page = 1;
  if (isObservationsCheck(appStore)) {
    page = appStore.observationsApiParams.page || 1;
  } else {
    page = appStore.identificationsApiParams.page || 1;
  }

  let tableEl = createTable(data.results, page, perPage);
  containerEl.appendChild(tableEl);

  let pagination2El = createPagination(
    data.per_page,
    data.page,
    totalCount,
    appStore,
    paginationCallback,
  );
  containerEl.appendChild(pagination2El);
}

async function getAPIData(perPage: number, appStore: MapStore) {
  if (import.meta.env?.VITE_CACHE === "true") {
    let page = isObservationsCheck(appStore)
      ? appStore.observationsApiParams.page
      : appStore.identificationsApiParams.page;

    replaceWithCacheImages(identifiers.results);
    return { ...identifiers, page: page || 1 };
  }

  try {
    let data;
    if (isIdentificationsCheck(appStore)) {
      let params = cleanupIdentificationParams(appStore);
      data = await getIdentificationsIdentifiers(params, perPage);
    } else if (isObservationsCheck(appStore)) {
      let params = cleanupObervationsParams(appStore);
      data = await getObservationsIdentifiers(params, perPage);
    }

    return data;
  } catch (error) {
    console.error("ViewIdentifiers getAPIData ERROR:", error);
  }
}

function createTable(
  results: ResourceIdentifiersResult[],
  currentPage: number,
  perPage: number,
) {
  let tableEl = document.createElement("table") as HTMLElement;
  tableEl.className = "identifiers-table table";

  let rowEl = document.createElement("tr");

  let tdEl = document.createElement("th");
  tdEl.textContent = "Rank";
  rowEl.appendChild(tdEl);

  tdEl = document.createElement("th");
  tdEl.textContent = "User";
  rowEl.appendChild(tdEl);

  tdEl = document.createElement("th");
  tdEl.textContent = "Identifications";
  rowEl.appendChild(tdEl);

  tableEl.appendChild(rowEl);

  results.forEach((row, i) => {
    let rowEl = document.createElement("tr");

    let tdEl = document.createElement("td");
    tdEl.textContent = (1 + i + (currentPage - 1) * perPage).toString();
    rowEl.appendChild(tdEl);

    tdEl = document.createElement("td");
    tdEl.innerHTML = renderUser(row.user);
    rowEl.appendChild(tdEl);

    tdEl = document.createElement("td");
    tdEl.textContent = row.count.toLocaleString();
    rowEl.appendChild(tdEl);

    tableEl.appendChild(rowEl);
  });

  return tableEl;
}

export async function paginationCallback(num: number, appStore: MapStore) {
  if (isObservationsCheck(appStore)) {
    appStore.observationsApiParams = {
      ...appStore.observationsApiParams,
      page: num,
    };
    appStore.viewMetadata.observations_identifiers = {
      ...appStore.viewMetadata.observations_identifiers,
      page: num,
    };
  } else {
    appStore.identificationsApiParams = {
      ...appStore.identificationsApiParams,
      page: num,
    };
    appStore.viewMetadata.identifications_identifiers = {
      ...appStore.viewMetadata.identifications_identifiers,
      page: num,
    };
  }

  // HACK: update store
  appStore.viewMetadata = appStore.viewMetadata;

  await fetchAndRenderData(perPage, paginationCallback, appStore);
  updateAppUrl(window.location, appStore);
}
