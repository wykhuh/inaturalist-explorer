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
  ancestor_ids: number[];
  ancestry: string;
  atlas_id?: number | null;
  complete_rank?: string;
  complete_species_count?: number | null;
  conservation_status?: ConservationStatus;
  current_synonymous_taxon_ids: any;
  default_photo: DefaultPhoto | null;
  extinct: boolean;
  flag_counts: FlagCounts;
  iconic_taxon_id: number;
  iconic_taxon_name?: string;
  id: number;
  is_active: boolean;
  matched_term: string;
  name: string;
  observations_count: number;
  parent_id: number;
  preferred_common_name?: string;
  rank_level: number;
  rank: string;
  taxon_changes_count: number;
  taxon_schemes_count: number;
  wikipedia_url: string | null;
}

export interface DefaultPhoto {
  attribution_name?: string;
  attribution: string;
  flags?: any[];
  id: number;
  license_code?: CCLicense | "pd" | null;
  medium_url: string;
  original_dimensions?: OriginalDimensions;
  square_url: string;
  url: string;
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
  matches: string[];
  record: SearchRecord;
  score: number;
  type: string;
}

export interface SearchRecord {
  admin_level: number | null;
  ancestor_place_ids: number[] | null;
  bbox_area: number;
  bounding_box_geojson: PolygonJson;
  display_name_autocomplete: string;
  display_name: string;
  geometry_geojson: MultiPolygonJson | PolygonJson;
  id: number;
  location: string;
  matched_term: string;
  name: string;
  names: string[];
  observations_count: number;
  place_type: number | null;
  point_geojson: Point;
  slug: string;
  universal_search_rank: number;
  user: UserBasic | null;
  uuid: string;
  without_check_list: boolean | null;
}

export interface UserBasic {
  created_at: string;
  id: number;
  login: string;
  spam: boolean;
  suspended: boolean;
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
  ancestor_ids: number[];
  ancestors?: Ancestor[];
  ancestry: string | null;
  atlas_id: number | null;
  children?: Children[];
  complete_rank?: string;
  complete_species_count: number | null;
  conservation_status?: any[];
  conservation_statuses?: ConservationStatus[];
  current_synonymous_taxon_ids: number | null;
  default_photo: DefaultPhoto | null;
  extinct: boolean;
  flag_counts: FlagCounts;
  iconic_taxon_id: number | null;
  iconic_taxon_name?: string;
  id: number;
  is_active: boolean;
  listed_taxa_count?: number;
  listed_taxa?: ListedTaxa[];
  name: string;
  observations_count: number;
  parent_id: number | null;
  photos_locked?: boolean;
  preferred_common_name?: string;
  rank_level: number;
  rank: string;
  taxon_changes_count: number;
  taxon_photos?: TaxonPhotoSummary[];
  taxon_schemes_count: number;
  vision?: boolean;
  wikipedia_summary?: string;
  wikipedia_url: string | null;
}

export interface Taxon {
  ancestor_ids: number[];
  ancestors?: Ancestor[];
  ancestry?: string | null;
  atlas_id?: any;
  complete_rank?: string;
  complete_species_count?: any;
  created_at?: string;
  current_synonymous_taxon_ids?: any;
  default_photo?: DefaultPhoto | null;
  endemic?: boolean;
  extinct?: boolean;
  flag_counts?: FlagCounts;
  iconic_taxon_id: number | null;
  iconic_taxon_name?: string;
  id: number;
  introduced?: boolean;
  is_active: boolean;
  min_species_ancestry?: string;
  min_species_taxon_id?: number;
  name?: string;
  native?: boolean;
  observations_count?: number;
  parent_id?: number | null;
  photos_locked?: boolean;
  preferred_common_name?: string;
  provisional?: boolean;
  rank_level: number;
  rank: string;
  taxon_changes_count?: number;
  taxon_schemes_count?: number;
  threatened?: boolean;
  universal_search_rank?: number;
  wikipedia_url?: string | null;
}

export interface ConservationStatus {
  authority: string;
  geoprivacy: string;
  id: number;
  iucn: number;
  place_id: number | null;
  source_id: number | null;
  status_name: string;
  status: string;
  user_id: number | null;
}

