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
import { createSpinner } from "../../lib/spinner";
import type { ResourceIdentifiersResult } from "../../types/inat_api";
import { updateAppUrl } from "../../lib/utils";
import type { DataComponentType, AppStoreType } from "../../types/app";
import { identifiers } from "../../data/api/observations";
import {
  isIdentificationsCheck,
  isObservationsCheck,
  replaceWithCacheImages,
} from "../../lib/data_utils";

export async function fetchAndRenderData(
  paginationCallback: (
    currentPage: number,
    appStore: AppStoreType,
  ) => Promise<void>,
  appStore: AppStoreType,
) {
  let containerEl = document.querySelector(".identifiers-table-container");
  if (!containerEl) return;

  let spinner = createSpinner();
  spinner.start();

  const t1 = performance.now();
  let data = await getAPIData(appStore);
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

  let tableEl = createTable(data.results, page, data.per_page);
  containerEl.appendChild(tableEl);

  let pagination2 = document.createElement(
    "app-pagination",
  ) as unknown as DataComponentType;
  pagination2.data = {
    perPage: data.per_page,
    currentPage: data.page,
    totalRecords: totalCount,
    paginationCallback,
    scrollToSelector: ".identifiers-table-container",
  };
  containerEl.appendChild(pagination2);
}

async function getAPIData(appStore: AppStoreType) {
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
      data = await getIdentificationsIdentifiers(params);
    } else if (isObservationsCheck(appStore)) {
      let params = cleanupObervationsParams(appStore);
      data = await getObservationsIdentifiers(params);
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

export async function paginationCallback(num: number, appStore: AppStoreType) {
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

  await fetchAndRenderData(paginationCallback, appStore);
  updateAppUrl(window.location, appStore);
}
