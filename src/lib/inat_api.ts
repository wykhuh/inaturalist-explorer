import type {
  iNatObservationTilesSettings,
  NormalizediNatTaxon,
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
} from "../types/inat_api.d.ts";
import { normalizeAppParams } from "./data_utils.ts";
import { loggerUrl } from "./logger.ts";
import { iNatOrange } from "./map_colors_utils.ts";

export const api_base = "https://api.inaturalist.org/v1/";
const search_api = "https://api.inaturalist.org/v1/search";
export const autocomplete_places_api = `${search_api}?sources=places`;
export const autocomplete_projects_api = `https://api.inaturalist.org/v1/projects/autocomplete?`;
export const autocomplete_users_api = `https://api.inaturalist.org/v1/users/autocomplete?order=activity`;
export const autocomplete_taxa_api =
  "https://api.inaturalist.org/v1/taxa/autocomplete?";

const observations_api = "https://api.inaturalist.org/v2/observations";
const taxa_api = "https://api.inaturalist.org/v1/taxa/";
const places_api = "https://api.inaturalist.org/v1/places/";
// set max-age Cache-Control HTTP header to 30 days
const histogram_year_api = `https://api.inaturalist.org/v1/observations/histogram?date_field=observed&interval=year&ttl=${60 * 60 * 24 * 30}`;
const projects_api = "https://api.inaturalist.org/v1/projects/";
const users_api = "https://api.inaturalist.org/v1/users/";

type Params = {
  [index: string]: any;
};

function formatDescription(inatApiParams: Params, type: string) {
  let text = `overlay: iNat ${type}, taxon_id ${inatApiParams.taxon_id || 0}`;
  if (inatApiParams.place_id) {
    text += `, place_id ${inatApiParams.place_id}`;
  }
  if (inatApiParams.project_id) {
    text += `, project_id ${inatApiParams.project_id}`;
  }
  if (inatApiParams.user_id) {
    text += `, user_id ${inatApiParams.user_id}`;
  }
  return text;
}

export const getiNatMapTiles = (
  inatApiParams: Params,
  taxonObj: NormalizediNatTaxon,
): iNatObservationTilesSettings => {
  let dupParams = structuredClone(inatApiParams);

  // rename colors to color to work with iNat api
  dupParams.color = dupParams.colors;
  delete dupParams.colors;

  // remove taxon id if it is zero
  if (dupParams.taxon_id === "0") {
    delete dupParams.taxon_id;
  }
  if (dupParams.color === undefined) {
    dupParams.color = iNatOrange;
  }

  let paramsString = new URLSearchParams(dupParams).toString();
  let taxonRangeParamsString = new URLSearchParams({
    color: dupParams.color,
  }).toString();

  delete dupParams.color;
  let noColorParamsString = new URLSearchParams(dupParams).toString();

  let tiles: iNatObservationTilesSettings = {
    iNatGrid: {
      name: "Grid",
      type: "overlay",
      url: `https://api.inaturalist.org/v1/grid/{z}/{x}/{y}.png?${paramsString}`,
      options: {
        attribution:
          'Observation data by <a href="https://www.inaturalist.org/">iNaturalist</a>.',
        minZoom: 0,
        maxZoom: 21,
        layer_description: formatDescription(inatApiParams, "grid"),
        control_name: `${taxonObj.display_name} Grid`,
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
        layer_description: formatDescription(inatApiParams, "points"),
        control_name: `${taxonObj.display_name} Points`,
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
        layer_description: formatDescription(inatApiParams, "taxon range"),
        control_name: `${taxonObj.display_name} Taxon Range`,
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
        layer_description: formatDescription(inatApiParams, "heatmap"),
        control_name: `${taxonObj.display_name} Heatmap`,
      },
    },
  };

  if (dupParams.taxon_id === "0" || dupParams.taxon_id === undefined) {
    delete tiles.iNatTaxonRange;
  }
  return tiles;
};

export async function searchPlaces(placename: string) {
  let paramsString = new URLSearchParams(placename).toString();

  try {
    let response = await fetch(`${autocomplete_places_api}${paramsString}`);
    let data = (await response.json()) as iNatObservationsSpeciesCountAPI;
    return data.results.reduce((prev, current) => prev + current.count, 0);
  } catch (error) {
    console.error("searchPlaces ERROR:", error);
  }
}

