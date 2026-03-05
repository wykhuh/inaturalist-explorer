import {
  cleanupObervationsGraphParams,
  cleanupObervationsParams,
  cleanupObervationsParamsObject,
} from "../../lib/cleanup_params_utils";
import { getHistogram, getObservations } from "../../lib/inat_api";
import { createSpinner } from "../../lib/spinner";
import { updateAppUrl } from "../../lib/utils";
import type {
  iNatObservationsAPI,
  ObservationsResult,
} from "../../types/inat_api";
import type {
  DataComponentType,
  AppStoreType,
  ObservationSubviewsType,
  AppStoreSelectedResourcesKeysType,
  viewMetadataGraphs,
  Spinner,
  NormalizediNatTaxonType,
  GraphData,
  GraphCategory,
} from "../../types/app";
import { observations_fields_annotations as observations } from "../../data/api/observations";
import { setInputChecked, setSelectedOption } from "../../lib/form_utils";
import { updateSelectedResourcesId } from "../../lib/count_utils";
import {
  isObservationsCheck,
  replaceWithCacheImages,
  resetPageNumber,
} from "../../lib/data_utils";
import { initRenderMap } from "../../lib/init_app";
import { removeMap } from "../../lib/map_utils";
import { createGraphs } from "./charts_utils";
import { iNatObservationUrl } from "../../data/inat_data";
import {
  formatDateLong,
  renderMedia,
  renderObservationMetadataCounts,
  renderPlace,
  renderQualityGrade,
  renderTaxonNames,
  renderUser,
} from "../../lib/render_utils";
import {
  histograph_year,
  histograph_month,
  histograph_month_year,
  histograph_month_year_monarch,
  histograph_month_year_milkweed,
  histograph_year_monarch,
  histograph_month_monarch,
  histograph_year_milkweed,
  histograph_month_milkweed,
  histograph_month_year_monarch_us,
  histograph_month_year_monarch_mexico,
  histograph_year_monarch_us,
  histograph_year_monarch_mexico,
  histograph_month_monarch_mexico,
  histograph_month_monarch_us,
} from "../../data/api/histogram";
import { defaultColorScheme } from "../../lib/map_colors_utils";

export let defaultPerPage = 24;

