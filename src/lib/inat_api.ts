import type { NormalizediNatTaxon, TileSettings } from "../types/app.d.ts";
import type {
  ObservationsSpeciesCountAPI,
  ObservationsAPI,
  iNatTaxaAPI,
  iNatPlacesAPI,
} from "../types/inat_api.d.ts";
import { defaultColorScheme } from "./map_colors_utils.ts";

const search_api = "https://api.inaturalist.org/v1/search";
export const search_places_api = `${search_api}?sources=places&per_page=10&q=`;
export const autocomplete_taxa_api =
  "https://api.inaturalist.org/v1/taxa/autocomplete";
const observations_api = "https://api.inaturalist.org/v2/observations";
const observations_count_api =
  "https://api.inaturalist.org/v2/observations/species_counts";
export const api_base = "https://api.inaturalist.org/v1/";
const taxa_api = "https://api.inaturalist.org/v1/taxa/";
const places_api = "https://api.inaturalist.org/v1/places/";

export const taxonRanks = [
  "Kingdom",
  "Phylum",
  "Subphylum",
  "Superclass",
  "Class",
  "Subclass",
  "Infraclass",
  "Subterclass",
  "Superorder",
  "Order",
  "Suborder",
  "Infraorder",
  "Parvorder",
  "Zoosection",
  "Zoosubsection",
  "Superfamily",
  "Epifamily",
  "Family",
  "Subfamily",
  "Supertribe",
  "Tribe",
  "Subtribe",
  "Genus / Genushybrid",
  "Subgenus",
  "Section",
  "Subsection",
  "Complex",
  "Species / Hybrid",
  "Subspecies / Variety / Form",
];

export const lifeTaxon: NormalizediNatTaxon = {
  name: "Life",
  default_photo:
    "https://inaturalist-open-data.s3.amazonaws.com/photos/347064198/square.jpeg",
  preferred_common_name: "life",
  matched_term: "Life",
  rank: "stateofmatter",
  id: 48460,
  display_name: "life",
  color: defaultColorScheme[0],
  title: "Life",
  subtitle: "Life",
};

type Params = {
  [index: string]: any;
};

export const getiNatMapTiles = (
  taxonID: number,
  params: Params,
): { [name: string]: TileSettings } => {
  let paramsString = new URLSearchParams(params).toString();
  let taxonRangeParamsString = new URLSearchParams({
    color: params.color,
  }).toString();

  let dupParams = structuredClone(params);
  delete dupParams.color;
  let noColorParamsString = new URLSearchParams(dupParams).toString();

  function formatDescription(params: Params, type: string) {
    let text = `overlay: iNat ${type}, taxon_id ${params.taxon_id}`;
    if (params.place_id) {
      text += `, place_id ${params.place_id}`;
    }

    return text;
  }
  return {
    iNatGrid: {
      name: "Grid",
      type: "overlay",
      url: `https://api.inaturalist.org/v1/grid/{z}/{x}/{y}.png?${paramsString}`,
      options: {
        attribution:
          'Observation data by <a href="https://www.inaturalist.org/">iNaturalist</a>.',
        minZoom: 0,
        maxZoom: 21,
        layer_description: formatDescription(params, "grid"),
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
        layer_description: formatDescription(params, "points"),
      },
    },
    iNatTaxonRange: {
      name: "Taxon Range",
      type: "overlay",
      url: `https://api.inaturalist.org/v1/taxon_ranges/${taxonID}/{z}/{x}/{y}.png?${taxonRangeParamsString}`,
      options: {
        attribution:
          'Taxon range by <a href="https://www.inaturalist.org/">iNaturalist</a>.',
        minZoom: 0,
        maxZoom: 21,
        layer_description: formatDescription(params, "taxon range"),
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
        layer_description: formatDescription(params, "heatmap"),
      },
    },
  };
};

export async function getiNatObservationsTotal(
  params: Params,
): Promise<number | undefined> {
  let paramsString = new URLSearchParams(params).toString();

  try {
    let response = await fetch(`${observations_api}?${paramsString}`);
    let data = (await response.json()) as ObservationsAPI;
    return data.total_results;
  } catch (error) {
    console.error(error);
  }
}

export async function getiNatObservationsSpeciesCount(
  params: Params,
): Promise<number | undefined> {
  let paramsString = new URLSearchParams(params).toString();

  try {
    let response = await fetch(`${observations_count_api}?${paramsString}`);
    let data = (await response.json()) as ObservationsSpeciesCountAPI;
    return data.results.reduce((prev, current) => prev + current.count, 0);
  } catch (error) {
    console.error(error);
  }
}

export async function searchPlaces(placename: string) {
  let paramsString = new URLSearchParams(placename).toString();

  try {
    let response = await fetch(`${search_places_api}${paramsString}`);
    let data = (await response.json()) as ObservationsSpeciesCountAPI;
    return data.results.reduce((prev, current) => prev + current.count, 0);
  } catch (error) {
    console.error(error);
  }
}

export async function getTaxonById(id: number) {
  try {
    let resp = await fetch(taxa_api + id);
    let data = (await resp.json()) as iNatTaxaAPI;
    return data.results[0];
  } catch (error) {
    console.error(error);
  }
}

export async function getPlaceById(id: number) {
  try {
    let resp = await fetch(places_api + id);
    let data = (await resp.json()) as iNatPlacesAPI;
    return data.results[0];
  } catch (error) {
    console.error(error);
  }
}
