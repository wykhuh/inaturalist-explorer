import { getObservationsSpecies } from "../../lib/inat_api";
import { loggerTime } from "../../lib/logger";
import { createPagination } from "../../lib/pagination";
import { createSpinner } from "../../lib/spinner";
import type { DataComponent } from "../../types/app";
import type { SpeciesCountResult } from "../../types/inat_api";

export let perPage = 50;

export async function fetchAndRenderData(
  currentPage: number,
  perPage: number,
  paginationcCallback: (currentPage: number) => void,
) {
  let containerEl = document.querySelector(".species-list-container");
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
      data.total_results,
      paginationcCallback,
    );
    containerEl.appendChild(pagination1);

    let tableEl = createGrid(data.results);
    containerEl.appendChild(tableEl);

    let pagination2El = createPagination(
      data.per_page,
      data.page,
      data.total_results,
      paginationcCallback,
    );
    containerEl.appendChild(pagination2El);
  }
}

async function getAPIData(currentPage: number, perPage: number) {
  try {
    let data = await getObservationsSpecies(
      window.location.search,
      perPage,
      currentPage,
    );
    if (!data) return;

    return data;
  } catch (error) {
    console.error("ViewSpecies getAPIData ERROR:", error);
  }
}

function createGrid(results: SpeciesCountResult[]) {
  let containerEl = document.createElement("div");
  containerEl.className = "species-list grid-auto-fill";

  results.forEach((row) => {
    let cardEl = document.createElement(
      "x-card-species",
    ) as unknown as DataComponent;
    cardEl.data = row;
    containerEl.appendChild(cardEl);
  });

  return containerEl;
}

export function paginationcCallback(num: number) {
  fetchAndRenderData(num, perPage, paginationcCallback);
}
