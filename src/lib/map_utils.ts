import L from "leaflet";

export type TileSettings = {
  name: string;
  type: "overlay" | "basemap";
  url: string;
  options: {
    attribution: string;
    minZoom: number;
    maxZoom: number;
  };
};

// https://api.inaturalist.org/v1/docs/#!/Observation_Tiles/get_grid_zoom_x_y_png
type TilesAPIParams = {
  color?: string;
  captive?: boolean;
  endemic?: boolean;
  identified?: boolean;
  introduced?: boolean;
  native?: boolean;
  out_of_range?: boolean;
  photos?: boolean;
  sounds?: boolean;
  threatened?: boolean;
  verifiable?: boolean;
  license?: CCLicense;
  photo_license?: CCLicense;
  place_id?: string;
  project_id?: string;
  rank?: TaxonRanks;
  sound_license?: CCLicense;
  taxon_id?: string;
  without_taxon_id?: string;
  taxon_name?: string;
  user_id?: string;
  user_login?: string;
  ident_user_id?: string;
  hour?: string;
  day?: string;
  month?: string;
  year?: string;
  annotation_user_id?: string;
  acc_above?: string;
  acc_below?: string;
  acc_below_or_unknown?: string;
  d1?: string;
  d2?: string;
  observed_on?: string;
  csi?: IUCNStatus;
  geoprivacy?: PrivacyStatus;
  taxon_geoprivacy?: PrivacyStatus;
  obscuration?: "obscured" | "private" | "none";
  hrank?: TaxonRanks;
  lrank?: TaxonRanks;
  iconic_taxa?: IconicTaxa;
  identifications?: "most_agree" | "most_disagree" | "some_agree";
  lat?: number;
  lng?: number;
  radius?: number;
  nelat?: number;
  nelng?: number;
  swlat?: number;
  swlng?: number;
  quality_grade?: "casual" | "needs_id" | "research";
};

type CCLicense =
  | "cc-by"
  | "cc-by-nc"
  | "cc-by-nd"
  | "cc-by-sa"
  | "cc-by-nc-nd"
  | "cc-by-nc-sa"
  | "cc0";

type TaxonRanks =
  | "kingdom"
  | "phylum"
  | "subphylum"
  | "superclass"
  | "class"
  | "subclass"
  | "superorder"
  | "order"
  | "suborder"
  | "infraorder"
  | "superfamily"
  | "epifamily"
  | "family"
  | "subfamily"
  | "supertribe"
  | "tribe"
  | "subtribe"
  | "genus"
  | "genushybrid"
  | "species"
  | "hybrid"
  | "subspecies"
  | "variety"
  | "form";

type IUCNStatus = "LC" | "NT" | "VU" | "EN" | "CR" | "EW" | "EX";
type PrivacyStatus = "obscured" | "obscured_private" | "open" | "private";
type IconicTaxa =
  | "Actinopterygii"
  | "Animalia"
  | "Amphibia"
  | "Arachnida"
  | "Aves"
  | "Chromista"
  | "Fungi"
  | "Insecta"
  | "Mammalia"
  | "Mollusca"
  | "Reptilia"
  | "Plantae"
  | "Protozoa"
  | "unknown";


export function getMonthName(month) {
  // https://reactgo.com/convert-month-number-to-name-js/

  // this regex handles both numbers string numbers
  if (/^[0-9]+$/.test(month)) {
    const date = new Date();
    // set date to middle of the month to avoid weird conversion for start/end
    // of the month
    date.setDate(15);
    date.setMonth(month);
    return date.toLocaleString("default", { month: "short" });
  } else {
    return month;
  }
}

export function radiusZoom(zoomLevel) {
  return 800000 / 2 ** zoomLevel;
}

export function rectangleLatitudeZoom(zoomLevel) {
  return 7 / 2 ** zoomLevel;
}

export function rectangleLongitudeZoom(zoomLevel) {
  return 10 / 2 ** zoomLevel;
}

export function fitPointsInMap(coordinates, map) {
  if (coordinates.length > 0) {
    map.fitBounds(coordinates);
  }
}

export function isObservationInMap(observation, map, L) {
  let currentBounds = map.getBounds();
  return currentBounds.contains(
    L.latLng(observation.latitude, observation.longitude)
  );
}

export function areAllPointsInMap(coordinates, map, L) {
  // determine if all the markers are inside the map bounding box
  if (coordinates.length > 0) {
    let currentBounds = map.getBounds();
    let observationBounds = L.latLngBounds(coordinates);
    return currentBounds.contains(observationBounds);
  }
}