export interface Ancestor {
  ancestor_ids: number[];
  ancestry: string | null;
  atlas_id: any;
  complete_rank?: string;
  complete_species_count: any;
  current_synonymous_taxon_ids: any;
  default_photo: DefaultPhoto | null;
  extinct: boolean;
  flag_counts: FlagCounts;
  iconic_taxon_id: number | null;
  iconic_taxon_name?: string;
  id: number;
  is_active: boolean;
  name: string;
  observations_count: number;
  parent_id: number | null;
  preferred_common_name?: string;
  provisional?: boolean;
  rank_level: number;
  rank: string;
  taxon_changes_count: number;
  taxon_schemes_count: number;
  wikipedia_url: string | null;
}

export interface Children {
  ancestor_ids: number[];
  ancestry: string;
  atlas_id: any;
  complete_rank?: string;
  complete_species_count: any;
  conservation_status?: any;
  current_synonymous_taxon_ids: any;
  default_photo: DefaultPhoto | null;
  extinct: boolean;
  flag_counts: FlagCounts;
  iconic_taxon_id: number | null;
  iconic_taxon_name?: string;
  id: number;
  is_active: boolean;
  name: string;
  observations_count: number;
  parent_id: number | null;
  preferred_common_name?: string;
  rank_level: number;
  rank: string;
  taxon_changes_count: number;
  taxon_schemes_count: number;
  wikipedia_url: string | null;
}

export interface ListedTaxa {
  establishment_means: string;
  id: number;
  list: List;
  place: Place;
  taxon_id: number;
}

export interface Place {
  admin_level?: number | null;
  ancestor_place_ids: number[];
  display_name: string;
  id: number;
  name: string;
}

export interface List {
  id: number;
  title: string;
}

export interface TaxonPhotoSummary {
  taxon_id: number;
  photo: {
    attribution_name?: string;
    attribution: string;
    flags: any[];
    hidden?: boolean;
    id: number;
    large_url?: string;
    license_code?: CCLicense | null;
    medium_url?: string;
    moderator_actions?: any[];
    native_page_url?: string | null;
    native_photo_id?: string | null;
    original_dimensions: OriginalDimensions;
    original_url?: string;
    small_url?: string;
    square_url?: string;
    type?: string;
    url: string;
  };
  taxon: Taxon;
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
  annotations?: Annotation[];
  cached_votes_total?: number;
  captive?: boolean;
  comments?: any[];
  comments_count: number;
  community_taxon_id?: number;
  created_at: string;
  created_at_details?: CreatedAtDetails;
  created_time_zone: string;
  description?: string;
  faves?: any[];
  faves_count: number;
  flags?: string[];
  geojson?: Point;
  geoprivacy?: string | null;
  id: number;
  ident_taxon_ids?: number[];
  identification_disagreements_count?: number;
  identifications: Identification[];
  identifications_count?: number;
  identifications_most_agree?: boolean;
  identifications_most_disagree?: boolean;
  identifications_some_agree?: boolean;
  license_code?: CCLicense;
  location?: string;
  map_scale?: null | string;
  mappable?: boolean;
  non_owner_ids?: Identification[];
  num_identification_agreements?: number;
  num_identification_disagreements?: number;
  oauth_application_id?: number | null;
  obscured: boolean;
  observation_photos?: ObservationPhotoSummary[];
  observation_sounds?: ObservationSoundSummary[];
  observed_on: string;
  observed_on_details?: ObservedOnDetails;
  observed_on_string?: string;
  observed_time_zone: string;
  ofvs?: ObservationField[];
  outlinks?: any[];
  owners_identification_from_vision?: boolean;
  photos: ObservationPhoto[];
  place_guess: string;
  place_ids?: number[];
  positional_accuracy?: number | null;
  preferences?: any;
  project_ids?: number[];
  project_ids_with_curator_id?: number[];
  project_ids_without_curator_id?: number[];
  project_observations?: any[];
  public_positional_accuracy?: number | null;
  quality_grade: string;
  quality_metrics?: string[];
  reviewed_by?: number[];
  site_id?: number | null;
  sounds: ObservationSound[];
  spam?: boolean;
  species_guess?: string;
  tags?: string[];
  taxon: ObservationTaxon;
  taxon_geoprivacy?: string;
  time_observed_at: string | null;
  time_zone_offset?: string;
  updated_at?: string;
  uri?: string;
  user: ObservationUser;
  uuid: string;
  votes?: any[];
}

