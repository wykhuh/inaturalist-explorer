import type {
  iNatObservationTilesSettingsType,
  MapTilesAPIParamsType,
  NormalizediNatTaxonType,
  RecordTypes,
} from "../types/app";
import type {
  iNatObservationsSpeciesCountAPI,
  iNatObservationsAPI,
  iNatTaxaAPI,
  iNatPlacesAPI,
  iNatHistogramApi,
  iNatProjectsAPI,
  iNatUsersAPI,
  iNatObservationsObserversAPI,
  iNatObservationsIdentifiersAPI,
  IdentificationsAPI,
  IdentificationsIdentifiersAPI,
  IdentificationsObserversAPI,
  IdentificationsSpeciesCountAPI,
  UserResult,
  iNatTaxonomyApi,
} from "../types/inat_api.d.ts";
import { loggerUrl } from "./logger.ts";

export const api_base = "https://api.inaturalist.org/v1/";
const search_api = "https://api.inaturalist.org/v1/search";
export const autocomplete_places_api = `${search_api}?sources=places`;
export const autocomplete_projects_api = `https://api.inaturalist.org/v1/projects/autocomplete?`;
export const autocomplete_users_api = `https://api.inaturalist.org/v1/users/autocomplete?order=activity`;
export const autocomplete_taxa_api =
  "https://api.inaturalist.org/v1/taxa/autocomplete?";
export const autocomplete_observation_fields_api = `https://api.inaturalist.org/v1/observation_fields/autocomplete?`;

const observations_api_v1 = "https://api.inaturalist.org/v1/observations";
const observations_api = "https://api.inaturalist.org/v2/observations";
const identifications_api = "https://api.inaturalist.org/v1/identifications";
const taxa_api = "https://api.inaturalist.org/v1/taxa/";
const places_api = "https://api.inaturalist.org/v1/places/";
// set max-age Cache-Control HTTP header to 30 days
const histogram_year_api = `https://api.inaturalist.org/v1/observations/histogram?date_field=observed&interval=year&ttl=${60 * 60 * 24 * 30}`;
const projects_api = "https://api.inaturalist.org/v1/projects/";
const users_api = "https://api.inaturalist.org/v1/users/";

function formatDescription(
  mapTilesApiParams: MapTilesAPIParamsType,
  recordType: RecordTypes,
  type: string,
) {
  // NOTE: update when adding selectedResource; map layer name
  let text = `overlay: iNat ${type}`;
  if (recordType === "observations") {
    text += `, taxon_id ${mapTilesApiParams.taxon_id || 0}`;
  } else {
    text += `, ident_taxon_id ${mapTilesApiParams.ident_taxon_id || 0}`;
  }
  if (mapTilesApiParams.place_id) {
    text += `, place_id ${mapTilesApiParams.place_id}`;
  }
  if (mapTilesApiParams.project_id) {
    text += `, project_id ${mapTilesApiParams.project_id}`;
  }
  if (mapTilesApiParams.user_id) {
    text += `, user_id ${mapTilesApiParams.user_id}`;
  }
  if (mapTilesApiParams.ident_user_id) {
    text += `, ident_user_id ${mapTilesApiParams.ident_user_id}`;
  }
  if (mapTilesApiParams.unobserved_by_user_id) {
    text += `, unobserved_by_user_id ${mapTilesApiParams.unobserved_by_user_id}`;
  }
  if (mapTilesApiParams.viewer_id) {
    text += `, viewer_id ${mapTilesApiParams.viewer_id}`;
  }
  if (mapTilesApiParams.annotation_user_id) {
    text += `, annotation_user_id ${mapTilesApiParams.annotation_user_id}`;
  }
  if (mapTilesApiParams.not_in_project) {
    text += `, not_in_project ${mapTilesApiParams.not_in_project}`;
  }
  if (mapTilesApiParams.without_taxon_id) {
    text += `, without_taxon_id ${mapTilesApiParams.without_taxon_id}`;
  }
  return text;
}