// fetch new data from api when changing pages, order, filters and view
export async function fetchAndRenderData(
  paginationCallback: (
    currentPage: number,
    appStore: AppStoreType,
  ) => Promise<void>,
  appStore: AppStoreType,
  useCache: boolean,
) {
  let subcontainerEl =
    document.querySelector<HTMLDivElement>(".subview-container");
  if (!subcontainerEl) return;
  let obsCache = appStore.cacheData.observations;

  // clear cache
  if (useCache === false) {
    obsCache.observations = {} as iNatObservationsAPI;
    obsCache.graphsSpecies = { month_of_year: [], year: [], month: [] };
    obsCache.graphs = { month_of_year: [], year: [], month: [] };
    obsCache.graphsPlaces = { month_of_year: [], year: [], month: [] };
  }

  //  handle graphs
  if (appStore.viewMetadata.observations_observations.subview === "graph") {
    let graphsMetadata = appStore.viewMetadata.observations_observations
      .graphs as viewMetadataGraphs;

    let spinner = createSpinner();
    spinner.start();

    if (await graphMaxObservationMessage(appStore, spinner)) {
      return;
    }

    // check if cache data exists
    let graphData = hasGraphCache(appStore, graphsMetadata);
    // fetch data if no cache
    if (!graphData) {
      await fetchGraphData(appStore);
    }

    spinner.stop();

    let selectedResource: AppStoreSelectedResourcesKeysType | undefined =
      undefined;
    if (graphsMetadata.groupBy === "species") {
      selectedResource = "selectedTaxa";
    } else if (graphsMetadata.groupBy === "places") {
      selectedResource = "selectedPlaces";
    }

    // render data
    renderGraphs(appStore, selectedResource);

    // handle map, grid, media, table
  } else {
    // get data
    let data;
    // use cache data
    if (useCache && obsCache.observations.results) {
      data = obsCache.observations;
      // fetch new data
    } else {
      let spinner = createSpinner();
      spinner.start();

      data = await getAPIData(appStore);

      spinner.stop();
    }

    if (!data) return;

    // display message if no records
    let view =
      appStore.viewMetadata[
        appStore.currentView || "observations_observations"
      ];
    if (view.subview !== "map" && data.results.length == 0) {
      subcontainerEl.innerHTML = "No records found";
      obsCache.observations = {} as iNatObservationsAPI;
      return;
    }

    // store results in store
    obsCache.observations = data;

    // render data
    if (appStore.viewMetadata.observations_observations.subview === "map") {
      renderMap(appStore);
    } else {
      renderGrid(data, paginationCallback, appStore);
    }
  }
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
// graphs data
// ===============

async function getAPIGraphData(params: string, interval: string) {
  try {
    let data = await getHistogram(`${params}&interval=${interval}`);
    if (!data) return;

    return data;
  } catch (error) {
    console.error("ViewObservations getAPIGraphData ERROR:", error);
  }
}

// display message if too many observations
async function graphMaxObservationMessage(
  appStore: AppStoreType,
  spinner: Spinner,
) {
  if (import.meta.env?.VITE_CACHE === "true") {
    return;
  }

  let containerEl =
    document.querySelector<HTMLDivElement>(".subview-container");
  if (!containerEl) return;

  let count = await getObservationCount(appStore);
  if (count && count > 100000000) {
    spinner.stop();
    containerEl.innerHTML = `<p>Please use searches and filters to reduce the total
      number of observations to be less than 100,000,000.</p>`;
    return true;
  }
}

async function getObservationCount(appStore: AppStoreType) {
  let countParamsTemp = cleanupObervationsParamsObject(
    appStore,
    "observations",
  ) as URLSearchParams;
  countParamsTemp.set("per_page", "0");
  let countParams = countParamsTemp.toString();
  let data = await getObservations(countParams.toString());
  return data?.total_results;
}

async function fetchGraphData(appStore: AppStoreType) {
  let cacheData = appStore.cacheData.observations;

  let graphsMetadata = appStore.viewMetadata.observations_observations
    .graphs as viewMetadataGraphs;

  if (import.meta.env?.VITE_CACHE === "true") {
    devCachedGraphData(appStore, graphsMetadata);
    return;
  }

  // fetch histogram data for each species
  if (graphsMetadata.groupBy === "species") {
    let paramsTemp = cleanupObervationsGraphParams(appStore, "observations");

    for await (const taxon of appStore.selectedTaxa) {
      paramsTemp.set("taxon_id", taxon.id.toString());
      let params = paramsTemp.toString();

      if (graphsMetadata.category === "month_of_year") {
        let monthYearData = await getAPIGraphData(params, "month_of_year");
        if (monthYearData) {
          cacheData.graphsSpecies.month_of_year.push(monthYearData.results);
        }
      } else if (graphsMetadata.category === "year") {
        let yearData = await getAPIGraphData(params, "year");
        if (yearData) {
          cacheData.graphsSpecies.year.push(yearData.results);
        }
      } else if (graphsMetadata.category === "month") {
        let monthData = await getAPIGraphData(params, "month");
        if (monthData) {
          cacheData.graphsSpecies.month.push(monthData.results);
        }
      }
    }
    // fetch histogram data for places
  } else if (graphsMetadata.groupBy === "places") {
    let paramsTemp = cleanupObervationsGraphParams(appStore, "observations");

    for await (const place of appStore.selectedPlaces) {
      paramsTemp.set("place_id", place.id.toString());
      let params = paramsTemp.toString();

      if (graphsMetadata.category === "month_of_year") {
        let monthYearData = await getAPIGraphData(params, "month_of_year");
        if (monthYearData) {
          cacheData.graphsPlaces.month_of_year.push(monthYearData.results);
        }
      } else if (graphsMetadata.category === "year") {
        let yearData = await getAPIGraphData(params, "year");
        if (yearData) {
          cacheData.graphsPlaces.year.push(yearData.results);
        }
      } else if (graphsMetadata.category === "month") {
        let monthData = await getAPIGraphData(params, "month");
        if (monthData) {
          cacheData.graphsPlaces.month.push(monthData.results);
        }
      }
    }

    // fetch histogram data
  } else {
    let params = cleanupObervationsGraphParams(
      appStore,
      "observations",
    ).toString();

    if (graphsMetadata.category === "month_of_year") {
      let monthYearData = await getAPIGraphData(params, "month_of_year");
      if (monthYearData) {
        cacheData.graphs.month_of_year = [monthYearData.results];
      }
    } else if (graphsMetadata.category === "year") {
      let yearData = await getAPIGraphData(params, "year");
      if (yearData) {
        cacheData.graphs.year = [yearData.results];
      }
    } else if (graphsMetadata.category === "month") {
      let monthData = await getAPIGraphData(params, "month");
      if (monthData) {
        cacheData.graphs.month = [monthData.results];
      }
    }
  }
}

function devCachedGraphData(
  appStore: AppStoreType,
  graphsMetadata: viewMetadataGraphs,
) {
  let cacheData = appStore.cacheData.observations;

  let monarch = {
    id: 48662,
    name: "Danaus plexippus",
    preferred_common_name: "Monarch",
    color: defaultColorScheme[0],
  } as NormalizediNatTaxonType;
  let milkweed = {
    id: 56851,
    name: "Asclepias fascicularis",
    preferred_common_name: "Narrowleaf Milkweed",
    color: defaultColorScheme[1],
  } as NormalizediNatTaxonType;
  let unitedStates = {
    id: 1,
    name: "United States",
    display_name: "United States",
  };
  let mexico = {
    id: 6793,
    name: "Mexico",
    display_name: "Mexico",
  };

  if (graphsMetadata.groupBy === "species") {
    appStore.selectedTaxa = [monarch, milkweed];
    appStore.observationsApiParams.taxon_id = "48662,56851";

    if (graphsMetadata.category === "month_of_year") {
      cacheData.graphsSpecies.month_of_year = [
        histograph_month_year_monarch.results,
        histograph_month_year_milkweed.results,
      ];
    } else if (graphsMetadata.category === "year") {
      cacheData.graphsSpecies.year = [
        histograph_year_monarch.results,
        histograph_year_milkweed.results,
      ];
    } else if (graphsMetadata.category === "month") {
      cacheData.graphsSpecies.month = [
        histograph_month_monarch.results,
        histograph_month_milkweed.results,
      ];
    }
  } else if (graphsMetadata.groupBy === "places") {
    appStore.selectedTaxa = [monarch];
    appStore.selectedPlaces = [unitedStates, mexico];
    appStore.observationsApiParams.taxon_id = "48662";
    appStore.observationsApiParams.place_id = "1,6793";

    if (graphsMetadata.category === "month_of_year") {
      cacheData.graphsPlaces.month_of_year = [
        histograph_month_year_monarch_us.results,
        histograph_month_year_monarch_mexico.results,
      ];
    } else if (graphsMetadata.category === "year") {
      cacheData.graphsPlaces.year = [
        histograph_year_monarch_us.results,
        histograph_year_monarch_mexico.results,
      ];
    } else if (graphsMetadata.category === "month") {
      cacheData.graphsPlaces.month = [
        histograph_month_monarch_us.results,
        histograph_month_monarch_mexico.results,
      ];
    }
  } else {
    if (graphsMetadata.category === "month_of_year") {
      cacheData.graphs.month_of_year = [histograph_month_year.results];
    } else if (graphsMetadata.category === "year") {
      cacheData.graphs.year = [histograph_year.results];
    } else if (graphsMetadata.category === "month") {
      cacheData.graphs.month = [histograph_month.results];
    }
  }
}

function hasGraphCache(
  appStore: AppStoreType,
  graphsMetadata: viewMetadataGraphs,
) {
  let graphData;
  if (graphsMetadata.groupBy === "species") {
    graphData =
      appStore.cacheData.observations.graphsSpecies[graphsMetadata.category];
  } else if (graphsMetadata.groupBy === "places") {
    graphData =
      appStore.cacheData.observations.graphsPlaces[graphsMetadata.category];
  } else {
    graphData = appStore.cacheData.observations.graphs[graphsMetadata.category];
  }

  console.log(graphData.length > 0, "graphData.length > 0");

  return graphData.length > 0;
}

// ===============
// misc
// ===============

export function displayJSON(data: any, element: HTMLDivElement) {
  let div = document.createElement("div");
  div.innerText = JSON.stringify(data);
  element.appendChild(div);
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

  await fetchAndRenderData(paginationCallback, appStore, false);
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
  } else if (subview === "table") {
    componentContext.tableLinkEl?.classList.add("current-subview");
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

  let graphsMetadata = appStore.viewMetadata.observations_observations
    .graphs as viewMetadataGraphs;
  if (graphsMetadata.groupBy === "species") {
    setInputChecked("#graph-form #group-by-species", true);
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
      console.log(link);
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
  let obsCache = appStore.cacheData.observations;

  // remove map when change from map to other subview
  if (view.subview === "map") {
    removeMap(appStore);
  }

  // update store
  view.subview = subview;

  // HACK: force triggering store proxy
  appStore.viewMetadata = appStore.viewMetadata;

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

  let graphsMetadata = appStore.viewMetadata.observations_observations
    .graphs as viewMetadataGraphs;

  // if no cached graph data, fetch data
  if (subview === "graph") {
    let spinner = createSpinner();
    spinner.start();

    // show max observation message
    if (await graphMaxObservationMessage(appStore, spinner)) {
      return;
    }

    // check if cache data exists
    let graphData = hasGraphCache(appStore, graphsMetadata);
    // fetch data if no cache
    if (!graphData) {
      await fetchGraphData(appStore);
    }

    spinner.stop();

    // if no cache data, fetch data
  } else if (obsCache.observations.results === undefined) {
    let spinner = createSpinner();
    spinner.start();

    let data = await getAPIData(appStore);
    if (data) {
      obsCache.observations = data;
    }

    spinner.stop();
  }

  // render subview
  if (subview === "map") {
    renderMap(appStore);
  } else if (subview === "graph") {
    if (graphsMetadata.groupBy === "species") {
      renderGraphs(appStore, "selectedTaxa");
    } else if (graphsMetadata.groupBy === "places") {
      renderGraphs(appStore, "selectedPlaces");
    } else {
      renderGraphs(appStore, undefined);
    }
  } else if (subview === "table") {
    renderTable(obsCache.observations, paginationCallback, appStore);
  } else {
    renderGrid(obsCache.observations, paginationCallback, appStore);
  }

  // add subview to url
  updateAppUrl(window.location, appStore);
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
  await fetchAndRenderData(paginationCallback, appStore, false);
  updateAppUrl(window.location, appStore);
}

// called when graph category or group by is changed
export async function updateGraphs(formData: FormData, appStore: AppStoreType) {
  let graphsMetadata = appStore.viewMetadata.observations_observations
    .graphs as viewMetadataGraphs;

  if (formData.get("graphs-group-by") === "species") {
    graphsMetadata.groupBy = "species";
  } else if (formData.get("graphs-group-by") === "places") {
    graphsMetadata.groupBy = "places";
  } else {
    delete graphsMetadata.groupBy;
  }

  let category = formData.get("graphs-category");
  if (category) {
    graphsMetadata.category = category as GraphCategory;
  }

  let spinner = createSpinner();
  spinner.start();

  // check if cache data exists
  let graphData = hasGraphCache(appStore, graphsMetadata);
  // fetch data if no cache
  if (!graphData) {
    await fetchGraphData(appStore);
  }

  spinner.stop();

  if (graphsMetadata.groupBy === "species") {
    renderGraphs(appStore, "selectedTaxa");
  } else if (graphsMetadata.groupBy === "places") {
    renderGraphs(appStore, "selectedPlaces");
  } else {
    renderGraphs(appStore, undefined);
  }
}

export function toggleGraphOptions(
  appStore: AppStoreType,
  componentContext: any,
) {
  let speciesOption = componentContext.querySelector(
    "#graphs-group-by option[value='species']",
  );
  if (!speciesOption) return;
  let placesOption = componentContext.querySelector(
    "#graphs-group-by option[value='places']",
  );
  if (!placesOption) return;

  if (appStore.selectedTaxa.length === 0 || appStore.selectedTaxa[0].id === 0) {
    speciesOption.disabled = true;
  } else {
    speciesOption.disabled = false;
  }

  if (
    appStore.selectedPlaces.length === 0 ||
    appStore.selectedPlaces[0].id === 0
  ) {
    placesOption.disabled = true;
  } else {
    placesOption.disabled = false;
  }
}

// ===============
// map subview
// ===============

export function createMap() {
  let divEl = document.createElement("div");
  divEl.id = "map";
  return divEl;
}

function renderMap(appStore: AppStoreType) {
  let containerEl = document.querySelector(".subview-container");
  let orderFormEl = document.querySelector("#order-form");
  let graphGroupByFormEl = document.querySelector("#graph-form");
  if (!containerEl) return;
  if (!orderFormEl) return;
  if (!graphGroupByFormEl) return;

  if (!appStore.map.map) {
    containerEl.innerHTML = "";
  }
  orderFormEl.className = "hide";
  graphGroupByFormEl.className = "hide";

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

// ===============
// grid subview
// ===============

export function createGrid(results: ObservationsResult[]) {
  let containerEl = document.createElement("div");
  containerEl.className = "observations-grid grid-auto-fill";

  results.forEach((row) => {
    let cardEl = document.createElement(
      "card-observation",
    ) as unknown as DataComponentType;
    cardEl.data = row;
    containerEl.appendChild(cardEl);
  });

  return containerEl;
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
  let orderFormEl = document.querySelector("#order-form");
  let graphGroupByFormEl = document.querySelector("#graph-form");
  if (!containerEl) return;
  if (!orderFormEl) return;
  if (!graphGroupByFormEl) return;

  let view = appStore.viewMetadata.observations_observations;

  containerEl.innerHTML = "";
  orderFormEl.className = "";
  graphGroupByFormEl.className = "hide";

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

// ===============
// media subview
// ===============

export function createMediaGrid(results: ObservationsResult[]) {
  let containerEl = document.createElement("div");
  containerEl.className = "observations-media-grid grid-auto-fill";
  results.forEach((record) => {
    let media = record.photos.concat(record.sounds);
    media.forEach((medium, j) => {
      let cardEl = document.createElement(
        "card-media",
      ) as unknown as DataComponentType;
      cardEl.data = {
        observation: record,
        media: medium,
        mediaIndex: j,
        type: medium.url ? "photo" : "sound",
      };
      containerEl.appendChild(cardEl);
    });
  });

  return containerEl;
}

// ===============
// table subview
// ===============

export function createTable(
  results: ObservationsResult[],
  appStore: AppStoreType,
) {
  let tableEl = document.createElement("table") as HTMLElement;
  tableEl.className = "observations-table table";

  let rowEl = document.createElement("tr");

  let tdEl = document.createElement("th");
  tdEl.textContent = "Media";
  rowEl.appendChild(tdEl);

  tdEl = document.createElement("th");
  tdEl.textContent = "Name";
  rowEl.appendChild(tdEl);

  tdEl = document.createElement("th");
  tdEl.textContent = "User";
  rowEl.appendChild(tdEl);

  tdEl = document.createElement("th");
  tdEl.textContent = "Place";
  rowEl.appendChild(tdEl);

  tdEl = document.createElement("th");
  tdEl.textContent = "Observed";
  rowEl.appendChild(tdEl);

  tdEl = document.createElement("th");
  tdEl.textContent = "Added";
  rowEl.appendChild(tdEl);

  tableEl.appendChild(rowEl);

  results.forEach((row) => {
    let rowEl = document.createElement("tr");

    // media
    let tdEl = document.createElement("td");
    tdEl.className = "media-cell";
    let url = `${iNatObservationUrl}/${row.id}`;
    tdEl.innerHTML = renderMedia(
      url,
      row.taxon,
      row.photos,
      row.sounds,
      appStore,
      true,
      "square",
    );
    rowEl.appendChild(tdEl);

    // taxon name, observation metadata
    tdEl = document.createElement("td");
    tdEl.className = "name";
    let observationContent = ``;

    if (row.taxon) {
      observationContent += renderTaxonNames(
        row.taxon,
        appStore,
        `${iNatObservationUrl}/${row.id}`,
      );

      // some obsevations only have sound and no tax info
    } else {
      observationContent += `<span class="title">`;
      observationContent += `<a href="${iNatObservationUrl}/${row.id}">Unknown</a>`;
      observationContent += "</span>";
    }

    observationContent += renderQualityGrade(row.quality_grade);
    observationContent += renderObservationMetadataCounts(row);

    tdEl.innerHTML = observationContent;
    rowEl.appendChild(tdEl);

    // user
    tdEl = document.createElement("td");
    tdEl.className = "user";
    tdEl.innerHTML = renderUser(row.user);
    rowEl.appendChild(tdEl);

    // place
    tdEl = document.createElement("td");
    tdEl.className = "place";
    let placeContent = renderPlace(row.place_guess, row.obscured);
    tdEl.innerHTML = placeContent;
    rowEl.appendChild(tdEl);

    // observed on
    tdEl = document.createElement("td");
    tdEl.className = "observed";
    if (row.time_observed_at) {
      tdEl.innerText = ` ${formatDateLong(row.time_observed_at, row.observed_time_zone)}`;
    }
    rowEl.appendChild(tdEl);

    // created
    tdEl = document.createElement("td");
    tdEl.className = "created";
    tdEl.innerText = ` ${formatDateLong(row.created_at, row.created_time_zone)}`;

    rowEl.appendChild(tdEl);

    tableEl.appendChild(rowEl);
  });

  return tableEl;
}

function renderTable(
  data: iNatObservationsAPI,
  paginationCallback: any,
  appStore: AppStoreType,
) {
  let containerEl = document.querySelector(".subview-container");
  let orderFormEl = document.querySelector("#order-form");
  let graphGroupByFormEl = document.querySelector("#graph-form");
  if (!containerEl) return;
  if (!orderFormEl) return;
  if (!graphGroupByFormEl) return;

  containerEl.innerHTML = "";
  orderFormEl.className = "";
  graphGroupByFormEl.className = "hide";

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

  subviewEl.appendChild(createTable(data.results, appStore));
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

// ===============
// graph subview
// ===============

export async function renderGraphs(
  appStore: AppStoreType,
  selectedResource?: AppStoreSelectedResourcesKeysType,
) {
  let containerEl =
    document.querySelector<HTMLDivElement>(".subview-container");
  let orderFormEl = document.querySelector("#order-form");
  let graphGroupByFormEl = document.querySelector("#graph-form");
  if (!containerEl) return;
  if (!orderFormEl) return;
  if (!graphGroupByFormEl) return;

  let graphsMetadata = appStore.viewMetadata.observations_observations
    .graphs as viewMetadataGraphs;

  containerEl.innerHTML = "";
  orderFormEl.className = "hide";
  graphGroupByFormEl.className = "";

  let subviewEl = document.createElement("div");
  subviewEl.className = "observations-subview";

  let cacheData = appStore.cacheData.observations;
  let data;
  if (graphsMetadata.groupBy === "species") {
    data = cacheData.graphsSpecies[graphsMetadata.category];
  } else if (graphsMetadata.groupBy === "places") {
    data = cacheData.graphsPlaces[graphsMetadata.category];
  } else {
    data = cacheData.graphs[graphsMetadata.category];
  }

  if (data.length > 0) {
    let graph = createGraphs(data, appStore, selectedResource);
    if (graph) {
      subviewEl.appendChild(graph);
    }
  }

  containerEl.append(subviewEl);
}
