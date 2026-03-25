import {
  cleanupObervationsHistogramParams,
  cleanupObervationsPopularFieldsBasicParams,
  cleanupObervationsPopularFieldsParams,
} from "../../lib/cleanup_params_utils";
import {
  getHistogram,
  getPopularFields,
  getPopularFieldsBasic,
} from "../../lib/inat_api";
import { createSpinner } from "../../lib/spinner";
import type { iNatPopularFieldsBasicAPI } from "../../types/inat_api";
import type {
  AppStoreType,
  viewMetadataGraphs,
  NormalizediNatTaxonType,
  GraphCategory,
  NormalizedPopularFields,
  PopularFieldsByTermId,
  PopularFieldAnnotation,
  ControlledAttributeBasic,
  AppStoreSelectedResourcesKeysType,
} from "../../types/app";
import { formatTaxonName, isPopularFieldCategory } from "../../lib/data_utils";

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
  // popular_fields_basic_milkweed,
  // popular_fields_basic_monarch,
  // popular_fields_milkweed,
  // popular_fields_monarch,
  popular_fields_basic_canyon_gooseberry,
  popular_fields_basic_hillside_gooseberry,
  popular_fields_canyon_gooseberry,
  popular_fields_hillside_gooseberry,
} from "../../data/api/popular_fields";
import {
  createGraphs,
  createPopularFieldsGraphs,
  createPopularFieldsGraphsForTaxon,
} from "./charts_utils";
import { calculateObservationsCount } from "../../lib/count_utils";
import { setSelectedOption } from "../../lib/form_utils";
import { updateAppUrl } from "../../lib/utils";
import { annotationsValues } from "../../data/inat_data";

// ===============
// UI
// ===============

export async function renderGraphs(
  appStore: AppStoreType,
  componentContext: HTMLElement,
  selectedResource?: AppStoreSelectedResourcesKeysType,
) {
  let dataContainer = componentContext.querySelector<HTMLDivElement>(
    "#subview-data-container",
  );
  if (!dataContainer) return;
  dataContainer.innerHTML = "";

  let graphsMetadata = appStore.viewMetadata.observations_observations
    .graphs as viewMetadataGraphs;

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
    let graph = createGraphs(data, appStore, selectedResource);
    if (graph) {
      dataContainer.appendChild(graph);
    }
  } else {
    data = cacheData.popularFields[category];
    if (data) {
      if (graphsMetadata.groupBy === "species") {
        let graph = createPopularFieldsGraphs(data);
        if (graph) {
          dataContainer.appendChild(graph);
        }
      } else {
        data.forEach((datum) => {
          let graph = createPopularFieldsGraphsForTaxon(datum);
          if (graph) {
            dataContainer.appendChild(graph);
          }
        });
      }
    }
  }
}

export function disablePopularFieldsOptions(
  target: HTMLSelectElement,
  appStore: AppStoreType,
  componentContext: HTMLElement,
) {
  let graphMetadata = appStore.viewMetadata.observations_observations.graphs;
  if (!graphMetadata) return;

  // disable popular fields options if group by places
  if (target.value === "places") {
    // deselect current option if it is popular field
    let currentPopularFieldOption =
      componentContext.querySelector<HTMLOptionElement>(
        "#graphs-category option:checked[data-graph-type='popular-fields']",
      );
    if (currentPopularFieldOption) {
      currentPopularFieldOption.selected = false;
      graphMetadata.category = "month_of_year";
    }

    // disable popular fields
    componentContext
      .querySelectorAll<HTMLOptionElement>('[data-graph-type="popular-fields"]')
      .forEach((option) => {
        option.disabled = true;
      });
  } else {
    // enable popular  fields
    componentContext
      .querySelectorAll<HTMLOptionElement>('[data-graph-type="popular-fields"]')
      .forEach((option) => {
        option.disabled = false;
      });
  }
}

