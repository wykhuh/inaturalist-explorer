// ==================
// search api
// ==================

import type { LngLat } from "./app";

export interface iNatSearchAPI {
  total_results: number;
  page: number;
  per_page: number;
  results: SearchResult[];
}

export interface SearchResult {
  score: number;
  type: string;
  matches: string[];
  record: SearchRecord;
}

export interface SearchRecord {
  id: number;
  uuid: string;
  slug: string;
  name: string;
  display_name: string;
  display_name_autocomplete: string;
  place_type: number | null;
  admin_level: number | null;
  bbox_area: number;
  ancestor_place_ids: number[] | null;
  user: User | null;
  geometry_geojson: MultiPolygonJson | PolygonJson;
  bounding_box_geojson: PolygonJson;
  location: string;
  point_geojson: Point;
  without_check_list: boolean | null;
  observations_count: number;
  universal_search_rank: number;
  names: string[];
  matched_term: string;
}

export interface User {
  id: number;
  login: string;
  spam: boolean;
  suspended: boolean;
  created_at: string;
}

interface MultiPolygonJson {
  type: "MultiPolygon";
  coordinates: LngLat[][][];
}

export interface PolygonJson {
  type: "Polygon";
  coordinates: LngLat[][];
}

interface Point {
  type: "Point";
  coordinates: LngLat;
}

export interface Geojson {
  type: string;
  coordinates: number[][][];
}

// ==================
// taxa api
// ==================

type iNatAutocompleteTaxaAPI = {
  total_results: number;
  page: number;
  per_page: number;
  results: iNatAutocompleteResult[];
};

type iNatAutocompleteResult = {
  id: number;
  rank: string;
  rank_level: number;
  iconic_taxon_id: number;
  ancestor_ids: number[];
  is_active: boolean;
  name: string;
  parent_id: number;
  ancestry: string;
  extinct: boolean;
  default_photo: DefaultPhoto | null;
  taxon_changes_count: number;
  taxon_schemes_count: number;
  observations_count: number;
  flag_counts: {
    resolved: number;
    unresolved: number;
  };
  current_synonymous_taxon_ids: number | null;
  atlas_id: number | null;
  complete_species_count: number | null;
  wikipedia_url: string | null;
  matched_term: string;
  iconic_taxon_name: string;
  preferred_common_name?: string;
  conservation_status?: {
    id: number;
    place_id: number | null;
    source_id: number | null;
    user_id: number;
    authority: string;
    status: string;
    status_name: string;
    geoprivacy: string;
    iucn: number;
  };
  complete_rank?: string;
};

type DefaultPhoto = {
  id: number;
  license_code: string | null;
  attribution: string;
  url: string;
  original_dimensions: {
    height: number;
    width: number;
  };
  flags: string[];
  attribution_name: string;
  square_url: string;
  medium_url: string;
};

// ==================
// observations api
// ==================

export type ObservationsSpeciesCountAPI = {
  total_results: number;
  page: number;
  per_page: number;
  results: {
    count: number;
    taxon: {
      id: number;
    };
  }[];
};

export type ObservationsAPI = {
  total_results: number;
  page: number;
  per_page: number;
  results: {
    uuid: string;
  }[];
};

// ==================
// observations api
// ==================

