import {
  formatPopularFields,
  formatPopularFieldsMenuOptions,
} from "../components/SubviewGraphs/utils";
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
} from "../data/api/histogram";
import { defaultColorScheme, secondaryColorScheme } from "./map_colors_utils";
import {
  // popular_fields_basic_milkweed,
  // popular_fields_basic_monarch,
  // popular_fields_milkweed,
  // popular_fields_monarch,
  popular_fields_basic_canyon_gooseberry,
  popular_fields_basic_hillside_gooseberry,
  popular_fields_canyon_gooseberry,
  popular_fields_hillside_gooseberry,
  popular_fields_narrowleaf_milkweed_la,
  popular_fields_narrowleaf_milkweed_sd,
  popular_fields_tropical_milkweed_la,
  popular_fields_tropical_milkweed_sd,
} from "../data/api/popular_fields";
import type {
  AppStoreType,
  NormalizediNatTaxonType,
  NormalizedPopularFields,
  ObservationsGraphData,
  viewMetadataGraphs,
} from "../types/app";
import { isPopularFieldCategory } from "./data_utils";

export function displayGraphStatus() {
  let header = document.querySelector(".navbar-brand");
  if (header) {
    header.innerHTML = "";

    let div = document.createElement("div");
    div.textContent = "";
    div.textContent = `${JSON.stringify(window.app.store.viewMetadata.observations_observations.graphs)}`;
    header.append(div);
  }
}

export function devCachedGraphData(appStore: AppStoreType) {
  let cacheData = {
    popularFields: {},
    graphsSpecies: {
      month_of_year: [],
      month: [],
      year: [],
    },
    graphsPlaces: {
      month_of_year: [],
      month: [],
      year: [],
    },
    graphs: {
      month_of_year: [],
      month: [],
      year: [],
    },
  } as ObservationsGraphData;

  let graphsMetadata = appStore.viewMetadata.observations_observations
    .graphs as viewMetadataGraphs;

  let monarch = {
    id: 102,
    name: "Danaus plexippus",
    preferred_common_name: "Monarch",
    color: defaultColorScheme[0],
  } as NormalizediNatTaxonType;
  let milkweed = {
    id: 100,
    name: "Asclepias fascicularis",
    preferred_common_name: "Narrowleaf Milkweed",
    color: defaultColorScheme[1],
  } as NormalizediNatTaxonType;
  let tropical_milkweed = {
    id: 101,
    name: "Asclepias boo",
    preferred_common_name: "tropical Milkweed",
    color: defaultColorScheme[1],
  } as NormalizediNatTaxonType;

  let LA = {
    id: 10,
    name: "Los Angeles",
    display_name: "Los Angeles",
  };
  let SD = {
    id: 11,
    name: "San Diego",
    display_name: "San Diego",
  };

  appStore.selectedTaxa = [monarch, milkweed];
  appStore.observationsApiParams.taxon_id = "102,100";
  appStore.selectedPlaces = [LA, SD];
  appStore.observationsApiParams.place_id = "10,11";

  let popularFieldsOptions = formatPopularFieldsMenuOptions([
    popular_fields_narrowleaf_milkweed_la,
    popular_fields_narrowleaf_milkweed_sd,
    popular_fields_tropical_milkweed_la,
    popular_fields_tropical_milkweed_sd,
  ]);
  appStore.viewMetadata.popularFieldsOptions = popularFieldsOptions;

  if (isPopularFieldCategory(appStore)) {
    appStore.selectedTaxa = [milkweed, tropical_milkweed];
    appStore.observationsApiParams.taxon_id = "100,101";
    appStore.selectedPlaces = [LA, SD];
    appStore.observationsApiParams.place_id = "10,20";

    if (graphsMetadata.groupBy === "places") {
      let data1 = structuredClone(
        popular_fields_narrowleaf_milkweed_la,
      ) as NormalizedPopularFields;
      data1.taxon_id = milkweed.id;
      data1.taxon_name = milkweed.preferred_common_name || "";
      data1.taxon_color = defaultColorScheme[0];
      data1.place_id = LA.id;
      data1.place_name = LA.name;
      data1.place_color = secondaryColorScheme[0];

      let data2 = structuredClone(
        popular_fields_narrowleaf_milkweed_sd,
      ) as NormalizedPopularFields;
      data2.taxon_id = milkweed.id;
      data2.taxon_name = milkweed.preferred_common_name || "";
      data2.taxon_color = defaultColorScheme[0];
      data2.place_id = SD.id;
      data2.place_name = SD.name;
      data2.place_color = secondaryColorScheme[1];

      let data3 = structuredClone(
        popular_fields_tropical_milkweed_la,
      ) as NormalizedPopularFields;
      data3.taxon_id = tropical_milkweed.id;
      data3.taxon_name = tropical_milkweed.preferred_common_name || "";
      data3.taxon_color = defaultColorScheme[1];
      data3.place_id = LA.id;
      data3.place_name = LA.name;
      data3.place_color = secondaryColorScheme[0];

      let data4 = structuredClone(
        popular_fields_tropical_milkweed_sd,
      ) as NormalizedPopularFields;
      data4.taxon_id = tropical_milkweed.id;
      data4.taxon_name = tropical_milkweed.preferred_common_name || "";
      data4.taxon_color = defaultColorScheme[1];
      data4.place_id = SD.id;
      data4.place_name = SD.name;
      data4.place_color = secondaryColorScheme[1];

      cacheData.popularFields = formatPopularFields([
        data1,
        data2,
        data3,
        data4,
      ]);
    } else {
      let data1 = structuredClone(
        popular_fields_hillside_gooseberry,
      ) as NormalizedPopularFields;
      data1.taxon_id = milkweed.id;
      data1.taxon_name = milkweed.preferred_common_name || "";
      data1.taxon_color = defaultColorScheme[0];

      let data2 = structuredClone(
        popular_fields_canyon_gooseberry,
      ) as NormalizedPopularFields;
      data2.taxon_id = tropical_milkweed.id;
      data2.taxon_name = tropical_milkweed.preferred_common_name || "";
      data2.taxon_color = defaultColorScheme[1];

      cacheData.popularFields = formatPopularFields([data1, data2]);
    }
  } else if (graphsMetadata.groupBy === "species") {
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

  return cacheData;
}
