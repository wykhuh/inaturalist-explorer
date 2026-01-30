import type {
  LngLatType,
  NormalizediNatPlaceType,
  NormalizediNatTaxonType,
  PlaceTypes,
} from "../types/app";
import { defaultColorScheme, iNatOrange } from "../lib/map_colors_utils";
import { range } from "../lib/utils";

export const taxonRanks = [
  "kingdom",
  "phylum",
  "subphylum",
  "superclass",
  "class",
  "subclass",
  "infraclass",
  "subterclass",
  "superorder",
  "order",
  "suborder",
  "infraorder",
  "parvorder",
  "zoosection",
  "zoosubsection",
  "superfamily",
  "epifamily",
  "family",
  "subfamily",
  "supertribe",
  "tribe",
  "subtribe",
  "genus",
  "subgenus",
  "genushybrid",
  "subgenus",
  "section",
  "subsection",
  "complex",
  "species",
  "hybrid",
  "subspecies",
  "variety",
  "form",
  "infrahybrid",
];

export const speciesRanks = [
  "species",
  "hybrid",
  "subspecies",
  "variety",
  "form",
];

export const subspeciesRanks = ["hybrid", "subspecies", "variety", "form"];

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

// BUG: tests are not importing defaultColorScheme correctly, so need to use
// hexcolor
const color = defaultColorScheme ? defaultColorScheme[0] : "#4477aa";
export const lifeTaxon: NormalizediNatTaxonType = {
  name: "Life",
  default_photo:
    "https://inaturalist-open-data.s3.amazonaws.com/photos/347064198/square.jpeg",
  preferred_common_name: "life",
  matched_term: "Life",
  rank: "stateofmatter",
  id: 48460,
  color: color,
  title: "Life",
  subtitle: "Life",
};

export const allTaxaRecord: NormalizediNatTaxonType = {
  id: 0,
  color: iNatOrange,
  title: "All species",
  preferred_common_name: "All species",
};

export function bboxPlaceRecord(bbox: LngLatType[]): NormalizediNatPlaceType {
  return {
    id: 0,
    name: "Custom Boundary",
    display_name: "Custom Boundary",
    bounding_box: { type: "Polygon", coordinates: [bbox] },
  };
}

export const iNatObservationUrl = "https://www.inaturalist.org/observations";
export const iNatUserUrl = "https://www.inaturalist.org/people";
export const iNatTaxaUrl = "https://www.inaturalist.org/taxa";

export const iNatObservationsYears = [
  ...range(1860, new Date().getFullYear()).reverse(),
  1845,
  1838,
  1768,
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

export const iconicTaxaIdName = {
  3: "Aves",
  20978: "Amphibia",
  26036: "Reptilia",
  40151: "Mammalia",
  47178: "Actinopterygii",
  47115: "Mollusca",
  47119: "Arachnida",
  47158: "Insecta",
  47126: "Plantae",
  47170: "Fungi",
  47686: "Protozoa",
};

export const annotationsTerms = {
  1: "Life Stage",
  9: "Sex",
  12: "Flowers and Fruits",
  17: "Alive or Dead",
  22: "Evidence of Presence",
  33: "Established",
  36: "Leaves",
};

export const annotationsValues = {
  2: "Adult",
  3: "Teneral",
  4: "Pupa",
  5: "Nymph",
  6: "Larva",
  7: "Egg",
  8: "Juvenile",
  16: "Subimago",
  10: "Female",
  11: "Male",
  20: "Cannot Be Determined",
  13: "Flowers",
  14: "Fruits or Seeds",
  15: "Flower Buds",
  21: "No Flowers or Fruits",
  18: "Alive",
  19: "Dead",
  23: "Feather",
  24: "Organism",
  25: "Scat",
  26: "Track",
  27: "Bone",
  28: "Molt",
  29: "Gall",
  30: "Egg",
  31: "Hair",
  32: "Leafmine",
  35: "Construction",
  34: "Not Established",
  37: "Breaking Leaf Buds",
  38: "Green Leaves",
  39: "Colored Leaves",
  40: "No Live Leaves",
};

export const geoprivacyValues = [
  "obscured",
  "obscured_private",
  "open",
  "private",
];
export const obscurationValues = ["obscured", "private", "none"];