// called when graph category or group by is changed
export async function updateGraphs(
  formData: FormData,
  appStore: AppStoreType,
  componentContext: HTMLElement,
) {
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
    await fetchGraphData(
      appStore,
      getAPIHistogramData,
      getAPIPopularFieldsData,
    );
  }

  spinner.stop();

  if (graphsMetadata.groupBy === "species") {
    renderGraphs(appStore, componentContext, "selectedTaxa");
  } else if (graphsMetadata.groupBy === "places") {
    renderGraphs(appStore, componentContext, "selectedPlaces");
  } else {
    renderGraphs(appStore, componentContext, undefined);
  }
  updateAppUrl(window.location, appStore);
}

export function disableGroupByForSelectedResources(
  appStore: AppStoreType,
  componentContext: HTMLElement,
) {
  let speciesOption = componentContext.querySelector<HTMLOptionElement>(
    "#graphs-group-by option[value='species']",
  );
  if (!speciesOption) return;
  let placesOption = componentContext.querySelector<HTMLOptionElement>(
    "#graphs-group-by option[value='places']",
  );
  if (!placesOption) return;

  // enable species option if there are selected taxa
  if (appStore.selectedTaxa.length < 2) {
    speciesOption.disabled = true;
    speciesOption.selected = false;
  } else {
    speciesOption.disabled = false;
  }

  // enable places option if there are selected places
  if (appStore.selectedPlaces.length < 2 || isPopularFieldCategory(appStore)) {
    placesOption.disabled = true;
    placesOption.selected = false;
  } else {
    placesOption.disabled = false;
  }
}

export function graphMaxObservationMessage(
  appStore: AppStoreType,
  componentContext: HTMLElement,
) {
  if (graphHasMaxObservation(appStore)) {
    let dataContainer = componentContext.querySelector<HTMLDivElement>(
      "#subview-data-container",
    );
    if (dataContainer) {
      dataContainer.innerHTML = "";

      dataContainer.innerText =
        "Please use searches and filters to lower the observation count to less than 100,000,000.";
    }
    return true;
  }
}

