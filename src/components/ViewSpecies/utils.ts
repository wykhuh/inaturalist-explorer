import {
  observationsTaxonomy,
  threatenedSpecies,
} from "../../data/inat_api_cache";
import { subspeciesRanks } from "../../data/inat_data";
import {
  cleanupIdentificationParams,
  cleanupObervationsParams,
  cleanupObervationsTaxonomyParams,
} from "../../lib/cleanup_params_utils";
import {
  isSubpeciesCheck,
  isIdentificationsCheck,
  isObservationsCheck,
  replaceWithCacheImages,
} from "../../lib/data_utils";
import {
  getIdentificationsSpecies,
  getObservationsSpecies,
  getObservationsTaxonomy,
  getTaxa,
} from "../../lib/inat_api";
import { loggerTime } from "../../lib/logger";
import { createSpinner } from "../../lib/spinner";
import { updateAppUrl } from "../../lib/utils";
import type { DataComponentType, AppStoreType } from "../../types/app";
import type {
  IdentificationsResult,
  ObservationsResult,
  ResourceSpeciesCountResult,
  TaxonomyResult,
} from "../../types/inat_api";

export async function fetchAndRenderData(
  paginationCallback: (
    currentPage: number,
    appStore: AppStoreType,
  ) => Promise<void>,
  appStore: AppStoreType,
) {
  let containerEl = document.querySelector(".species-list-container");
  if (!containerEl) return;

  let spinner = createSpinner();
  spinner.start();

  const t1 = performance.now();

  let data;
  // use /observations/taxonomy and /taxa to get subspecies taxa and counts
  if (isObservationsCheck(appStore) && isSubpeciesCheck(appStore)) {
    data = await getSubspeciesData(appStore);
    // use /observations/species_counts or /identifications/species_counts
    // to get taxa and counts
  } else {
    data = await getAPIData(appStore);
  }

  const t10 = performance.now();
  loggerTime(`api ${t10 - t1} milliseconds`);

  spinner.stop();

  if (!data || data.results.length === 0) {
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

  let tableEl = createGrid(data.results);
  containerEl.appendChild(tableEl);

  let pagination2 = document.createElement(
    "app-pagination",
  ) as unknown as DataComponentType;
  pagination2.data = {
    perPage: data.per_page,
    currentPage: data.page,
    totalRecords: data.total_results,
    paginationCallback,
    scrollToSelector: ".species-list-container",
  };
  containerEl.appendChild(pagination2);
}

async function getAPIData(appStore: AppStoreType) {
  if (import.meta.env?.VITE_CACHE === "true") {
    let page = isObservationsCheck(appStore)
      ? appStore.observationsApiParams.page
      : appStore.identificationsApiParams.page;
    replaceWithCacheImages(threatenedSpecies.results);
    return { ...threatenedSpecies, page: page || 1 };
  }

  try {
    let data;
    if (isIdentificationsCheck(appStore)) {
      let params = cleanupIdentificationParams(appStore);
      data = await getIdentificationsSpecies(params);
    } else if (isObservationsCheck(appStore)) {
      let params = cleanupObervationsParams(appStore);
      data = await getObservationsSpecies(params);
    }

    return data;
  } catch (error) {
    console.error("ViewSpecies getAPIData ERROR:", error);
  }
}

export function getSubspeciesIds(
  taxonomyResults: TaxonomyResult[],
  validRanks: string[],
) {
  // store count and id for taxa with subspecies ranks
  let countId: { [k: string]: number } = {};
  taxonomyResults
    .filter((taxon) => validRanks.includes(taxon.rank))
    .forEach((taxon) => {
      countId[taxon.direct_obs_count] = taxon.id;
    });

  // sort counts from high to low
  let sortedCounts = Object.keys(countId)
    .map((c) => Number(c))
    .sort(function (a, b) {
      return a - b;
    })
    .reverse();

  // store id and count
  // using map instead of objects because objects do not maintain order when
  // keys are numbers
  let taxaIdCount = new Map();
  sortedCounts.forEach((count) => taxaIdCount.set(countId[count], count));

  return { taxaIdCount, subspeciesIds: [...taxaIdCount.keys()] };
}

export function validSubspeciesForStore(appStore: AppStoreType) {
  let ranks = appStore.observationsApiParams.rank;
  if (!ranks) return;

  return ranks.split(",").filter((r) => subspeciesRanks.includes(r));
}

async function getSubspeciesData(appStore: AppStoreType) {
  // get taxonomy data
  let taxonomyData = await getTaxonomyAPIData(appStore);
  if (!taxonomyData) return;

  let validRanks = validSubspeciesForStore(appStore);
  if (!validRanks) return;

  let { taxaIdCount, subspeciesIds } = getSubspeciesIds(
    taxonomyData.results,
    validRanks,
  );
  if (subspeciesIds.length > 0) {
    // calculate the subspecies ids pased on per_page and page
    let perPage = appStore.viewMetadata.observations_species.perPage || 24;
    let page = appStore.observationsApiParams.page || 1;
    let start = perPage * (page - 1);
    let end = start + perPage;
    let ids = subspeciesIds.slice(start, end);

    // get taxa data
    let taxaData = await getTaxaAPIData(ids, perPage);
    if (taxaData) {
      // normalized the taxa data so it has same format as species count data
      let normalizedTaxa: ResourceSpeciesCountResult[] = [];
      taxaData.forEach((taxon) => {
        normalizedTaxa.push({
          count: taxaIdCount.get(taxon.id),
          taxon: {
            default_photo: taxon.default_photo || undefined,
            iconic_taxon_name: taxon.iconic_taxon_name,
            id: taxon.id,
            name: taxon.name,
            preferred_common_name: taxon.preferred_common_name,
            rank: taxon.rank,
          },
        });
      });

      return {
        results: normalizedTaxa,
        per_page: perPage,
        page: page,
        total_results: subspeciesIds.length,
      };
    }
  }
}

// get taxonomy data
export async function getTaxonomyAPIData(appStore: AppStoreType) {
  let isObservations = isObservationsCheck(appStore);
  if (!isObservations) return;

  let isSubpecies = isSubpeciesCheck(appStore);
  if (!isSubpecies) return;

  if (import.meta.env?.VITE_CACHE === "true") {
    let page = appStore.observationsApiParams.page || 1;
    replaceWithCacheImages(threatenedSpecies.results);
    return { ...observationsTaxonomy, page: page };
  }

  try {
    let params = cleanupObervationsTaxonomyParams(
      appStore.observationsApiParams,
    );
    let data = await getObservationsTaxonomy(params);

    return data;
  } catch (error) {
    console.error("ViewSpecies getTaxonomyAPIData ERROR:", error);
  }
}

// get taxa data for an array of subspecies ids
async function getTaxaAPIData(ids: number[], perPage: number) {
  try {
    let data = await getTaxa(`id=${ids.join(",")}&per_page=${perPage}`);

    return data;
  } catch (error) {
    console.error("ViewSpecies getTaxaAPIData ERROR:", error);
  }
}

function createGrid(
  results:
    | ObservationsResult[]
    | IdentificationsResult[]
    | ResourceSpeciesCountResult[],
) {
  let containerEl = document.createElement("div");
  containerEl.className = "species-grid grid-auto-fill";

  results.forEach((row) => {
    let cardEl = document.createElement(
      "card-species",
    ) as unknown as DataComponentType;
    cardEl.data = row;
    containerEl.appendChild(cardEl);
  });

  return containerEl;
}

export async function paginationCallback(num: number, appStore: AppStoreType) {
  if (isObservationsCheck(appStore)) {
    appStore.observationsApiParams = {
      ...appStore.observationsApiParams,
      page: num,
    };
    appStore.viewMetadata.observations_species = {
      ...appStore.viewMetadata.observations_species,
      page: num,
    };
  } else {
    appStore.identificationsApiParams = {
      ...appStore.identificationsApiParams,
      page: num,
    };
    appStore.viewMetadata.identifications_species = {
      ...appStore.viewMetadata.identifications_species,
      page: num,
    };
  }

  // HACK: update store
  appStore.viewMetadata = appStore.viewMetadata;

  await fetchAndRenderData(paginationCallback, appStore);
  updateAppUrl(window.location, appStore);
}
