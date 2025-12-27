import { cleanupIdentificationParams } from "../../lib/cleanup_params_utils";
import { getIdentifications } from "../../lib/inat_api";
import { loggerTime } from "../../lib/logger";
import { createSpinner } from "../../lib/spinner";
import type { IdentificationsResult } from "../../types/inat_api";
import { updateAppUrl } from "../../lib/utils";
import type { DataComponentType, AppStoreType } from "../../types/app";
import { identifications } from "../../data/inat_api_cache";
import {
  isObservationsCheck,
  replaceWithCacheImages,
} from "../../lib/data_utils";

export let perPage = 24;

export async function fetchAndRenderData(
  perPage: number,
  paginationCallback: (
    currentPage: number,
    appStore: AppStoreType,
  ) => Promise<void>,
  appStore: AppStoreType,
) {
  let containerEl = document.querySelector(".identifications-grid");
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

  let gridEl = createGrid(data.results);
  containerEl.appendChild(gridEl);

  let pagination2 = document.createElement(
    "app-pagination",
  ) as unknown as DataComponentType;
  pagination2.data = {
    perPage: data.per_page,
    currentPage: data.page,
    totalRecords: data.total_results,
    paginationCallback,
    scrollToSelector: ".identifications-grid",
  };
  containerEl.appendChild(pagination2);
}

async function getAPIData(perPage: number, appStore: AppStoreType) {
  if (import.meta.env?.VITE_CACHE === "true") {
    let page = isObservationsCheck(appStore)
      ? appStore.observationsApiParams.page
      : appStore.identificationsApiParams.page;

    replaceWithCacheImages(identifications.results);

    return { ...identifications, page: page || 1 };
  }

  let params = cleanupIdentificationParams(appStore);

  try {
    let data = await getIdentifications(params, perPage);
    if (!data) return;

    return data;
  } catch (error) {
    console.error("ViewIdentifications getAPIData ERROR:", error);
  }
}

function createGrid(results: IdentificationsResult[]) {
  let containerEl = document.createElement("div");
  containerEl.className = "identification-grid";

  results.forEach((row) => {
    let recordEl = document.createElement(
      "card-identification",
    ) as unknown as DataComponentType;
    recordEl.data = row;
    containerEl.append(recordEl);
  });

  return containerEl;
}

export async function paginationCallback(num: number, appStore: AppStoreType) {
  if (isObservationsCheck(appStore)) {
  } else {
    appStore.identificationsApiParams = {
      ...appStore.identificationsApiParams,
      page: num,
    };
    appStore.viewMetadata.identifications_identifications = {
      ...appStore.viewMetadata.identifications_identifications,
      page: num,
    };
  }
  // HACK: update store
  appStore.viewMetadata = appStore.viewMetadata;

  await fetchAndRenderData(perPage, paginationCallback, appStore);
  updateAppUrl(window.location, appStore);
}
