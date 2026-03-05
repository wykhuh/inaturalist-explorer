import {
  cleanupObervationsHistogramParams,
  cleanupObervationsParams,
  cleanupObervationsParamsObject,
  cleanupObervationsPopularFieldsBasicParams,
  cleanupObervationsPopularFieldsParams,
} from "../../lib/cleanup_params_utils";
import {
  getHistogram,
  getObservations,
  getPopularFields,
  getPopularFieldsBasic,
} from "../../lib/inat_api";
import { createSpinner } from "../../lib/spinner";
import { updateAppUrl } from "../../lib/utils";
import type {
  iNatObservationsAPI,
  iNatPopularFieldsBasicAPI,
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
  GraphCategory,
  NormalizedPopularFields,
  PopularFieldsByTermId,
  PopularFieldAnnotation,
  ControlledAttributeBasic,
} from "../../types/app";
import { observations_fields_annotations as observations } from "../../data/api/observations";
import { setInputChecked, setSelectedOption } from "../../lib/form_utils";
import { updateSelectedResourcesId } from "../../lib/count_utils";
import {
  formatTaxonName,
  isObservationsCheck,
  replaceWithCacheImages,
  resetPageNumber,
} from "../../lib/data_utils";
import { initRenderMap } from "../../lib/init_app";
import { removeMap } from "../../lib/map_utils";
import { createGraphs, createPopularFieldsGraphs } from "./charts_utils";
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
import {
  popular_fields_basic_milkweed,
  popular_fields_basic_monarch,
  processedPopularFields,
} from "../../data/api/popular_fields";

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
    obsCache.popularFieldsOptions = [];
    obsCache.popularFields = {};
  }

  fetchDataForGraphCategories(appStore);

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

