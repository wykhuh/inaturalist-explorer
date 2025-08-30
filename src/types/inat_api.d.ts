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
  geometry_geojson: MultiPolygon | Polygon;
  bounding_box_geojson: Polygon;
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

interface MultiPolygon {
  type: "MultiPolygon";
  coordinates: LngLat[][][];
}

export interface Polygon {
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
  geometry_geojson: GeometryGeojson;
  bounding_box_geojson: BoundingBoxGeojson;
  location: string;
}

export interface GeometryGeojson {
  type: string;
  coordinates: number[][][][];
}

export interface BoundingBoxGeojson {
  type: string;
  coordinates: number[][][];
}
