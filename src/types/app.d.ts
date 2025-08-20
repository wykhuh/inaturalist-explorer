import type { TileLayer, Map, Control } from "leaflet";

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

export type NormalizediNatTaxon = {
  name: string;
  default_photo?: string;
  preferred_common_name?: string;
  matched_term: string;
  rank: string;
  id: number;
  color?: string;
  observations_count?: number;
};

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

export interface MapStore {
  selectedTaxa: NormalizediNatTaxon[];
  taxaMapLayers: { [index: string]: TileLayer[] };
  inatApiParams: {
    [index: string]: any;
  };
  displayJsonEl: HTMLElement | null;
  taxaListEl: HTMLElement | null;
  color: string;
  map: { map: Map | null; layerControl: Control.Layers | null };
}

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