export function renderGraphCategorySelect(
  appStore: AppStoreType,
  componentContext: HTMLElement,
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

export function initGraphFilters(appStore: AppStoreType) {
  let graphMetadata = appStore.viewMetadata.observations_observations.graphs;
  if (graphMetadata) {
    if (graphMetadata.category) {
      setSelectedOption(
        `#graph-form select#graphs-category option[value='${graphMetadata.category}']`,
      );
    }
    if (graphMetadata.groupBy) {
      setSelectedOption(
        `#graph-form select#graphs-group-by option[value='${graphMetadata.groupBy}']`,
      );
    }
  }
}

// ===============
// graphs data
// ===============

export async function getAPIHistogramData(params: string, interval: string) {
  try {
    let data = await getHistogram(`${params}&interval=${interval}`);
    if (!data) return;

    return data;
  } catch (error) {
    console.error("ViewObservations getAPIHistogramData ERROR:", error);
  }
}

// check if too many observations
export function graphHasMaxObservation(appStore: AppStoreType) {
  if (import.meta.env?.VITE_CACHE === "true") {
    return;
  }

  let count = calculateObservationsCount(appStore);
  if (count && count > 100000000) {
    return true;
  }
}

export async function fetchGraphData(
  appStore: AppStoreType,
  getAPIHistogramDataFn: any,
  getAPIPopularFieldsDataFn: any,
) {
  let cacheData = appStore.cacheData.observations;

  let graphsMetadata = appStore.viewMetadata.observations_observations
    .graphs as viewMetadataGraphs;

  if (import.meta.env?.VITE_CACHE === "true") {
    devCachedGraphData(appStore, graphsMetadata);
    return;
  }

  // fetch popular fields data for each species
  if (isPopularFieldCategory(appStore) && appStore.selectedTaxa[0].id !== 0) {
    let data = [];
    let params = cleanupObervationsPopularFieldsParams(
      appStore,
      "observations",
    );
    for await (const taxon of appStore.selectedTaxa) {
      params.set("taxon_id", taxon.id.toString());

      let fieldsData = (await getAPIPopularFieldsDataFn(
        params.toString(),
      )) as NormalizedPopularFields;

      if (fieldsData) {
        // add taxon data
        let { title, subtitle } = formatTaxonName(taxon, appStore);
        fieldsData.taxon_id = taxon.id;
        fieldsData.taxon_name = title || subtitle || "Unknown";

        data.push(fieldsData);
      }
    }

    let popularFields = formatPopularFields(data);
    cacheData.popularFields = popularFields;

    // fetch histogram data for each species
  } else if (
    graphsMetadata.groupBy === "species" &&
    appStore.selectedTaxa[0].id !== 0
  ) {
    let params = cleanupObervationsHistogramParams(appStore, "observations");

    for await (const taxon of appStore.selectedTaxa) {
      params.set("taxon_id", taxon.id.toString());

      if (graphsMetadata.category === "month_of_year") {
        let monthYearData = await getAPIHistogramDataFn(
          params.toString(),
          "month_of_year",
        );
        if (monthYearData) {
          cacheData.graphsSpecies.month_of_year.push(monthYearData.results);
        }
      } else if (graphsMetadata.category === "year") {
        setLastTenYears(params);
        let yearData = await getAPIHistogramDataFn(params.toString(), "year");
        if (yearData) {
          cacheData.graphsSpecies.year.push(yearData.results);
        }
      } else if (graphsMetadata.category === "month") {
        setLastTenYears(params);
        let monthData = await getAPIHistogramDataFn(params.toString(), "month");
        if (monthData) {
          cacheData.graphsSpecies.month.push(monthData.results);
        }
      }
    }
    // fetch histogram data for places
  } else if (
    graphsMetadata.groupBy === "places" &&
    appStore.selectedPlaces[0].id !== 0
  ) {
    let params = cleanupObervationsHistogramParams(appStore, "observations");

    for await (const place of appStore.selectedPlaces) {
      params.set("place_id", place.id.toString());

      if (graphsMetadata.category === "month_of_year") {
        let monthYearData = await getAPIHistogramDataFn(
          params.toString(),
          "month_of_year",
        );
        if (monthYearData) {
          cacheData.graphsPlaces.month_of_year.push(monthYearData.results);
        }
      } else if (graphsMetadata.category === "year") {
        setLastTenYears(params);
        let yearData = await getAPIHistogramDataFn(params.toString(), "year");
        if (yearData) {
          cacheData.graphsPlaces.year.push(yearData.results);
        }
      } else if (graphsMetadata.category === "month") {
        setLastTenYears(params);
        let monthData = await getAPIHistogramDataFn(params.toString(), "month");
        if (monthData) {
          cacheData.graphsPlaces.month.push(monthData.results);
        }
      }
    }

    // fetch histogram data
  } else {
    let params = cleanupObervationsHistogramParams(appStore, "observations");

    if (graphsMetadata.category === "year") {
      setLastTenYears(params);
      let yearData = await getAPIHistogramDataFn(params.toString(), "year");
      if (yearData) {
        cacheData.graphs.year = [yearData.results];
      }
    } else if (graphsMetadata.category === "month") {
      setLastTenYears(params);
      let monthData = await getAPIHistogramDataFn(params.toString(), "month");
      if (monthData) {
        cacheData.graphs.month = [monthData.results];
      }
    } else {
      let monthYearData = await getAPIHistogramDataFn(
        params.toString(),
        "month_of_year",
      );

      if (monthYearData) {
        cacheData.graphs.month_of_year = [monthYearData.results];
      }
    }
  }
}

function setLastTenYears(params: URLSearchParams) {
  if (params.get("d1") === null) {
    let year = new Date().getFullYear() - 10;
    params.set("d1", `${year}-01-01`);
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
    popular_fields_basic_canyon_gooseberry,
    popular_fields_basic_hillside_gooseberry,
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

  let data1 = structuredClone(
    popular_fields_canyon_gooseberry,
  ) as NormalizedPopularFields;
  data1.taxon_id = 1;
  data1.taxon_name = "milkweed";

  let data2 = structuredClone(
    popular_fields_hillside_gooseberry,
  ) as NormalizedPopularFields;
  data2.taxon_id = 2;
  data2.taxon_name = "monarch";

  cacheData.popularFields = formatPopularFields([data1, data2]);
}

export function hasGraphCache(
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

// ===============
// popular fields data
// ===============

export async function getAPIPopularFieldsData(params: string) {
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
export async function fetchDataForGraphCategories(appStore: AppStoreType) {
  let data = [];
  let paramsTemp = cleanupObervationsPopularFieldsBasicParams(
    appStore,
    "observations",
  );
  for await (const taxon of appStore.selectedTaxa) {
    if (taxon.id === 0) {
      continue;
    }
    paramsTemp.set("taxon_id", taxon.id.toString());
    let params = paramsTemp.toString();

    let res = await getAPIPopularFieldsBasicData(params);
    if (res) {
      data.push(res);
    }
  }

  let popularFieldsOptions = formatPopularFieldsOptions(data);
  appStore.cacheData.observations.popularFieldsOptions = popularFieldsOptions;
  window.dispatchEvent(new Event("popularFieldsOptionsChange"));
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
  // keep track of all term value ids for each term id
  let termIdValueIds = createTermIdValueIds(data);

  let popularFields = {} as PopularFieldsByTermId;
  data.forEach((datum) => {
    datum.results.forEach((result) => {
      let term_id = result.controlled_attribute.id;
      if (popularFields[term_id] === undefined) {
        popularFields[term_id] = [];
      }
    });

    Object.keys(popularFields)
      .map((term_id) => Number(term_id))
      .forEach((term_id) => {
        let missingValuesIds = new Set([...termIdValueIds[term_id]]);

        let annotations: PopularFieldAnnotation[] = [];
        let controlled_attribute = {} as ControlledAttributeBasic;
        datum.results.forEach((result) => {
          if (result.controlled_attribute.id === Number(term_id)) {
            missingValuesIds.delete(result.controlled_value.id);

            annotations.push({
              controlled_value: result.controlled_value,
              month_of_year: result.month_of_year,
              count: result.count,
            });
            controlled_attribute = result.controlled_attribute;
          }
        });

        // add record with zero values so all charts have the same
        // term values
        if (missingValuesIds.size != termIdValueIds[term_id].size) {
          missingValuesIds.forEach((id) => {
            annotations.push(createMissingChartData(id));
          });
        }

        // sort graph data by term value id
        annotations = annotations.sort(
          (a, b) => a.controlled_value.id - b.controlled_value.id,
        );

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

export function createTermIdValueIds(data: NormalizedPopularFields[]) {
  let termIdValueIds: { [k: number]: Set<number> } = {};
  data.forEach((datum) => {
    datum.results.forEach((result) => {
      let term_id = result.controlled_attribute.id;

      if (termIdValueIds[term_id] === undefined) {
        termIdValueIds[term_id] = new Set();
      }
      termIdValueIds[term_id].add(result.controlled_value.id);
    });
  });

  return termIdValueIds;
}

function createMissingChartData(id: number) {
  return {
    controlled_value: {
      id: id,
      // @ts-ignore
      label: annotationsValues[id],
    },
    month_of_year: {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0,
      "9": 0,
      "10": 0,
      "11": 0,
      "12": 0,
    },
    count: 0,
  };
}

export function updateInvalidGraphCategory(
  appStore: AppStoreType,
  graphsMetadata?: viewMetadataGraphs,
) {
  if (!graphsMetadata) return;

  // manually set graphs_category for cases when graphs_category is set to
  // popular fields id but there are no selected taxa, such as when user
  // is viewing a popular field graph and deletes selected taxa
  if (isPopularFieldCategory(appStore) && appStore.selectedTaxa[0].id === 0) {
    graphsMetadata.category = "month_of_year";

    // manually set graphs_category for cases when graphs_category is set to
    // popular fields id but that field does not apply to selected taxa,
    // such as when user is viewing a popular field graph with multiple taxa with
    // different fields and deletes one of the taxa
  } else if (
    isPopularFieldCategory(appStore) &&
    appStore.cacheData.observations.popularFields[
      graphsMetadata.category as unknown as number
    ] === undefined
  ) {
    graphsMetadata.category = "month_of_year";
  }
}
