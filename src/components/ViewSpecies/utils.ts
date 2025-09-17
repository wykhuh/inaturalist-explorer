import { threatenedSpecies } from "../../data/inat_api_cache";
import { cleanupObervationsParams } from "../../lib/data_utils";
import { getObservationsSpecies } from "../../lib/inat_api";
import { loggerTime } from "../../lib/logger";
import { createPagination } from "../../lib/pagination";
import { createSpinner } from "../../lib/spinner";
import { updateAppUrl } from "../../lib/utils";
import type { DataComponent } from "../../types/app";
import type { SpeciesCountResult } from "../../types/inat_api";

export let perPage = 48;

export async function fetchAndRenderData(
  perPage: number,
  paginationcCallback: (currentPage: number) => void,
) {
  let containerEl = document.querySelector(".species-list-container");
  if (!containerEl) return;

  let spinner = createSpinner();
  spinner.start();

  const t1 = performance.now();
  let data = await getAPIData(perPage);

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

async function getAPIData(perPage: number) {
  if (import.meta.env.VITE_CACHE === "true") {
    return threatenedSpecies;
  }

  let params = cleanupObervationsParams(window.location.search);

  try {
    let data = await getObservationsSpecies(params, perPage);
    if (!data) return;

    return data;
  } catch (error) {
    console.error("ViewSpecies getAPIData ERROR:", error);
  }
}

function createGrid(results: SpeciesCountResult[]) {
  let containerEl = document.createElement("div");
  containerEl.className = "species-grid grid-auto-fill";

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
  window.app.store.inatApiParams = {
    ...window.app.store.inatApiParams,
    page: num,
  };
  window.app.store.viewMetadata.species = {
    ...window.app.store.viewMetadata.species,
    page: num,
  };

  fetchAndRenderData(perPage, paginationcCallback);
  updateAppUrl(window.location, window.app.store);
}
