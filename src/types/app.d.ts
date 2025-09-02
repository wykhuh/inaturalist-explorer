import type {
  TileLayer,
  Map,
  Control,
  LayerOptions,
  PolylineOptions,
  GeoJSONOptions,
  GeoJSON,
  Polygon,
} from "leaflet";
import type { PolygonJson, MultiPolygonJson } from "./inat_api";

declare global {
  interface Window {
    app: { store: MapStore };
  }
}

export type TileSettings = {
  name: string;
  type: "overlay" | "basemap";
  url: string;
  options: {
    layer_description: string;
    attribution: string;
    minZoom: number;
    maxZoom: number;
  };
};

export type NormalizediNatTaxon = {
  name?: string;
  default_photo?: string;
  preferred_common_name?: string;
  matched_term?: string;
  rank?: string;
  id: number;
  color?: string;
  observations_count?: number;
  display_name?: string;
  title?: string;
  subtitle?: string;
};

export type NormalizediNatPlace = {
  display_name?: string;
  name?: string;
  geometry?: PolygonJson | MultiPolygonJson;
  bounding_box?: PolygonJson;
  id: number;
  place_type?: number;
  place_type_name?: string;
};

export interface MapStore {
  selectedTaxa: NormalizediNatTaxon[];
  taxaMapLayers: { [index: string]: TileLayer[] };
  taxaListEl: HTMLElement | null;
  selectedPlaces: NormalizediNatPlace[];
  placesMapLayers: { [index: string]: CustomGeoJSON[] };
  placesListEl: HTMLElement | null;
  inatApiParams: iNatApiParams;
  displayJsonEl: HTMLElement | null;
  color: string;
  map: { map: Map | null; layerControl: Control.Layers | null };
  boundingBox?: { nelat: number; nelng: number; swlat: number; swlng: number };
  refreshMap: {
    refreshMapButtonEl: HTMLElement | null;
    showRefreshMapButton: boolean;
    layer: CustomPolygon | null;
  };
  formFilters: {
    params: iNatApiParams;
    string: string;
  };
}

export type MapStoreKeys = keyof MapStore;

interface iNatApiParams extends iNatApiFilterableParams {
  nelat?: number;
  nelng?: number;
  swlat?: number;
  swlng?: number;
  color?: string; // only one value allowed
  per_page?: number;
  place_id?: string; // comma-seperated string
  taxon_id?: number; // comma-seperated string
}

interface iNatApiFilterableParams {
  captive?: boolean;
  d1?: string; // date
  d2?: string; // date
  hrank?: TaxonRanks; // one value
  iconic_taxa?: string; // comma-seperated string, type IconicTaxa
  introduced?: boolean;
  lrank?: TaxonRanks; // one value
  month?: string;
  on?: string;
  photos?: boolean;
  popular?: boolean;
  quality_grade?: "casual" | "needs_id" | "research";
  spam?: boolean;
  sounds?: boolean;
  threatened?: boolean;
  verifiable?: boolean | "any";
  // todo implemented
  acc?: boolean;
  endemic?: boolean;
  identified?: boolean;
  licensed?: boolean;
  native?: boolean;
  out_of_range?: boolean;
  photo_licensed?: boolean;
  license?: string; // comma-seperated string, type CCLicense
  photo_license?: string; // comma-seperated string, type CCLicense
  project_id?: string; // comma-seperated string
  rank?: string; // comma-seperated string, type TaxonRanks
  sound_license?: string; // comma-seperated string, type CCLicense
  without_taxon_id?: string; // comma-seperated string
  taxon_name?: string; // comma-seperated string
  user_id?: string; // comma-seperated string
  ident_user_id?: number;
  year?: string; // comma-seperated string
  annotation_user_id?: string; // comma-seperated string
  acc_above?: number;
  acc_below?: number;
  observed_on?: string; // date
  csi?: string; // comma-seperated string, type IUCNStatus
  geoprivacy?: string; // comma-seperated string, type PrivacyStatus
  taxon_geoprivacy?: string; // comma-seperated string, type PrivacyStatus
  obscuration?: "obscured" | "private" | "none"; // comma-seperated string
  identifications?: "most_agree" | "most_disagree" | "some_agree"; // one value
  not_in_project?: string;