export interface ObservationField {
  datatype: ObservationFieldTypes;
  id: number;
  name: string;
  value: string;
  taxon?: {
    id: number;
    name: string;
    preferred_common_name: string;
    rank: string;
  };
}

export type ObservationFieldTypes =
  | "date"
  | "datetime"
  | "dna"
  | "numeric"
  | "time"
  | "taxon"
  | "text";

export interface CreatedAtDetails {
  date: string;
  day: number;
  hour: number;
  month: number;
  week: number;
  year: number;
}

export interface Identification {
  body?: any;
  category?: string;
  created_at_details?: CreatedAtDetails;
  created_at?: string;
  current: boolean;
  disagreement?: boolean | null;
  flags?: any[];
  hidden?: boolean;
  id: number;
  moderator_actions?: any[];
  own_observation?: boolean;
  previous_observation_taxon_id?: number | null;
  previous_observation_taxon?: Taxon;
  spam?: boolean;
  taxon_change?: any;
  taxon_id?: number;
  taxon?: Taxon;
  user?: UserResult;
  uuid?: string;
  vision?: boolean;
}

export interface ObservedOnDetails {
  date: string;
  day: number;
  hour: number;
  month: number;
  week: number;
  year: number;
}

export interface ObservationPhotoSummary {
  id: number;
  photo?: ObservationPhoto;
  photo_id?: number;
  position?: number;
  uuid?: string;
}

export interface ObservationPhoto {
  attribution?: string;
  flags?: any[];
  hidden?: boolean;
  id: number;
  license_code?: CCLicense | null;
  moderator_actions?: any[];
  original_dimensions?: OriginalDimensions;
  url?: string;
}

export interface ObservationTaxon {
  ancestor_ids?: number[];
  ancestry?: string;
  atlas_id?: number | null;
  complete_rank?: string;
  complete_species_count?: number | null;
  created_at?: string;
  current_synonymous_taxon_ids?: number | null;
  default_photo?: DefaultPhoto;
  endemic?: boolean;
  extinct?: boolean;
  flag_counts?: FlagCount;
  iconic_taxon_id?: number | null;
  iconic_taxon_name?: string;
  id: number;
  introduced?: boolean;
  is_active?: boolean;
  min_species_ancestry?: string;
  min_species_taxon_id?: number;
  name: string;
  native?: boolean;
  observations_count?: number;
  parent_id?: number;
  photos_locked?: boolean;
  preferred_common_name?: string;
  provisional?: boolean;
  rank: string;
  rank_level: number;
  taxon_changes_count?: number;
  taxon_schemes_count?: number;
  threatened?: boolean;
  universal_search_rank?: number;
  wikipedia_url?: string;
}

interface FlagCount {
  resolved: number;
  unresolved: number;
}

export interface ObservationUser {
  activity_count?: number;
  annotated_observations_count?: number;
  created_at?: string;
  icon?: string | null;
  icon_url?: string | null;
  id: number;
  identifications_count?: number;
  journal_posts_count?: number;
  login: string;
  login_autocomplete?: string;
  login_exact?: string;
  name?: string | null;
  name_autocomplete?: string | null;
  observations_count?: number;
  orcid?: string | null;
  preferences?: {};
  roles?: any[];
  site_id?: number | null;
  spam?: boolean;
  species_count?: number;
  suspended?: boolean;
  universal_search_rank?: number;
}

interface ObservationSoundSummary {
  id: number;
  uuid: string;
  sound: ObservationSound;
}

export interface ObservationSound {
  attribution?: string;
  file_content_type?: string;
  file_url?: string;
  flags?: any[];
  hidden?: boolean;
  id: number;
  license_code?: CCLicense | null;
  moderator_actions?: any[];
  native_sound_id?: number | null;
  play_local?: boolean;
  secret_token?: string | null;
  subtype?: string | null;
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
  results: ResourceIdentifiersResult[];
}

export interface ResourceIdentifiersResult {
  count: number;
  user: ObservationUser;
}

export interface iNatObservationsSpeciesCountAPI {
  total_results: number;
  page: number;
  per_page: number;
  results: ResourceSpeciesCountResult[];
}

export interface ResourceSpeciesCountResult {
  count: number;
  taxon: SpeciesCountTaxon;
}

