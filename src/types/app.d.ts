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
import type { TerraDraw } from "terra-draw";

declare global {
  interface Window {
    app: { store: AppStoreType; router: RouterType };
  }
}

type RouterType = {
  init: () => void;
  go: (recordType: RecordTypes) => void;
};

export interface AppStoreType {
  // selected resources
  // NOTE: update when adding selectedResource AppStoreType
  selectedPlaces: NormalizediNatPlaceType[];
  selectedWithoutPlaces: NormalizediNatPlaceType[];
  selectedTaxa: NormalizediNatTaxonType[];
  selectedWithoutTaxa: NormalizediNatTaxonType[];
  selectedTaxaIdentified: NormalizediNatTaxonType[];
  selectedWithoutTaxaIdentified: NormalizediNatTaxonType[];
  selectedUsers: NormalizediNatUserType[];
  selectedWithoutUsers: NormalizediNatUserType[];
  selectedUsersIdentifiers: NormalizediNatUserType[];
  selectedWithoutUsersIdentifiers: NormalizediNatUserType[];
  selectedUnobservedByUser: NormalizediNatUserType;
  selectedUsersAnnotators: NormalizediNatUserType[];
  selectedReviewer: NormalizediNatUserType;
  selectedProjects: NormalizediNatProjectType[];
  selectedWithoutProjects: NormalizediNatProjectType[];
  // map layers
  taxaMapLayers: { [index: string]: TileLayer[] };
  taxaIdentifiedMapLayers: { [index: string]: TileLayer[] };
  placesMapLayers: { [index: string]: CustomGeoJSONType[] };
  projectsMapLayers?: { [index: string]: CustomGeoJSONType[] };
  // misc
  observationsApiParams: ObservationsApiParamsType;
  identificationsApiParams: IdentificationsApiParamsType;
  color: string;
  map: {
    map: Map | null;
    layerControl: Control.Layers | null;
    bounds?: LatLngBoundsExpression;
    terraDraw: TerraDraw | null;
  };

  formFilters: {
    params: ObservationsApiParamsType;
    string: string;
  };
  iNatStats: {
    headerCounts: any;
    headerCountsIndex: string[];
  };
  currentView?: ObservationViewsType;
  observationsSubviewData: iNatObservationsAPI;
  viewMetadata: {
    observations_observations: ViewOptions;
    observations_species: ViewOptions;
    observations_identifiers: ViewOptions;
    observations_observers: ViewOptions;
    identifications_species: ViewOptions;
    identifications_identifiers: ViewOptions;
    identifications_observers: ViewOptions;
    identifications_identifications: ViewOptions;
    name_order: NameOrderType;
  };
  record_type: RecordTypes;
}

type RecordTypes = "observations" | "identifications" | "about";

type ViewOptions = {
  page?: number;
  order?: string;
  order_by?: string;
  subview?: ObservationSubviewsType | IdentificationSubviewsType;
  perPage?: number;
};

export type AppStoreKeysType = keyof AppStoreType;

export type ObservationViewsType =
  | "observations_observations"
  | "observations_species"
  | "observations_identifiers"
  | "observations_observers"
  | "identifications_species"
  | "identifications_identifiers"
  | "identifications_observers"
  | "identifications_identifications";

export type ObservationSubviewsType = "table" | "grid" | "media" | "map";

export type IdentificationSubviewsType = "grid" | "map" | "history";

export type NameOrderType = "cs" | "sc" | "s";

export type NormalizediNatTaxonType = {
  name?: string;
  default_photo?: string;
  preferred_common_name?: string;
  matched_term?: string;
  rank?: string;
  id: number;
  color?: string;
  observations_count?: number;
  identifications_count?: number;
  title?: string;
  subtitle?: string;
};

export type NormalizediNatPlaceType = {
  display_name?: string;
  name?: string;
  geometry?: PolygonJson | MultiPolygonJson;
  bounding_box?: PolygonJson;
  id: number;
  place_type?: number;
  place_type_name?: string;
  observations_count?: number;
  identifications_count?: number;
};

