import { isObservationsCheck, resetPageNumber } from "../../lib/data_utils";
import { setSelectedOption } from "../../lib/form_utils";
import { loggerRender } from "../../lib/logger";
import { updateAppUrl } from "../../lib/utils";
import type { AppStoreType, DataComponentType } from "../../types/app";
import type { iNatObservationsAPI } from "../../types/inat_api";
import { createMediaGrid } from "../SubviewMedia/utils";
import { createTable } from "../SubviewTable/utils";
import { fetchAndCacheData } from "../ViewObservations/utils";
import { createGrid } from "./utils";

// re-render grids, tables, pagination everytime we fetch new data. only render
// map if it does not exist since we have another function to add/delete map
// layers when data changes.
export function renderObservations(
  data: iNatObservationsAPI | undefined,
  appStore: AppStoreType,
) {
  loggerRender("++ SubviewObservationsGrid render");
  let dataContainer = document.querySelector("#subview-data-container");
  if (!dataContainer) return;

  dataContainer.innerHTML = "";

  if (data === undefined || data.total_results === 0) {
    dataContainer.innerHTML = "No records found";

    return;
  }

  let pagination1 = document.createElement(
    "app-pagination",
  ) as DataComponentType;
  pagination1.data = {
    perPage: data.per_page,
    currentPage: data.page,
    totalRecords: data.total_results,
    paginationCallback,
  };
  dataContainer.appendChild(pagination1);

  let filteredObservations = filterObservationsBeta(data, appStore);

  let subview = appStore.viewMetadata.observations_observations.subview;
  if (subview === "grid") {
    dataContainer.appendChild(createGrid(filteredObservations));
  } else if (subview === "media") {
    dataContainer.appendChild(createMediaGrid(filteredObservations));
  } else if (subview === "table") {
    dataContainer.appendChild(createTable(filteredObservations, appStore));
  }

  let pagination2 = document.createElement(
    "app-pagination",
  ) as DataComponentType;
  pagination2.data = {
    perPage: data.per_page,
    currentPage: data.page,
    totalRecords: data.total_results,
    paginationCallback,
    scrollToSelector: "#observations-list-controls",
  };
  dataContainer.appendChild(pagination2);
}

// called when order menu is changed
export async function updateOrderForStore(
  data: FormData,
  appStore: AppStoreType,
) {
  let orderBy;
  let order;
  data.forEach((v, k) => {
    if (k === "order_combo") {
      let values = v.toString().split(":");
      orderBy = values[0];
      order = values[1];
    }
  });

  if (orderBy) {
    appStore.observationsApiParams.order_by = orderBy;
    if (appStore.currentView) {
      appStore.viewMetadata[appStore.currentView].order_by = orderBy;
    }
  }
  if (order) {
    appStore.observationsApiParams.order = order;
    if (appStore.currentView) {
      appStore.viewMetadata[appStore.currentView].order = order;
    }
  } else {
    delete appStore.observationsApiParams.order;
  }

  resetPageNumber(appStore);

  await fetchAndCacheData(appStore, false);
  updateAppUrl(window.location, appStore);
}

export function addEventListenersObservations(componentContext: any) {
  window.addEventListener("observationsChange", componentContext);
  window.addEventListener("localeChanged", componentContext);
  window.addEventListener("nameOrderChanged", componentContext);
  window.addEventListener("perPageChanged", componentContext);
  componentContext.orderForm.addEventListener("change", componentContext);
}

export function removeEventListenersObservations(componentContext: any) {
  window.removeEventListener("observationsChange", componentContext);
  window.removeEventListener("localeChanged", componentContext);
  window.removeEventListener("nameOrderChanged", componentContext);
  window.removeEventListener("perPageChanged", componentContext);
  componentContext.orderForm.removeEventListener("change", componentContext);
}

export async function eventHandlersObservations(
  event: Event,
  componentContext: any,
  appStore: AppStoreType,
) {
  let target = event.target as HTMLElement;
  if (!target) return;

  let resourceChanges = [
    "observationsChange",
    "localeChanged",
    "perPageChanged",
  ];
  if (resourceChanges.includes(event.type)) {
    await fetchAndCacheData(window.app.store, false);
    componentContext.render(appStore);
  }

  let resourceChangesUseCache = ["nameOrderChanged"];
  if (resourceChangesUseCache.includes(event.type)) {
    await fetchAndCacheData(window.app.store, true);
    componentContext.render(appStore);
  }

  if (target.id === "order_combo") {
    const formData = new FormData(componentContext.orderForm);
    await updateOrderForStore(formData, appStore);
    componentContext.render(appStore);
  }
}

// use store to populate the filter form fields on page load
export function initFilters(appStore: AppStoreType) {
  let { observationsApiParams } = appStore;

  if (observationsApiParams.order_by && observationsApiParams.order) {
    setSelectedOption(
      `#order-form select#order_combo option[value='${observationsApiParams.order_by}:${observationsApiParams.order}']`,
    );
  } else if (observationsApiParams.order_by) {
    setSelectedOption(
      `#order-form select#order_combo option[value='${observationsApiParams.order_by}']`,
    );
  }
}

export async function paginationCallback(num: number, appStore: AppStoreType) {
  if (isObservationsCheck(appStore)) {
    appStore.observationsApiParams = {
      ...appStore.observationsApiParams,
      page: num,
    };
    appStore.viewMetadata.observations_observations = {
      ...appStore.viewMetadata.observations_observations,
      page: num,
    };
  }

  // HACK: update store
  appStore.viewMetadata = appStore.viewMetadata;

  let data = (await fetchAndCacheData(appStore, false)) as
    | iNatObservationsAPI
    | undefined;
  renderObservations(data, appStore);
  updateAppUrl(window.location, appStore);
}

// filter observations using methods not supported by iNat API
export function filterObservationsBeta(
  data: iNatObservationsAPI,
  appStore: AppStoreType,
) {
  let filteredResults = data.results;

  if (appStore.observationsApiParams.obs_without_annotations) {
    filteredResults = filteredResults.filter((obs) => {
      if (obs.annotations && obs.annotations.length === 0) {
        return true;
      } else {
        return false;
      }
    });
  }
  if (appStore.observationsApiParams.obs_without_ofvs) {
    filteredResults = filteredResults.filter((obs) => {
      if (obs.ofvs && obs.ofvs.length === 0) {
        return true;
      } else {
        return false;
      }
    });
  }

  return filteredResults;
}

export function resetGraphCache(appStore: AppStoreType) {
  appStore.viewMetadata.popularFieldsOptions = [];
  appStore.viewMetadata.popularFieldsByTaxa = {};
}
