import type {
  iNatSearchAPI,
  TaxaResult,
  iNatObservationsSpeciesCountAPI,
} from "../../types/inat_api.js";

export let redTaxaAutocompleteResults: TaxaResult[] = [
  {
    id: 846366,
    rank: "tribe",
    rank_level: 25,
    iconic_taxon_id: 40151,
    ancestor_ids: [
      48460, 1, 2, 355675, 40151, 848317, 848320, 848324, 152870, 424850, 42241,
      568847, 846366,
    ],
    is_active: true,
    name: "Reduncini",
    parent_id: 568847,
    ancestry:
      "48460/1/2/355675/40151/848317/848320/848324/152870/424850/42241/568847",
    extinct: false,
    default_photo: {
      id: 11484396,
      license_code: "cc-by-nc-nd",
      attribution: "(c) Zweer de Bruin, some rights reserved (CC BY-NC-ND)",
      url: "https://inat.com/photos/11484396/square.jpg",
      original_dimensions: {
        height: 1572,
        width: 2048,
      },
      flags: [],
      attribution_name: "Zweer de Bruin",
      square_url: "https://inat.com/photos/11484396/square.jpg",
      medium_url: "https://inat.com/photos/11484396/medium.jpg",
    },
    taxon_changes_count: 2,
    taxon_schemes_count: 0,
    observations_count: 15985,
    flag_counts: {
      resolved: 0,
      unresolved: 0,
    },
    current_synonymous_taxon_ids: null,
    atlas_id: null,
    complete_species_count: 9,
    wikipedia_url: "https://en.wikipedia.org/wiki/Reduncinae",
    complete_rank: "species",
    matched_term: "Reduncini",
    iconic_taxon_name: "Mammalia",
    preferred_common_name: "Reduncines",
  },
  {
    id: 861036,
    rank: "section",
    rank_level: 13,
    iconic_taxon_id: 47126,
    ancestor_ids: [
      48460, 47126, 211194, 47125, 47124, 47853, 47852, 47851, 861029, 861036,
    ],
    is_active: true,
    name: "Lobatae",
    parent_id: 861029,
    ancestry: "48460/47126/211194/47125/47124/47853/47852/47851/861029",
    extinct: false,
    default_photo: {
      id: 149586607,
      license_code: "cc-by-nc",
      attribution: "(c) Jim Dollar, some rights reserved (CC BY-NC)",
      url: "https://inat.com/photos/149586607/square.jpg",
      original_dimensions: {
        height: 1365,
        width: 2048,
      },
      flags: [],
      attribution_name: "Jim Dollar",
      square_url: "https://inat.com/photos/149586607/square.jpg",
      medium_url: "https://inat.com/photos/149586607/medium.jpg",
    },
    taxon_changes_count: 0,
    taxon_schemes_count: 0,
    observations_count: 427191,
    flag_counts: {
      resolved: 7,
      unresolved: 0,
    },
    current_synonymous_taxon_ids: null,
    atlas_id: null,
    complete_species_count: null,
    wikipedia_url: "https://en.wikipedia.org/wiki/Quercus_subg._Quercus",
    matched_term: "red oaks",
    iconic_taxon_name: "Plantae",
    preferred_common_name: "red oaks",
  },
  {
    id: 12727,
    rank: "species",
    rank_level: 10,
    iconic_taxon_id: 3,
    ancestor_ids: [48460, 1, 2, 355675, 3, 7251, 15977, 12705, 12727],
    is_active: true,
    name: "Turdus migratorius",
    parent_id: 12705,
    ancestry: "48460/1/2/355675/3/7251/15977/12705",
    extinct: false,
    default_photo: {
      id: 34859026,
      license_code: "cc-by-nc",
      attribution:
        "(c) John D Reynolds, some rights reserved (CC BY-NC), uploaded by John D Reynolds",
      url: "https://inat.com/photos/34859026/square.jpg",
      original_dimensions: {
        height: 1365,
        width: 2048,
      },
      flags: [],
      attribution_name: "John D Reynolds",
      square_url: "https://inat.com/photos/34859026/square.jpg",
      medium_url: "https://inat.com/photos/34859026/medium.jpg",
    },
    taxon_changes_count: 0,
    taxon_schemes_count: 9,
    observations_count: 377094,
    flag_counts: {
      resolved: 3,
      unresolved: 0,
    },
    current_synonymous_taxon_ids: null,
    atlas_id: null,
    complete_species_count: null,
    wikipedia_url: "http://en.wikipedia.org/wiki/American_robin",
    complete_rank: "subspecies",
    matched_term: "Red Robin",
    iconic_taxon_name: "Aves",
    preferred_common_name: "American Robin",
  },
  {
    id: 9083,
    rank: "species",
    rank_level: 10,
    iconic_taxon_id: 3,
    ancestor_ids: [48460, 1, 2, 355675, 3, 7251, 71305, 9080, 9083],
    is_active: true,
    name: "Cardinalis cardinalis",
    parent_id: 9080,
    ancestry: "48460/1/2/355675/3/7251/71305/9080",
    extinct: false,
    default_photo: {
      id: 189434971,
      license_code: "cc-by-nc",
      attribution:
        "(c) Laura Keene, some rights reserved (CC BY-NC), uploaded by Laura Keene",
      url: "https://inat.com/photos/189434971/square.jpg",
      original_dimensions: {
        height: 1429,
        width: 2048,
      },
      flags: [],
      attribution_name: "Laura Keene",
      square_url: "https://inat.com/photos/189434971/square.jpg",
      medium_url: "https://inat.com/photos/189434971/medium.jpg",
    },
    taxon_changes_count: 0,
    taxon_schemes_count: 10,
    observations_count: 306869,
    flag_counts: {
      resolved: 1,
      unresolved: 0,
    },
    current_synonymous_taxon_ids: null,
    atlas_id: 26016,
    complete_species_count: null,
    wikipedia_url: "http://en.wikipedia.org/wiki/Northern_cardinal",
    complete_rank: "subspecies",
    matched_term: "Red Cardinal",
    iconic_taxon_name: "Aves",
    preferred_common_name: "Northern Cardinal",
  },
  {
    id: 5212,
    rank: "species",
    rank_level: 10,
    iconic_taxon_id: 3,
    ancestor_ids: [48460, 1, 2, 355675, 3, 71261, 5067, 1542783, 5179, 5212],
    is_active: true,
    name: "Buteo jamaicensis",
    parent_id: 5179,
    ancestry: "48460/1/2/355675/3/71261/5067/1542783/5179",
    extinct: false,
    default_photo: {
      id: 101327658,
      license_code: "cc-by-nc",
      attribution:
        "(c) Craig K. Hunt, some rights reserved (CC BY-NC), uploaded by Craig K. Hunt",
      url: "https://inat.com/photos/101327658/square.jpg",
      original_dimensions: {
        height: 2048,
        width: 1281,
      },
      flags: [],
      attribution_name: "Craig K. Hunt",
      square_url: "https://inat.com/photos/101327658/square.jpg",
      medium_url: "https://inat.com/photos/101327658/medium.jpg",
    },
    taxon_changes_count: 2,
    taxon_schemes_count: 9,
    observations_count: 291542,
    flag_counts: {
      resolved: 7,
      unresolved: 0,
    },
    current_synonymous_taxon_ids: null,
    atlas_id: null,
    complete_species_count: null,
    wikipedia_url: "https://en.wikipedia.org/wiki/Red-tailed_hawk",
    complete_rank: "subspecies",
    matched_term: "Redtail",
    iconic_taxon_name: "Aves",
    preferred_common_name: "Red-tailed Hawk",
  },
  {
    id: 9740,
    rank: "genus",
    rank_level: 20,
    iconic_taxon_id: 3,
    ancestor_ids: [48460, 1, 2, 355675, 3, 7251, 11989, 9740],
    is_active: true,
    name: "Agelaius",
    parent_id: 11989,
    ancestry: "48460/1/2/355675/3/7251/11989",
    extinct: false,
    default_photo: {
      id: 28027,
      license_code: "cc-by-nc",
      attribution: "(c) Jamie Chavez, some rights reserved (CC BY-NC)",
      url: "https://inat.com/photos/28027/square.jpg",
      original_dimensions: {
        height: 1350,
        width: 1824,
      },
      flags: [],
      attribution_name: "Jamie Chavez",
      square_url: "https://inat.com/photos/28027/square.jpg",
      medium_url: "https://inat.com/photos/28027/medium.jpg",
    },
    taxon_changes_count: 0,
    taxon_schemes_count: 1,
    observations_count: 258198,
    flag_counts: {
      resolved: 0,
      unresolved: 0,
    },
    current_synonymous_taxon_ids: null,
    atlas_id: null,
    complete_species_count: 5,
    wikipedia_url: "http://en.wikipedia.org/wiki/Agelaius",
    complete_rank: "subspecies",
    matched_term: "Red-shouldered Blackbirds and Allies",
    iconic_taxon_name: "Aves",
    preferred_common_name: "Agelaius Blackbirds",
  },
  {
    id: 9744,
    rank: "species",
    rank_level: 10,
    iconic_taxon_id: 3,
    ancestor_ids: [48460, 1, 2, 355675, 3, 7251, 11989, 9740, 9744],
    is_active: true,
    name: "Agelaius phoeniceus",
    parent_id: 9740,
    ancestry: "48460/1/2/355675/3/7251/11989/9740",
    extinct: false,
    default_photo: {
      id: 368048127,
      license_code: null,
      attribution: "(c) sdrov, all rights reserved, uploaded by sdrov",
      url: "https://static.inaturalist.org/photos/368048127/square.jpg",
      original_dimensions: {
        height: 1365,
        width: 2048,
      },
      flags: [],
      attribution_name: "sdrov",
      square_url: "https://static.inaturalist.org/photos/368048127/square.jpg",
      medium_url: "https://static.inaturalist.org/photos/368048127/medium.jpg",
    },
    taxon_changes_count: 1,
    taxon_schemes_count: 9,
    observations_count: 253896,
    flag_counts: {
      resolved: 2,
      unresolved: 0,
    },
    current_synonymous_taxon_ids: null,
    atlas_id: 20815,
    complete_species_count: null,
    wikipedia_url: "http://en.wikipedia.org/wiki/Red-winged_blackbird",
    complete_rank: "subspecies",
    matched_term: "Redwing Blackbird",
    iconic_taxon_name: "Aves",
    preferred_common_name: "Red-winged Blackbird",
  },
  {
    id: 49133,
    rank: "species",
    rank_level: 10,
    iconic_taxon_id: 47158,
    ancestor_ids: [
      48460, 1, 47120, 372739, 47158, 184884, 47157, 47224, 47922, 202067,
      202066, 48507, 49133,
    ],
    is_active: true,
    name: "Vanessa atalanta",
    parent_id: 48507,
    ancestry:
      "48460/1/47120/372739/47158/184884/47157/47224/47922/202067/202066/48507",
    extinct: false,
    default_photo: {
      id: 53928483,
      license_code: "cc-by-sa",
      attribution:
        "(c) Gilles San Martin, some rights reserved (CC BY-SA), uploaded by Gilles San Martin",
      url: "https://inat.com/photos/53928483/square.jpg",
      original_dimensions: {
        height: 1529,
        width: 2048,
      },
      flags: [],
      attribution_name: "Gilles San Martin",
      square_url: "https://inat.com/photos/53928483/square.jpg",
      medium_url: "https://inat.com/photos/53928483/medium.jpg",
    },
    taxon_changes_count: 1,
    taxon_schemes_count: 4,
    observations_count: 234966,
    flag_counts: {
      resolved: 0,
      unresolved: 0,
    },
    current_synonymous_taxon_ids: null,
    atlas_id: 2194,
    complete_species_count: null,
    wikipedia_url: "http://en.wikipedia.org/wiki/Vanessa_atalanta",
    matched_term: "Red Admiral",
    iconic_taxon_name: "Insecta",
    preferred_common_name: "Red Admiral",
  },
  {
    id: 52983,
    rank: "superfamily",
    rank_level: 33,
    iconic_taxon_id: 47158,
    ancestor_ids: [
      48460, 1, 47120, 372739, 47158, 184884, 47744, 61267, 372868, 52983,
    ],
    is_active: true,
    name: "Pyrrhocoroidea",
    parent_id: 372868,
    ancestry: "48460/1/47120/372739/47158/184884/47744/61267/372868",
    extinct: false,
    default_photo: {
      id: 385623143,
      license_code: "cc-by-nc",
      attribution:
        "(c) James Bailey, some rights reserved (CC BY-NC), uploaded by James Bailey",
      url: "https://inat.com/photos/385623143/square.jpeg",
      original_dimensions: {
        height: 1530,
        width: 2048,
      },
      flags: [],
      attribution_name: "James Bailey",
      square_url: "https://inat.com/photos/385623143/square.jpeg",
      medium_url: "https://inat.com/photos/385623143/medium.jpeg",
    },
    taxon_changes_count: 0,
    taxon_schemes_count: 1,
    observations_count: 193087,
    flag_counts: {
      resolved: 0,
      unresolved: 0,
    },
    current_synonymous_taxon_ids: null,
    atlas_id: null,
    complete_species_count: null,
    wikipedia_url: "http://en.wikipedia.org/wiki/Pyrrhocoroidea",
    matched_term: "Red and Bordered Plant Bugs",
    iconic_taxon_name: "Insecta",
    preferred_common_name: "Red and Bordered Plant Bugs",
  },
  {
    id: 57774,
    rank: "phylum",
    rank_level: 60,
    iconic_taxon_id: 47126,
    ancestor_ids: [48460, 47126, 57774],
    is_active: true,
    name: "Rhodophyta",
    parent_id: 47126,
    ancestry: "48460/47126",
    extinct: false,
    default_photo: {
      id: 28834665,
      license_code: "cc-by-nc",
      attribution:
        "(c) ðejay (Orkney), some rights reserved (CC BY-NC), uploaded by ðejay (Orkney)",
      url: "https://inat.com/photos/28834665/square.jpeg",
      original_dimensions: {
        height: 1639,
        width: 2048,
      },
      flags: [],
      attribution_name: "ðejay (Orkney)",
      square_url: "https://inat.com/photos/28834665/square.jpeg",
      medium_url: "https://inat.com/photos/28834665/medium.jpeg",
    },
    taxon_changes_count: 2,
    taxon_schemes_count: 2,
    observations_count: 191967,
    flag_counts: {
      resolved: 5,
      unresolved: 0,
    },
    current_synonymous_taxon_ids: null,
    atlas_id: null,
    complete_species_count: null,
    wikipedia_url: "http://en.wikipedia.org/wiki/Red_algae",
    matched_term: "red algae",
    iconic_taxon_name: "Plantae",
    preferred_common_name: "red algae",
  },
];

