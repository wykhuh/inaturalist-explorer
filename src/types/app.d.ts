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
import type {
  PolygonJson,
  MultiPolygonJson,
  iNatObservationsAPI,
  iNatPopularFieldsAPI,
  iNatObservationsHistogramResult,
} from "./inat_api";
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
  viewMetadata: {
    mapTimePeriods: string[] | number[];
    popularFieldsByTaxa: PopularFieldsByTaxa;
    popularFieldsOptions: PopularFieldOption[];
    observations_observations: ViewOptions;
    observations_species: ViewOptions;
    observations_identifiers: ViewOptions;
    observations_observers: ViewOptions;
    identifications_species: ViewOptions;
    identifications_identifiers: ViewOptions;
    identifications_observers: ViewOptions;
    identifications_identifications: ViewOptions;
    name_order: NameOrderType;
    side_menu: "show" | "hide";
  };
  record_type: RecordTypes;
}

export type PopularFieldsByTaxa = {
  [term_id: string]: { [taxon_id: string]: true };
};

export type PopularFieldsByTermId = {
  [term_id: number]: PopularFieldForGraph[];
};

export type PopularFieldForGraph = {
  taxon_id: number;
  taxon_name: string;
  taxon_color: string;
  place_id?: number;
  place_name?: string;
  place_color?: string;
  controlled_attribute: ControlledAttributeBasic;
  annotations: PopularFieldAnnotation[];
  unannotated: { count: number; month_of_year: { [k: string]: number } };
};

export type PopularFieldAnnotation = {
  count: number;
  controlled_value: ControlledAttributeBasic;
  month_of_year: { [k: string]: number };
};

export type ControlledAttributeBasic = { id: number; label: string };

interface NormalizedPopularFields extends iNatPopularFieldsAPI {
  taxon_id: number;
  taxon_name: string;
  taxon_color: string;
  place_id?: number;
  place_name?: string;
  place_color?: string;
}

export type ObservationsGraphData = {
  histogram: iNatObservationsHistogramResult[];
  popularFields: PopularFieldsByTermId;
};

export type ObservationsMapData = {
  timePeriods: number[] | string[];
  type?: HistogramCategory;
};

export type GraphData = {
  month_of_year: iNatObservationsHistogramResult[];
  year: iNatObservationsHistogramResult[];
  month: iNatObservationsHistogramResult[];
};

type RecordTypes = "observations" | "identifications" | "about";

type ViewOptions = {
  page?: number;
  order?: string;
  order_by?: string;
  subview?: ObservationSubviewsType | IdentificationSubviewsType;
  perPage?: number;
  displayFields?: { [k: string]: boolean };
  graphs?: ViewMetadataGraphs;
  map?: MapMetadataGraphs;
};

export type ViewMetadataGraphs = {
  groupBy?: GraphGroupBy;
  category?: GraphCategory;
  valueType?: GraphValueType;
};

export type MapMetadataGraphs = {
  category?: MapCategory;
  setTimeoutIds?: any[];
  mapAnimation?: boolean;
  mapLayers?: { [k: string]: TileLayer[] };
};

export type GraphGroupBy = "species" | "places";
export type GraphValueType = "counts" | "percents";
export type GraphCategory =
  | "month_of_year"
  | "month"
  | "year"
  | "1"
  | "9"
  | "12"
  | "17"
  | "22"
  | "33"
  | "36";

export type HistogramCategory = "month_of_year" | "month" | "year";

export type MapCategory = "month_of_year" | "month" | "year" | "none";

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

export type ObservationSubviewsType =
  | "graph"
  | "grid"
  | "media"
  | "map"
  | "table";

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
  slug?: string;
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