export const getiNatMapTiles = (
  mapTilesApiParams: MapTilesAPIParamsType,
  taxonObj: NormalizediNatTaxonType,
  recordType: RecordTypes,
): iNatObservationTilesSettingsType => {
  let dupParams = structuredClone(mapTilesApiParams) as any;
  if (dupParams.taxon_id === "0") {
    delete dupParams.taxon_id;
  }

  let paramsString = new URLSearchParams(dupParams).toString();

  let taxonRangeParamsString = new URLSearchParams({
    color: dupParams.color,
  }).toString();

  delete dupParams.color;
  let noColorParamsString = new URLSearchParams(dupParams).toString();

  let tiles: iNatObservationTilesSettingsType = {
    iNatGrid: {
      name: "Grid",
      type: "overlay",
      url: `https://api.inaturalist.org/v1/grid/{z}/{x}/{y}.png?${paramsString}`,
      options: {
        attribution:
          'Observation data by <a href="https://www.inaturalist.org/">iNaturalist</a>.',
        minZoom: 0,
        maxZoom: 21,
        layer_description: formatDescription(
          mapTilesApiParams,
          recordType,
          "grid",
        ),
        control_name: `${taxonObj.title} Grid`,
      },
    },
    iNatPoint: {
      name: "Points",
      type: "overlay",
      url: `https://api.inaturalist.org/v1/points/{z}/{x}/{y}.png?${paramsString}`,
      options: {
        attribution:
          'Observation data by <a href="https://www.inaturalist.org/">iNaturalist</a>.',
        minZoom: 0,
        maxZoom: 21,
        layer_description: formatDescription(
          mapTilesApiParams,
          recordType,
          "points",
        ),
        control_name: `${taxonObj.title} Points`,
      },
    },
    iNatTaxonRange: {
      name: "Taxon Range",
      type: "overlay",
      url: `https://api.inaturalist.org/v1/taxon_ranges/${dupParams.taxon_id}/{z}/{x}/{y}.png?${taxonRangeParamsString}`,
      options: {
        attribution:
          'Taxon range by <a href="https://www.inaturalist.org/">iNaturalist</a>.',
        minZoom: 0,
        maxZoom: 21,
        layer_description: formatDescription(
          mapTilesApiParams,
          recordType,
          "taxon range",
        ),
        control_name: `${taxonObj.title} Taxon Range`,
      },
    },
    iNatHeatmap: {
      name: "Heatmap",
      type: "overlay",
      url: `https://api.inaturalist.org/v1/heatmap/{z}/{x}/{y}.png?${noColorParamsString}`,
      options: {
        attribution:
          'Observation data by <a href="https://www.inaturalist.org/">iNaturalist</a>.',
        minZoom: 0,
        maxZoom: 21,
        layer_description: formatDescription(
          mapTilesApiParams,
          recordType,
          "heatmap",
        ),
        control_name: `${taxonObj.title} Heatmap`,
      },
    },
  };

  if (taxonObj.id === 0 || taxonObj.id === undefined) {
    delete tiles.iNatTaxonRange;
  }

  return tiles;
};

export async function getTaxonById(id: number) {
  try {
    let resp = await fetch(taxa_api + id);
    let data = (await resp.json()) as iNatTaxaAPI;
    return data.results[0];
  } catch (error) {
    console.error("getTaxonById ERROR:", error);
  }
}

export async function getTaxa(params: string) {
  try {
    let resp = await fetch(`${taxa_api}?${params}`);
    let data = (await resp.json()) as iNatTaxaAPI;
    return data.results;
  } catch (error) {
    console.error("getTaxonById ERROR:", error);
  }
}

export async function getPlaceById(id: number) {
  try {
    let resp = await fetch(places_api + id);
    let data = (await resp.json()) as iNatPlacesAPI;
    return data.results[0];
  } catch (error) {
    console.error("getPlaceById ERROR:", error);
  }
}

export async function getProjectById(id: number) {
  try {
    let resp = await fetch(projects_api + id);
    let data = (await resp.json()) as iNatProjectsAPI;
    return data.results[0];
  } catch (error) {
    console.error("getProjectById ERROR:", error);
  }
}

export async function getUserById(id: number) {
  if (import.meta.env?.VITE_CACHE === "true") {
    return { login: `user${id}`, name: `user ${id}`, id: id } as UserResult;
  }

  try {
    let resp = await fetch(users_api + id);
    let data = (await resp.json()) as iNatUsersAPI;
    return data.results[0];
  } catch (error) {
    console.error("getUserById ERROR:", error);
  }
}

// used to populate the years filter
export async function getObservationsYears() {
  try {
    let resp = await fetch(histogram_year_api);
    let data = (await resp.json()) as iNatHistogramApi;
    return data.results;
  } catch (error) {
    console.error("getObservationsYears ERROR:", error);
  }
}

export function formatObservationsApiUrl(appParams: string) {
  let fields =
    "(comments_count:!t," +
    // "comments:!t," +
    "created_at:!t," +
    // "created_at_details:all," +
    "created_time_zone:!t," +
    "num_identification_disagreements:!t," +
    "faves_count:!t," +
    "geoprivacy:!t," +
    "id:!t," +
    "identifications:(current:!t)," +
    "annotations:(controlled_attribute_id:!t,controlled_value_id:!t)," +
    // "annotations:(controlled_attribute_id:!t,controlled_value_id:!t,user:(icon_url:!t,icon:!t,id:!t,login:!t))," +
    // "identifications_count:!t," +
    // "location:!t," +
    // "mappable:!t," +
    "obscured:!t," +
    "observed_on:!t," +
    // "observed_on_details:all," +
    "observed_time_zone:!t," +
    "ofvs:(id:!t,name:!t,value:!t,datatype:!t,taxon:(id:!t,name:!t,preferred_common_name:!t,rank:!t))," +
    "time_observed_at:!t," +
    "updated_at:!t," +
    "photos:(id:!t,url:!t)," +
    "place_guess:!t," +
    // "private_geojson:!t," +
    "quality_grade:!t," +
    "sounds:(id:!t,file_url:!t)," +
    "taxon:(iconic_taxon_id:!t,name:!t,preferred_common_name:!t,preferred_common_names:(name:!t),rank:!t,rank_level:!t)," +
    "user:(icon_url:!t,icon:!t,id:!t,login:!t,name:!t))";

  return `${observations_api}?${appParams}` + `&fields=${fields}`;
}

