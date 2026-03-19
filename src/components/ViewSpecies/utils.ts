import { threatenedSpecies } from "../../data/api/observations";
import { observationsTaxonomy } from "../../data/api/taxonomy";
import { subspeciesRanks } from "../../data/inat_data";
import {
  cleanupIdentificationParams,
  cleanupObervationsSpeciesParams,
  cleanupObervationsTaxonomyParams,
} from "../../lib/cleanup_params_utils";
import {
  isSubpeciesCheck,
  isIdentificationsCheck,
  isObservationsCheck,
  replaceWithCacheImages,
  isSpeciesOrHigerCheck,
  resetPageNumber,
  getResourceApiParams,
} from "../../lib/data_utils";
import { setSelectedOption } from "../../lib/form_utils";
import {
  getIdentificationsSpecies,
  getObservationsSpecies,
  getObservationsTaxonomy,
  getTaxa,
} from "../../lib/inat_api";
import { loggerTime } from "../../lib/logger";
import { createSpinner } from "../../lib/spinner";
import { sortObjectByValue, updateAppUrl } from "../../lib/utils";
import type {
  DataComponentType,
  AppStoreType,
  PaginationCallback,
} from "../../types/app";
import type {
  IdentificationsResult,
  IdentificationsSpeciesCountAPI,
  iNatObservationsSpeciesCountAPI,
  ObservationsResult,
  ResourceSpeciesCountResult,
  TaxonomyResult,
} from "../../types/inat_api";

export function calculateSubspeciesIdsOffset(
  speciesData: iNatObservationsSpeciesCountAPI,
  subspeciesIds: number[],
) {
  let lastSpeciesPage = Math.ceil(
    speciesData.total_results / speciesData.per_page,
  );
  let speciesOffset =
    lastSpeciesPage * speciesData.per_page - speciesData.total_results;

  // handle pages that just have subspecies data
  if (speciesData.page > lastSpeciesPage) {
    let subspeciesOffset =
      (speciesData.page - lastSpeciesPage - 1) * speciesData.per_page +
      speciesOffset;

    return subspeciesIds.slice(
      subspeciesOffset,
      subspeciesOffset + speciesData.per_page,
    );
    // handle pages that have species and subspecies data
  } else if (speciesData.page === lastSpeciesPage) {
    return subspeciesIds.slice(0, speciesOffset);
  }
}

export async function fetchData(
  appStore: AppStoreType,
): Promise<iNatObservationsSpeciesCountAPI | undefined> {
  let data;

  // get species and subspecies data for observations
  if (isObservationsCheck(appStore)) {
    // get species and subspecies
    if (isSubpeciesCheck(appStore)) {
      let speciesData;
      if (isSpeciesOrHigerCheck(appStore)) {
        // get species data
        speciesData = await getAPIData(appStore);
      }

      if (!speciesData) {
        speciesData = {
          per_page:
            appStore.observationsApiParams.per_page ||
            appStore.viewMetadata.observations_species.perPage,
          page: appStore.observationsApiParams.page || 1,
          total_results: 0,
          results: [],
        } as iNatObservationsSpeciesCountAPI;
      }

      // get subspecies data
      let subspeciesData = await getSubspeciesData(appStore, speciesData);
      // have both species and subspecies data
      if (speciesData && subspeciesData) {
        let subspeciesResults = subspeciesData.results.sort(
          (a, b) => b.count - a.count,
        );
        data = {
          per_page: speciesData.per_page,
          page: speciesData.page,
          total_results:
            speciesData.total_results + subspeciesData.total_results,
          results: speciesData.results.concat(subspeciesResults),
        };
        // only have species data
      } else if (speciesData) {
        data = speciesData;
        // only have subspecies data
      } else if (subspeciesData) {
        data = {
          ...subspeciesData,
          results: subspeciesData.results.sort((a, b) => b.count - a.count),
        };
      }
      // get species data
    } else {
      data = await getAPIData(appStore);
    }
    // get species data for identifications
  } else {
    data = await getAPIData(appStore);
  }
  return data;
}

export async function fetchAndRenderData(
  paginationCallback: PaginationCallback,
  appStore: AppStoreType,
  useCache: boolean,
) {
  let cache: iNatObservationsSpeciesCountAPI | IdentificationsSpeciesCountAPI;
  if (isObservationsCheck(appStore)) {
    cache = appStore.cacheData.observations.species;
  } else {
    cache = appStore.cacheData.identifications.species;
  }

  if (useCache === false) {
    cache = {} as
      | iNatObservationsSpeciesCountAPI
      | IdentificationsSpeciesCountAPI;
  }

  if (!cache.total_results) {
    let spinner = createSpinner();
    spinner.start();

    const t1 = performance.now();

    let data = await fetchData(appStore);
    if (isObservationsCheck(appStore)) {
      appStore.cacheData.observations.species = data;
    } else {
      appStore.cacheData.identifications.species = data;
    }

    const t10 = performance.now();
    loggerTime(`api ${t10 - t1} milliseconds`);

    spinner.stop();
  }

  renderGrid(paginationCallback, appStore);
}