export type NormalizedObservatFieldType = {
  name: string;
  description: string;
  datatype: ObservationFieldTypes;
  count: number;
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

interface ObservationsApiBase {
  acc?: boolean;
  acc_above?: number;
  acc_below?: number;
  acc_below_or_unknown?: number | "unknown";
  annotation_user_id?: string; // comma-seperated string
  apply_project_rules_for?: string;
  captive?: boolean;
  colors?: string;
  coords_viewable_for_proj?: string;
  created_d1?: string; // date-time
  created_d2?: string; // date-time
  created_day?: string; // comma-seperated string
  created_month?: string; // comma-seperated string
  created_on?: string; // date
  created_year?: string; // comma-seperated string
  cs?: string;
  csa?: string;
  csi?: string; // comma-seperated string, type IUCNStatus
  d1?: string; // date
  d2?: string; // date
  day?: string; // comma-seperated string
  disagreements?: boolean;
  endemic?: boolean;
  exact_taxon_id?: string; // array of number
  expected_nearby?: boolean;
  fails_dqa_accurate?: boolean;
  fails_dqa_date?: boolean;
  fails_dqa_evidence?: boolean;
  fails_dqa_location?: boolean;
  fails_dqa_needs_id?: boolean;
  fails_dqa_recent?: boolean;
  fails_dqa_subject?: boolean;
  fails_dqa_wild?: boolean;
  geo?: boolean;
  geoprivacy?: string; // comma-seperated string, type PrivacyStatus
  hour?: string; // comma-seperated string
  hrank?: TaxonRanks; // one value
  iconic_taxa?: string; // comma-seperated string, type IconicTaxa
  id?: string; // comma-seperated string
  id_above?: string;
  id_below?: string;
  id_please?: boolean;
  ident_taxon_id?: string;
  ident_taxon_id_exclusive?: string; // array of number
  ident_user_id?: string; // comma-seperated string
  identifications?: "most_agree" | "most_disagree" | "some_agree"; // one value
  identified?: boolean;
  introduced?: boolean;
  lat?: number;
  license?: string; // comma-seperated string, type CCLicense
  licensed?: boolean;
  list_id?: number;
  lng?: number;
  locale?: string;
  lrank?: TaxonRanks; // one value
  mappable?: boolean;
  month?: string;
  native?: boolean;
  nelat?: number;
  nelng?: number;
  not_id?: string; // comma-seperated string
  not_in_place?: string; // array of number
  not_in_project?: string;
  not_matching_project_rules_for?: string;
  not_user_id?: string; // array of number
  obscuration?: "obscured" | "private" | "none"; // comma-seperated string
  observation_accuracy_experiment_id?: string; // comma-seperated string
  observed_on?: string; // date
  ofv_datatype?: string; // comma-seperated string
  on?: string;
  only_id?: boolean;
  out_of_range?: boolean;
  outlink_source?: string;
  pcid?: boolean;
  photo_license?: string; // comma-seperated string, type CCLicense
  photo_licensed?: boolean;
  photos?: boolean;
  place_id?: string; // comma-seperated string
  popular?: boolean;
  project_id?: string; // comma-seperated string
  project_id?: string; // comma-seperated string
  q?: string;
  quality_grade?: string;
  radius?: number;
  rank?: string; // comma-seperated string, type TaxonRanks
  reviewed?: boolean;
  search_on?: "names" | "tags" | "description" | "place";
  site_id?: string; // comma-seperated string, type CCLicense
  sound_license?: string; // comma-seperated string, type CCLicense
  sounds?: boolean;
  spam?: boolean;
  subview?: string;
  swlat?: number;
  swlng?: number;
  taxon_geoprivacy?: string; // comma-seperated string, type PrivacyStatus
  taxon_id?: string; // comma-seperated string
  taxon_is_active?: boolean;
  taxon_name?: string; // comma-seperated string
  term_id?: string; // comma-seperated string
  term_id_or_unknown?: string; // comma-seperated string
  term_value_id?: string; // comma-seperated string
  threatened?: boolean;
  ttl?: number;
  unobserved_by_user_id?: number;
  updated_since?: string;
  user_after?: string;
  user_before?: string;
  user_id?: string; // comma-seperated string
  user_login?: string; // comma-seperated string
  verifiable?: boolean | "any";
  view?: string;
  viewer_id?: number;
  without_direct_taxon_id?: string; // array of number
  without_field?: string;
  without_ident_user_id?: string; // array of number
  without_taxon_id?: string; // comma-seperated string
  without_term_id?: number;
  without_term_value_id?: string; // comma-seperated string
  year?: string; // comma-seperated string

  // beta hacky features
  obs_without_ofvs?: boolean;
  obs_without_annotations?: boolean;
}

interface ObservationsApiParamsType extends ObservationsApiBase {
  fields?: string;
  only_id?: boolean;
  order?: string;
  order_by?: string;
  page?: number;
  per_page?: number;
}

interface HistogramsApiParamsType extends ObservationsApiBase {
  date_field?: string;
  interval?: string; // year, month, week, day, hour, month_of_year, week_of_year
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
  only_id?: boolean;
  taxon_of?: string;
}

export type IdentificationsApiParamsKeysType =
  keyof IdentificationsApiParamsType;

type AppCustomParamsType = {
  graphs_category?: GraphCategory;
  graphs_group_by?: GraphGroupBy;
  graphs_value?: GraphValueType;
  name_order?: NameOrderType;
  locale?: string;
  map_category?: MapCategory;
};

export type AppParamsType = ObservationsApiParamsType &
  IdentificationsApiParamsType &
  AppCustomParamsType;

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
        | NormalizediNatUserType
        | NormalizedObservatFieldType;
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
  type?: string;
}

