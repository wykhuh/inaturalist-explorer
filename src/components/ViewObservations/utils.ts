import { cleanupObervationsParams } from "../../lib/cleanup_params_utils";
import { getObservations } from "../../lib/inat_api";
import { createSpinner } from "../../lib/spinner";
import { updateAppUrl } from "../../lib/utils";
import type { iNatObservationsAPI } from "../../types/inat_api";
import type {
  DataComponentType,
  AppStoreType,
  ObservationSubviewsType,
  viewMetadataGraphs,
} from "../../types/app";
import { observations_fields_annotations as observations } from "../../data/api/observations";
import { updateSelectedResourcesId } from "../../lib/count_utils";
import { replaceWithCacheImages } from "../../lib/data_utils";
import {
  fetchDataForGraphCategories,
  fetchGraphData,
  getAPIHistogramData,
  getAPIPopularFieldsData,
  graphHasMaxObservation,
  hasGraphCache,
} from "../SubviewGraphs/utils";

// fetch new data from api when changing pages, order, filters and view
export async function fetchAndCacheData(
  appStore: AppStoreType,
  useCache: boolean,
) {
  let obsCache = appStore.cacheData && appStore.cacheData.observations;

  // clear cache
  if (useCache === false) {
    obsCache.graphsSpecies = { month_of_year: [], year: [], month: [] };
    obsCache.graphs = { month_of_year: [], year: [], month: [] };
    obsCache.graphsPlaces = { month_of_year: [], year: [], month: [] };
    obsCache.popularFieldsOptions = [];
    obsCache.popularFields = {};
  }

  // if no cached data, fetch data
  //  handle graphs
  let subview = appStore.viewMetadata.observations_observations.subview;
  if (subview === "graph") {
    await fetchAndCacheGraphData(appStore);

    // handle map
  } else if (subview === "map") {
    // handle grid, media, table
  } else {
    return await fetchAndCacheObservationsData(appStore);
  }
}

async function fetchAndCacheGraphData(appStore: AppStoreType) {
  let graphsMetadata = appStore.viewMetadata.observations_observations
    .graphs as viewMetadataGraphs;

  let spinner = createSpinner();
  spinner.start();

  if (graphHasMaxObservation(appStore)) {
    spinner.stop();
    return;
  }

  if (appStore.cacheData.observations.popularFieldsOptions.length == 0) {
    await fetchDataForGraphCategories(appStore);
  }

  // check if cache data exists
  let graphData = hasGraphCache(appStore, graphsMetadata);
  // fetch data if no cache
  if (!graphData) {
    await fetchGraphData(
      appStore,
      getAPIHistogramData,
      getAPIPopularFieldsData,
    );
  }

  spinner.stop();
}

async function fetchAndCacheObservationsData(appStore: AppStoreType) {
  let spinner = createSpinner();
  spinner.start();
  let data = await getAPIData(appStore);

  spinner.stop();

  return data;
}

export function renderSubview(
  data: iNatObservationsAPI | undefined,
  appStore: AppStoreType,
) {
  let subcontainerEl =
    document.querySelector<HTMLDivElement>(".subview-container");
  if (!subcontainerEl) return;
  subcontainerEl.innerHTML = "";

  let graphsMetadata = appStore.viewMetadata.observations_observations
    .graphs as viewMetadataGraphs;
  let subview = appStore.viewMetadata.observations_observations.subview;

  let component: DataComponentType;
  if (subview === "map") {
    component = document.createElement("subview-observations-map");
  } else if (subview === "graph") {
    component = document.createElement("subview-observations-graphs");
    if (graphsMetadata.groupBy === "species") {
      component.data = { selectedResource: "selectedTaxa" };
    } else if (graphsMetadata.groupBy === "places") {
      component.data = { selectedResource: "selectedPlaces" };
    } else {
      component.data = { selectedResource: undefined };
    }
  } else if (subview === "table") {
    component = document.createElement("subview-observations-table");
    component.data = data;
  } else if (subview === "media") {
    component = document.createElement("subview-observations-media");
    component.data = data;
  } else {
    component = document.createElement("subview-observations-grid");
    component.data = data;
  }
  subcontainerEl.appendChild(component);
}

// ===============
// observations data
// ===============

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

// ===============
// misc
// ===============

export function displayJSON(data: any, element: HTMLDivElement) {
  let div = document.createElement("div");
  div.innerText = JSON.stringify(data);
  element.appendChild(div);
}

// use store to populate the filter form fields on page load
export function initFilters(appStore: AppStoreType, componentContext: any) {
  // set initial current-subview class
  let subview = appStore.viewMetadata.observations_observations?.subview;
  if (subview === "graph") {
    componentContext.graphLinkEl?.classList.add("current-subview");
  } else if (subview === "media") {
    componentContext.mediaLinkEl?.classList.add("current-subview");
  } else if (subview === "map") {
    componentContext.mapLinkEl?.classList.add("current-subview");
  } else if (subview === "table") {
    componentContext.tableLinkEl?.classList.add("current-subview");
  } else {
    componentContext.gridLinkEl?.classList.add("current-subview");
  }
}

// ===============
// event handlers
// ===============

function updateSubviewLinkClass(componentContext: any, ignoreLink: any) {
  let links = [
    componentContext.graphLinkEl,
    componentContext.gridLinkEl,
    componentContext.mediaLinkEl,
    componentContext.mapLinkEl,
    componentContext.tableLinkEl,
  ];

  links
    .filter((link) => link !== ignoreLink)
    .forEach((link) => {
      link.classList.remove("current-subview");
    });

  ignoreLink.classList.add("current-subview");
}

// called when user changes subview
export async function updateSubviewState(
  subview: ObservationSubviewsType,
  componentContext: any,
  appStore: AppStoreType,
) {
  // early return if this is current subview
  let view = appStore.viewMetadata.observations_observations;
  if (subview === view.subview) return;

  // update store
  view.subview = subview;

  // make menu link active
  if (subview === "graph") {
    updateSubviewLinkClass(componentContext, componentContext.graphLinkEl);
  } else if (subview === "grid") {
    updateSubviewLinkClass(componentContext, componentContext.gridLinkEl);
  } else if (subview === "media") {
    updateSubviewLinkClass(componentContext, componentContext.mediaLinkEl);
  } else if (subview === "table") {
    updateSubviewLinkClass(componentContext, componentContext.tableLinkEl);
  } else {
    updateSubviewLinkClass(componentContext, componentContext.mapLinkEl);
  }

  // if no cached data, fetch data
  // handle graphs
  let data;
  if (subview === "graph") {
    data = await fetchAndCacheGraphData(appStore);
    // handle map
  } else if (subview === "map") {
    // handle grid, media, table
  } else {
    data = await fetchAndCacheObservationsData(appStore);
  }

  renderSubview(data, appStore);

  // add subview to url
  updateAppUrl(window.location, appStore);
}