export interface SpeciesCountTaxon {
  ancestry?: string;
  conservation_status?: {
    id: number;
    status: string;
  };
  default_photo?: DefaultPhoto;
  establishment_means?: { establishment_means: string };
  iconic_taxon_name?: string;
  id: number;
  is_active?: boolean;
  name?: string;
  preferred_common_name?: string;
  rank_level?: number;
  rank?: string;
}

// ==================
// observations tiles api
// ==================

// https://api.inaturalist.org/v1/docs/#!/Observation_Tiles/get_grid_zoom_x_y_png
interface iNatObservationTilesAPI {
  acc_above?: number;
  acc_below_or_unknown?: number | "unknown";
  acc_below?: number;
  acc?: boolean;
  annotation_user_id?: string; // comma-seperated string
  apply_project_rules_for?: string;
  captive?: boolean;
  color?: string; // only one value
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
  endemic?: boolean;
  expected_nearby?: boolean;
  geo?: boolean;
  geoprivacy?: PrivacyStatus; // comma-seperated string, type PrivacyStatus
  hour?: string; // comma-seperated string
  hrank?: TaxonRanks; // one value
  iconic_taxa?: string; // comma-seperated string, type IconicTaxa
  id_above?: string;
  id_below?: string;
  id_please?: boolean;
  id?: string; // comma-seperated string
  ident_user_id?: Number;
  identifications?: "most_agree" | "most_disagree" | "some_agree"; // one value
  identified?: boolean;
  introduced?: boolean;
  lat?: number;
  license?: string; // comma-seperated string, type CCLicense
  licensed?: boolean;
  list_id?: number;
  lng?: number;
  lrank?: TaxonRanks; // one value
  mappable?: boolean;
  month?: string; // comma-seperated string
  native?: boolean;
  nelat?: number;
  nelng?: number;
  not_id?: string; // comma-seperated string
  not_in_project?: string;
  not_matching_project_rules_for?: string;
  obscuration?: "obscured" | "private" | "none"; // comma-seperated string
  observation_accuracy_experiment_id?: string; // comma-seperated string
  observed_on?: string; // date
  ofv_datatype?: string; // comma-seperated string
  out_of_range?: boolean;
  pcid?: boolean;
  photo_license?: string; // comma-seperated string, type CCLicense
  photo_licensed?: boolean;
  photos?: boolean;
  place_id?: string; // comma-seperated string
  popular?: boolean;
  project_id?: string; // comma-seperated string
  q?: string;
  quality_grade?: "casual" | "needs_id" | "research";
  radius?: number;
  rank?: string; // comma-seperated string, type TaxonRanks
  reviewed?: boolean;
  search_on?: "names" | "tags" | "description" | "place";
  site_id?: number | null; // comma-seperated string
  sound_license?: string; // comma-seperated string, type CCLicense
  sounds?: boolean;
  swlat?: number;
  swlng?: number;
  taxon_geoprivacy?: PrivacyStatus; // comma-seperated string, type PrivacyStatus
  taxon_id?: string; // comma-seperated string
  taxon_is_active?: boolean;
  taxon_name?: string; // comma-seperated string
  term_id_or_unknown?: string; // comma-seperated string
  term_id?: string; // comma-seperated string
  term_value_id?: string; // comma-seperated string
  threatened?: boolean;
  unobserved_by_user_id?: number;
  updated_since?: string;
  user_id?: string; // comma-seperated string
  user_login?: string; // comma-seperated string
  verifiable?: boolean;
  viewer_id?: string;
  without_taxon_id?: string; // comma-seperated string
  without_term_id?: number;
  without_term_value_id?: string; // comma-seperated string
  x: number;
  y: number;
  year?: string; // comma-seperated string
  zoom: number;
}

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
  | "subgenus"
  | "genushybrid"
  | "species"
  | "hybrid"
  | "infrahybrid"
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
  admin_level: number | null;
  ancestor_place_ids: number[];
  bbox_area: number;
  bounding_box_geojson: PolygonJson;
  display_name: string;
  geometry_geojson: MultiPolygonJson | PolygonJson;
  id: number;
  location: string;
  name: string;
  place_type: number;
  slug: string;
  uuid: string;
}

// ==================
// histogram api
// ==================

export interface iNatHistogramApi {
  total_results: number;
  page: number;
  per_page: number;
  results: HistogramResult;
}

