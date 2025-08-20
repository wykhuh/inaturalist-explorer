import type {
  TileSettings,
  ObservationsSpeciesCountAPI,
  ObservationsAPI,
} from "../types/app.d.ts";

export const getiNatMapTiles = (
  taxonID: number,
  params: { [index: string]: any },
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

export async function getiNatObservationsTotal(params: {
  [index: string]: any;
}): Promise<number | undefined> {
  let paramsString = new URLSearchParams(params).toString();
  let baseUrl = "https://api.inaturalist.org/v2/observations";

  try {
    let response = await fetch(`${baseUrl}?${paramsString}`);
    let data = (await response.json()) as ObservationsAPI;
    return data.total_results;
  } catch (error) {
    console.error(error);
  }
}

export async function getiNatObservationsSpeciesCount(params: {
  [index: string]: any;
}): Promise<number | undefined> {
  let paramsString = new URLSearchParams(params).toString();
  let baseUrl = "https://api.inaturalist.org/v2/observations/species_counts";

  try {
    let response = await fetch(`${baseUrl}?${paramsString}`);
    let data = (await response.json()) as ObservationsSpeciesCountAPI;
    return data.results.reduce((prev, current) => prev + current.count, 0);
  } catch (error) {
    console.error(error);
  }
}
