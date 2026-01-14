import { threatenedSpecies } from "../../data/inat_api_cache";
import {
  cleanupIdentificationParams,
  cleanupObervationsParams,
} from "../../lib/cleanup_params_utils";
import {
  isIdentificationsCheck,
  isObservationsCheck,
  replaceWithCacheImages,
} from "../../lib/data_utils";
import {
  getIdentificationsSpecies,
  getObservationsSpecies,
} from "../../lib/inat_api";
import { loggerTime } from "../../lib/logger";
import { createSpinner } from "../../lib/spinner";
import { updateAppUrl } from "../../lib/utils";
import type { DataComponentType, AppStoreType } from "../../types/app";
import type {
  IdentificationsResult,
  ObservationsResult,
  ResourceSpeciesCountResult,
} from "../../types/inat_api";

export async function fetchAndRenderData(
  paginationCallback: (
    currentPage: number,
    appStore: AppStoreType,
  ) => Promise<void>,
  appStore: AppStoreType,
) {
  let containerEl = document.querySelector(".species-list-container");
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

  let pagination1 = document.createElement(
    "app-pagination",
  ) as unknown as DataComponentType;
  pagination1.data = {
    perPage: data.per_page,
    currentPage: data.page,
    totalRecords: data.total_results,
    paginationCallback,
  };
  containerEl.appendChild(pagination1);

  let tableEl = createGrid(data.results, appStore);
  containerEl.appendChild(tableEl);

  let pagination2 = document.createElement(
    "app-pagination",
  ) as unknown as DataComponentType;
  pagination2.data = {
    perPage: data.per_page,
    currentPage: data.page,
    totalRecords: data.total_results,
    paginationCallback,
    scrollToSelector: ".species-list-container",
  };
  containerEl.appendChild(pagination2);
}

async function getAPIData(appStore: AppStoreType) {
  if (import.meta.env?.VITE_CACHE === "true") {
    let page = isObservationsCheck(appStore)
      ? appStore.observationsApiParams.page
      : appStore.identificationsApiParams.page;
    replaceWithCacheImages(threatenedSpecies.results);
    return { ...threatenedSpecies, page: page || 1 };
  }

  try {
    let data;
    if (isIdentificationsCheck(appStore)) {
      let params = cleanupIdentificationParams(appStore);
      data = await getIdentificationsSpecies(params);
    } else if (isObservationsCheck(appStore)) {
      let params = cleanupObervationsParams(appStore);
      data = await getObservationsSpecies(params);
    }

    return data;
  } catch (error) {
    console.error("ViewSpecies getAPIData ERROR:", error);
  }
}

function createGrid(
  results:
    | ObservationsResult[]
    | IdentificationsResult[]
    | ResourceSpeciesCountResult[],
  appStore: AppStoreType,
) {
  let containerEl = document.createElement("div");
  containerEl.className = "species-grid grid-auto-fill";

  results.forEach((row) => {
    let cardEl = document.createElement(
      "card-species",
    ) as unknown as DataComponentType;
    cardEl.data = row;
    cardEl.record_type = appStore.record_type;
    containerEl.appendChild(cardEl);
  });

  return containerEl;
}

export async function paginationCallback(num: number, appStore: AppStoreType) {
  if (isObservationsCheck(appStore)) {
    appStore.observationsApiParams = {
      ...appStore.observationsApiParams,
      page: num,
    };
    appStore.viewMetadata.observations_species = {
      ...appStore.viewMetadata.observations_species,
      page: num,
    };
  } else {
    appStore.identificationsApiParams = {
      ...appStore.identificationsApiParams,
      page: num,
    };
    appStore.viewMetadata.identifications_species = {
      ...appStore.viewMetadata.identifications_species,
      page: num,
    };
  }

  // HACK: update store
  appStore.viewMetadata = appStore.viewMetadata;

  await fetchAndRenderData(paginationCallback, appStore);
  updateAppUrl(window.location, appStore);
}
