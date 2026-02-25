import { cleanupObervationsParams } from "../../lib/cleanup_params_utils";
import { getHistogram, getObservations } from "../../lib/inat_api";
import { loggerTime } from "../../lib/logger";
import { createSpinner } from "../../lib/spinner";
import { updateAppUrl } from "../../lib/utils";
import type { iNatObservationsAPI } from "../../types/inat_api";
import type {
  DataComponentType,
  AppStoreType,
  ObservationSubviewsType,
} from "../../types/app";
import { observations_fields_annotations as observations } from "../../data/inat_api_cache";
import { setSelectedOption } from "../../lib/form_utils";
import { updateSelectedResourcesId } from "../../lib/count_utils";
import {
  isObservationsCheck,
  replaceWithCacheImages,
  resetPageNumber,
} from "../../lib/data_utils";
import { initRenderMap } from "../../lib/init_app";
import { removeMap } from "../../lib/map_utils";
import {
  createGraph,
  createGrid,
  createMap,
  createMediaGrid,
} from "./subviews";

export let defaultPerPage = 24;

// fetch new data from api when changing pages, order, filters and view
export async function fetchAndRenderData(
  paginationCallback: (
    currentPage: number,
    appStore: AppStoreType,
  ) => Promise<void>,
  appStore: AppStoreType,
) {
  let subcontainerEl = document.querySelector(".subview-container");
  if (!subcontainerEl) return;

  //  handle observations
  if (appStore.viewMetadata.observations_observations.subview !== "graph") {
    let spinner = createSpinner();
    spinner.start();
    const t1 = performance.now();

    // fetch data
    let data = await getAPIData(appStore);
    if (!data) return;

    const t10 = performance.now();
    loggerTime(`api ${t10 - t1} milliseconds`);
    spinner.stop();

    // display message if no records
    let view =
      appStore.viewMetadata[
        appStore.currentView || "observations_observations"
      ];
    if (view.subview !== "map" && data.results.length == 0) {
      subcontainerEl.innerHTML = "No records found";
      appStore.observationsSubviewData = [];
      return;
    }

    // store results in store for switching subview
    appStore.observationsSubviewData = data;

    // render data
    if (appStore.viewMetadata.observations_observations.subview === "map") {
      renderMap(appStore);
    } else {
      renderGrid(data, paginationCallback, appStore);
    }

    // handle graphs
  } else {
    renderGraphs(appStore);
  }
}

// re-render grids, tables, pagination everytime we fetch new data. only render
// map if it does not exist since we have another function to add/delete map
// layers when data changes.
function renderGrid(
  data: iNatObservationsAPI,
  paginationCallback: any,
  appStore: AppStoreType,
) {
  let containerEl = document.querySelector(".subview-container");
  let formEl = document.querySelector("#order-form");
  if (!containerEl) return;
  if (!formEl) return;

  let view = appStore.viewMetadata.observations_observations;

  containerEl.innerHTML = "";
  formEl.className = "";

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

  let subviewEl = document.createElement("div");
  subviewEl.className = "observations-subview";

  if (view.subview === "media") {
    subviewEl.appendChild(createMediaGrid(data.results));
  } else {
    subviewEl.appendChild(createGrid(data.results));
  }
  containerEl.append(subviewEl);

  let pagination2 = document.createElement(
    "app-pagination",
  ) as unknown as DataComponentType;
  pagination2.data = {
    perPage: data.per_page,
    currentPage: data.page,
    totalRecords: data.total_results,
    paginationCallback,
    scrollToSelector: "#observations-list-controls",
  };
  containerEl.appendChild(pagination2);
}

function renderMap(appStore: AppStoreType) {
  let containerEl = document.querySelector(".subview-container");
  let formEl = document.querySelector("#order-form");
  if (!containerEl) return;
  if (!formEl) return;

  if (!appStore.map.map) {
    containerEl.innerHTML = "";
  }
  formEl.className = "hide";

  let subviewEl = document.createElement("div");
  subviewEl.className = "observations-subview";

  if (!appStore.map.map) {
    subviewEl.appendChild(createMap());

    // HACK: use setTimeout to ensure initRenderMap is called after createMap
    // adds div#map
    setTimeout(() => {
      initRenderMap(appStore);
    }, 0);
  }

  containerEl.append(subviewEl);
}

async function renderGraphs(appStore: AppStoreType) {
  let containerEl =
    document.querySelector<HTMLDivElement>(".subview-container");
  let formEl = document.querySelector("#order-form");
  if (!containerEl) return;
  if (!formEl) return;

  containerEl.innerHTML = "";
  formEl.className = "hide";

  let subviewEl = document.createElement("div");
  subviewEl.className = "observations-subview";

  let data1 = await getAPIGraphData("month_of_year", appStore);
  if (data1) {
    let graph = await createGraph(data1.results);
    containerEl.appendChild(graph);
  }

  let data2 = await getAPIGraphData("year", appStore);
  if (data2) {
    let graph = await createGraph(data2.results);
    containerEl.appendChild(graph);
  }

  let data3 = await getAPIGraphData("month", appStore);
  if (data3) {
    let graph = await createGraph(data3.results);
    containerEl.appendChild(graph);
  }
  containerEl.append(subviewEl);
}