export type NormalizediNatProjectType = {
  id: number;
  name: string;
  slug: string;
  observations_count?: number;
  identifications_count?: number;
  place_id?: number | null;
  geometry?: PolygonJson | MultiPolygonJson;
  bounding_box?: PolygonJson;
};

export type NormalizediNatUserType = {
  id: number;
  login: string;
  name?: string | null;
  observations_count?: number;
  identifications_count?: number;
};

export type AppStoreKeysType = keyof AppStoreType;

// NOTE: update when adding selectedResource
export type AppStoreSelectedResourcesKeysType =
  | "selectedPlaces"
  | "selectedWithoutPlaces"
  | "selectedProjects"
  | "selectedWithoutProjects"
  | "selectedTaxa"
  | "selectedWithoutTaxa"
  | "selectedTaxaIdentified"
  | "selectedWithoutTaxaIdentified"
  | "selectedUsers"
  | "selectedWithoutUsers"
  | "selectedUsersAnnotators"
  | "selectedUsersIdentifiers"
  | "selectedWithoutUsersIdentifiers";

export type AppStoreSelectedResourceKeysType =
  | "selectedReviewer"
  | "selectedUnobservedByUser";

export type AppStoreTypeParamsKeys =
  | "observationsApiParams"
  | "identificationsApiParams";

interface ObservationsApiParamsType {
  nelat?: number;
  nelng?: number;
  swlat?: number;
  swlng?: number;
  colors?: string;
  per_page?: number;
  place_id?: string; // comma-seperated string
  taxon_id?: string; // comma-seperated string
  observation_taxon_id?: string; // comma-seperated string
  project_id?: string; // comma-seperated string
  user_id?: string; // comma-seperated string
  ident_user_id?: string; // comma-seperated string
  unobserved_by_user_id?: number;
  reviewed?: boolean;
  viewer_id?: number;
  page?: number;
  order?: string;
  order_by?: string;
  locale?: string;

  // filterable
  captive?: boolean;
  d1?: string; // date
  d2?: string; // date
  disagreements?: boolean;
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
  quality_grade?: string;
  spam?: boolean;
  sound_license?: string; // comma-seperated string, type CCLicense
  sounds?: boolean;
  threatened?: boolean;
  user_id?: string; // comma-seperated string
  verifiable?: boolean | "any";
  year?: string; // comma-seperated string
  view?: string;
  subview?: string;
  user_before?: string;
  user_after?: string;

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

  ident_taxon_id?: string;
  ident_taxon_id_exclusive?: string; // array of number
  exact_taxon_id?: string; // array of number
  without_direct_taxon_id?: string; // array of number
  not_in_place?: string; // array of number
  not_user_id?: string; // array of number
  without_ident_user_id?: string; // array of number
  outlink_source?: string;
}

export type ObservationsApiParamsKeysType = keyof ObservationsApiParamsType;

interface IdentificationsApiParamsType {
  place_id?: string; // comma-seperated string
  taxon_id?: string; // comma-seperated string
  observation_taxon_id?: string; // comma-seperated string
  user_id?: string; // comma-seperated string
  page?: number;
  per_page?: number;
  colors?: string; // comma-seperated string
  order?: string;
  order_by?: string;
  not_in_place?: string; // array of number

  // filterable
  d1?: string; // date
  d2?: string; // date
  iconic_taxon_id?: string | number; // comma-seperated string
  hrank?: TaxonRanks; // one value
  lrank?: TaxonRanks; // one value

  observed_d1?: string; // date
  observed_d2?: string; // date
  observation_iconic_taxon_id?: string | number; // comma-seperated string
  observation_hrank?: TaxonRanks; // one value
  observation_lrank?: TaxonRanks; // one value
  quality_grade?: string;

  view?: string;
  subview?: string;