function renderGrid(
  paginationCallback: PaginationCallback,
  appStore: AppStoreType,
) {
  let containerEl = document.querySelector(".subview-container");
  if (!containerEl) return;

  let cache;
  if (isObservationsCheck(appStore)) {
    cache = appStore.cacheData.observations.species;
  } else {
    cache = appStore.cacheData.identifications.species;
  }

  if (!cache || cache.results.length === 0) {
    containerEl.innerHTML = "No records found";
    return;
  }

  containerEl.innerHTML = "";

  let pagination1 = document.createElement(
    "app-pagination",
  ) as DataComponentType;
  pagination1.data = {
    perPage: cache.per_page,
    currentPage: cache.page,
    totalRecords: cache.total_results,
    paginationCallback,
  };

  containerEl.appendChild(pagination1);

  let tableEl = createGrid(cache.results);
  containerEl.appendChild(tableEl);

  let pagination2 = document.createElement(
    "app-pagination",
  ) as DataComponentType;
  pagination2.data = {
    perPage: cache.per_page,
    currentPage: cache.page,
    totalRecords: cache.total_results,
    paginationCallback,
    scrollToSelector: ".species-list-container",
  };
  containerEl.appendChild(pagination2);
}

// use /observations/species_counts or /identifications/species_counts
// to get taxa and counts
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
      let params = cleanupObervationsSpeciesParams(appStore);
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
  let idCountSorted: { [k: string]: number } = {};
  let idCount: { [k: string]: number } = {};

  taxonomyResults
    .filter((taxon) => validRanks.includes(taxon.rank))
    .forEach((taxon) => {
      // HACK: add space to number id because javascript does not properly sort
      // objects that have numeric keys
      idCountSorted[taxon.id + " "] = taxon.direct_obs_count;
      idCount[taxon.id] = taxon.direct_obs_count;
    });

  idCountSorted = sortObjectByValue(idCountSorted, false);

  return {
    // idCount is unsorted object
    taxaIdCount: idCount,
    // subspeciesIds are sorted by on direct_obs_count
    subspeciesIds: Object.keys(idCountSorted).map((id) => Number(id)),
  };
}

export function validSubspeciesForStore(appStore: AppStoreType) {
  let ranks = appStore.observationsApiParams.rank;
  if (!ranks) return;

  return ranks.split(",").filter((r) => subspeciesRanks.includes(r));
}

// use /observations/taxonomy and /taxa to get subspecies taxa and counts
async function getSubspeciesData(
  appStore: AppStoreType,
  speciesData: iNatObservationsSpeciesCountAPI,
) {
  // get taxonomy data in order to get the subspecies taxa ids, names, and counts
  let taxonomyData = await getTaxonomyAPIData(appStore);
  if (!taxonomyData) return;

  // get subspecies rank
  let validRanks = validSubspeciesForStore(appStore);
  if (!validRanks) return;

  // reformat taxonomyData to get ids and counts
  let { taxaIdCount, subspeciesIds } = getSubspeciesIds(
    taxonomyData.results,
    validRanks,
  );

  if (subspeciesIds.length > 0) {
    // use subset of subspecies ids to limit the number of subspecies displayed.
    // get a subset of ids based on per_page and page.

    let ids = calculateSubspeciesIdsOffset(speciesData, subspeciesIds);
    if (!ids || ids.length === 0) return;

    // get taxa data using subset of ids. taxa data provides photo that
    let taxaData = await getTaxaAPIData(ids, speciesData.per_page);
    if (taxaData) {
      // normalized the taxa data so it has same format as species count data
      let normalizedTaxa: ResourceSpeciesCountResult[] = [];

      taxaData.forEach((taxon) => {
        normalizedTaxa.push({
          count: taxaIdCount[taxon.id],
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
        per_page: speciesData.per_page,
        page: speciesData.page,
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
    return await getObservationsTaxonomy(params);
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
    let cardEl = document.createElement("card-species") as DataComponentType;
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

  await fetchAndRenderData(paginationCallback, appStore, false);
  updateAppUrl(window.location, appStore);
}

export async function updateOrderForStore(
  data: FormData,
  appStore: AppStoreType,
) {
  let resourceParams = getResourceApiParams(isObservationsCheck(appStore));

  let order;
  data.forEach((v, k) => {
    if (k === "order_combo") {
      order = v;
    }
  });

  if (order) {
    appStore[resourceParams].order = order;
    if (appStore.currentView) {
      appStore.viewMetadata[appStore.currentView].order = order;
    }
  } else {
    delete appStore[resourceParams].order;
  }

  delete appStore[resourceParams].order_by;

  resetPageNumber(appStore);
  await fetchAndRenderData(paginationCallback, appStore, false);
  updateAppUrl(window.location, appStore);
}

// use store to populate the filter form fields on page load
export function initFilters(appStore: AppStoreType) {
  let resourceParams = getResourceApiParams(isObservationsCheck(appStore));

  if (appStore[resourceParams].order) {
    setSelectedOption(
      `#order-form select#order_combo option[value='${appStore.observationsApiParams.order}']`,
    );
  }
}