interface HistogramResult {
  year?: {
    [key: string]: number;
  };
  month?: {
    [key: string]: number;
  };
  month_of_year?: {
    [key: string]: number;
  };
}

// ==================
// popular api
// ==================

interface iNatPopularFieldsAPI {
  total_results: number;
  page: number;
  per_page: number;
  results: PopularFieldsResult[];
  unannotated: UnannotatedFields;
}

interface PopularFieldsResult {
  count: number;
  controlled_attribute: {
    id: number;
    label: string;
  };
  controlled_value: {
    id: number;
    label: string;
  };
  month_of_year: {
    [key: string]: number;
  };
}

interface UnannotatedFields {
  [key: string]: {
    count: number;
    month_of_year: {
      [key: string]: number;
    };
  };
}

interface iNatPopularFieldsBasicAPI {
  total_results: number;
  page: number;
  per_page: number;
  results: PopularFieldsBasicResult[];
}

interface PopularFieldsBasicResult {
  count: number;
  controlled_attribute: {
    id: number;
    label: string;
  };
}

// ==================
// taxonomy api
// ==================

export interface iNatTaxonomyApi {
  count_without_taxon: number;
  size: number;
  results: TaxonomyResult[];
}

export interface TaxonomyResult {
  count?: number;
  id: number;
  name: string;
  rank: TaxonRanks | "stateofmatter";
  rank_level: number;
  is_active: boolean;
  iconic_taxon_name: string | null;
  parent_id?: number;
  descendant_obs_count: number;
  direct_obs_count: number;
}

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
  activity_count?: number;
  annotated_observations_count?: number;
  created_at?: string;
  icon_url?: string | null;
  icon?: string | null;
  id: number;
  identifications_count?: number;
  journal_posts_count?: number;
  login_autocomplete?: string;
  login_exact?: string;
  login: string;
  name_autocomplete?: string | null;
  name?: string | null;
  observations_count?: number;
  orcid?: string | null;
  preferences?: Preferences;
  roles?: string[];
  site_id?: number | null;
  spam?: boolean;
  species_count?: number;
  suspended?: boolean;
  universal_search_rank?: number;
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
  admins: Admin[];
  banner_color: string;
  created_at: string;
  delegated_project_id?: number | null;
  description: string;
  flags: any[];
  header_image_contain: boolean;
  header_image_file_name: string;
  header_image_url: string;
  hide_title: boolean;
  hide_umbrella_map_flags?: boolean;
  icon_file_name?: string;
  icon: string;
  id: number;
  is_delegated_umbrella: boolean;
  is_new_style_project: boolean;
  is_umbrella: boolean;
  location: any;
  observation_requirements_updated_at: string;
  place_id?: number | null;
  prefers_user_trust: boolean;
  project_observation_fields: any[];
  project_observation_rules: ProjectObservationRule[];
  project_type: string;
  rule_preferences: RulePreference[];
  search_parameters: SearchParameter[];
  site_features: SiteFeature[];
  slug: string;
  terms: any;
  title: string;
  updated_at: string;
  user_id: number;
  user_ids: number[];
  user: User;
}

export interface SearchParameter {
  field: string;
  value_keyword?: any;
  value_number?: number[];
  value: any;
}

export interface ProjectObservationRule {
  id: number;
  operand_id: number;
  operand_type: string;
  operator: string;
}

export interface RulePreference {
  field: string;
  value: string;
}

export interface SiteFeature {
  featured_at: string;
  noteworthy: boolean;
  site_id: number;
}

// ==================
// identifications api
// ==================

export interface IdentificationsAPI {
  total_results: number;
  page: number;
  per_page: number;
  results: IdentificationsResult[];
}

export type IdentificationsResult = {
  body: any;
  category: string | null;
  created_at_details: CreatedAtDetails;
  created_at: string;
  current_taxon: boolean;
  current: boolean;
  disagreement?: boolean | null;
  flags: any[];
  hidden: boolean;
  id: number;
  moderator_actions: any[];
  observation: IdentificationObservation;
  own_observation: boolean;
  previous_observation_taxon_id: number;
  spam: boolean;
  taxon_change: any;
  taxon_id: number;
  taxon: IdentificationTaxon;
  user: UserBasic;
  uuid: string;
  vision: boolean;
};

