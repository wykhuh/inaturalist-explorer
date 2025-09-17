import type {
  LngLat,
  NormalizediNatPlace,
  NormalizediNatTaxon,
  PlaceTypes,
} from "../types/app";
import { defaultColorScheme, iNatOrange } from "../lib/map_colors_utils.ts";

export const taxonRanks = [
  "Kingdom",
  "Phylum",
  "Subphylum",
  "Superclass",
  "Class",
  "Subclass",
  "Infraclass",
  "Subterclass",
  "Superorder",
  "Order",
  "Suborder",
  "Infraorder",
  "Parvorder",
  "Zoosection",
  "Zoosubsection",
  "Superfamily",
  "Epifamily",
  "Family",
  "Subfamily",
  "Supertribe",
  "Tribe",
  "Subtribe",
  "Genus / Genushybrid",
  "Subgenus",
  "Section",
  "Subsection",
  "Complex",
  "Species / Hybrid",
  "Subspecies / Variety / Form",
];

export const speciesRanks = [
  "species",
  "hybrid",
  "subspecies",
  "variety",
  "form",
];

export const iNatApiNonFilterableNames = [
  "nelat",
  "nelng",
  "swlat",
  "swlng",
  "colors",
  "per_page",
  "place_id",
  "taxon_id",
  "project_id",
  "user_id",
  "view",
  "subview",
  "page",
  "order",
  "order_by",
];

export const iNatApiFilterableNames = [
  "captive",
  "d1",
  "d2",
  "endemic",
  "hrank",
  "iconic_taxa",
  "identified",
  "introduced",
  "license",
  "lrank",
  "month",
  "native",
  "on",
  "photo_license",
  "photos",
  "popular",
  "quality_grade",
  "sound_license",
  "sounds",
  "threatened",
  "verifiable",
  "year",

  // TODO: needs to be implemented
  "acc",
  "licensed",
  "out_of_range",
  "photo_licensed",
  "rank",
  "without_taxon_id",
  "taxon_name",
  "ident_user_id",
  "annotation_user_id",
  "acc_above",
  "acc_below",
  "observed_on",
  "csi",
  "geoprivacy",
  "taxon_geoprivacy",
  "obscuration",
  "identifications",
  "not_in_project",

  // not implemented
  "geo",
  "id_please",
  "mappable",
  "pcid",
  "taxon_is_active",
  "expected_nearby",
  "id",
  "not_id",
  "ofv_datatype",
  "rank",
  "site_id",
  "user_login",
  "hour",
  "day",
  "created_day",
  "created_month",
  "created_year",
  "term_id",
  "term_value_id",
  "without_term_id",
  "without_term_value_id",
  "term_id_or_unknown",
  "acc_above",
  "acc_below",
  "acc_below_or_unknown",
  "created_d1",
  "created_d2",
  "created_on",
  "unobserved_by_user_id",
  "apply_project_rules_for",
  "cs",
  "csa",
  "id_above",
  "id_below",
  "lat",
  "lng",
  "radius",
  "list_id",
  "not_matching_project_rules_for",
  "observation_accuracy_experiment_id",
  "q",
  "search_on",
  "updated_since",
  "viewer_id",
  "reviewed",
  "spam",
];

export const iNatApiNames = iNatApiNonFilterableNames.concat(
  iNatApiFilterableNames,
);

export const CCLicenses = [
  "cc0",
  "cc-by",
  "cc-by-nc",
  "cc-by-sa",
  "cc-by-nd",
  "cc-by-nc-sa",
  "cc-by-nc-nd",
];

//forum.inaturalist.org/t/what-is-places-type-for-the-api-call-for-places-nearby/49446/2?u=wy_bio
export const placeTypes: PlaceTypes = {
  "0": "Undefined",
  "2": "Street Segment",
  "5": "Intersection",
  "6": "Street",
  "7": "Town",
  "8": "State",
  "9": "County",
  "10": "Local Administrative Area",
  "12": "Country",
  "13": "Island",
  "14": "Airport",
  "15": "Drainage",
  "16": "Land Feature",
  "17": "Miscellaneous",
  "18": "Nationality",
  "19": "Supername",
  "20": "Point of Interest",
  "21": "Region",
  "24": "Colloquial",
  "25": "Zone",
  "26": "Historical State",
  "27": "Historical County",
  "29": "Continent",
  "33": "Estate",
  "35": "Historical Town",
  "36": "Aggregate",
  "100": "Open Space",
  "101": "Territory",
  "102": "District",
  "103": "Province",
  "1000": "Municipality",
  "1001": "Parish",
  "1002": "Department Segment",
  "1003": "City Building",
  "1004": "Commune",
  "1005": "Governorate",
  "1006": "Prefecture",
  "1007": "Canton",
  "1008": "Republic",
  "1009": "Division",
  "1010": "Subdivision",
  "1011": "Village block",
  "1012": "Sum",
  "1013": "Unknown",
  "1014": "Shire",
  "1015": "Prefecture City",
  "1016": "Regency",
  "1017": "Constituency",
  "1018": "Local Authority",
  "1019": "Poblacion",
  "1020": "Delegation",
};

export const lifeTaxon: NormalizediNatTaxon = {
  name: "Life",
  default_photo:
    "https://inaturalist-open-data.s3.amazonaws.com/photos/347064198/square.jpeg",
  preferred_common_name: "life",
  matched_term: "Life",
  rank: "stateofmatter",
  id: 48460,
  display_name: "life",
  color: defaultColorScheme[0],
  title: "Life",
  subtitle: "Life",
};

export const allTaxaRecord: NormalizediNatTaxon = {
  rank: "allTaxaRecord rank",
  id: 0,
  display_name: "All species",
  color: iNatOrange,
  title: "All species",
};

export function bboxPlaceRecord(bbox: LngLat[]): NormalizediNatPlace {
  return {
    id: 0,
    name: "Custom Boundary",
    display_name: "Custom Boundary",
    bounding_box: { type: "Polygon", coordinates: [bbox] },
  };
}

export let fieldsWithAny = [
  "quality_grade",
  "reviewed",
  "verifiable",
  "place_id",
  "captive",
];

export const iNatObservationUrl = "https://www.inaturalist.org/observations";
export const iNatUserUrl = "https://www.inaturalist.org/people";
export const iNatTaxaUrl = "https://www.inaturalist.org/taxa";

export const iNatObservationsYears = [
  2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013,
  2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005, 2004, 2003, 2002, 2001, 2000,
  1999, 1998, 1997, 1996, 1995, 1994, 1993, 1992, 1991, 1990, 1989, 1988, 1987,
  1986, 1985, 1984, 1983, 1982, 1981, 1980, 1979, 1978, 1977, 1976, 1975, 1974,
  1973, 1972, 1971, 1970, 1969, 1968, 1967, 1966, 1965, 1964, 1963, 1962, 1961,
  1960, 1959, 1958, 1957, 1956, 1955, 1954, 1953, 1952, 1951, 1950, 1949, 1948,
  1947, 1946, 1945, 1944, 1943, 1942, 1941, 1940, 1939, 1938, 1937, 1936, 1935,
  1934, 1933, 1932, 1931, 1930, 1929, 1928, 1927, 1926, 1925,
];

// desc is default for /observations
export const orderValues = ["desc", "asc"];

// created_at default for /observations
export const observationsOrderByValuesAll = [
  "created_at",
  "geo_score",
  "id",
  "observed_on",
  "random",
  "species_guess",
  "updated_at",
  "votes",
];

//
export const observationsOrderByValues = [
  "id",
  "created_at",
  "observed_on",
  "votes",
];
