import {
  cleanupIdentificationsObserversParams,
  cleanupObervationsObserversParams,
} from "../../lib/cleanup_params_utils";
import { formatAvatar } from "../../lib/render_utils";
import {
  getIdentificationsObservers,
  getObservationsObservers,
} from "../../lib/inat_api";
import { iNatUserUrl } from "../../data/inat_data";
import { loggerTime } from "../../lib/logger";
import { createPagination } from "../../lib/pagination";
import { createSpinner } from "../../lib/spinner";
import type {
  IdentificationsObserversResult,
  ObservationsObserversResult,
} from "../../types/inat_api";
import { updateAppUrl } from "../../lib/utils";
import type { MapStore } from "../../types/app";
import { observers } from "../../data/inat_api_cache";
import { isIdentificationsObserversResult } from "../../types/utils";
import {
  isIdentificationsCheck,
  isObservationsCheck,
} from "../../lib/data_utils";

export let perPage = 25;

export async function fetchAndRenderData(
  perPage: number,
  paginationCallback: (
    currentPage: number,
    appStore: MapStore,
  ) => Promise<void>,
  appStore: MapStore,
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

  let pagination1 = createPagination(
    data.per_page,
    data.page,
    // iNat API only returns first 500 records
    Math.min(data.total_results, 500),
    appStore,
    paginationCallback,
  );
  containerEl.appendChild(pagination1);

  let page = appStore.observationsApiParams.page || 1;
  let tableEl;
  if (isIdentificationsObserversResult(data.results)) {
    tableEl = createIdentificationsTable(data.results, page, perPage);
  } else {
    tableEl = createTable(data.results, page, perPage);
  }
  containerEl.appendChild(tableEl);

  let pagination2El = createPagination(
    data.per_page,
    data.page,
    // iNat API only returns first 500 records
    Math.min(data.total_results, 500),
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
    tdEl.innerHTML = `<span class="avatar-name">
      <a href="${iNatUserUrl}/${row.user.login}">${formatAvatar(row.user)}</a>
      <a href="${iNatUserUrl}/${row.user.login}">${row.user.login}</a>
    </span>`;
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
    tdEl.innerHTML = `<span class="avatar-name">
      <a href="${iNatUserUrl}/${row.user.login}">${formatAvatar(row.user)}</a>
      <a href="${iNatUserUrl}/${row.user.login}">${row.user.login}</a>
    </span>`;
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
