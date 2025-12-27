import {
  cleanupIdentificationsObserversParams,
  cleanupObervationsObserversParams,
} from "../../lib/cleanup_params_utils";
import { renderUser } from "../../lib/render_utils";
import {
  getIdentificationsObservers,
  getObservationsObservers,
} from "../../lib/inat_api";
import { loggerTime } from "../../lib/logger";
import { createSpinner } from "../../lib/spinner";
import type {
  IdentificationsObserversResult,
  ObservationsObserversResult,
} from "../../types/inat_api";
import { updateAppUrl } from "../../lib/utils";
import type { DataComponentType, AppStoreType } from "../../types/app";
import { observers } from "../../data/inat_api_cache";
import { isIdentificationsObserversResult } from "../../types/utils";
import {
  isIdentificationsCheck,
  isObservationsCheck,
  replaceWithCacheImages,
} from "../../lib/data_utils";

// BUG: iNat /v1/identifications/observers API
// - returns 0 results for any page greater than 1.
// - returns only 100 observers
// https://api.inaturalist.org/v1/identifications/observers?page=2&per_page=25
export let perPage = 200;

export async function fetchAndRenderData(
  perPage: number,
  paginationCallback: (
    currentPage: number,
    appStore: AppStoreType,
  ) => Promise<void>,
  appStore: AppStoreType,
) {
  let containerEl = document.querySelector(".observers-table-container");
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

  // HACK: iNat API only returns first 500 record for observations and 100 for identifications
  let totalCount = isObservationsCheck(appStore)
    ? Math.min(data.total_results, 500)
    : Math.min(data.total_results, 100);

  let pagination1 = document.createElement(
    "app-pagination",
  ) as unknown as DataComponentType;
  pagination1.data = {
    perPage: data.per_page,
    currentPage: data.page,
    totalRecords: totalCount,
    paginationCallback,
  };
  containerEl.appendChild(pagination1);

  let page = 1;
  if (isObservationsCheck(appStore)) {
    page = appStore.observationsApiParams.page || 1;
  } else {
    page = appStore.identificationsApiParams.page || 1;
  }

  let tableEl;
  if (isIdentificationsObserversResult(data.results)) {
    tableEl = createIdentificationsTable(data.results, page, perPage);
  } else {
    tableEl = createTable(data.results, page, perPage);
  }
  containerEl.appendChild(tableEl);

  let pagination2 = document.createElement(
    "app-pagination",
  ) as unknown as DataComponentType;
  pagination2.data = {
    perPage: data.per_page,
    currentPage: data.page,
    totalRecords: totalCount,
    paginationCallback,
    scrollToSelector: ".observers-table-container",
  };
  containerEl.appendChild(pagination2);
}

async function getAPIData(perPage: number, appStore: AppStoreType) {
  if (import.meta.env?.VITE_CACHE === "true") {
    let page = isObservationsCheck(appStore)
      ? appStore.observationsApiParams.page
      : appStore.identificationsApiParams.page;
    replaceWithCacheImages(observers.results);

    return { ...observers, page: page || 1 };
  }

  try {
    let data;
    if (isIdentificationsCheck(appStore)) {
      let params = cleanupIdentificationsObserversParams(appStore);
      data = await getIdentificationsObservers(params, perPage);
    } else if (isObservationsCheck(appStore)) {
      let params = cleanupObervationsObserversParams(appStore);
      data = await getObservationsObservers(params, perPage);
    }

    return data;
  } catch (error) {
    console.error("ViewObservers getAPIData ERROR:", error);
  }
}

function createTable(
  results: ObservationsObserversResult[],
  currentPage: number,
  perPage: number,
) {
  let tableEl = document.createElement("table") as HTMLElement;
  tableEl.className = "observers-table table";

  let rowEl = document.createElement("tr");

  let tdEl = document.createElement("th");
  tdEl.textContent = "Rank";
  rowEl.appendChild(tdEl);

  tdEl = document.createElement("th");
  tdEl.textContent = "User";
  rowEl.appendChild(tdEl);

  tdEl = document.createElement("th");
  tdEl.textContent = "Observations";
  rowEl.appendChild(tdEl);

  tdEl = document.createElement("th");
  tdEl.textContent = "Species";
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
    tdEl.textContent = row.observation_count.toLocaleString();
    rowEl.appendChild(tdEl);

    tdEl = document.createElement("td");
    tdEl.textContent = row.species_count.toLocaleString();
    rowEl.appendChild(tdEl);

    tableEl.appendChild(rowEl);
  });

  return tableEl;
}

function createIdentificationsTable(
  results: IdentificationsObserversResult[],
  currentPage: number,
  perPage: number,
) {
  let tableEl = document.createElement("table") as HTMLElement;
  tableEl.className = "observers-table table";

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

export async function paginationCallback(num: number, appStore: AppStoreType) {
  if (isObservationsCheck(appStore)) {
    appStore.observationsApiParams = {
      ...appStore.observationsApiParams,
      page: num,
    };
    appStore.viewMetadata.observations_observers = {
      ...appStore.viewMetadata.observations_observers,
      page: num,
    };
  } else {
    appStore.identificationsApiParams = {
      ...appStore.identificationsApiParams,
      page: num,
    };
    appStore.viewMetadata.identifications_observers = {
      ...appStore.viewMetadata.identifications_observers,
      page: num,
    };
  }

  // HACK: update store
  appStore.viewMetadata = appStore.viewMetadata;

  await fetchAndRenderData(perPage, paginationCallback, appStore);
  updateAppUrl(window.location, appStore);
}
