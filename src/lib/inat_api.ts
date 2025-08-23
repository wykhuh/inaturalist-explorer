import type { NormalizediNatTaxon, TileSettings } from "../types/app.d.ts";
import type {
  ObservationsSpeciesCountAPI,
  ObservationsAPI,
} from "../types/inat_api.d.ts";

const search_api = "https://api.inaturalist.org/v1/search";
export const search_places_api = `${search_api}?sources=places&per_page=10&q=`;
export const autocomplete_taxa_api =
  "https://api.inaturalist.org/v1/taxa/autocomplete";
const observations_api = "https://api.inaturalist.org/v2/observations";
const observations_count_api =
  "https://api.inaturalist.org/v2/observations/species_counts";

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
