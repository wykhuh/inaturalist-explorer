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
  ViewMetadataGraphs,
  GraphCategory,
  NormalizedPopularFields,
  PopularFieldsByTermId,
  PopularFieldAnnotation,
  ControlledAttributeBasic,
  AppStoreSelectedResourcesKeysType,
  GraphValueType,
  ObservationsGraphData,
  PopularFieldsByTaxa,
  PopularFieldForGraph,
} from "../../types/app";
import { formatTaxonName, isPopularFieldCategory } from "../../lib/data_utils";
import {
  createGraphs,
  createPopularFieldsGraphsGroupSpecies,
  createPopularFieldsGraphs,
  createPopularFieldsGraphsGroupPlaces,
} from "./charts_utils";
import { calculateObservationsCount } from "../../lib/count_utils";
import { setSelectedOption } from "../../lib/form_utils";
import { updateAppUrl } from "../../lib/utils";
import { annotationsValues } from "../../data/inat_data";
import {
  getColorByIndex,
  secondaryColorScheme,
} from "../../lib/map_colors_utils";
import { devCachedGraphData } from "../../lib/dev_utils";

// ===============
// UI
// ===============

export function checkIfNoData(
  category: GraphCategory | undefined,
  graphData: ObservationsGraphData | undefined,
) {
  if (graphData === undefined) {
    return true;
  }
  if (
    graphData.histogram.length === 0 &&
    Object.keys(graphData.popularFields).length === 0
  ) {
    return true;
  }

  let noData = false;

  if (category === "month_of_year") {
    noData = graphData.histogram.every((data) => {
      if (data[category]) {
        let temp = new Set(Object.values(data[category]));
        return temp.size === 1 && temp.has(0);
      }
      return false;
    });
  } else if (category === "year" || category === "month") {
    noData = graphData.histogram.every((data) => {
      if (data[category]) {
        return Object.keys(data[category]).length === 0;
      }
      return false;
    });
  } else {
  }

  return noData;
}

export async function renderGraphs(
  graphData: ObservationsGraphData | undefined,
  appStore: AppStoreType,
  componentContext: HTMLElement,
  selectedResource?: AppStoreSelectedResourcesKeysType,
) {
  if (graphData === undefined) return;
  let dataContainer = componentContext.querySelector<HTMLDivElement>(
    "#subview-data-container",
  );
  if (!dataContainer) return;
  dataContainer.innerHTML = "";

  let graphsMetadata = appStore.viewMetadata.observations_observations
    .graphs as ViewMetadataGraphs;

  let category = graphsMetadata.category;

  let noData = checkIfNoData(category, graphData);
  if (noData) {
    return (dataContainer.innerHTML = "No records found");
  }

  if (
    category === "month_of_year" ||
    category === "year" ||
    category === "month"
  ) {
    let data = graphData.histogram;

    let legendEl = document.createElement("div");
    legendEl.id = `legend-container`;
    legendEl.className = "legend-container";
    dataContainer.appendChild(legendEl);

    let graph = createGraphs(
      data,
      "legend-container",
      selectedResource,
      appStore,
    );
    if (graph) {
      dataContainer.appendChild(graph);
    }
    // popular fields
  } else if (category) {
    let data = graphData.popularFields[category];
    if (data) {
      // group by species
      if (graphsMetadata.groupBy === "species") {
        let legendEl = document.createElement("div");
        legendEl.id = "legend-container";
        legendEl.className = "legend-container";
        dataContainer.appendChild(legendEl);

        let graph = createPopularFieldsGraphsGroupSpecies(
          data,
          "legend-container",
          appStore,
        );
        if (graph) {
          dataContainer.appendChild(graph);
        }
        // group by places
      } else if (graphsMetadata.groupBy === "places") {
        appStore.selectedTaxa.forEach((taxon, i) => {
          let dataForTaxon: PopularFieldForGraph[] = data.filter(
            (d) => d.taxon_id === taxon.id,
          );
          if (dataForTaxon.length === 0) {
            dataForTaxon = [
              {
                taxon_name: taxon.name || "",
                taxon_id: taxon.id,
                taxon_color: taxon.color || "",
                annotations: [],
                unannotated: { count: 0, month_of_year: {} },
                controlled_attribute: {
                  id: 0,
                  label: data[0].controlled_attribute.label,
                },
              },
            ];
          }

          let legendEl = document.createElement("div");
          legendEl.id = `legend-container-${i}`;
          legendEl.className = "legend-container";
          dataContainer.appendChild(legendEl);

          let graph = createPopularFieldsGraphsGroupPlaces(
            dataForTaxon,
            `legend-container-${i}`,
            appStore,
          );
          if (graph) {
            dataContainer.appendChild(graph);
          }
        });

        // no group by
      } else {
        data.forEach((datum, i) => {
          let legendEl = document.createElement("div");
          legendEl.id = `legend-container-${i}`;
          legendEl.className = "legend-container";
          dataContainer.appendChild(legendEl);

          let graph = createPopularFieldsGraphs(
            datum,
            `legend-container-${i}`,
            appStore,
          );
          if (graph) {
            dataContainer.appendChild(graph);
          }
        });
      }
    }
  }
}

