import { threatenedSpecies } from "../../data/inat_api_cache";
import {
  cleanupIdentificationParams,
  cleanupObervationsParams,
} from "../../lib/cleanup_params_utils";
import {
  isIdentificationsCheck,
  isObservationsCheck,
} from "../../lib/data_utils";
import {
  getIdentificationsSpecies,
  getObservationsSpecies,
} from "../../lib/inat_api";
import { loggerTime } from "../../lib/logger";
import { createPagination } from "../../lib/pagination";
import { createSpinner } from "../../lib/spinner";
import { updateAppUrl } from "../../lib/utils";
import type { DataComponent, MapStore } from "../../types/app";
import type {
  IdentificationsResult,
  ResourceSpeciesCountResult,
} from "../../types/inat_api";

export let perPage = 24;

export async function fetchAndRenderData(
  perPage: number,
  paginationcCallback: (currentPage: number) => Promise<void>,
  appStore: MapStore,
) {
  let containerEl = document.querySelector(".species-list-container");
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
    data.total_results,
    paginationcCallback,
  );
  containerEl.appendChild(pagination1);

  let tableEl = createGrid(data.results, appStore);
  containerEl.appendChild(tableEl);

  let pagination2El = createPagination(
    data.per_page,
    data.page,
    data.total_results,
    paginationcCallback,
  );
  containerEl.appendChild(pagination2El);
}

async function getAPIData(perPage: number, appStore: MapStore) {
  if (import.meta.env?.VITE_CACHE === "true") {
    return threatenedSpecies;
  }

  try {
    let data;
    if (isIdentificationsCheck(appStore)) {
      let params = cleanupIdentificationParams(appStore);
      data = await getIdentificationsSpecies(params, perPage);
    } else if (isObservationsCheck(appStore)) {
      let params = cleanupObervationsParams(appStore);
      data = await getObservationsSpecies(params, perPage);
    }

    return data;
  } catch (error) {
    console.error("ViewSpecies getAPIData ERROR:", error);
  }
}

function createGrid(
  results: ResourceSpeciesCountResult[] | IdentificationsResult[],
  appStore: MapStore,
) {
  let containerEl = document.createElement("div");
  containerEl.className = "species-grid grid-auto-fill";

  results.forEach((row) => {
    let cardEl = document.createElement(
      "card-species",
    ) as unknown as DataComponent;
    cardEl.data = row;
    cardEl.record_type = appStore.record_type;
    containerEl.appendChild(cardEl);
  });

  return containerEl;
}

export async function paginationcCallback(num: number) {
  if (isObservationsCheck(window.app.store)) {
    window.app.store.observationsApiParams = {
      ...window.app.store.observationsApiParams,
      page: num,
    };
    window.app.store.viewMetadata.observations_species = {
      ...window.app.store.viewMetadata.observations_species,
      page: num,
    };
  } else {
    window.app.store.identificationsApiParams = {
      ...window.app.store.identificationsApiParams,
      page: num,
    };
    window.app.store.viewMetadata.identifications_species = {
      ...window.app.store.viewMetadata.identifications_species,
      page: num,
    };
  }

  // HACK: update store
  window.app.store.viewMetadata = window.app.store.viewMetadata;

  await fetchAndRenderData(perPage, paginationcCallback, window.app.store);
  updateAppUrl(window.location, window.app.store);
}
