import { formatAvatar } from "../../lib/data_utils";
import { getObservationsObservers } from "../../lib/inat_api";
import { iNatUserUrl } from "../../lib/inat_data";
import { loggerTime } from "../../lib/logger";
import { createPagination } from "../../lib/pagination";
import { createSpinner } from "../../lib/spinner";
import type { ObservationsObserversResult } from "../../types/inat_api";

export let perPage = 100;

export async function fetchAndRenderData(
  currentPage: number,
  perPage: number,
  paginationcCallback: (currentPage: number) => void,
) {
  let containerEl = document.querySelector(".observers-table-container");
  if (!containerEl) return;

  let spinner = createSpinner();
  spinner.start();

  const t1 = performance.now();
  let data = await getAPIData(currentPage, perPage);
  const t10 = performance.now();
  loggerTime(`api ${t10 - t1} milliseconds`);

  spinner.stop();

  if (data) {
    containerEl.innerHTML = "";

    let pagination1 = createPagination(
      data.per_page,
      data.page,
      // iNat API only returns first 500 records
      Math.min(data.total_results, 500),
      paginationcCallback,
    );
    containerEl.appendChild(pagination1);

    let tableEl = createTable(data.results, currentPage, perPage);
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
}

async function getAPIData(currentPage: number, perPage: number) {
  try {
    let data = await getObservationsObservers(
      window.location.search,
      perPage,
      currentPage,
    );
    if (!data) return;

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
      <a href="${iNatUserUrl}/${row.user.login}">${formatAvatar(row.user.icon_url)}</a>
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

export function paginationcCallback(num: number) {
  fetchAndRenderData(num, perPage, paginationcCallback);
}