export async function getObservations(appParams: string) {
  let url = formatObservationsApiUrl(appParams) + "&ttl=180";

  try {
    let resp = await fetch(url);
    let data = (await resp.json()) as iNatObservationsAPI;
    loggerUrl(url.split("&fields")[0] + "&fields...", data.total_results);
    return data;
  } catch (error) {
    console.error("getObservations ERROR:", error);
  }
}

export async function getObservationsSpecies(appParams: string) {
  let fields =
    "(taxon:" +
    "(" +
    // "ancestors:" +
    // "(iconic_taxon_name:!t,id:!t,name:!t,preferred_common_name:!t,preferred_common_names:(name:!t),rank:!t,rank_level:!t,uuid:!t)," +
    // "ancestry:!t," +
    "establishment_means:(establishment_means:!t)," +
    "conservation_status:(status:!t)," +
    "default_photo:(attribution:!t,license_code:!t,medium_url:!t,square_url:!t,url:!t)," +
    "iconic_taxon_name:!t," +
    "id:!t," +
    "name:!t," +
    "preferred_common_name:!t," +
    "preferred_common_names:(name:!t)," +
    "rank:!t))";
  let url =
    `${observations_api}/species_counts?${appParams}&ttl=3600` +
    `&fields=${fields}`;

  try {
    let resp = await fetch(url);
    let data = (await resp.json()) as iNatObservationsSpeciesCountAPI;
    loggerUrl(url.split("&fields")[0] + "&fields...", data.total_results);
    return data;
  } catch (error) {
    console.error("getObservationsSpecies ERROR:", error);
  }
}

// order_by=id&order=desc
// order_by=observed_on&order=desc
export async function getObservationsObservers(appParams: string) {
  let url =
    `${observations_api}/observers?${appParams}&ttl=3600` +
    `&fields=(user:(icon_url:!t,id:!t,login:!t,name:!t))`;
  try {
    let resp = await fetch(url);
    let data = (await resp.json()) as iNatObservationsObserversAPI;
    loggerUrl(url.split("&fields")[0] + "&fields...", data.total_results);
    return data;
  } catch (error) {
    console.error("getObservationsObservers ERROR:", error);
  }
}

export async function getObservationsIdentifiers(appParams: string) {
  let url =
    `${observations_api}/identifiers?${appParams}&ttl=3600` +
    `&fields=(user:(icon_url:!t,id:!t,login:!t,name:!t))`;
  try {
    let resp = await fetch(url);
    let data = (await resp.json()) as iNatObservationsIdentifiersAPI;
    loggerUrl(url.split("&fields")[0] + "&fields...", data.total_results);
    return data;
  } catch (error) {
    console.error("getObservationsIdentifiers ERROR:", error);
  }
}

export async function getIdentifications(appParams: string) {
  let url = `${identifications_api}/?${appParams}&ttl=3600`;
  try {
    let resp = await fetch(url);
    let data = (await resp.json()) as IdentificationsAPI;
    loggerUrl(url, data.total_results);
    return data;
  } catch (error) {
    console.error("getIdentifications ERROR:", error);
  }
}

export async function getIdentificationsSpecies(appParams: string) {
  let url = `${identifications_api}/species_counts?${appParams}&ttl=3600`;
  try {
    let resp = await fetch(url);
    let data = (await resp.json()) as IdentificationsSpeciesCountAPI;
    loggerUrl(url, data.total_results);
    return data;
  } catch (error) {
    console.error("getIdentificationsSpecies ERROR:", error);
  }
}

export async function getIdentificationsObservers(appParams: string) {
  let url = `${identifications_api}/observers?${appParams}&ttl=3600`;
  try {
    let resp = await fetch(url);
    let data = (await resp.json()) as IdentificationsObserversAPI;
    loggerUrl(url, data.total_results);
    return data;
  } catch (error) {
    console.error("getIdentificationsObservers ERROR:", error);
  }
}

export async function getIdentificationsIdentifiers(appParams: string) {
  let url = `${identifications_api}/identifiers?${appParams}&ttl=3600`;
  try {
    let resp = await fetch(url);
    let data = (await resp.json()) as IdentificationsIdentifiersAPI;
    loggerUrl(url, data.total_results);
    return data;
  } catch (error) {
    console.error("getIdentificationsIdentifiers ERROR:", error);
  }
}

// taxonomy endpoint ignores per_page and page
export async function getObservationsTaxonomy(appParams: string) {
  let url = `${observations_api_v1}/taxonomy?${appParams}&ttl=3600`;
  try {
    let resp = await fetch(url);
    let data = (await resp.json()) as iNatTaxonomyApi;
    loggerUrl(url, data.size);
    return data;
  } catch (error) {
    console.error("getObservationsTaxonomy ERROR:", error);
  }
}