export interface IdentificationsSpeciesCountAPI {
  total_results: number;
  page: number;
  per_page: number;
  results: ResourceSpeciesCountResult[];
}

export interface IdentificationsObserversAPI {
  total_results: number;
  page: number;
  per_page: number;
  results: IdentificationsObserversResult[];
}

export interface IdentificationsObserversResult {
  count: number;
  user: ObservationUser;
}

export interface IdentificationsIdentifiersAPI {
  total_results: number;
  page: number;
  per_page: number;
  results: ResourceIdentifiersResult[];
}

export interface IdentificationObservation {
  annotations: Annotation[];
  cached_votes_total: number;
  captive: boolean;
  comments_count: number;
  comments: any[];
  community_taxon_id?: number | null;
  created_at_details: CreatedAtDetails;
  created_at: string;
  created_time_zone: string;
  description: any;
  faves_count: number;
  faves: any[];
  flags: any[];
  geojson: Point;
  geoprivacy: any;
  id: number;
  ident_taxon_ids: number[];
  identification_disagreements_count?: number;
  identifications_count: number;
  identifications_most_agree: boolean;
  identifications_most_disagree: boolean;
  identifications_some_agree: boolean;
  identifications: Identification[];
  license_code: string | null;
  location: string;
  map_scale: any;
  mappable: boolean;
  min_species_taxon_id?: number;
  non_owner_ids: any[];
  num_identification_agreements: number;
  num_identification_disagreements: number;
  oauth_application_id?: number | null;
  obscured: boolean;
  observation_photos?: ObservationPhotoSummary[];
  observation_sounds?: ObservationSoundSummary[];
  observed_on_details: ObservedOnDetails;
  observed_on_string: string;
  observed_on: string;
  observed_time_zone: string;
  ofvs: any[];
  outlinks: any[];
  owners_identification_from_vision: boolean;
  photos: ObservationPhoto[];
  place_guess: string;
  place_ids: number[];
  positional_accuracy: number | null;
  preferences: Preferences;
  project_ids_with_curator_id: any[];
  project_ids_without_curator_id: any[];
  project_ids: any[];
  project_observations: any[];
  public_positional_accuracy: number | null;
  quality_grade: string;
  quality_metrics: any[];
  reviewed_by: number[];
  site_id?: number | null;
  sounds: ObservationSound[];
  spam: boolean;
  species_guess: string | null;
  tags: any[];
  taxon_geoprivacy: string | null;
  taxon: Taxon;
  time_observed_at: string | null;
  time_zone_offset: string;
  updated_at: string;
  uri: string;
  user_id: number;
  user: UserResult;
  uuid: string;
  votes: any[];
}

export interface IdentificationTaxon {
  ancestor_ids: number[];
  iconic_taxon_id: number;
  id: number;
  is_active: boolean;
  min_species_ancestry: string;
  min_species_taxon_id: number;
  rank_level: number;
  rank: string;
}

export interface Preferences {
  prefers_community_taxon?: any;
}

export interface Annotation {
  concatenated_attr_val?: string;
  controlled_attribute_id: number;
  controlled_value_id: number;
  user_id?: number;
  user: UserResult;
  uuid: string;
  vote_score?: number;
  votes?: AnnotationVote[];
}

interface AnnotationVote {
  id: number;
  vote_flag: boolean;
  vote_scope: string | null;
  user_id: number;
  user: UserResult;
}

interface iNatObservatFieldsAPI {
  total_results: number;
  page: number;
  per_page: number;
  results: [
    {
      id: number;
      name: string;
      description: string;
      datatype: ObservationFieldTypes;
      allowed_values: string;
      values_count: number;
    },
  ];
}

export interface iNatObservationsHistogramAPI {
  total_results: number;
  page: number;
  per_page: number;
  results: iNatObservationsHistogramResult;
}

export interface iNatObservationsHistogramResult {
  year?: {
    [k: string]: number;
  };
  month?: {
    [k: string]: number;
  };
  week?: {
    [k: string]: number;
  };
  day?: {
    [k: string]: number;
  };
  hour?: {
    [k: string]: number;
  };
  month_of_year?: {
    [k: string]: number;
  };
  week_of_year?: {
    [k: string]: number;
  };
}

type iNatObservationsHistogramResultKey =
  | "year"
  | "month"
  | "week"
  | "day"
  | "hour"
  | "month_of_year"
  | "week_of_year";