export let redTaxaAutocomplete = {
  total_results: 50,
  page: 1,
  per_page: 25,
  results: redTaxaAutocompleteResults,
};

export let canisTaxaAutocompleteResults: TaxaResult[] = [
  {
    id: 42044,
    rank: "genus",
    rank_level: 20,
    iconic_taxon_id: 40151,
    ancestor_ids: [
      48460, 1, 2, 355675, 40151, 848317, 848320, 848324, 41573, 42043, 42044,
    ],
    is_active: true,
    name: "Canis",
    parent_id: 42043,
    ancestry: "48460/1/2/355675/40151/848317/848320/848324/41573/42043",
    extinct: false,
    default_photo: {
      id: 13367754,
      license_code: "cc-by-nd",
      attribution: "(c) Giuseppe Calsamiglia, some rights reserved (CC BY-ND)",
      url: "https://inat.com/photos/13367754/square.jpg",
      original_dimensions: {
        height: 800,
        width: 1200,
      },
      flags: [],
      attribution_name: "Giuseppe Calsamiglia",
      square_url: "https://inat.com/photos/13367754/square.jpg",
      medium_url: "https://inat.com/photos/13367754/medium.jpg",
    },
    taxon_changes_count: 1,
    taxon_schemes_count: 2,
    observations_count: 286239,
    flag_counts: {
      resolved: 6,
      unresolved: 0,
    },
    current_synonymous_taxon_ids: null,
    atlas_id: null,
    complete_species_count: 8,
    wikipedia_url: "https://en.wikipedia.org/wiki/Canis",
    complete_rank: "species",
    matched_term: "Canis",
    iconic_taxon_name: "Mammalia",
    preferred_common_name: "Wolves and Dogs",
  },
  {
    id: 47144,
    rank: "species",
    rank_level: 10,
    iconic_taxon_id: 40151,
    ancestor_ids: [
      48460, 1, 2, 355675, 40151, 848317, 848320, 848324, 41573, 42043, 42044,
      47144,
    ],
    is_active: true,
    name: "Canis familiaris",
    parent_id: 42044,
    ancestry: "48460/1/2/355675/40151/848317/848320/848324/41573/42043/42044",
    extinct: false,
    default_photo: {
      id: 117465258,
      license_code: "cc-by-nc",
      attribution:
        "(c) Марина Горбунова-Ëлкина, some rights reserved (CC BY-NC), uploaded by Марина Горбунова-Ëлкина",
      url: "https://inat.com/photos/117465258/square.jpg",
      original_dimensions: {
        height: 1367,
        width: 2048,
      },
      flags: [],
      attribution_name: "Марина Горбунова-Ëлкина",
      square_url: "https://inat.com/photos/117465258/square.jpg",
      medium_url: "https://inat.com/photos/117465258/medium.jpg",
    },
    taxon_changes_count: 4,
    taxon_schemes_count: 3,
    observations_count: 126046,
    flag_counts: {
      resolved: 9,
      unresolved: 1,
    },
    current_synonymous_taxon_ids: null,
    atlas_id: 21714,
    complete_species_count: null,
    wikipedia_url: "http://en.wikipedia.org/wiki/Dog",
    matched_term: "Canis",
    iconic_taxon_name: "Mammalia",
    preferred_common_name: "Domestic Dog",
  },
  {
    id: 42051,
    rank: "species",
    rank_level: 10,
    iconic_taxon_id: 40151,
    ancestor_ids: [
      48460, 1, 2, 355675, 40151, 848317, 848320, 848324, 41573, 42043, 42044,
      42051,
    ],
    is_active: true,
    name: "Canis latrans",
    parent_id: 42044,
    ancestry: "48460/1/2/355675/40151/848317/848320/848324/41573/42043/42044",
    extinct: false,
    default_photo: {
      id: 10963085,
      license_code: null,
      attribution:
        "(c) Jorge Velez, all rights reserved, uploaded by Jorge Velez",
      url: "https://static.inaturalist.org/photos/10963085/square.jpg",
      original_dimensions: {
        height: 1366,
        width: 2048,
      },
      flags: [],
      attribution_name: "Jorge Velez",
      square_url: "https://static.inaturalist.org/photos/10963085/square.jpg",
      medium_url: "https://static.inaturalist.org/photos/10963085/medium.jpg",
    },
    taxon_changes_count: 2,
    taxon_schemes_count: 6,
    observations_count: 127466,
    flag_counts: {
      resolved: 5,
      unresolved: 3,
    },
    current_synonymous_taxon_ids: null,
    atlas_id: 8,
    complete_species_count: null,
    wikipedia_url: "http://en.wikipedia.org/wiki/Coyote",
    matched_term: "Canis latrans",
    iconic_taxon_name: "Mammalia",
    preferred_common_name: "Coyote",
  },
  {
    id: 42069,
    rank: "species",
    rank_level: 10,
    iconic_taxon_id: 40151,
    ancestor_ids: [
      48460, 1, 2, 355675, 40151, 848317, 848320, 848324, 41573, 42043, 42054,
      42069,
    ],
    is_active: true,
    name: "Vulpes vulpes",
    parent_id: 42054,
    ancestry: "48460/1/2/355675/40151/848317/848320/848324/41573/42043/42054",
    extinct: false,
    default_photo: {
      id: 265916780,
      license_code: null,
      attribution:
        "(c) Pierre Noel, all rights reserved, uploaded by Pierre Noel",
      url: "https://static.inaturalist.org/photos/265916780/square.jpg",
      original_dimensions: {
        height: 1638,
        width: 2048,
      },
      flags: [],
      attribution_name: "Pierre Noel",
      square_url: "https://static.inaturalist.org/photos/265916780/square.jpg",
      medium_url: "https://static.inaturalist.org/photos/265916780/medium.jpg",
    },
    taxon_changes_count: 0,
    taxon_schemes_count: 5,
    observations_count: 120805,
    flag_counts: {
      resolved: 7,
      unresolved: 0,
    },
    current_synonymous_taxon_ids: null,
    atlas_id: 20,
    complete_species_count: null,
    wikipedia_url: "http://en.wikipedia.org/wiki/Red_fox",
    matched_term: "Canis vulpes",
    iconic_taxon_name: "Mammalia",
    preferred_common_name: "Red Fox",
  },
  {
    id: 42048,
    rank: "species",
    rank_level: 10,
    iconic_taxon_id: 40151,
    ancestor_ids: [
      48460, 1, 2, 355675, 40151, 848317, 848320, 848324, 41573, 42043, 42044,
      42048,
    ],
    is_active: true,
    name: "Canis lupus",
    parent_id: 42044,
    ancestry: "48460/1/2/355675/40151/848317/848320/848324/41573/42043/42044",
    extinct: false,
    default_photo: {
      id: 43410580,
      license_code: "cc-by-nc",
      attribution:
        "(c) Brian Starzomski, some rights reserved (CC BY-NC), uploaded by Brian Starzomski",
      url: "https://inat.com/photos/43410580/square.jpg",
      original_dimensions: {
        height: 1536,
        width: 2048,
      },
      flags: [],
      attribution_name: "Brian Starzomski",
      square_url: "https://inat.com/photos/43410580/square.jpg",
      medium_url: "https://inat.com/photos/43410580/medium.jpg",
    },
    taxon_changes_count: 1,
    taxon_schemes_count: 6,
    observations_count: 17557,
    flag_counts: {
      resolved: 5,
      unresolved: 0,
    },
    current_synonymous_taxon_ids: null,
    atlas_id: 73,
    complete_species_count: null,
    wikipedia_url: "http://en.wikipedia.org/wiki/Gray_wolf",
    matched_term: "Canis lupus",
    iconic_taxon_name: "Mammalia",
    preferred_common_name: "Gray Wolf",
  },
  {
    id: 41886,
    rank: "species",
    rank_level: 10,
    iconic_taxon_id: 40151,
    ancestor_ids: [
      48460, 1, 2, 355675, 40151, 848317, 848320, 848324, 41573, 41884, 846226,
      41885, 41886,
    ],
    is_active: true,
    name: "Crocuta crocuta",
    parent_id: 41885,
    ancestry:
      "48460/1/2/355675/40151/848317/848320/848324/41573/41884/846226/41885",
    extinct: false,
    default_photo: {
      id: 15526597,
      license_code: null,
      attribution:
        "(c) mary-hunter, all rights reserved, uploaded by mary-hunter",
      url: "https://static.inaturalist.org/photos/15526597/square.jpg",
      original_dimensions: {
        height: 566,
        width: 800,
      },
      flags: [],
      attribution_name: "mary-hunter",
      square_url: "https://static.inaturalist.org/photos/15526597/square.jpg",
      medium_url: "https://static.inaturalist.org/photos/15526597/medium.jpg",
    },
    taxon_changes_count: 0,
    taxon_schemes_count: 4,
    observations_count: 7868,
    flag_counts: {
      resolved: 0,
      unresolved: 0,
    },
    current_synonymous_taxon_ids: null,
    atlas_id: 3278,
    complete_species_count: null,
    wikipedia_url: "http://en.wikipedia.org/wiki/Spotted_hyena",
    matched_term: "Canis crocuta",
    iconic_taxon_name: "Mammalia",
    preferred_common_name: "Spotted Hyena",
  },
  {
    id: 1210966,
    rank: "species",
    rank_level: 10,
    iconic_taxon_id: 40151,
    ancestor_ids: [
      48460, 1, 2, 355675, 40151, 848317, 848320, 848324, 41573, 42043, 1210963,
      1210966,
    ],
    is_active: true,
    name: "Lupulella mesomelas",
    parent_id: 1210963,
    ancestry: "48460/1/2/355675/40151/848317/848320/848324/41573/42043/1210963",
    extinct: false,
    default_photo: {
      id: 477185480,
      license_code: "cc-by-sa",
      attribution: "(c) Bernard DUPONT, some rights reserved (CC BY-SA)",
      url: "https://inat.com/photos/477185480/square.jpg",
      original_dimensions: {
        height: 1365,
        width: 2048,
      },
      flags: [],
      attribution_name: "Bernard DUPONT",
      square_url: "https://inat.com/photos/477185480/square.jpg",
      medium_url: "https://inat.com/photos/477185480/medium.jpg",
    },
    taxon_changes_count: 1,
    taxon_schemes_count: 0,
    observations_count: 6056,
    flag_counts: {
      resolved: 1,
      unresolved: 0,
    },
    current_synonymous_taxon_ids: null,
    atlas_id: 30905,
    complete_species_count: null,
    wikipedia_url: "https://en.wikipedia.org/wiki/Black-backed_jackal",
    matched_term: "Canis mesomelas",
    iconic_taxon_name: "Mammalia",
    preferred_common_name: "Black-backed Jackal",
  },
  {
    id: 851014,
    rank: "species",
    rank_level: 10,
    iconic_taxon_id: 40151,
    ancestor_ids: [
      48460, 1, 2, 355675, 40151, 848317, 848320, 848324, 41573, 42043, 42044,
      851014,
    ],
    is_active: true,
    name: "Canis aureus",
    parent_id: 42044,
    ancestry: "48460/1/2/355675/40151/848317/848320/848324/41573/42043/42044",
    extinct: false,
    default_photo: {
      id: 12400254,
      license_code: "cc-by-nc-sa",
      attribution:
        "(c) Balaji Venkatesh Sivaramakrishnan, some rights reserved (CC BY-NC-SA)",
      url: "https://inat.com/photos/12400254/square.jpg",
      original_dimensions: {
        height: 1192,
        width: 1800,
      },
      flags: [],
      attribution_name: "Balaji Venkatesh Sivaramakrishnan",
      square_url: "https://inat.com/photos/12400254/square.jpg",
      medium_url: "https://inat.com/photos/12400254/medium.jpg",
    },
    taxon_changes_count: 1,
    taxon_schemes_count: 1,
    observations_count: 4967,
    flag_counts: {
      resolved: 2,
      unresolved: 0,
    },
    current_synonymous_taxon_ids: null,
    atlas_id: 19259,
    complete_species_count: null,
    wikipedia_url: "http://en.wikipedia.org/wiki/Golden_jackal",
    matched_term: "Canis aureus",
    iconic_taxon_name: "Mammalia",
    preferred_common_name: "Golden Jackal",
  },
  {
    id: 42087,
    rank: "species",
    rank_level: 10,
    iconic_taxon_id: 40151,
    ancestor_ids: [
      48460, 1, 2, 355675, 40151, 848317, 848320, 848324, 41573, 42043, 42086,
      42087,
    ],
    is_active: true,
    name: "Cerdocyon thous",
    parent_id: 42086,
    ancestry: "48460/1/2/355675/40151/848317/848320/848324/41573/42043/42086",
    extinct: false,
    default_photo: {
      id: 34537325,
      license_code: "cc0",
      attribution: "no rights reserved, uploaded by Diego Carús",
      url: "https://inat.com/photos/34537325/square.jpeg",
      original_dimensions: {
        height: 1536,
        width: 2048,
      },
      flags: [],
      attribution_name: "Diego Carús",
      square_url: "https://inat.com/photos/34537325/square.jpeg",
      medium_url: "https://inat.com/photos/34537325/medium.jpeg",
    },
    taxon_changes_count: 0,
    taxon_schemes_count: 4,
    observations_count: 4011,
    flag_counts: {
      resolved: 3,
      unresolved: 0,
    },
    current_synonymous_taxon_ids: null,
    atlas_id: 13118,
    complete_species_count: null,
    wikipedia_url: "http://en.wikipedia.org/wiki/Crab-eating_fox",
    matched_term: "Canis thous",
    iconic_taxon_name: "Mammalia",
    preferred_common_name: "Crab-eating Fox",
  },
  {
    id: 1210973,
    rank: "subspecies",
    rank_level: 5,
    iconic_taxon_id: 40151,
    ancestor_ids: [
      48460, 1, 2, 355675, 40151, 848317, 848320, 848324, 41573, 42043, 1210963,
      1210966, 1210973,
    ],
    is_active: true,
    name: "Lupulella mesomelas mesomelas",
    parent_id: 1210966,
    ancestry:
      "48460/1/2/355675/40151/848317/848320/848324/41573/42043/1210963/1210966",
    extinct: false,
    default_photo: {
      id: 264050159,
      license_code: null,
      attribution:
        "(c) Mark Sikking, all rights reserved, uploaded by Mark Sikking",
      url: "https://static.inaturalist.org/photos/264050159/square.jpg",
      original_dimensions: {
        height: 1365,
        width: 2048,
      },
      flags: [],
      attribution_name: "Mark Sikking",
      square_url: "https://static.inaturalist.org/photos/264050159/square.jpg",
      medium_url: "https://static.inaturalist.org/photos/264050159/medium.jpg",
    },
    taxon_changes_count: 1,
    taxon_schemes_count: 0,
    observations_count: 3492,
    flag_counts: {
      resolved: 0,
      unresolved: 0,
    },
    current_synonymous_taxon_ids: null,
    atlas_id: null,
    complete_species_count: null,
    wikipedia_url: null,
    matched_term: "Canis mesomelas mesomelas",
    iconic_taxon_name: "Mammalia",
    preferred_common_name: "Southern Black-backed Jackal",
  },
];