// https://api.inaturalist.org/v1/docs/#!/Observation_Tiles/get_grid_zoom_x_y_png
type TilesAPIParams = {
  zoom: number;
  x: number;
  y: number;
  color?: string; // only one value
  acc?: boolean;
  captive?: boolean;
  endemic?: boolean;
  geo?: boolean;
  id_please?: boolean;
  identified?: boolean;
  introduced?: boolean;
  mappable?: boolean;
  native?: boolean;
  out_of_range?: boolean;
  pcid?: boolean;
  photos?: boolean;
  popular?: boolean;
  sounds?: boolean;
  taxon_is_active?: boolean;
  threatened?: boolean;
  verifiable?: boolean;
  licensed?: boolean;
  photo_licensed?: boolean;
  expected_nearby?: boolean;
  id?: string; // comma-seperated string
  not_id?: string; // comma-seperated string
  license?: string; // comma-seperated string, type CCLicense
  ofv_datatype?: string; // comma-seperated string
  photo_license?: string; // comma-seperated string, type CCLicense
  place_id?: string; // comma-seperated string
  project_id?: string; // comma-seperated string
  rank?: string; // comma-seperated string, type TaxonRanks
  site_id?: string; // comma-seperated string, type CCLicense
  sound_license?: string; // comma-seperated string, type CCLicense
  taxon_id?: string; // comma-seperated string
  without_taxon_id?: string; // comma-seperated string
  taxon_name?: string; // comma-seperated string
  user_id?: string; // comma-seperated string
  user_login?: string; // comma-seperated string
  ident_user_id?: Number;
  hour?: string; // comma-seperated string
  day?: string; // comma-seperated string
  month?: string; // comma-seperated string
  year?: string; // comma-seperated string
  created_day?: string; // comma-seperated string
  created_month?: string; // comma-seperated string
  created_year?: string; // comma-seperated string
  term_id?: string; // comma-seperated string
  term_value_id?: string; // comma-seperated string
  without_term_id?: number;
  without_term_value_id?: string; // comma-seperated string
  term_id_or_unknown?: string; // comma-seperated string
  annotation_user_id?: string; // comma-seperated string
  acc_above?: number;
  acc_below?: number;
  acc_below_or_unknown?: number | "unknown";
  d1?: string; // date
  d2?: string; // date
  created_d1?: string; // date-time
  created_d2?: string; // date-time
  created_on?: string; // date
  observed_on?: string; // date
  unobserved_by_user_id?: number;
  apply_project_rules_for?: string;
  cs?: string;
  csa?: string;
  csi?: string; // comma-seperated string, type IUCNStatus
  geoprivacy?: string; // comma-seperated string, type PrivacyStatus
  taxon_geoprivacy?: string; // comma-seperated string, type PrivacyStatus
  obscuration?: "obscured" | "private" | "none"; // comma-seperated string
  hrank?: TaxonRanks; // one value
  lrank?: TaxonRanks; // one value
  iconic_taxa?: string; // comma-seperated string, type IconicTaxa
  id_above?: string;
  id_below?: string;
  identifications?: "most_agree" | "most_disagree" | "some_agree"; // one value
  lat?: number;
  lng?: number;
  radius?: number;
  nelat?: number;
  nelng?: number;
  swlat?: number;
  swlng?: number;
  list_id?: number;
  not_in_project?: string;
  not_matching_project_rules_for?: string;
  observation_accuracy_experiment_id?: string; // comma-seperated string
  q?: string;
  search_on?: "names" | "tags" | "description" | "place";
  quality_grade?: "casual" | "needs_id" | "research";
  updated_since?: string;
  viewer_id?: string;
  reviewed?: boolean;
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

// ==================
// taxa api
// ==================

export interface iNatTaxaAPI {
  total_results: number;
  page: number;
  per_page: number;
  results: TaxaResult[];
}

export interface TaxaResult {
  id: number;
  rank: string;
  rank_level: number;
  iconic_taxon_id: number;
  ancestor_ids: number[];
  is_active: boolean;
  name: string;
  parent_id: number;
  ancestry: string;
  extinct: boolean;
  default_photo: DefaultPhoto;
  taxon_changes_count: number;
  taxon_schemes_count: number;
  observations_count: number;
  photos_locked: boolean;
  flag_counts: FlagCounts;
  current_synonymous_taxon_ids: any;
  taxon_photos: TaxonPhoto[];
  atlas_id: any;
  complete_species_count: any;
  wikipedia_url: string;
  iconic_taxon_name: string;
  preferred_common_name: string;
  ancestors: Ancestor[];
  children: Children[];
  conservation_statuses: any[];
  listed_taxa_count: number;
  listed_taxa: ListedTaxa[];
  wikipedia_summary: string;
  vision: boolean;
}

export interface DefaultPhoto {
  id: number;
  license_code: string;
  attribution: string;
  url: string;
  original_dimensions: OriginalDimensions;
  flags: any[];
  attribution_name: string;
  square_url: string;
  medium_url: string;
}

export interface OriginalDimensions {
  height: number;
  width: number;
}

export interface FlagCounts {
  resolved: number;
  unresolved: number;
}

export interface TaxonPhoto {
  taxon_id: number;
  photo: Photo;
  taxon: Taxon;
}

export interface Photo {
  id: number;
  license_code?: string;
  attribution: string;
  url: string;
  original_dimensions: OriginalDimensions;
  flags: any[];
  native_page_url?: string;
  native_photo_id?: string;
  type: string;
  attribution_name: string;
  square_url: string;
  small_url: string;
  medium_url: string;
  large_url: string;
  original_url: string;
}

export interface Taxon {
  id: number;
  rank: string;
  rank_level: number;
  iconic_taxon_id: number;
  ancestor_ids: number[];
  is_active: boolean;
  name: string;
  parent_id: number;
  ancestry: string;
  extinct: boolean;
  default_photo: DefaultPhoto;
  taxon_changes_count: number;
  taxon_schemes_count: number;
  observations_count: number;
  photos_locked: boolean;
  flag_counts: FlagCounts;
  current_synonymous_taxon_ids: any;
  atlas_id: any;
  complete_species_count: any;
  wikipedia_url: string;
  iconic_taxon_name: string;
  preferred_common_name: string;
}

export interface Ancestor {
  id: number;
  rank: string;
  rank_level: number;
  iconic_taxon_id: number;
  ancestor_ids: number[];
  is_active: boolean;
  name: string;
  parent_id: number;
  ancestry: string;
  extinct: boolean;
  default_photo: DefaultPhoto;
  taxon_changes_count: number;
  taxon_schemes_count: number;
  observations_count: number;
  flag_counts: FlagCounts;
  current_synonymous_taxon_ids: any;
  atlas_id: any;
  complete_species_count: any;
  wikipedia_url: string;
  complete_rank?: string;
  iconic_taxon_name: string;
  preferred_common_name: string;
}

export interface Children {
  id: number;
  rank: string;
  rank_level: number;
  iconic_taxon_id: number;
  ancestor_ids: number[];
  is_active: boolean;
  name: string;
  parent_id: number;
  ancestry: string;
  extinct: boolean;
  default_photo: DefaultPhoto;
  taxon_changes_count: number;
  taxon_schemes_count: number;
  observations_count: number;
  flag_counts: FlagCounts;
  current_synonymous_taxon_ids: any;
  atlas_id: any;
  complete_species_count: any;
  wikipedia_url: string;
  iconic_taxon_name: string;
  preferred_common_name?: string;
}

export interface ListedTaxa {
  id: number;
  taxon_id: number;
  establishment_means: string;
  place: Place;
  list: List;
}

export interface Place {
  id: number;
  name: string;
  display_name: string;
  admin_level?: number;
  ancestor_place_ids: number[];
}

export interface List {
  id: number;
  title: string;
}

// ==================
// places api
// ==================

export interface iNatPlacesAPI {
  total_results: number;
  page: number;
  per_page: number;
  results: PlacesResult[];
}

export interface PlacesResult {
  id: number;
  uuid: string;
  slug: string;
  name: string;
  display_name: string;
  place_type: number;
  admin_level: number;
  bbox_area: number;
  ancestor_place_ids: number[];
  geometry_geojson: MultiPolygonJson | PolygonJson;
  bounding_box_geojson: PolygonJson;
  location: string;
}