export async function getTaxonById(id: number) {
  try {
    let resp = await fetch(taxa_api + id);
    let data = (await resp.json()) as iNatTaxaAPI;
    return data.results[0];
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

export async function getObservations(
  appParams: string,
  perPage: number,
  order_by = "id",
  order = "desc",
) {
  let searchParams = normalizeAppParams(appParams);
  let url =
    `${observations_api}?${searchParams}&ttl=3600` +
    `&per_page=${perPage}&order_by=${order_by}&order=${order}` +
    `&fields=(comments_count%3A!t` +
    `%2Ccreated_at%3A!t` +
    `%2Ccreated_at_details%3Aall` +
    `%2Ccreated_time_zone%3A!t` +
    `%2Cfaves_count%3A!t` +
    `%2Cgeoprivacy%3A!t` +
    `%2Cid%3A!t` +
    `%2Cidentifications%3A(current%3A!t)` +
    // `%2Cidentifications_count%3A!t` +
    // `%2Clocation%3A!t` +
    // `%2Cmappable%3A!t` +
    `%2Cobscured%3A!t` +
    `%2Cobserved_on%3A!t` +
    `%2Cobserved_on_details%3Aall` +
    `%2Cobserved_time_zone%3A!t` +
    `%2Cphotos%3A(id%3A!t%2Curl%3A!t)` +
    `%2Cplace_guess%3A!t` +
    `%2Cprivate_geojson%3A!t` +
    `%2Cquality_grade%3A!t` +
    `%2Csounds%3A(id%3A!t)` +
    `%2Ctaxon%3A(iconic_taxon_id%3A!t%2Cname%3A!t%2Cpreferred_common_name%3A!t` +
    `%2Cpreferred_common_names%3A(name%3A!t)%2Crank%3A!t%2Crank_level%3A!t)` +
    `%2Ctime_observed_at%3A!t` +
    `%2Cuser%3A(icon_url%3A!t%2Cid%3A!t%2Clogin%3A!t%2Cname%3A!t))`;

  try {
    let resp = await fetch(url);
    let data = (await resp.json()) as iNatObservationsAPI;
    loggerUrl(url, data.total_results);
    return data;
  } catch (error) {
    console.error("getObservations ERROR:", error);
  }
}

export async function getObservationsSpecies(
  appParams: string,
  perPage: number,
) {
  let searchParams = normalizeAppParams(appParams);
  let url =
    `${observations_api}/species_counts?${searchParams}&ttl=3600` +
    `&per_page=${perPage}` +
    `&fields=(taxon%3A(ancestors%3A(iconic_taxon_name%3A!t` +
    `%2Cid%3A!t%2Cname%3A!t` +
    `%2Cpreferred_common_name%3A!t%2Cpreferred_common_names%3A(name%3A!t)` +
    `%2Crank%3A!t%2Crank_level%3A!t%2Cuuid%3A!t)%2Cancestry%3A!t` +
    `%2Cconservation_status%3A(status%3A!t)` +
    `%2Cdefault_photo%3A(attribution%3A!t%2Clicense_code%3A!t%2Cmedium_url%3A!t%2Csquare_url%3A!t%2Curl%3A!t)` +
    `%2Ciconic_taxon_name%3A!t%2Cid%3A!t%2Cname%3A!t` +
    `%2Cpreferred_common_name%3A!t%2Cpreferred_common_names%3A(name%3A!t)` +
    `%2Crank%3A!t))`;

  try {
    let resp = await fetch(url);
    let data = (await resp.json()) as iNatObservationsSpeciesCountAPI;
    loggerUrl(url, data.total_results);
    return data;
  } catch (error) {
    console.error("getObservationsSpecies ERROR:", error);
  }
}

// order_by=id&order=desc
// order_by=observed_on&order=desc
export async function getObservationsObservers(
  appParams: string,
  perPage: number,
) {
  let searchParams = normalizeAppParams(appParams);
  let url =
    `${observations_api}/observers?${searchParams}&ttl=3600` +
    `&per_page=${perPage}` +
    `&fields=(user%3A(icon_url%3A!t%2Cid%3A!t%2Clogin%3A!t%2Cname%3A!t))`;
  try {
    let resp = await fetch(url);
    let data = (await resp.json()) as iNatObservationsObserversAPI;
    loggerUrl(url, data.total_results);
    return data;
  } catch (error) {
    console.error("getObservationsObservers ERROR:", error);
  }
}

export async function getObservationsIdentifiers(
  appParams: string,
  perPage: number,
) {
  let searchParams = normalizeAppParams(appParams);
  let url =
    `${observations_api}/identifiers?${searchParams}&ttl=3600` +
    `&per_page=${perPage}` +
    `&fields=(user%3A(icon_url%3A!t%2Cid%3A!t%2Clogin%3A!t%2Cname%3A!t))`;
  try {
    let resp = await fetch(url);
    let data = (await resp.json()) as iNatObservationsIdentifiersAPI;
    loggerUrl(url, data.total_results);
    return data;
  } catch (error) {
    console.error("getObservationsIdentifiers ERROR:", error);
  }
}