export const getMapTiles = (): { [name: string]: TileSettings } => {
  return {
    OpenStreetMap: {
      name: "Open Street Map",
      type: "basemap",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      options: {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors.',
        minZoom: 0,
        maxZoom: 19,
      },
    },
    AlidadeSmooth: {
      name: "Alidade Smooth",
      type: "basemap",
      url: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
      options: {
        attribution:
          '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
        minZoom: 0,
        maxZoom: 20,
      },
    },
    AlidadeSmoothDark: {
      name: "Alidade Smooth Dark",
      type: "basemap",
      url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
      options: {
        attribution:
          '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
        minZoom: 0,
        maxZoom: 20,
      },
    },
    StadiaOutdoors: {
      name: "Stadia Outdoors",
      type: "basemap",
      url: "https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png",
      options: {
        attribution:
          '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
        minZoom: 0,
        maxZoom: 20,
      },
    },
    StamenTerrain: {
      name: "Stamen Terrain",
      type: "basemap",
      url: "https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png",
      options: {
        attribution:
          '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
        minZoom: 0,
        maxZoom: 20,
      },
    },
    StamenWatercolor: {
      name: "Stamen Watercolor",
      type: "basemap",
      url: "https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg",
      options: {
        attribution:
          '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
        minZoom: 0,
        maxZoom: 16,
      },
    },
    OSMBright: {
      name: "OSM Bright",
      type: "basemap",
      url: "https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}.jpg",
      options: {
        attribution:
          '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
        minZoom: 0,
        maxZoom: 20,
      },
    },

    USGSTopo: {
      name: "USGS Topo",
      type: "basemap",
      url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}",
      options: {
        attribution:
          'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>',
        minZoom: 0,
        maxZoom: 16,
      },
    },
    USGSImagery: {
      name: "USGS Imagery",
      type: "basemap",
      url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}",
      options: {
        attribution:
          'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>',
        minZoom: 0,
        maxZoom: 16,
      },
    },
    OpenTopo: {
      name: "Open Topo",
      type: "basemap",
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      options: {
        attribution:
          'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
        minZoom: 0,
        maxZoom: 17,
      },
    },
    GBIFClassic: {
      name: "GBIF Classic",
      type: "basemap",
      url: "https://tile.gbif.org/3857/omt/{z}/{x}/{y}@1x.png?style=gbif-classic",
      options: {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://www.openmaptiles.org/copyright">OpenMapTiles</a>.',
        minZoom: 0,
        maxZoom: 21,
      },
    },
    GBIFLight: {
      name: "GBIF Light",
      type: "basemap",
      url: "https://tile.gbif.org/3857/omt/{z}/{x}/{y}@1x.png?style=gbif-light",
      options: {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://www.openmaptiles.org/copyright">OpenMapTiles</a>.',
        minZoom: 0,
        maxZoom: 21,
      },
    },
    GBIFGeyser: {
      name: "GBIF Geyser",
      type: "basemap",
      url: "https://tile.gbif.org/3857/omt/{z}/{x}/{y}@1x.png?style=gbif-geyser",
      options: {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://www.openmaptiles.org/copyright">OpenMapTiles</a>.',
        minZoom: 0,
        maxZoom: 21,
      },
    },
    GBIFBright: {
      name: "GBIF Bright",
      type: "basemap",
      url: "https://tile.gbif.org/3857/omt/{z}/{x}/{y}@1x.png?style=osm-bright",
      options: {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://www.openmaptiles.org/copyright">OpenMapTiles</a>.',
        minZoom: 0,
        maxZoom: 21,
      },
    },
    GBIFNatural: {
      name: "GBIF Natural",
      type: "basemap",
      url: "https://tile.gbif.org/3857/omt/{z}/{x}/{y}@1x.png?style=gbif-natural",
      options: {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://www.openmaptiles.org/copyright">OpenMapTiles</a>.',
        minZoom: 0,
        maxZoom: 21,
      },
    },
  };
};

export const getiNatMapTiles = (
  taxonID: number,
  params: string
): { [name: string]: TileSettings } => {
  return {
    iNatGrid: {
      name: "Grid",
      type: "overlay",
      url: `https://api.inaturalist.org/v1/grid/{z}/{x}/{y}.png?${params}`,
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
      url: `https://api.inaturalist.org/v1/points/{z}/{x}/{y}.png?${params}`,
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
      url: `https://api.inaturalist.org/v1/taxon_ranges/${taxonID}/{z}/{x}/{y}.png`,
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
      url: `https://api.inaturalist.org/v1/heatmap/{z}/{x}/{y}.png?${params}`,
      options: {
        attribution:
          'Observation data by <a href="https://www.inaturalist.org/">iNaturalist</a>.',
        minZoom: 0,
        maxZoom: 21,
      },
    },
  };
};

export let scaleControlOptions = {
  maxWidth: 200,
};

export function addLayerToMap(
  tileObj: TileSettings,
  map: any,
  layerControl: any,
  checked = false
) {
  let layer = L.tileLayer(tileObj.url, tileObj.options);
  if (checked) {
    layer.addTo(map);
  }
  layerControl.addBaseLayer(layer, tileObj.name);

  return layer;
}

export function addOverlayToLayerControl(
  tileObj: TileSettings,
  map: any,
  layerControl: any,
  taxon: string,
  checked = false
) {
  let layer = L.tileLayer(tileObj.url, tileObj.options);
  if (checked) {
    layer.addTo(map);
  }
  layerControl.addOverlay(layer, `${taxon} ${tileObj.name}`);
  return layer;
}
