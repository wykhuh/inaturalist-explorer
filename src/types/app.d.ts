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

export interface MapStore {
  selectedTaxa: NormalizediNatTaxon[];
  taxaMapLayers: { [index: string]: TileLayer[] };
  selectedPlaces: NormalizediNatPlace[];
  placesMapLayers: { [index: string]: CustomGeoJSON[] };
  selectedUsers: NormalizediNatUser[];
  selectedProjects: NormalizediNatProject[];
  inatApiParams: iNatApiParams;
  color: string;
  map: {
    map: Map | null;
    layerControl: Control.Layers | null;
    bounds?: LatLngBoundsExpression;
  };
  refreshMap: {
    refreshMapButtonEl: HTMLElement | null;
    showRefreshMapButton: boolean;
    layer: CustomPolygon | null;
  };
  formFilters: {
    params: iNatApiParams;
    string: string;
  };
  iNatStats: {
    years?: number[];
  };
  currentView?: ObservationViews;
  currentObservationsSubview?: string;
  observationsSubviewData: ObservationsResult[];
  viewMetadata: {
    observations: ViewOptions;
    species: ViewOptions;
    identifiers: ViewOptions;
    observers: ViewOptions;
  };
}

type ViewOptions = {
  page?: number;
  order?: string;
  order_by?: string;
  subview?: string;
};

export type MapStoreKeys = keyof MapStore;

export type ObservationViews =
  | "observations"
  | "species"
  | "identifiers"
  | "observers";

export type ObservationSubviews = "table" | "grid";

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

export type NormalizediNatProject = {
  id: number;
  name: string;
  slug: string;
};

export type NormalizediNatUser = {
  id: number;
  login: string;
  name: string;
};

export type MapStoreKeys = keyof MapStore;

interface iNatApiParams extends iNatApiFilterableParams {
  nelat?: number;
  nelng?: number;
  swlat?: number;
  swlng?: number;
  colors?: string;
  per_page?: number;
  place_id?: string; // comma-seperated string
  taxon_id?: string; // comma-seperated string
  project_id?: string; // comma-seperated string
  user_id?: string; // comma-seperated string
  page?: number;
  order?: string;
  order_by?: string;
}

interface iNatApiFilterableParams {
  captive?: boolean;
  d1?: string; // date
  d2?: string; // date
  endemic?: boolean;
  hrank?: TaxonRanks; // one value
  iconic_taxa?: string; // comma-seperated string, type IconicTaxa
  identified?: boolean;
  introduced?: boolean;
  license?: string; // comma-seperated string, type CCLicense
  lrank?: TaxonRanks; // one value
  month?: string;
  native?: boolean;
  on?: string;
  photo_license?: string; // comma-seperated string, type CCLicense
  photos?: boolean;
  popular?: boolean;
  project_id?: string; // comma-seperated string
  quality_grade?: "casual" | "needs_id" | "research";
  spam?: boolean;
  sound_license?: string; // comma-seperated string, type CCLicense
  sounds?: boolean;
  threatened?: boolean;
  user_id?: string; // comma-seperated string
  verifiable?: boolean | "any";
  year?: string; // comma-seperated string
  view?: string;
  subview?: string;

  // TODO: needs to be implemented
  acc?: boolean;
  licensed?: boolean;
  out_of_range?: boolean;
  photo_licensed?: boolean;
  rank?: string; // comma-seperated string, type TaxonRanks
  without_taxon_id?: string; // comma-seperated string
  taxon_name?: string; // comma-seperated string
  ident_user_id?: number;
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

export interface AutoCompleteEvent {
  detail: {
    query: string;
    selection: {
      index: number;
      match: string;
      value:
        | NormalizediNatTaxon
        | NormalizediNatPlace
        | NormalizediNatProject
        | NormalizediNatUser;
    };
  };
}

export type iNatObservationTilesSettings = {
  iNatGrid: ObservationTilesSetting;
  iNatPoint: ObservationTilesSetting;
  iNatTaxonRange?: ObservationTilesSetting;
  iNatHeatmap: ObservationTilesSetting;
};

export interface ObservationTilesSetting {
  name: string;
  type: "overlay" | "basemap";
  url: string;
  options: {
    attribution: string;
    minZoom: number;
    maxZoom: number;
    layer_description: string;
    control_name?: string;
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
  _bounds: LeafletBounds;
  options: CustomPolygonOptions;
}

type LeafletBounds = {
  nelat?: number;
  nelng?: number;
  swlat?: number;
  swlng?: number;
};

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

type SearchOptions = {
  places: SearchOption;
  projects: SearchOption;
  users: SearchOption;
  taxa: SearchOption;
};

type SearchOption = { setup: any; selectedHandler: any };
type SearchOptionsKeys = keyof SearchOptions;

type Spinner = {
  start: () => void;
  stop: () => void;
};

export interface DataComponent extends HTMLElement {
  data?: any;
}