export let canisTaxaAutocomplete = {
  total_results: 50,
  page: 1,
  per_page: 25,
  results: canisTaxaAutocompleteResults,
};

export let coastOakAutocompleteResults = [
  {
    id: 78808,
    rank: "species",
    rank_level: 10,
    iconic_taxon_id: 47126,
    ancestor_ids: [
      48460, 47126, 211194, 47125, 47124, 47853, 47852, 47851, 861029, 861036,
      1542658, 78808,
    ],
    is_active: true,
    name: "Quercus parvula",
    parent_id: 1542658,
    ancestry:
      "48460/47126/211194/47125/47124/47853/47852/47851/861029/861036/1542658",
    extinct: false,
    default_photo: {
      id: 1149511,
      license_code: "cc-by-nc",
      attribution: "(c) dshell, some rights reserved (CC BY-NC)",
      url: "https://inaturalist-open-data.s3.amazonaws.com/photos/1149511/square.JPG",
      original_dimensions: {
        height: 1536,
        width: 2048,
      },
      flags: [],
      attribution_name: "dshell",
      square_url:
        "https://inaturalist-open-data.s3.amazonaws.com/photos/1149511/square.JPG",
      medium_url:
        "https://inaturalist-open-data.s3.amazonaws.com/photos/1149511/medium.JPG",
    },
    taxon_changes_count: 0,
    taxon_schemes_count: 3,
    observations_count: 1138,
    flag_counts: {
      resolved: 1,
      unresolved: 0,
    },
    current_synonymous_taxon_ids: null,
    atlas_id: null,
    complete_species_count: null,
    wikipedia_url: "http://en.wikipedia.org/wiki/Quercus_parvula",
    matched_term: "coast oak",
    iconic_taxon_name: "Plantae",
    preferred_common_name: "coast oak",
    conservation_status: {
      id: 212499,
      place_id: null,
      source_id: null,
      user_id: null,
      authority: "IUCN Red List",
      status: "nt",
      status_name: "near threatened",
      geoprivacy: "open",
      iucn: 20,
    },
  },
  {
    id: 47850,
    rank: "species",
    rank_level: 10,
    iconic_taxon_id: 47126,
    ancestor_ids: [
      48460, 47126, 211194, 47125, 47124, 47853, 47852, 47851, 861029, 861036,
      1542658, 47850,
    ],
    is_active: true,
    name: "Quercus agrifolia",
    parent_id: 1542658,
    ancestry:
      "48460/47126/211194/47125/47124/47853/47852/47851/861029/861036/1542658",
    extinct: false,
    default_photo: {
      id: 18734105,
      license_code: "cc-by-sa",
      attribution: "(c) Franco Folini, some rights reserved (CC BY-SA)",
      url: "https://inaturalist-open-data.s3.amazonaws.com/photos/18734105/square.jpg",
      original_dimensions: {
        height: 1356,
        width: 2048,
      },
      flags: [],
      attribution_name: "Franco Folini",
      square_url:
        "https://inaturalist-open-data.s3.amazonaws.com/photos/18734105/square.jpg",
      medium_url:
        "https://inaturalist-open-data.s3.amazonaws.com/photos/18734105/medium.jpg",
    },
    taxon_changes_count: 0,
    taxon_schemes_count: 5,
    observations_count: 54847,
    flag_counts: {
      resolved: 1,
      unresolved: 0,
    },
    current_synonymous_taxon_ids: null,
    atlas_id: 141,
    complete_species_count: null,
    wikipedia_url: "http://en.wikipedia.org/wiki/Quercus_agrifolia",
    matched_term: "coast live oak",
    iconic_taxon_name: "Plantae",
    preferred_common_name: "coast live oak",
  },
  {
    id: 62888,
    rank: "species",
    rank_level: 10,
    iconic_taxon_id: 47126,
    ancestor_ids: [
      48460, 47126, 211194, 47125, 47124, 47853, 62890, 62891, 62888,
    ],
    is_active: true,
    name: "Casuarina equisetifolia",
    parent_id: 62891,
    ancestry: "48460/47126/211194/47125/47124/47853/62890/62891",
    extinct: false,
    default_photo: {
      id: 16450498,
      license_code: "cc-by-nc",
      attribution:
        "(c) Pedro Alanis, some rights reserved (CC BY-NC), uploaded by Pedro Alanis",
      url: "https://inaturalist-open-data.s3.amazonaws.com/photos/16450498/square.jpeg",
      original_dimensions: {
        height: 1536,
        width: 2048,
      },
      flags: [],
      attribution_name: "Pedro Alanis",
      square_url:
        "https://inaturalist-open-data.s3.amazonaws.com/photos/16450498/square.jpeg",
      medium_url:
        "https://inaturalist-open-data.s3.amazonaws.com/photos/16450498/medium.jpeg",
    },
    taxon_changes_count: 0,
    taxon_schemes_count: 3,
    observations_count: 18163,
    flag_counts: {
      resolved: 0,
      unresolved: 0,
    },
    current_synonymous_taxon_ids: null,
    atlas_id: null,
    complete_species_count: null,
    wikipedia_url: "http://en.wikipedia.org/wiki/Casuarina_equisetifolia",
    matched_term: "coast she-oak",
    iconic_taxon_name: "Plantae",
    preferred_common_name: "Beach Sheoak",
  },
  {
    id: 567699,
    rank: "species",
    rank_level: 10,
    iconic_taxon_id: 47126,
    ancestor_ids: [
      48460, 47126, 211194, 47125, 47124, 47605, 47604, 201654, 632780, 184565,
      567699,
    ],
    is_active: true,
    name: "Brachylaena discolor",
    parent_id: 184565,
    ancestry: "48460/47126/211194/47125/47124/47605/47604/201654/632780/184565",
    extinct: false,
    default_photo: {
      id: 19070182,
      license_code: "cc-by-nc",
      attribution:
        "(c) Ricky Taylor, some rights reserved (CC BY-NC), uploaded by Ricky Taylor",
      url: "https://inaturalist-open-data.s3.amazonaws.com/photos/19070182/square.jpg",
      original_dimensions: {
        height: 1705,
        width: 2048,
      },
      flags: [],
      attribution_name: "Ricky Taylor",
      square_url:
        "https://inaturalist-open-data.s3.amazonaws.com/photos/19070182/square.jpg",
      medium_url:
        "https://inaturalist-open-data.s3.amazonaws.com/photos/19070182/medium.jpg",
    },
    taxon_changes_count: 0,
    taxon_schemes_count: 1,
    observations_count: 2773,
    flag_counts: {
      resolved: 0,
      unresolved: 1,
    },
    current_synonymous_taxon_ids: null,
    atlas_id: null,
    complete_species_count: null,
    wikipedia_url: "http://en.wikipedia.org/wiki/Brachylaena_discolor",
    matched_term: "Coast Silver-oak",
    iconic_taxon_name: "Plantae",
    preferred_common_name: "Coast Silver-oak",
  },
  {
    id: 64137,
    rank: "species",
    rank_level: 10,
    iconic_taxon_id: 47126,
    ancestor_ids: [
      48460, 47126, 211194, 47125, 47124, 47853, 47852, 47851, 861029, 861033,
      1553163, 1553166, 64137,
    ],
    is_active: true,
    name: "Quercus dumosa",
    parent_id: 1553166,
    ancestry:
      "48460/47126/211194/47125/47124/47853/47852/47851/861029/861033/1553163/1553166",
    extinct: false,
    default_photo: {
      id: 5095235,
      license_code: "cc-by-nc",
      attribution:
        "(c) James Bailey, some rights reserved (CC BY-NC), uploaded by James Bailey",
      url: "https://inaturalist-open-data.s3.amazonaws.com/photos/5095235/square.jpeg",
      original_dimensions: {
        height: 1365,
        width: 2048,
      },
      flags: [],
      attribution_name: "James Bailey",
      square_url:
        "https://inaturalist-open-data.s3.amazonaws.com/photos/5095235/square.jpeg",
      medium_url:
        "https://inaturalist-open-data.s3.amazonaws.com/photos/5095235/medium.jpeg",
    },
    taxon_changes_count: 1,
    taxon_schemes_count: 6,
    observations_count: 2275,
    flag_counts: {
      resolved: 1,
      unresolved: 0,
    },
    current_synonymous_taxon_ids: null,
    atlas_id: null,
    complete_species_count: null,
    wikipedia_url: "http://en.wikipedia.org/wiki/Quercus_dumosa",
    matched_term: "coastal sage scrub oak",
    iconic_taxon_name: "Plantae",
    preferred_common_name: "Nuttall's scrub oak",
    conservation_status: {
      id: 87032,
      place_id: null,
      source_id: 9164,
      user_id: null,
      authority: "IUCN Red List",
      status: "en",
      status_name: "endangered",
      geoprivacy: "open",
      iucn: 40,
    },
  },
  {
    id: 81309,
    rank: "variety",
    rank_level: 5,
    iconic_taxon_id: 47126,
    ancestor_ids: [
      48460, 47126, 211194, 47125, 47124, 47853, 47852, 47851, 861029, 861036,
      1542658, 47850, 81309,
    ],
    is_active: true,
    name: "Quercus agrifolia oxyadenia",
    parent_id: 47850,
    ancestry:
      "48460/47126/211194/47125/47124/47853/47852/47851/861029/861036/1542658/47850",
    extinct: false,
    default_photo: {
      id: 1451089,
      license_code: null,
      attribution:
        "(c) Jay Keller, all rights reserved, uploaded by Jay Keller",
      url: "https://static.inaturalist.org/photos/1451089/square.jpg",
      original_dimensions: {
        height: 1520,
        width: 2005,
      },
      flags: [],
      attribution_name: "Jay Keller",
      square_url: "https://static.inaturalist.org/photos/1451089/square.jpg",
      medium_url: "https://static.inaturalist.org/photos/1451089/medium.jpg",
    },
    taxon_changes_count: 0,
    taxon_schemes_count: 3,
    observations_count: 356,
    flag_counts: {
      resolved: 0,
      unresolved: 0,
    },
    current_synonymous_taxon_ids: null,
    atlas_id: null,
    complete_species_count: null,
    wikipedia_url: null,
    matched_term: "Southern Coast Live Oak",
    iconic_taxon_name: "Plantae",
    preferred_common_name: "Southern Coast Live Oak",
  },
  {
    id: 1473163,
    rank: "hybrid",
    rank_level: 10,
    iconic_taxon_id: 47126,
    ancestor_ids: [
      48460, 47126, 211194, 47125, 47124, 47853, 47852, 47851, 861029, 861036,
      1542658, 1473163,
    ],
    is_active: true,
    name: "Quercus agrifolia × wislizeni",
    parent_id: 1542658,
    ancestry:
      "48460/47126/211194/47125/47124/47853/47852/47851/861029/861036/1542658",
    extinct: false,
    default_photo: {
      id: 215365554,
      license_code: "cc-by-nc",
      attribution: "(c) rebeccabrubaker, some rights reserved (CC BY-NC)",
      url: "https://inaturalist-open-data.s3.amazonaws.com/photos/215365554/square.jpg",
      original_dimensions: {
        height: 2048,
        width: 1536,
      },
      flags: [],
      attribution_name: "rebeccabrubaker",
      square_url:
        "https://inaturalist-open-data.s3.amazonaws.com/photos/215365554/square.jpg",
      medium_url:
        "https://inaturalist-open-data.s3.amazonaws.com/photos/215365554/medium.jpg",
    },
    taxon_changes_count: 0,
    taxon_schemes_count: 0,
    observations_count: 160,
    flag_counts: {
      resolved: 0,
      unresolved: 0,
    },
    current_synonymous_taxon_ids: null,
    atlas_id: null,
    complete_species_count: null,
    wikipedia_url: null,
    matched_term: "Coast Live × Interior Live Oak",
    iconic_taxon_name: "Plantae",
    preferred_common_name: "Coast Live × Interior Live Oak",
  },
  {
    id: 37011,
    rank: "species",
    rank_level: 10,
    iconic_taxon_id: 26036,
    ancestor_ids: [
      48460, 1, 2, 355675, 26036, 26172, 85552, 1563904, 36982, 787703, 37010,
      37011,
    ],
    is_active: true,
    name: "Cyclodomorphus michaeli",
    parent_id: 37010,
    ancestry: "48460/1/2/355675/26036/26172/85552/1563904/36982/787703/37010",
    extinct: false,
    default_photo: {
      id: 396015294,
      license_code: null,
      attribution:
        "(c) Tom Frisby, all rights reserved, uploaded by Tom Frisby",
      url: "https://static.inaturalist.org/photos/396015294/square.jpg",
      original_dimensions: {
        height: 1365,
        width: 2048,
      },
      flags: [],
      attribution_name: "Tom Frisby",
      square_url: "https://static.inaturalist.org/photos/396015294/square.jpg",
      medium_url: "https://static.inaturalist.org/photos/396015294/medium.jpg",
    },
    taxon_changes_count: 0,
    taxon_schemes_count: 2,
    observations_count: 99,
    flag_counts: {
      resolved: 1,
      unresolved: 0,
    },
    current_synonymous_taxon_ids: null,
    atlas_id: null,
    complete_species_count: null,
    wikipedia_url:
      "https://en.wikipedia.org/wiki/Coastal_she-oak_slender_bluetongue",
    complete_rank: "subspecies",
    matched_term: "Coastal She-oak Slender Bluetongue",
    iconic_taxon_name: "Reptilia",
    preferred_common_name: "Mainland Sheoak Skink",
  },
  {
    id: 170977,
    rank: "hybrid",
    rank_level: 10,
    iconic_taxon_id: 47126,
    ancestor_ids: [
      48460, 47126, 211194, 47125, 47124, 47853, 47852, 47851, 861029, 861036,
      1549940, 170977,
    ],
    is_active: true,
    name: "Quercus × atlantica",
    parent_id: 1549940,
    ancestry:
      "48460/47126/211194/47125/47124/47853/47852/47851/861029/861036/1549940",
    extinct: false,
    default_photo: {
      id: 51576437,
      license_code: null,
      attribution:
        "(c) Jeff Stauffer, all rights reserved, uploaded by Jeff Stauffer",
      url: "https://static.inaturalist.org/photos/51576437/square.jpg",
      original_dimensions: {
        height: 1536,
        width: 2048,
      },
      flags: [],
      attribution_name: "Jeff Stauffer",
      square_url: "https://static.inaturalist.org/photos/51576437/square.jpg",
      medium_url: "https://static.inaturalist.org/photos/51576437/medium.jpg",
    },
    taxon_changes_count: 0,
    taxon_schemes_count: 1,
    observations_count: 4,
    flag_counts: {
      resolved: 0,
      unresolved: 0,
    },
    current_synonymous_taxon_ids: null,
    atlas_id: null,
    complete_species_count: null,
    wikipedia_url: null,
    matched_term: "Atlantic coast oak",
    iconic_taxon_name: "Plantae",
    preferred_common_name: "Atlantic coast oak",
  },
];