export function displayJSON(data: any, element: HTMLDivElement) {
  let div = document.createElement("div");
  div.innerText = JSON.stringify(data);
  element.appendChild(div);
}

async function getAPIData(appStore: AppStoreType) {
  if (import.meta.env?.VITE_CACHE === "true") {
    let page = appStore.observationsApiParams.page;
    replaceWithCacheImages(observations.results);
    return { ...observations, page: page || 1 };
  }

  // TODO: check if this is needed
  updateSelectedResourcesId(appStore, "observations");
  let params = cleanupObervationsParams(appStore, "observations");

  try {
    let data = await getObservations(params);
    if (!data) return;

    return data;
  } catch (error) {
    console.error("ViewObservations getAPIData ERROR:", error);
  }
}

async function getAPIGraphData(interval: string, appStore: AppStoreType) {
  // TODO: check if this is needed
  updateSelectedResourcesId(appStore, "observations");
  let params = cleanupObervationsParams(appStore, "observations");

  try {
    let data = await getHistogram(`${params}&interval=${interval}`);
    if (!data) return;

    return data;
  } catch (error) {
    console.error("ViewObservations getAPIGraphData ERROR:", error);
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

  await fetchAndRenderData(paginationCallback, appStore);
  updateAppUrl(window.location, appStore);
}

export async function updateSubviewState(
  subview: ObservationSubviewsType,
  componentContext: any,
  appStore: AppStoreType,
) {
  // early return if this is current subview
  let view = appStore.viewMetadata.observations_observations;
  if (subview === view.subview) return;

  // remove map when change from map to other subview
  if (view.subview === "map") {
    removeMap(appStore);
  }

  // update store
  view.subview = subview;

  // HACK: force triggering store proxy
  appStore.viewMetadata = appStore.viewMetadata;

  if (subview === "graph") {
    componentContext.graphLinkEl.classList.add("current-subview");
    componentContext.gridLinkEl.classList.remove("current-subview");
    componentContext.mediaLinkEl.classList.remove("current-subview");
    componentContext.mapLinkEl.classList.remove("current-subview");
  } else if (subview === "grid") {
    componentContext.graphLinkEl.classList.remove("current-subview");
    componentContext.gridLinkEl.classList.add("current-subview");
    componentContext.mediaLinkEl.classList.remove("current-subview");
    componentContext.mapLinkEl.classList.remove("current-subview");
  } else if (subview === "media") {
    componentContext.graphLinkEl.classList.remove("current-subview");
    componentContext.gridLinkEl.classList.remove("current-subview");
    componentContext.mediaLinkEl.classList.add("current-subview");
    componentContext.mapLinkEl.classList.remove("current-subview");
  } else {
    componentContext.graphLinkEl.classList.remove("current-subview");
    componentContext.gridLinkEl.classList.remove("current-subview");
    componentContext.mediaLinkEl.classList.remove("current-subview");
    componentContext.mapLinkEl.classList.add("current-subview");
  }

  // if observationsGraphSubviewData is empty, fetch data
  if (
    subview === "graph" &&
    appStore.observationsGraphSubviewData.length === 0
  ) {
    // if observationsSubviewData is empty, fetch data
  } else if (appStore.observationsSubviewData.length === 0) {
    let data = await getAPIData(appStore);
    appStore.observationsSubviewData = data;
  }

  if (subview === "map") {
    renderMap(appStore);
  } else if (subview === "graph") {
    renderGraphs(appStore);
  } else {
    renderGrid(appStore.observationsSubviewData, paginationCallback, appStore);
  }

  // add subview to url
  updateAppUrl(window.location, appStore);
}

// use store to populate the filter form fields on page load
export function initFilters(appStore: AppStoreType, componentContext: any) {
  let { observationsApiParams } = appStore;

  // set initial current-subview class
  let subview = appStore.viewMetadata.observations_observations?.subview;
  if (subview === "graph") {
    componentContext.graphLinkEl?.classList.add("current-subview");
  } else if (subview === "media") {
    componentContext.mediaLinkEl?.classList.add("current-subview");
  } else if (subview === "map") {
    componentContext.mapLinkEl?.classList.add("current-subview");
  } else {
    componentContext.gridLinkEl?.classList.add("current-subview");
  }

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
  await fetchAndRenderData(paginationCallback, appStore);
  updateAppUrl(window.location, appStore);
}