// called when graph category or group by is changed
export async function updateGraphs(
  formData: FormData,
  appStore: AppStoreType,
  componentContext: HTMLElement,
) {
  let graphsMetadata = appStore.viewMetadata.observations_observations
    .graphs as ViewMetadataGraphs;

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

  let valueType = formData.get("graphs-value-type");
  if (valueType) {
    graphsMetadata.valueType = valueType as GraphValueType;
  }

  let spinner = createSpinner();
  spinner.start();

  // fetch data if no cache
  let graphData = await fetchGraphData(
    appStore,
    getAPIHistogramData,
    getAPIPopularFieldsData,
  );

  spinner.stop();

  if (graphsMetadata.groupBy === "species") {
    renderGraphs(graphData, appStore, componentContext, "selectedTaxa");
  } else if (graphsMetadata.groupBy === "places") {
    renderGraphs(graphData, appStore, componentContext, "selectedPlaces");
  } else {
    renderGraphs(graphData, appStore, componentContext, undefined);
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
  if (appStore.selectedPlaces.length < 2) {
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
  selector: string,
) {
  let selectEl = componentContext.querySelector(selector);
  if (!selectEl) return;

  selectEl.innerHTML = `
    <option value="month_of_year">Month</option>
    <option value="year">Year</option>
    <option value="month">Month and Year</option>
  `;

  appStore.viewMetadata.popularFieldsOptions.forEach((field) => {
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
    if (graphMetadata.valueType) {
      setSelectedOption(
        `#graph-form select#graphs-value-type option[value='${graphMetadata.valueType}']`,
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

// NOTE: pass get functions as params to make  fetchGraphData testable
export async function fetchGraphData(
  appStore: AppStoreType,
  getAPIHistogramDataFn: any,
  getAPIPopularFieldsDataFn: any,
) {
  if (import.meta.env?.VITE_CACHE === "true") {
    return devCachedGraphData(appStore);
  }

  let graphData = {
    histogram: [],
    popularFields: {},
  } as ObservationsGraphData;

  let graphsMetadata = appStore.viewMetadata.observations_observations
    .graphs as ViewMetadataGraphs;

  // fetch popular fields data for each species
  if (isPopularFieldCategory(appStore) && appStore.selectedTaxa[0].id !== 0) {
    let data = [];
    let params = cleanupObervationsPopularFieldsParams(
      appStore,
      "observations",
    );
    if (graphsMetadata.groupBy === "places") {
      let count = 0;
      for await (const place of appStore.selectedPlaces) {
        params.set("place_id", place.id.toString());
        for await (const taxon of appStore.selectedTaxa) {
          params.set("taxon_id", taxon.id.toString());

          let fieldsData = (await getAPIPopularFieldsDataFn(
            params.toString(),
          )) as NormalizedPopularFields;

          if (fieldsData) {
            // add taxon data
            let { title, subtitle } = formatTaxonName(taxon, appStore);
            fieldsData.place_id = place.id;
            fieldsData.place_name = place.name;
            fieldsData.place_color = getColorByIndex(
              count,
              secondaryColorScheme,
            );
            fieldsData.taxon_id = taxon.id;
            fieldsData.taxon_name = title || subtitle || "Unknown";
            fieldsData.taxon_color = taxon.color as string;
            data.push(fieldsData);
          }
        }
        count += 1;
      }

      graphData.popularFields = formatPopularFields(data);

      appStore.viewMetadata.popularFieldsByTaxa =
        formatPopularFieldsMenuByTaxa(data);
    } else {
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
          fieldsData.taxon_color = taxon.color as string;
          data.push(fieldsData);
        }
      }

      graphData.popularFields = formatPopularFields(data);

      appStore.viewMetadata.popularFieldsByTaxa =
        formatPopularFieldsMenuByTaxa(data);
    }
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
          graphData.histogram.push(monthYearData.results);
        }
      } else if (graphsMetadata.category === "year") {
        setLastTenYears(params);
        let yearData = await getAPIHistogramDataFn(params.toString(), "year");
        if (yearData) {
          graphData.histogram.push(yearData.results);
        }
      } else if (graphsMetadata.category === "month") {
        setLastTenYears(params);
        let monthData = await getAPIHistogramDataFn(params.toString(), "month");
        if (monthData) {
          graphData.histogram.push(monthData.results);
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
          graphData.histogram.push(monthYearData.results);
        }
      } else if (graphsMetadata.category === "year") {
        setLastTenYears(params);
        let yearData = await getAPIHistogramDataFn(params.toString(), "year");
        if (yearData) {
          graphData.histogram.push(yearData.results);
        }
      } else if (graphsMetadata.category === "month") {
        setLastTenYears(params);
        let monthData = await getAPIHistogramDataFn(params.toString(), "month");
        if (monthData) {
          graphData.histogram.push(monthData.results);
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
        graphData.histogram.push(yearData.results);
      }
    } else if (graphsMetadata.category === "month") {
      setLastTenYears(params);
      let monthData = await getAPIHistogramDataFn(params.toString(), "month");
      if (monthData) {
        graphData.histogram.push(monthData.results);
      }
    } else {
      let monthYearData = await getAPIHistogramDataFn(
        params.toString(),
        "month_of_year",
      );

      if (monthYearData) {
        graphData.histogram.push(monthYearData.results);
      }
    }
  }

  return graphData;
}

export function setLastTenYears(params: URLSearchParams) {
  if (params.get("d1") === null) {
    let year = new Date().getFullYear() - 10;
    params.set("d1", `${year}-01-01`);
  }
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

  let popularFieldsOptions = formatPopularFieldsMenuOptions(data);
  appStore.viewMetadata.popularFieldsOptions = popularFieldsOptions;
  window.dispatchEvent(new Event("popularFieldsOptionsChange"));
}

export function formatPopularFieldsMenuOptions(
  data: iNatPopularFieldsBasicAPI[],
) {
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
          let record: PopularFieldForGraph = {
            annotations: annotations,
            unannotated: datum.unannotated[term_id],
            controlled_attribute: controlled_attribute,
            taxon_id: datum.taxon_id,
            taxon_name: datum.taxon_name,
            taxon_color: datum.taxon_color,
          };
          if (datum.place_id) {
            record.place_id = datum.place_id;
            record.place_name = datum.place_name;
            record.place_color = datum.place_color;
          }

          popularFields[Number(term_id)].push(record);
        }
      });
  });

  return popularFields;
}

export function formatPopularFieldsMenuByTaxa(data: NormalizedPopularFields[]) {
  let popularFields = {} as PopularFieldsByTaxa;
  data.forEach((datum) => {
    datum.results.forEach((result) => {
      let term_id = result.controlled_attribute.id;
      if (popularFields[term_id] === undefined) {
        popularFields[term_id] = {};
      }
      popularFields[term_id][datum.taxon_id] = true;
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
  graphsMetadata?: ViewMetadataGraphs,
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
    appStore.viewMetadata.popularFieldsByTaxa[
      graphsMetadata.category as unknown as number
    ] === undefined
  ) {
    graphsMetadata.category = "month_of_year";
  }
}