export let redOaksSpeciesCount: iNatObservationsSpeciesCountAPI = {
  total_results: 175,
  page: 1,
  per_page: 200,
  results: [
    {
      count: 97894,
      taxon: {
        id: 49005,
      },
    },
    {
      count: 54185,
      taxon: {
        id: 47850,
      },
    },
    {
      count: 26473,
      taxon: {
        id: 49006,
      },
    },
    {
      count: 25749,
      taxon: {
        id: 53640,
      },
    },
    {
      count: 25210,
      taxon: {
        id: 54785,
      },
    },
    {
      count: 25196,
      taxon: {
        id: 119983,
      },
    },
    {
      count: 15000,
      taxon: {
        id: 49919,
      },
    },
    {
      count: 13918,
      taxon: {
        id: 61324,
      },
    },
    {
      count: 13738,
      taxon: {
        id: 82329,
      },
    },
    {
      count: 12799,
      taxon: {
        id: 54786,
      },
    },
    {
      count: 9054,
      taxon: {
        id: 54784,
      },
    },
    {
      count: 8518,
      taxon: {
        id: 51089,
      },
    },
    {
      count: 7641,
      taxon: {
        id: 117428,
      },
    },
    {
      count: 6468,
      taxon: {
        id: 130737,
      },
    },
    {
      count: 5765,
      taxon: {
        id: 167640,
      },
    },
    {
      count: 5671,
      taxon: {
        id: 69845,
      },
    },
    {
      count: 5191,
      taxon: {
        id: 128752,
      },
    },
    {
      count: 3954,
      taxon: {
        id: 167660,
      },
    },
    {
      count: 3841,
      taxon: {
        id: 144029,
      },
    },
    {
      count: 3485,
      taxon: {
        id: 167646,
      },
    },
    {
      count: 3291,
      taxon: {
        id: 167652,
      },
    },
    {
      count: 3196,
      taxon: {
        id: 121690,
      },
    },
    {
      count: 2253,
      taxon: {
        id: 167654,
      },
    },
    {
      count: 1915,
      taxon: {
        id: 125847,
      },
    },
    {
      count: 1525,
      taxon: {
        id: 133176,
      },
    },
    {
      count: 1117,
      taxon: {
        id: 78808,
      },
    },
    {
      count: 924,
      taxon: {
        id: 167663,
      },
    },
    {
      count: 905,
      taxon: {
        id: 275462,
      },
    },
    {
      count: 811,
      taxon: {
        id: 171031,
      },
    },
    {
      count: 761,
      taxon: {
        id: 282380,
      },
    },
    {
      count: 628,
      taxon: {
        id: 167650,
      },
    },
    {
      count: 490,
      taxon: {
        id: 167670,
      },
    },
    {
      count: 438,
      taxon: {
        id: 282406,
      },
    },
    {
      count: 386,
      taxon: {
        id: 275460,
      },
    },
    {
      count: 379,
      taxon: {
        id: 282411,
      },
    },
    {
      count: 322,
      taxon: {
        id: 132052,
      },
    },
    {
      count: 295,
      taxon: {
        id: 167648,
      },
    },
    {
      count: 290,
      taxon: {
        id: 209422,
      },
    },
    {
      count: 267,
      taxon: {
        id: 209275,
      },
    },
    {
      count: 267,
      taxon: {
        id: 1558918,
      },
    },
    {
      count: 253,
      taxon: {
        id: 212109,
      },
    },
    {
      count: 215,
      taxon: {
        id: 567260,
      },
    },
    {
      count: 200,
      taxon: {
        id: 282407,
      },
    },
    {
      count: 180,
      taxon: {
        id: 167637,
      },
    },
    {
      count: 180,
      taxon: {
        id: 181844,
      },
    },
    {
      count: 174,
      taxon: {
        id: 638309,
      },
    },
    {
      count: 155,
      taxon: {
        id: 282386,
      },
    },
    {
      count: 155,
      taxon: {
        id: 1473163,
      },
    },
    {
      count: 151,
      taxon: {
        id: 275459,
      },
    },
    {
      count: 132,
      taxon: {
        id: 167673,
      },
    },
    {
      count: 120,
      taxon: {
        id: 275479,
      },
    },
    {
      count: 100,
      taxon: {
        id: 275465,
      },
    },
    {
      count: 95,
      taxon: {
        id: 275467,
      },
    },
    {
      count: 94,
      taxon: {
        id: 1596407,
      },
    },
    {
      count: 74,
      taxon: {
        id: 275507,
      },
    },
    {
      count: 72,
      taxon: {
        id: 282400,
      },
    },
    {
      count: 71,
      taxon: {
        id: 171026,
      },
    },
    {
      count: 71,
      taxon: {
        id: 282374,
      },
    },
    {
      count: 71,
      taxon: {
        id: 442874,
      },
    },
    {
      count: 70,
      taxon: {
        id: 275496,
      },
    },
    {
      count: 70,
      taxon: {
        id: 275526,
      },
    },
    {
      count: 70,
      taxon: {
        id: 548296,
      },
    },
    {
      count: 68,
      taxon: {
        id: 167633,
      },
    },
    {
      count: 65,
      taxon: {
        id: 282383,
      },
    },
    {
      count: 61,
      taxon: {
        id: 1551929,
      },
    },
    {
      count: 49,
      taxon: {
        id: 282387,
      },
    },
    {
      count: 48,
      taxon: {
        id: 167649,
      },
    },
    {
      count: 45,
      taxon: {
        id: 167665,
      },
    },
    {
      count: 45,
      taxon: {
        id: 275524,
      },
    },
    {
      count: 45,
      taxon: {
        id: 282398,
      },
    },
    {
      count: 44,
      taxon: {
        id: 282409,
      },
    },
    {
      count: 42,
      taxon: {
        id: 282391,
      },
    },
    {
      count: 39,
      taxon: {
        id: 170988,
      },
    },
    {
      count: 38,
      taxon: {
        id: 275469,
      },
    },
    {
      count: 37,
      taxon: {
        id: 275477,
      },
    },
    {
      count: 35,
      taxon: {
        id: 275489,
      },
    },
    {
      count: 35,
      taxon: {
        id: 1199821,
      },
    },
    {
      count: 35,
      taxon: {
        id: 1549941,
      },
    },
    {
      count: 33,
      taxon: {
        id: 171017,
      },
    },
    {
      count: 33,
      taxon: {
        id: 275484,
      },
    },
    {
      count: 33,
      taxon: {
        id: 282402,
      },
    },
    {
      count: 32,
      taxon: {
        id: 171016,
      },
    },
    {
      count: 31,
      taxon: {
        id: 275501,
      },
    },
    {
      count: 31,
      taxon: {
        id: 282384,
      },
    },
    {
      count: 29,
      taxon: {
        id: 282375,
      },
    },
    {
      count: 26,
      taxon: {
        id: 275466,
      },
    },
    {
      count: 25,
      taxon: {
        id: 275511,
      },
    },
    {
      count: 24,
      taxon: {
        id: 282377,
      },
    },
    {
      count: 24,
      taxon: {
        id: 282378,
      },
    },
    {
      count: 23,
      taxon: {
        id: 275463,
      },
    },
    {
      count: 23,
      taxon: {
        id: 275494,
      },
    },
    {
      count: 23,
      taxon: {
        id: 275503,
      },
    },
    {
      count: 22,
      taxon: {
        id: 275517,
      },
    },
    {
      count: 19,
      taxon: {
        id: 1198456,
      },
    },
    {
      count: 15,
      taxon: {
        id: 170976,
      },
    },
    {
      count: 15,
      taxon: {
        id: 275522,
      },
    },
    {
      count: 15,
      taxon: {
        id: 962098,
      },
    },
    {
      count: 14,
      taxon: {
        id: 171059,
      },
    },
    {
      count: 14,
      taxon: {
        id: 171070,
      },
    },
    {
      count: 13,
      taxon: {
        id: 170992,
      },
    },
    {
      count: 13,
      taxon: {
        id: 170996,
      },
    },
    {
      count: 13,
      taxon: {
        id: 171007,
      },
    },
    {
      count: 13,
      taxon: {
        id: 273732,
      },
    },
    {
      count: 12,
      taxon: {
        id: 171015,
      },
    },
    {
      count: 12,
      taxon: {
        id: 171069,
      },
    },
    {
      count: 12,
      taxon: {
        id: 275508,
      },
    },
    {
      count: 12,
      taxon: {
        id: 282393,
      },
    },
    {
      count: 12,
      taxon: {
        id: 1555935,
      },
    },
    {
      count: 11,
      taxon: {
        id: 282388,
      },
    },
    {
      count: 10,
      taxon: {
        id: 171040,
      },
    },
    {
      count: 10,
      taxon: {
        id: 171048,
      },
    },
    {
      count: 10,
      taxon: {
        id: 275492,
      },
    },
    {
      count: 9,
      taxon: {
        id: 275473,
      },
    },
    {
      count: 8,
      taxon: {
        id: 171027,
      },
    },
    {
      count: 8,
      taxon: {
        id: 171045,
      },
    },
    {
      count: 8,
      taxon: {
        id: 171049,
      },
    },
    {
      count: 8,
      taxon: {
        id: 487058,
      },
    },
    {
      count: 8,
      taxon: {
        id: 867019,
      },
    },
    {
      count: 7,
      taxon: {
        id: 275456,
      },
    },
    {
      count: 7,
      taxon: {
        id: 275493,
      },
    },
    {
      count: 7,
      taxon: {
        id: 275497,
      },
    },
    {
      count: 7,
      taxon: {
        id: 883524,
      },
    },
    {
      count: 7,
      taxon: {
        id: 1503245,
      },
    },
    {
      count: 6,
      taxon: {
        id: 171052,
      },
    },
    {
      count: 6,
      taxon: {
        id: 275476,
      },
    },
    {
      count: 6,
      taxon: {
        id: 1498387,
      },
    },
    {
      count: 5,
      taxon: {
        id: 170994,
      },
    },
    {
      count: 5,
      taxon: {
        id: 171005,
      },
    },
    {
      count: 5,
      taxon: {
        id: 209423,
      },
    },
    {
      count: 5,
      taxon: {
        id: 275490,
      },
    },
    {
      count: 5,
      taxon: {
        id: 282415,
      },
    },
    {
      count: 5,
      taxon: {
        id: 879870,
      },
    },
    {
      count: 5,
      taxon: {
        id: 1118355,
      },
    },
    {
      count: 5,
      taxon: {
        id: 1471166,
      },
    },
    {
      count: 4,
      taxon: {
        id: 170977,
      },
    },
    {
      count: 4,
      taxon: {
        id: 170986,
      },
    },
    {
      count: 4,
      taxon: {
        id: 170990,
      },
    },
    {
      count: 4,
      taxon: {
        id: 171020,
      },
    },
    {
      count: 4,
      taxon: {
        id: 171034,
      },
    },
    {
      count: 4,
      taxon: {
        id: 275464,
      },
    },
    {
      count: 4,
      taxon: {
        id: 275504,
      },
    },
    {
      count: 3,
      taxon: {
        id: 170982,
      },
    },
    {
      count: 3,
      taxon: {
        id: 171021,
      },
    },
    {
      count: 3,
      taxon: {
        id: 171066,
      },
    },
    {
      count: 3,
      taxon: {
        id: 275480,
      },
    },
    {
      count: 3,
      taxon: {
        id: 275510,
      },
    },
    {
      count: 3,
      taxon: {
        id: 907168,
      },
    },
    {
      count: 3,
      taxon: {
        id: 1240694,
      },
    },
    {
      count: 3,
      taxon: {
        id: 1480290,
      },
    },
    {
      count: 3,
      taxon: {
        id: 1567688,
      },
    },
    {
      count: 2,
      taxon: {
        id: 167669,
      },
    },
    {
      count: 2,
      taxon: {
        id: 170991,
      },
    },
    {
      count: 2,
      taxon: {
        id: 171003,
      },
    },
    {
      count: 2,
      taxon: {
        id: 171008,
      },
    },
    {
      count: 2,
      taxon: {
        id: 171010,
      },
    },
    {
      count: 2,
      taxon: {
        id: 171044,
      },
    },
    {
      count: 2,
      taxon: {
        id: 171060,
      },
    },
    {
      count: 2,
      taxon: {
        id: 275458,
      },
    },
    {
      count: 2,
      taxon: {
        id: 275474,
      },
    },
    {
      count: 1,
      taxon: {
        id: 170999,
      },
    },
    {
      count: 1,
      taxon: {
        id: 171011,
      },
    },
    {
      count: 1,
      taxon: {
        id: 171032,
      },
    },
    {
      count: 1,
      taxon: {
        id: 171035,
      },
    },
    {
      count: 1,
      taxon: {
        id: 171056,
      },
    },
    {
      count: 1,
      taxon: {
        id: 275457,
      },
    },
    {
      count: 1,
      taxon: {
        id: 275468,
      },
    },
    {
      count: 1,
      taxon: {
        id: 275475,
      },
    },
    {
      count: 1,
      taxon: {
        id: 275481,
      },
    },
    {
      count: 1,
      taxon: {
        id: 275500,
      },
    },
    {
      count: 1,
      taxon: {
        id: 282379,
      },
    },
    {
      count: 1,
      taxon: {
        id: 282390,
      },
    },
    {
      count: 1,
      taxon: {
        id: 442871,
      },
    },
    {
      count: 1,
      taxon: {
        id: 1365015,
      },
    },
    {
      count: 1,
      taxon: {
        id: 1542142,
      },
    },
    {
      count: 1,
      taxon: {
        id: 1639412,
      },
    },
  ],
};

