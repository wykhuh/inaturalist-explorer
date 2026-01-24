import { cleanupIdentificationParams } from "../../lib/cleanup_params_utils";
import { getIdentifications } from "../../lib/inat_api";
import { loggerTime } from "../../lib/logger";
import { createSpinner } from "../../lib/spinner";
import type {
  IdentificationsAPI,
  IdentificationsResult,
} from "../../types/inat_api";
import { updateAppUrl } from "../../lib/utils";
import type {
  DataComponentType,
  AppStoreType,
  IdentificationSubviewsType,
} from "../../types/app";
import { identifications } from "../../data/inat_api_cache";
import {
  isObservationsCheck,
  replaceWithCacheImages,
  resetPageNumber,
} from "../../lib/data_utils";
import { removeMap } from "../../lib/map_utils";
import { initRenderMap } from "../../lib/init_app";
import { setSelectedOption } from "../../lib/form_utils";

export async function fetchAndRenderData(
  paginationCallback: (
    currentPage: number,
    appStore: AppStoreType,
  ) => Promise<void>,
  appStore: AppStoreType,
) {
  let subcontainerEl = document.querySelector(".subview-container");
  if (!subcontainerEl) return;

  let spinner = createSpinner();
  spinner.start();

  const t1 = performance.now();
  let data = await getAPIData(appStore);
  const t10 = performance.now();
  loggerTime(`api ${t10 - t1} milliseconds`);
  spinner.stop();

  if (!data) return;
  if (data.results.length == 0) {
    subcontainerEl.innerHTML = "No records found";
    appStore.observationsSubviewData = [];
    return;
  }

  // store results in store for switching subview
  appStore.observationsSubviewData = data;

  render(data, paginationCallback, appStore);
}

function render(
  data: IdentificationsAPI,
  paginationCallback: any,
  appStore: AppStoreType,
) {
  let containerEl = document.querySelector(".subview-container");
  let formEl = document.querySelector("#order-form");
  if (!containerEl) return;
  if (!formEl) return;

  let view = isObservationsCheck(appStore)
    ? appStore.viewMetadata.observations_observations
    : appStore.viewMetadata.identifications_identifications;

  if (view.subview === "map") {
    if (!appStore.map.map) {
      containerEl.innerHTML = "";
    }
    formEl.className = "hide";
  } else {
    containerEl.innerHTML = "";
    formEl.className = "";
  }

  if (view.subview !== "map") {
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
  }

  let subviewEl = document.createElement("div");
  subviewEl.className = "observations-subview";

  if (view.subview === "map") {
    if (!appStore.map.map) {
      subviewEl.appendChild(createMap());

      // HACK: use setTimeout to ensure initRenderMap is called after createMap
      // adds div#map
      setTimeout(() => {
        initRenderMap(appStore);
      }, 0);
    }
  } else if (view.subview === "grid") {
    subviewEl.appendChild(createGrid(data.results));
  } else {
    subviewEl.appendChild(createHistory(data.results));
  }
  containerEl.append(subviewEl);

  if (view.subview !== "map") {
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
}

async function getAPIData(appStore: AppStoreType) {
  if (import.meta.env?.VITE_CACHE === "true") {
    let page = isObservationsCheck(appStore)
      ? appStore.observationsApiParams.page
      : appStore.identificationsApiParams.page;

    replaceWithCacheImages(identifications.results);

    return { ...identifications, page: page || 1 };
  }

  let params = cleanupIdentificationParams(appStore);

  try {
    let data = await getIdentifications(params);
    if (!data) return;

    return data;
  } catch (error) {
    console.error("ViewIdentifications getAPIData ERROR:", error);
  }
}

function createGrid(results: IdentificationsResult[]) {
  let containerEl = document.createElement("div");
  containerEl.className = "identifications-grid";

  results.forEach((row) => {
    let recordEl = document.createElement(
      "card-identification",
    ) as unknown as DataComponentType;
    recordEl.data = row;
    recordEl.type = "grid";
    containerEl.append(recordEl);
  });

  return containerEl;
}

function createHistory(results: IdentificationsResult[]) {
  let containerEl = document.createElement("div");
  containerEl.className = "identifications-history";

  let observationIds = new Set();
  results.forEach((row) => {
    if (observationIds.has(row.observation.id)) {
      return;
    }

    observationIds.add(row.observation.id);
    let recordEl = document.createElement(
      "card-identification",
    ) as unknown as DataComponentType;
    recordEl.data = row;
    recordEl.type = "history";
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
  await fetchAndRenderData(paginationCallback, appStore);
  updateAppUrl(window.location, appStore);
}

function createMap() {
  let divEl = document.createElement("div");
  divEl.id = "map";
  return divEl;
}

export function updateSubviewState(
  subview: IdentificationSubviewsType,
  componentContext: any,
  appStore: AppStoreType,
) {
  // early return if this is current subview
  let view = isObservationsCheck(appStore)
    ? appStore.viewMetadata.observations_observations
    : appStore.viewMetadata.identifications_identifications;
  if (subview === view.subview) return;

  // remove map when change from map to other subview
  if (view.subview === "map") {
    removeMap(appStore);
  }

  // update store
  view.subview = subview;

  // HACK: force triggering store proxy
  appStore.viewMetadata = appStore.viewMetadata;

  if (subview === "grid") {
    componentContext.gridLinkEl.classList.add("current-subview");
    componentContext.mapLinkEl.classList.remove("current-subview");
    componentContext.historyLinkEl.classList.remove("current-subview");
  } else if (subview === "history") {
    componentContext.gridLinkEl.classList.remove("current-subview");
    componentContext.mapLinkEl.classList.remove("current-subview");
    componentContext.historyLinkEl.classList.add("current-subview");
  } else {
    componentContext.gridLinkEl.classList.remove("current-subview");
    componentContext.mapLinkEl.classList.add("current-subview");
    componentContext.historyLinkEl.classList.remove("current-subview");
  }

  if (appStore.observationsSubviewData.length === 0) {
    return;
  }

  render(appStore.observationsSubviewData, paginationCallback, appStore);

  // add subview to url
  updateAppUrl(window.location, appStore);
}

// use store to populate the filter form fields on page load
export function initFilters(appStore: AppStoreType, componentContext: any) {
  let { identificationsApiParams } = appStore;
  // set initial current-subview class
  let subview = appStore.viewMetadata.identifications_identifications?.subview;
  if (subview === "map") {
    componentContext.mapLinkEl?.classList.add("current-subview");
  } else if (subview === "grid") {
    componentContext.gridLinkEl?.classList.add("current-subview");
  } else {
    componentContext.historyLinkEl?.classList.add("current-subview");
  }

  if (identificationsApiParams.order_by && identificationsApiParams.order) {
    setSelectedOption(
      `#order-form select#order_combo option[value='${identificationsApiParams.order_by}:${identificationsApiParams.order}']`,
    );
  } else if (identificationsApiParams.order_by) {
    setSelectedOption(
      `#order-form select#order_combo option[value='${identificationsApiParams.order_by}']`,
    );
  }
}

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
    appStore.identificationsApiParams.order_by = orderBy;
    if (appStore.currentView) {
      appStore.viewMetadata[appStore.currentView].order_by = orderBy;
    }
  }
  if (order) {
    appStore.identificationsApiParams.order = order;
    if (appStore.currentView) {
      appStore.viewMetadata[appStore.currentView].order = order;
    }
  } else {
    delete appStore.identificationsApiParams.order;
  }

  resetPageNumber(appStore);
  await fetchAndRenderData(paginationCallback, appStore);
  updateAppUrl(window.location, appStore);
}
