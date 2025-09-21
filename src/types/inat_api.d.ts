// ==================
// autocomplete api
// ==================

import type { LngLat } from "./app";

export interface iNatAutocompleteTaxaAPI {
  total_results: number;
  page: number;
  per_page: number;
  results: AutocompleteTaxaResult[];
}

export interface AutocompleteTaxaResult {
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
  flag_counts: FlagCounts;
  current_synonymous_taxon_ids: any;
  atlas_id?: number | null;
  complete_species_count?: number | null;
  wikipedia_url: string | null;
  matched_term: string;
  iconic_taxon_name?: string;
  preferred_common_name?: string;
  complete_rank?: string;
  conservation_status?: ConservationStatus;
}

export interface DefaultPhoto {
  id: number;
  license_code?: string | null;
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

// ==================
// search api
// ==================

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
  user: UserBasic | null;
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

export interface UserBasic {
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
  iconic_taxon_id: number | null;
  ancestor_ids: number[];
  is_active: boolean;
  name: string;
  parent_id: number | null;
  ancestry: string | null;
  extinct: boolean;
  default_photo: DefaultPhoto | null;
  taxon_changes_count: number;
  taxon_schemes_count: number;
  observations_count: number;
  photos_locked?: boolean;
  flag_counts: FlagCounts;
  current_synonymous_taxon_ids: number | null;
  taxon_photos?: TaxonPhoto[];
  atlas_id: number | null;
  complete_species_count: number | null;
  wikipedia_url: string | null;
  iconic_taxon_name?: string;
  preferred_common_name?: string;
  conservation_statuses?: ConservationStatus[];
  ancestors?: Ancestor[];
  children?: Children[];
  conservation_status?: any[];
  listed_taxa_count?: number;
  listed_taxa?: ListedTaxa[];
  wikipedia_summary?: string;
  vision?: boolean;
  complete_rank?: string;
}

export interface TaxonPhoto {
  taxon_id: number;
  photo: Photo;
  taxon: Taxon;
}

export interface Photo {
  id: number;
  license_code?: string | null;
  attribution: string;
  url: string;
  original_dimensions: OriginalDimensions;
  flags: any[];
  native_page_url?: string | null;
  native_photo_id?: string | null;
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
  iconic_taxon_id: number | null;
  ancestor_ids: number[];
  is_active: boolean;
  name: string;
  parent_id: number | null;
  ancestry: string | null;
  extinct: boolean;
  default_photo: DefaultPhoto | null;
  taxon_changes_count: number;
  taxon_schemes_count: number;
  observations_count: number;
  photos_locked: boolean;
  flag_counts: FlagCounts;
  current_synonymous_taxon_ids: any;
  atlas_id: any;
  complete_species_count: any;
  wikipedia_url: string | null;
  iconic_taxon_name?: string;
  preferred_common_name: string;
  complete_rank?: string;
}

export interface ConservationStatus {
  id: number;
  place_id: number | null;
  source_id: number | null;
  user_id: number | null;
  authority: string;
  status: string;
  status_name: string;
  geoprivacy: string;
  iucn: number;
}

export interface Ancestor {
  id: number;
  rank: string;
  rank_level: number;
  iconic_taxon_id: number | null;
  ancestor_ids: number[];
  is_active: boolean;
  name: string;
  parent_id: number | null;
  ancestry: string | null;
  extinct: boolean;
  default_photo: DefaultPhoto | null;
  taxon_changes_count: number;
  taxon_schemes_count: number;
  observations_count: number;
  flag_counts: FlagCounts;
  current_synonymous_taxon_ids: any;
  atlas_id: any;
  complete_species_count: any;
  wikipedia_url: string | null;
  complete_rank?: string;
  iconic_taxon_name?: string;
  preferred_common_name: string;
}

export interface Children {
  id: number;
  rank: string;
  rank_level: number;
  iconic_taxon_id: number | null;
  ancestor_ids: number[];
  is_active: boolean;
  name: string;
  parent_id: number | null;
  ancestry: string;
  extinct: boolean;
  default_photo: DefaultPhoto | null;
  taxon_changes_count: number;
  taxon_schemes_count: number;
  observations_count: number;
  flag_counts: FlagCounts;
  current_synonymous_taxon_ids: any;
  atlas_id: any;
  complete_species_count: any;
  wikipedia_url: string | null;
  iconic_taxon_name?: string;
  preferred_common_name?: string;
  complete_rank?: string;
  conservation_status?: any;
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
  admin_level?: number | null;
  ancestor_place_ids: number[];
}

export interface List {
  id: number;
  title: string;
}

// ==================
// observations  api
// ==================

export type iNatObservationsAPI = {
  total_results: number;
  page: number;
  per_page: number;
  results: ObservationsResult[];
};

export interface ObservationsResult {
  uuid: string;
  comments_count: number;
  created_at: string;
  created_at_details: CreatedAtDetails;
  created_time_zone: string;
  faves_count: number;
  geoprivacy: any;
  id: number;
  identifications: Identification[];
  identifications_count: number;
  location: string;
  mappable: boolean;
  obscured: boolean;
  observed_on: string;
  observed_on_details: ObservedOnDetails;
  observed_time_zone: string;
  photos: ObservationPhoto[];
  place_guess: string;
  quality_grade: string;
  sounds: any[];
  taxon: ObservationTaxon;
  time_observed_at: string | null;
  user: ObservationUser;
}

export interface CreatedAtDetails {
  date: string;
  day: number;
  hour: number;
  month: number;
  week: number;
  year: number;
}

export interface Identification {
  id: number;
  current: boolean;
}

export interface ObservedOnDetails {
  date: string;
  day: number;
  hour: number;
  month: number;
  week: number;
  year: number;
}

export interface ObservationPhoto {
  id: number;
  url: string;
}

export interface ObservationTaxon {
  id: number;
  iconic_taxon_id: number | null;
  name: string;
  preferred_common_name?: string;
  rank: string;
  rank_level: number;
}

export interface ObservationUser {
  id: number;
  icon_url?: string | null;
  login: string;
  name?: string | null;
}

export interface iNatObservationsObserversAPI {
  total_results: number;
  page: number;
  per_page: number;
  results: ObservationsObserversResult[];
}

export interface ObservationsObserversResult {
  observation_count: number;
  species_count: number;
  user: ObservationUser;
}

export interface iNatObservationsIdentifiersAPI {
  total_results: number;
  page: number;
  per_page: number;
  results: ObservationsIdentifiersResult[];
}

export interface ObservationsIdentifiersResult {
  count: number;
  user: ObservationUser;
}

export interface iNatObservationsSpeciesCountAPI {
  total_results: number;
  page: number;
  per_page: number;
  results: SpeciesCountResult[];
}

export interface SpeciesCountResult {
  count: number;
  taxon: SpeciesCountTaxon;
}

export interface SpeciesCountTaxon {
  id: number;
  ancestry?: string;
  default_photo?: SpeciesCountDefaultPhoto;
  iconic_taxon_name?: string;
  is_active?: boolean;
  name?: string;
  preferred_common_name?: string;
  rank?: string;
  rank_level?: number;
  conservation_status?: {
    id: number;
    status: string;
  };
  establishment_means?: { establishment_means: string };
}

export interface SpeciesCountDefaultPhoto {
  id: number;
  attribution: string;
  license_code: string | null;
  medium_url: string;
  square_url: string;
  url: string;
}

// ==================
// observations tiles api
// ==================

// https://api.inaturalist.org/v1/docs/#!/Observation_Tiles/get_grid_zoom_x_y_png
type iNatObservationTilesAPI = {
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
  admin_level: number | null;
  bbox_area: number;
  ancestor_place_ids: number[];
  geometry_geojson: MultiPolygonJson | PolygonJson;
  bounding_box_geojson: PolygonJson;
  location: string;
}

// ==================
// histogram api
// ==================

export type iNatHistogramApi = {
  total_results: number;
  page: number;
  per_page: number;
  results: {
    year: {
      [key: string]: number;
    };
  };
};

// ==================
//  user api
// ==================

export interface iNatUsersAPI {
  total_results: number;
  page: number;
  per_page: number;
  results: UserResult[];
}

export interface UserResult {
  id: number;
  login: string;
  spam: boolean;
  suspended: boolean;
  created_at: string;
  login_autocomplete: string;
  login_exact: string;
  name: string;
  name_autocomplete: string;
  orcid?: string | null;
  icon: string;
  observations_count: number;
  identifications_count: number;
  journal_posts_count: number;
  activity_count: number;
  species_count: number;
  universal_search_rank: number;
  roles: string[];
  site_id?: number;
  icon_url: string;
  annotated_observations_count?: number;
}

// ==================
// project api
// ==================

export interface iNatProjectsAPI {
  total_results: number;
  page: number;
  per_page: number;
  results: ProjectsResult[];
}

export interface ProjectsResult {
  id: number;
  title: string;
  hide_title: boolean;
  description: string;
  slug: string;
  project_type: string;

  delegated_project_id?: number | null;
  is_delegated_umbrella: boolean;
  banner_color: string;
  place_id?: number | null;
  user_id: number;
  admins: Admin[];
  user_ids: number[];
  location: any;
  icon: string;
  icon_file_name?: string;
  header_image_url: string;
  header_image_file_name: string;
  header_image_contain: boolean;
  project_observation_fields: any[];
  terms: any;
  search_parameters: SearchParameter[];
  project_observation_rules: ProjectObservationRule[];
  rule_preferences: RulePreference[];
  created_at: string;
  updated_at: string;
  flags: any[];
  site_features: SiteFeature[];
  prefers_user_trust: boolean;
  observation_requirements_updated_at: string;
  hide_umbrella_map_flags?: boolean;
  is_umbrella: boolean;
  is_new_style_project: boolean;
  user: User;
}

export interface SearchParameter {
  field: string;
  value: any;
  value_number?: number[];
  value_keyword?: any;
}

export interface ProjectObservationRule {
  id: number;
  operator: string;
  operand_type: string;
  operand_id: number;
}

export interface RulePreference {
  field: string;
  value: string;
}

export interface SiteFeature {
  site_id: number;
  noteworthy: boolean;
  featured_at: string;
}