export const losAngelesSearchPlaces: iNatSearchAPI = {
  total_results: 378,
  page: 1,
  per_page: 3,
  results: [
    {
      score: 8.383546,
      type: "Place",
      matches: ["Los Angeles County, US, CA"],
      record: {
        id: 962,
        uuid: "3e6773a1-12bb-43ab-9c0b-712be033287a",
        slug: "los-angeles-county",
        name: "Los Angeles",
        display_name: "Los Angeles County, US, CA",
        display_name_autocomplete: "Los Angeles County, US, CA",
        place_type: 9,
        admin_level: 20,
        bbox_area: 2.706326331914,
        ancestor_place_ids: [97394, 1, 14, 962],
        user: null,
        geometry_geojson: {
          type: "MultiPolygon",
          coordinates: [
            [
              [
                [-118.678551, 33.026356],
                [-118.670782, 33.057966],
                [-118.641301, 33.081882],
                [-118.542103, 33.073788],
                [-118.448863, 32.961749999999995],
                [-118.29724999999999, 32.845093999999996],
                [-118.295841, 32.798255999999995],
                [-118.323819, 32.773514],
                [-118.378377, 32.770232],
                [-118.408322, 32.751914],
                [-118.46471199999999, 32.760176],
                [-118.550515, 32.825328999999996],
                [-118.644732, 33.000033],
                [-118.670173, 33.000034],
                [-118.678551, 33.026356],
              ],
            ],
            [
              [
                [-118.667602, 33.477489],
                [-118.659924, 33.505759999999995],
                [-118.632505, 33.526466],
                [-118.533639, 33.531442],
                [-118.359393, 33.464922],
                [-118.25771399999999, 33.364131],
                [-118.24594, 33.291061],
                [-118.269178, 33.265679999999996],
                [-118.318622, 33.248472],
                [-118.486688, 33.276905],
                [-118.534885, 33.315176],
                [-118.547929, 33.376799],
                [-118.618574, 33.406191],
                [-118.667602, 33.477489],
              ],
            ],
            [
              [
                [-118.70339200000001, 34.168591],
                [-118.66815199999999, 34.168195],
                [-118.66771299999999, 34.240404],
                [-118.632495, 34.240426],
                [-118.636612, 34.291278],
                [-118.894474, 34.817972],
                [-118.863108, 34.802983999999995],
                [-118.854253, 34.817772],
                [-117.667292, 34.822525999999996],
                [-117.667034, 34.558008],
                [-117.646374, 34.28917],
                [-117.730125, 34.021370999999995],
                [-117.76769, 34.023506],
                [-117.767483, 34.004611],
                [-117.785062, 34.004809],
                [-117.802445, 33.968308],
                [-117.783287, 33.946411],
                [-117.97649799999999, 33.94605],
                [-117.976593, 33.902809999999995],
                [-118.058918, 33.846121],
                [-118.096561, 33.779467],
                [-118.09197, 33.758472],
                [-118.11950999999999, 33.737064],
                [-118.1259, 33.697151],
                [-118.237008, 33.690595],
                [-118.274239, 33.663429],
                [-118.319135, 33.659546999999996],
                [-118.466962, 33.725524],
                [-118.485577, 33.753664],
                [-118.484483, 33.803154],
                [-118.447254, 33.84876],
                [-118.557356, 33.987673],
                [-118.727459, 33.980306999999996],
                [-118.809827, 33.946905],
                [-118.873998, 33.983314],
                [-118.95172099999999, 33.992858],
                [-118.940801, 34.074967],
                [-118.788889, 34.168214],
                [-118.70339200000001, 34.168591],
              ],
            ],
          ],
        },
        bounding_box_geojson: {
          type: "Polygon",
          coordinates: [
            [
              [-118.951721, 32.75004],
              [-118.951721, 34.823302],
              [-117.646374, 34.823302],
              [-117.646374, 32.75004],
              [-118.951721, 32.75004],
            ],
          ],
        },
        location: "34.1980014782,-118.2610169697",
        point_geojson: {
          type: "Point",
          coordinates: [-118.2610169697, 34.1980014782],
        },
        without_check_list: null,
        observations_count: 2418499,
        universal_search_rank: 2418499,
        names: [],
        matched_term: "Los Angeles County, US, CA",
      },
    },
    {
      score: 8.3488865,
      type: "Place",
      matches: ["Los Angeles Area (custom), CA, US"],
      record: {
        id: 51043,
        uuid: "85cb90fd-d309-45f6-ba08-43edbd51dcc3",
        slug: "greater-los-angeles-area--3",
        name: "Los Angeles Area (custom)",
        display_name: "Los Angeles Area (custom), CA, US",
        display_name_autocomplete: "Los Angeles Area (custom), CA, US",
        place_type: null,
        admin_level: null,
        bbox_area: 3.9020734566981,
        ancestor_place_ids: [97394, 1, 14, 51043],
        user: {
          id: 5703,
          login: "get-to-know-program",
          spam: false,
          suspended: false,
          created_at: "2012-04-05T16:03:09.355Z",
        },
        geometry_geojson: {
          type: "Polygon",
          coordinates: [
            [
              [-118.88070245739073, 33.97330122266386],
              [-118.73238702770323, 34.237107483843836],
              [-118.58956476207823, 34.33695652688916],
              [-118.19955011364073, 34.47292295213237],
              [-116.97457452770323, 34.44574734782904],
              [-116.57357355114073, 34.26435080591277],
              [-116.48568292614073, 34.155324619761],
              [-116.36483331676573, 33.909500728188334],
              [-116.21102472301573, 33.49363453770704],
              [-116.46371026989073, 33.199954349461684],
              [-117.38656183239073, 33.01129580273726],
              [-118.88070245739073, 33.97330122266386],
            ],
          ],
        },
        bounding_box_geojson: {
          type: "Polygon",
          coordinates: [
            [
              [-118.8807024574, 33.0112958027],
              [-118.8807024574, 34.4729229521],
              [-116.211024723, 34.4729229521],
              [-116.211024723, 33.0112958027],
              [-118.8807024574, 33.0112958027],
            ],
          ],
        },
        location: "33.7421093774,-117.5458635902",
        point_geojson: {
          type: "Point",
          coordinates: [-117.5458635902, 33.7421093774],
        },
        without_check_list: null,
        observations_count: 2232987,
        universal_search_rank: 2232987,
        names: [],
        matched_term: "Los Angeles Area (custom), CA, US",
      },
    },
    {
      score: 8.273452,
      type: "Place",
      matches: ["Los Angeles & Ventura Metropolitan Areas"],
      record: {
        id: 108490,
        uuid: "a9ab5a78-366c-434d-97cc-06aedf8895ba",
        slug: "los-angeles-ventura-metropolitan-areas",
        name: "Los Angeles & Ventura Metropolitan Areas",
        display_name: "Los Angeles & Ventura Metropolitan Areas",
        display_name_autocomplete: "Los Angeles & Ventura Metropolitan Areas",
        place_type: null,
        admin_level: null,
        bbox_area: 3.1461780754217803,
        ancestor_place_ids: null,
        user: {
          id: 169078,
          login: "lacoyotes",
          spam: false,
          suspended: false,
          created_at: "2016-01-14T17:59:14.326Z",
        },
        geometry_geojson: {
          type: "Polygon",
          coordinates: [
            [
              [-119.46258544921874, 34.252676117101515],
              [-119.31976318359374, 34.56085936708387],
              [-118.38043212890625, 34.53823752729578],
              [-116.93572998046874, 34.08451193447477],
              [-116.83685302734375, 33.67863985167553],
              [-117.73223876953124, 33.36264966025664],
              [-118.57269287109374, 33.660353121928814],
              [-119.46258544921874, 34.252676117101515],
            ],
          ],
        },
        bounding_box_geojson: {
          type: "Polygon",
          coordinates: [
            [
              [-119.4625854492, 33.3626496603],
              [-119.4625854492, 34.5608593671],
              [-116.8368530273, 34.5608593671],
              [-116.8368530273, 33.3626496603],
              [-119.4625854492, 33.3626496603],
            ],
          ],
        },
        location: "34.0075154797,-118.1156389082",
        point_geojson: {
          type: "Point",
          coordinates: [-118.1156389082, 34.0075154797],
        },
        without_check_list: true,
        observations_count: 1876944,
        universal_search_rank: 1876944,
        names: [],
        matched_term: "Los Angeles & Ventura Metropolitan Areas",
      },
    },
  ],
};