  reviewed?: boolean;
  rank?: string;
  observation_rank?: string;
  observation_created_d1?: string;
  observation_created_d2?: string;
  current_taxon?: string;
  own_observation?: string;
  is_change?: string;
  taxon_active?: string;
  observation_taxon_active?: string;
  id?: string;
  user_login?: string; // array string
  current?: string;
  category?: string; // array string
  taxon_change_id?: string; // array string
  without_taxon_id?: string; // array string
  without_observation_taxon_id?: string; // array string
  id_above?: string;
  id_below?: string;
  only_id?: string;
  taxon_of?: string;
}

export type IdentificationsApiParamsKeysType =
  keyof IdentificationsApiParamsType;

export interface AutoCompleteEventType {
  detail: {
    query: string;
    selection: {
      index: number;
      match: string;
      value:
        | NormalizediNatTaxonType
        | NormalizediNatPlaceType
        | NormalizediNatProjectType
        | NormalizediNatUserType;
    };
  };
}

export type iNatObservationTilesSettingsType = {
  iNatGrid: ObservationTilesSettingType;
  iNatPoint: ObservationTilesSettingType;
  iNatTaxonRange?: ObservationTilesSettingType;
  iNatHeatmap: ObservationTilesSettingType;
};

export interface ObservationTilesSettingType {
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

type LeafletBoundsType = {
  _northEast: { lat: number; lng: number };
  _southWest: { lat: number; lng: number };
};

type Lng = number;
type Lat = number;
export type LngLatType = [Lng, Lat];
export type LatLngType = [Lat, Lng];
export type CoordinatesType = LngLatType | LatLngType;

export interface CustomLayerType extends LayerOptions {
  options: CustomLayerOptionsType;
  _bounds: LeafletBoundsType;
  _path: string;
  _container: string;
}

export interface CustomLayerOptionsType extends LayerOptions {
  layer_description?: string;
}

export interface CustomPolygon extends Polygon {
  _bounds: LeafletBoundsType;
  options: CustomPolygonOptions;
}

type LeafletBoundsType = {
  nelat?: number;
  nelng?: number;
  swlat?: number;
  swlng?: number;
};

export interface CustomPolygonOptions extends PolylineOptions {
  layer_description: string;
}

export interface CustomGeoJSONType extends GeoJSON {
  options: CustomGeoJSONTypeOptions;
}

export interface CustomGeoJSONTypeOptions extends GeoJSONOptions {
  layer_description: string;
}

interface ObservationsMapTilesAPIParamsType extends ObservationsApiParamsType {
  color?: string;
}

interface IdentificationsMapTilesAPIParamsType
  extends IdentificationsApiParamsType {
  color?: string;
}

type MapTilesAPIParamsType =
  | IdentificationsMapTilesAPIParams
  | ObservationsMapTilesAPIParamsType;

export type PlaceTypes = {
  [key: string]: string;
};
export type PlaceTypesKey = keyof PlaceTypes;

// NOTE: update when adding selectedResource; SearchOptions type
type SearchOptions = {
  places: SearchOption;
  withoutPlaces: SearchOption;
  projects: SearchOption;
  withoutProjects: SearchOption;
  users: SearchOption;
  withoutUsers: SearchOption;
  usersIdentifiers: SearchOption;
  withoutUsersIdentifiers: SearchOption;
  taxa: SearchOption;
  withoutTaxa: SearchOption;
  taxaIdentified: SearchOption;
  withoutTaxaIdentified: SearchOption;
  usersAnnotators: SearchOption;
};

type SearchOption = { setup: any; selectedHandler: any };
type SearchOptionsKeys = keyof SearchOptions;

type Spinner = {
  start: () => void;
  stop: () => void;
};

export interface DataComponentType extends HTMLElement {
  data?: any;
  type: string;
}

export type TooltipSettings = {
  id: string;
  content: string;
  tooltip: string;
};