export type TooltipSettings = {
  id: string;
  content: string;
  tooltip: string;
};

export type PaginationCallback = (
  currentPage: number,
  appStore: AppStoreType,
) => Promise<void>;

export type ObservationsCSVRow = {
  observation_created_at: string;
  observation_id: number;
  observation_observed_on: string;
  observation_photo_attribution?: string;
  observation_photo_license_code?: string | null;
  observation_photo_url?: string;
  observation_photos_count: number;
  observation_sound_attribution?: string;
  observation_sound_license_code?: string | null;
  observation_sound_url?: string;
  observation_sound_type?: string;
  observation_sounds_count: number;
  observation_quality_grade: string;
  observation_taxon_id: number;
  observation_taxon_name?: string;
  observation_taxon_preferred_common_name?: string;
  observation_uuid: string;
  observer_id: number;
  observer_login: string;

  annotations_count: number;
  annotations_score?: number;
  annotation_controlled_attribute_id: number;
  annotation_controlled_value_id: number;
  annotator_id: number;
  annotator_login: string;
  annotation_uuid: string;
  annotation_vote_score?: number;
};

export type IdentificationsCSVRow = {
  identification_body: string;
  identification_category?: string | null;
  identification_created_at: string;
  identification_current: boolean;
  identification_current_taxon: boolean;
  identification_disagreement?: boolean | null;
  identification_hidden: boolean;
  identification_own_observation: boolean;
  identification_spam: boolean;
  identification_vision: boolean;
  identification_id: number;
  identification_taxon_id: number;
  identification_taxon_name?: string;
  identification_taxon_preferred_common_name?: string;
  identification_taxon_rank: string;
  identification_uuid: string;
  identifier_id: number;
  identifier_login: string;
  observation_created_at: string;
  observation_id: number;
  observation_observed_on: string;
  observation_photo_attribution?: string;
  observation_photo_license_code?: string | null;
  observation_photo_url?: string;
  observation_photos_count: number;
  observation_sound_attribution?: string;
  observation_sound_license_code?: string | null;
  observation_sound_url?: string;
  observation_sound_type?: string;
  observation_sounds_count: number;
  observation_quality_grade: string;
  observation_taxon_id: number;
  observation_taxon_name?: string;
  observation_taxon_preferred_common_name?: string;
  observation_uuid: string;
  observer_id: number;
  observer_login: string;
};
