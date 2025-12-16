import {
  cleanupIdentificationParams,
  cleanupObervationsParams,
} from "../../lib/cleanup_params_utils";
import { formatAvatar } from "../../lib/render_utils";
import {
  getIdentificationsIdentifiers,
  getObservationsIdentifiers,
} from "../../lib/inat_api";
import { iNatUserUrl } from "../../data/inat_data";
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
} from "../../lib/data_utils";

export let perPage = 25;

export async function fetchAndRenderData(
  perPage: number,
  paginationcCallback: (currentPage: number) => Promise<void>,
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

  let pagination1 = createPagination(
    data.per_page,
    data.page,
    // iNat API only returns first 500 records
    Math.min(data.total_results, 500),
    paginationcCallback,
  );
  containerEl.appendChild(pagination1);

  let page = appStore.observationsApiParams.page || 1;
  let tableEl = createTable(data.results, page, perPage);
  containerEl.appendChild(tableEl);

  let pagination2El = createPagination(
    data.per_page,
    data.page,
    // iNat API only returns first 500 records
    Math.min(data.total_results, 500),
    paginationcCallback,
  );
  containerEl.appendChild(pagination2El);
}

async function getAPIData(perPage: number, appStore: MapStore) {
  if (import.meta.env?.VITE_CACHE === "true") {
    return identifiers;
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

export async function paginationcCallback(num: number) {
  if (isObservationsCheck(window.app.store)) {
    window.app.store.observationsApiParams = {
      ...window.app.store.observationsApiParams,
      page: num,
    };
    window.app.store.viewMetadata.observations_identifiers = {
      ...window.app.store.viewMetadata.observations_identifiers,
      page: num,
    };
  } else {
    window.app.store.identificationsApiParams = {
      ...window.app.store.identificationsApiParams,
      page: num,
    };
    window.app.store.viewMetadata.identifications_identifiers = {
      ...window.app.store.viewMetadata.identifications_identifiers,
      page: num,
    };
  }

  // HACK: update store
  window.app.store.viewMetadata = window.app.store.viewMetadata;

  await fetchAndRenderData(perPage, paginationcCallback, window.app.store);
  updateAppUrl(window.location, window.app.store);
}