export const sandiegoSearchPlaces: iNatSearchAPI = {
  total_results: 127,
  page: 1,
  per_page: 1,
  results: [
    {
      score: 8.421101,
      type: "Place",
      matches: ["San Diego County, CA, US"],
      record: {
        id: 829,
        uuid: "8f2b9caf-b0f6-4cd0-9d3a-48d86a277653",
        slug: "san-diego-county",
        name: "San Diego",
        display_name: "San Diego County, CA, US",
        display_name_autocomplete: "San Diego County, CA, US",
        place_type: 9,
        admin_level: 20,
        bbox_area: 1.493712933213,
        ancestor_place_ids: [97394, 1, 14, 829],
        user: null,
        geometry_geojson: {
          type: "Polygon",
          coordinates: [
            [
              [-117.437426, 33.17953],
              [-117.549601, 33.294418],
              [-117.611081, 33.333991999999995],
              [-117.57848, 33.453927],
              [-117.508614, 33.469614],
              [-117.509722, 33.505019],
              [-117.364272, 33.505024999999996],
              [-117.370925, 33.490549],
              [-117.241668, 33.448927999999995],
              [-117.24123, 33.43199],
              [-116.085165, 33.425931999999996],
              [-116.08109, 33.074833],
              [-116.103252, 33.07467],
              [-116.10618, 32.618592],
              [-117.204917, 32.528832],
              [-117.223302, 32.621238],
              [-117.268789, 32.619415],
              [-117.30923899999999, 32.656400999999995],
              [-117.342, 32.840354],
              [-117.323279, 32.903064],
              [-117.375872, 33.075216999999995],
              [-117.437426, 33.17953],
            ],
          ],
        },
        bounding_box_geojson: {
          type: "Polygon",
          coordinates: [
            [
              [-117.611081, 32.528832],
              [-117.611081, 33.505025],
              [-116.08094, 33.505025],
              [-116.08094, 32.528832],
              [-117.611081, 32.528832],
            ],
          ],
        },
        location: "33.028203199,-116.7702074446",
        point_geojson: {
          type: "Point",
          coordinates: [-116.7702074446, 33.028203199],
        },
        without_check_list: null,
        observations_count: 2636940,
        universal_search_rank: 2636940,
        names: [],
        matched_term: "San Diego County, CA, US",
      },
    },
  ],
};