  // not implemented
  geo?: boolean;
  id_please?: boolean;
  mappable?: boolean;
  pcid?: boolean;
  taxon_is_active?: boolean;
  expected_nearby?: boolean;
  id?: string; // comma-seperated string
  not_id?: string; // comma-seperated string
  ofv_datatype?: string; // comma-seperated string
  place_id?: string; // comma-seperated string
  rank?: string; // comma-seperated string, type TaxonRanks
  site_id?: string; // comma-seperated string, type CCLicense
  user_login?: string; // comma-seperated string
  hour?: string; // comma-seperated string
  day?: string; // comma-seperated string
  created_day?: string; // comma-seperated string
  created_month?: string; // comma-seperated string
  created_year?: string; // comma-seperated string
  term_id?: string; // comma-seperated string
  term_value_id?: string; // comma-seperated string
  without_term_id?: number;
  without_term_value_id?: string; // comma-seperated string
  term_id_or_unknown?: string; // comma-seperated string
  acc_above?: number;
  acc_below?: number;
  acc_below_or_unknown?: number | "unknown";
  created_d1?: string; // date-time
  created_d2?: string; // date-time
  created_on?: string; // date
  unobserved_by_user_id?: number;
  apply_project_rules_for?: string;
  cs?: string;
  csa?: string;
  id_above?: string;
  id_below?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  list_id?: number;
  not_matching_project_rules_for?: string;
  observation_accuracy_experiment_id?: string; // comma-seperated string
  q?: string;
  search_on?: "names" | "tags" | "description" | "place";
  updated_since?: string;
  viewer_id?: string;
  reviewed?: boolean;
}

export type iNatApiParamsKeys = keyof iNatApiParams;
export type iNatApiFilterableParamsKeys = keyof iNatApiFilterableParams;

export type AppUrlParams = {
  nelat?: number;
  nelng?: number;
  swlat?: number;
  swlng?: number;
  taxon_ids?: string;
  place_id?: string;
  colors?: string;
  spam?: boolean;
  verifiable?: boolean;
};

export type AppUrlParamsKeys = keyof AppUrlParams;

export interface AutoCompleteEvent {
  detail: {
    query: string;
    selection: { index: number; match: string; value: NormalizediNatTaxon };
  };
}

// https://freshman.tech/snippets/typescript/fix-value-not-exist-eventtarget/
type ButtonEvent = Event & {
  target: HTMLButtonElement;
};

type LeafletBounds = {
  _northEast: { lat: number; lng: number };
  _southWest: { lat: number; lng: number };
};

type Lng = number;
type Lat = number;
export type LngLat = [Lng, Lat];
export type LatLng = [Lat, Lng];
export type Coordinates = LngLat | LatLng;

export interface CustomLayer extends LayerOptions {
  options: CustomLayerOptions;
  _bounds: LeafletBounds;
  _path: string;
  _container: string;
}

export interface CustomLayerOptions extends LayerOptions {
  layer_description?: string;
}

export interface CustomPolygon extends Polygon {
  _bounds: { nelat?: number; nelng?: number; swlat?: number; swlng?: number };
  options: CustomPolygonOptions;
}

export interface CustomPolygonOptions extends PolylineOptions {
  layer_description: string;
}

export interface CustomGeoJSON extends GeoJSON {
  options: CustomGeoJSONOptions;
}

export interface CustomGeoJSONOptions extends GeoJSONOptions {
  layer_description: string;
}

export type PlaceTypes = {
  [key: string]: string;
};
export type PlaceTypesKey = keyof PlaceTypes;