async function getAPIHistogramData(params: string, interval: string) {
  try {
    let data = await getHistogram(`${params}&interval=${interval}`);
    if (!data) return;

    return data;
  } catch (error) {
    console.error("ViewObservations getAPIHistogramData ERROR:", error);
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

  // fetch popular fields data for each species
  if (/\d+/.test(graphsMetadata.category)) {
    let data = [];
    let paramsTemp = cleanupObervationsPopularFieldsParams(
      appStore,
      "observations",
    );
    for await (const taxon of appStore.selectedTaxa) {
      paramsTemp.set("taxon_id", taxon.id.toString());
      let params = paramsTemp.toString();

      let fieldsData = (await getAPIPopularFieldsData(
        params,
      )) as NormalizedPopularFields;
      if (fieldsData) {
        // add taxon data
        let { title, subtitle } = formatTaxonName(taxon, appStore);
        fieldsData.taxon_id = taxon.id;
        if (title) {
          fieldsData.taxon_name = subtitle ? `${title} (${subtitle})` : title;
        }

        data.push(fieldsData);
      }
    }

    let popularFields = formatPopularFields(data);
    cacheData.popularFields = popularFields;
    // fetch histogram data for each species
  } else if (graphsMetadata.groupBy === "species") {
    let paramsTemp = cleanupObervationsHistogramParams(
      appStore,
      "observations",
    );

    for await (const taxon of appStore.selectedTaxa) {
      paramsTemp.set("taxon_id", taxon.id.toString());
      let params = paramsTemp.toString();

      if (graphsMetadata.category === "month_of_year") {
        let monthYearData = await getAPIHistogramData(params, "month_of_year");
        if (monthYearData) {
          cacheData.graphsSpecies.month_of_year.push(monthYearData.results);
        }
      } else if (graphsMetadata.category === "year") {
        let yearData = await getAPIHistogramData(params, "year");
        if (yearData) {
          cacheData.graphsSpecies.year.push(yearData.results);
        }
      } else if (graphsMetadata.category === "month") {
        let monthData = await getAPIHistogramData(params, "month");
        if (monthData) {
          cacheData.graphsSpecies.month.push(monthData.results);
        }
      }
    }
    // fetch histogram data for places
  } else if (graphsMetadata.groupBy === "places") {
    let paramsTemp = cleanupObervationsHistogramParams(
      appStore,
      "observations",
    );

    for await (const place of appStore.selectedPlaces) {
      paramsTemp.set("place_id", place.id.toString());
      let params = paramsTemp.toString();

      if (graphsMetadata.category === "month_of_year") {
        let monthYearData = await getAPIHistogramData(params, "month_of_year");
        if (monthYearData) {
          cacheData.graphsPlaces.month_of_year.push(monthYearData.results);
        }
      } else if (graphsMetadata.category === "year") {
        let yearData = await getAPIHistogramData(params, "year");
        if (yearData) {
          cacheData.graphsPlaces.year.push(yearData.results);
        }
      } else if (graphsMetadata.category === "month") {
        let monthData = await getAPIHistogramData(params, "month");
        if (monthData) {
          cacheData.graphsPlaces.month.push(monthData.results);
        }
      }
    }

    // fetch histogram data
  } else {
    let params = cleanupObervationsHistogramParams(
      appStore,
      "observations",
    ).toString();

    if (graphsMetadata.category === "month_of_year") {
      let monthYearData = await getAPIHistogramData(params, "month_of_year");
      if (monthYearData) {
        cacheData.graphs.month_of_year = [monthYearData.results];
      }
    } else if (graphsMetadata.category === "year") {
      let yearData = await getAPIHistogramData(params, "year");
      if (yearData) {
        cacheData.graphs.year = [yearData.results];
      }
    } else if (graphsMetadata.category === "month") {
      let monthData = await getAPIHistogramData(params, "month");
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

  let popularFieldsOptions = formatPopularFieldsOptions([
    popular_fields_basic_milkweed,
    popular_fields_basic_monarch,
  ]);
  appStore.cacheData.observations.popularFieldsOptions = popularFieldsOptions;

  appStore.selectedTaxa = [monarch, milkweed];
  appStore.observationsApiParams.taxon_id = "48662,56851";
  appStore.selectedPlaces = [unitedStates, mexico];
  appStore.observationsApiParams.place_id = "1,6793";

  if (graphsMetadata.groupBy === "species") {
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
  cacheData.popularFields = processedPopularFields;
}

function hasGraphCache(
  appStore: AppStoreType,
  graphsMetadata: viewMetadataGraphs,
) {
  let graphData;
  let category = graphsMetadata.category;
  if (graphsMetadata.groupBy === "species") {
    if (
      category === "month_of_year" ||
      category === "year" ||
      category === "month"
    ) {
      graphData = appStore.cacheData.observations.graphsSpecies[category];
    } else {
      graphData = appStore.cacheData.observations.popularFields[category];
    }
  } else if (graphsMetadata.groupBy === "places") {
    if (
      category === "month_of_year" ||
      category === "year" ||
      category === "month"
    ) {
      graphData = appStore.cacheData.observations.graphsPlaces[category];
    } else {
      graphData = appStore.cacheData.observations.popularFields[category];
    }
  } else {
    if (
      category === "month_of_year" ||
      category === "year" ||
      category === "month"
    ) {
      graphData = appStore.cacheData.observations.graphs[category];
    } else {
      graphData = appStore.cacheData.observations.popularFields[category];
    }
  }

  return graphData && graphData.length > 0;
}

export function renderGraphCategorySelect(
  appStore: AppStoreType,
  componentContext: any,
) {
  let selectEl = componentContext.querySelector("select#graphs-category");
  if (!selectEl) return;

  selectEl.innerHTML = `
    <option value="month_of_year">Month/Year</option>
    <option value="year">Year</option>
    <option value="month">Month</option>
  `;

  appStore.cacheData.observations.popularFieldsOptions.forEach((field) => {
    let optionEl = document.createElement("option");
    optionEl.value = field.id.toString();
    optionEl.textContent = field.label;
    optionEl.dataset.graphType = "popular-fields";

    selectEl.appendChild(optionEl);
  });
}

// ===============
// popular fields data
// ===============

async function getAPIPopularFieldsData(params: string) {
  try {
    let data = await getPopularFields(`${params}`);
    if (!data) return;

    return data;
  } catch (error) {
    console.error("ViewObservations getAPIPopularFieldsData ERROR:", error);
  }
}

async function getAPIPopularFieldsBasicData(params: string) {
  try {
    let data = await getPopularFieldsBasic(params);
    if (!data) return;

    return data;
  } catch (error) {
    console.error(
      "ViewObservations getAPIPopularFieldsBasicData ERROR:",
      error,
    );
  }
}

// fetch basic popular fields data for each species to create select menu
async function fetchDataForGraphCategories(appStore: AppStoreType) {
  let data = [];
  let paramsTemp = cleanupObervationsPopularFieldsBasicParams(
    appStore,
    "observations",
  );
  for await (const taxon of appStore.selectedTaxa) {
    paramsTemp.set("taxon_id", taxon.id.toString());
    let params = paramsTemp.toString();
    let res = await getAPIPopularFieldsBasicData(params);
    if (res) {
      data.push(res);
    }
  }

  let popularFieldsOptions = formatPopularFieldsOptions(data);
  appStore.cacheData.observations.popularFieldsOptions = popularFieldsOptions;
  window.dispatchEvent(new Event("popularFieldsOptionsChanged"));
}

export function formatPopularFieldsOptions(data: iNatPopularFieldsBasicAPI[]) {
  let fieldIds = new Set();
  let fields: ControlledAttributeBasic[] = [];
  data.forEach((datum) => {
    datum.results.forEach((field) => {
      if (!fieldIds.has(field.controlled_attribute.id)) {
        fieldIds.add(field.controlled_attribute.id);
        fields.push({
          id: field.controlled_attribute.id,
          label: field.controlled_attribute.label,
        });
      }
    });
  });

  return fields;
}

export function formatPopularFields(data: NormalizedPopularFields[]) {
  let popularFields = {} as PopularFieldsByTermId;
  data.forEach((datum) => {
    datum.results.forEach((result) => {
      let term_id = result.controlled_attribute.id;
      if (popularFields[term_id] === undefined) {
        popularFields[term_id] = [];
      }
    });
    Object.keys(popularFields).forEach((term_id) => {
      let annotations: PopularFieldAnnotation[] = [];
      let controlled_attribute = {} as ControlledAttributeBasic;
      datum.results.forEach((result) => {
        if (result.controlled_attribute.id === Number(term_id)) {
          annotations.push({
            controlled_value: result.controlled_value,
            month_of_year: result.month_of_year,
            count: result.count,
          });
          controlled_attribute = result.controlled_attribute;
        }
      });
      if (annotations.length > 0) {
        popularFields[Number(term_id)].push({
          annotations: annotations,
          unannotated: datum.unannotated[term_id],
          controlled_attribute: controlled_attribute,
          taxon_id: datum.taxon_id,
          taxon_name: datum.taxon_name,
        });
      }
    });
  });

  return popularFields;
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

// filter observations using methods not supported by iNat API
function filterObservationsBeta(
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

  let groupBy = formData.get("graphs-group-by");
  if (groupBy === "species") {
    graphsMetadata.groupBy = "species";
  } else if (groupBy === "places") {
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

export function disableGroupByForSelectedResources(
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

  // enable species option if there are selected taxa
  if (appStore.selectedTaxa.length === 0 || appStore.selectedTaxa[0].id === 0) {
    speciesOption.disabled = true;
  } else {
    speciesOption.disabled = false;
  }

  // enable places option if there are selected places
  if (
    appStore.selectedPlaces.length === 0 ||
    appStore.selectedPlaces[0].id === 0
  ) {
    placesOption.disabled = true;
  } else {
    placesOption.disabled = false;
  }
}

export function disablePopularFieldsOptions(
  target: HTMLSelectElement,
  appStore: AppStoreType,
  componentContext: any,
) {
  let graphMetadata = appStore.viewMetadata.observations_observations.graphs;
  if (!graphMetadata) return;

  // disable popular fields options if group by places or species
  if (target.value === "places" || target.value === "species") {
    // deselect current option if it is popular field
    let currentPopularFieldOption = componentContext.querySelector(
      "#graphs-category option:checked[data-graph-type='popular-fields']",
    );
    if (currentPopularFieldOption) {
      currentPopularFieldOption.selected = false;
      graphMetadata.category = "month_of_year";
    }

    // disable popular fields
    componentContext
      .querySelectorAll('[data-graph-type="popular-fields"]')
      .forEach((option: HTMLOptionElement) => {
        option.disabled = true;
      });
  } else {
    // enable popular  fields
    componentContext
      .querySelectorAll('[data-graph-type="popular-fields"]')
      .forEach((option: HTMLOptionElement) => {
        option.disabled = false;
      });
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

  let filteredObservations = filterObservationsBeta(data, appStore);

  if (view.subview === "media") {
    subviewEl.appendChild(createMediaGrid(filteredObservations));
  } else {
    subviewEl.appendChild(createGrid(filteredObservations));
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

  let filteredObservations = filterObservationsBeta(data, appStore);

  subviewEl.appendChild(createTable(filteredObservations, appStore));
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
  let category = graphsMetadata.category;
  let data;

  if (
    category === "month_of_year" ||
    category === "year" ||
    category === "month"
  ) {
    if (graphsMetadata.groupBy === "species") {
      data = cacheData.graphsSpecies[category];
    } else if (graphsMetadata.groupBy === "places") {
      data = cacheData.graphsPlaces[category];
    } else {
      data = cacheData.graphs[category];
    }

    if (data.length > 0) {
      let graph = createGraphs(data, appStore, selectedResource);
      if (graph) {
        subviewEl.appendChild(graph);
      }
    }
  } else {
    data = cacheData.popularFields[category];
    data.forEach((datum) => {
      let graph = createPopularFieldsGraphs(datum, appStore);
      if (graph) {
        subviewEl.appendChild(graph);
      }
    });
  }

  containerEl.append(subviewEl);
}
