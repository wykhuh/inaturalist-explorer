import type {
  AppStoreSelectedResourcesKeysType,
  IdentificationsApiParamsKeysType,
  ObservationsApiParamsKeysType,
  ObservationSubviewsType,
  ObservationViewsType,
} from "../types/app";

export const validObservationsViews: ObservationViewsType[] = [
  "observations_observations",
  "observations_species",
  "observations_identifiers",
  "observations_observers",
];

export const validIdentificationsViews: ObservationViewsType[] = [
  "identifications_observations",
  "identifications_species",
  "identifications_identifiers",
  "identifications_observers",
  "identifications_identifications",
];

export const validViews: ObservationViewsType[] = validObservationsViews.concat(
  validIdentificationsViews,
);

export const validObservationsSubviews: ObservationSubviewsType[] = [
  "grid",
  "table",
  "media",
];

export function viewAndTemplateObject(targetView: ObservationViewsType) {
  switch (targetView) {
    case "observations_species":
      return "view-species";
    case "observations_identifiers":
      return "view-identifiers";
    case "observations_observers":
      return "view-observers";
    case "observations_observations":
      return "view-observations";
    case "identifications_species":
      return "view-species";
    case "identifications_identifiers":
      return "view-identifiers";
    case "identifications_observers":
      return "view-observers";
    case "identifications_observations":
      return "view-observations";
    case "identifications_identifications":
      return "view-identifications";
    default:
      throw Error(`Need to add view /template: ${targetView}`);
  }
}

// NOTE: update when adding selectedResource
// selected resources are the resources shown in the sidemenu with counts
export const selectedResources: AppStoreSelectedResourcesKeysType[] = [
  "selectedPlaces",
  "selectedProjects",
  "selectedTaxa",
  "selectedTaxaIdentified",
  "selectedUsers",
  "selectedUsersAnnotators",
  "selectedUsersIdentifiers",
];

export const selectedResourcesIdObservations = {
  selectedPlaces: "place_id",
  selectedProjects: "project_id",
  selectedTaxa: "taxon_id",
  selectedTaxaIdentified: null,
  selectedUsers: "user_id",
  selectedUsersAnnotators: "annotation_user_id",
  selectedUsersIdentifiers: "ident_user_id",
};

export const selectedResourcesIdIdentifications = {
  selectedPlaces: "place_id",
  selectedProjects: null,
  selectedTaxa: "observation_taxon_id",
  selectedTaxaIdentified: "taxon_id",
  selectedUsers: null,
  selectedUsersAnnotators: null,
  selectedUsersIdentifiers: "user_id",
};

// NOTE: update when adding selectedResource
export const ObservationsApiNonFilterableNames: ObservationsApiParamsKeysType[] =
  [
    "annotation_user_id",
    "colors",
    "ident_user_id",
    "locale",
    "nelat",
    "nelng",
    "page",
    "per_page",
    "place_id",
    "project_id",
    "subview",
    "swlat",
    "swlng",
    "taxon_id",
    "user_id",
    "view",
  ];

export const ObservationsFilterableImplemented: ObservationsApiParamsKeysType[] =
  [
    "captive",
    "created_d1",
    "created_d2",
    "created_on",
    "d1",
    "d2",
    "endemic",
    "hrank",
    "identified",
    "introduced",
    "lrank",
    "native",
    "on",
    "order_by",
    "order",
    "photos",
    "popular",
    "q",
    "reviewed",
    "sounds",
    "term_id",
    "threatened",
    "unobserved_by_user_id",
    "user_after",
    "user_before",
    "verifiable",
    "viewer_id",
  ];

export const ObservationsFilterableImplementedArrays: ObservationsApiParamsKeysType[] =
  [
    "created_month",
    "created_year",
    "iconic_taxa",
    "license",
    "month",
    "photo_license",
    "quality_grade",
    "sound_license",
    "term_value_id",
    "year",
  ];

const ObservationsFilterableTodo: ObservationsApiParamsKeysType[] = [
  // maybe
  "day",
  "hour",
  "not_in_project",

  "geoprivacy", // array
  "taxon_geoprivacy", // array
  "obscuration", // array

  "without_term_id", // integer
  "without_term_value_id", // array
  "without_taxon_id",

  // maybe
  "out_of_range",
  "created_day",
  "acc_above",
  "acc_below",
  "acc_below_or_unknown",
  "identifications",
  "list_id", // no way to do autocomplete lists name

  // no
  "csi",
  "observed_on",
  "acc",
  "licensed",
  "photo_licensed",
  "rank",
  "taxon_name",
  "acc_above",
  "acc_below",
  "apply_project_rules_for",
  "cs",
  "csa",
  "expected_nearby",
  "geo",
  "id",
  "id_above",
  "id_below",
  "id_please",
  "lat",
  "lng",
  "mappable",
  "not_id",
  "not_matching_project_rules_for",
  "observation_accuracy_experiment_id",
  "ofv_datatype",
  "pcid",
  "radius",
  "rank",
  "site_id",
  "search_on", // string; can only select one category at a time
  "spam",
  "taxon_is_active",
  "term_id_or_unknown",
  "updated_since",
  "user_login",
];

export const trueFalseFieldsObservations: ObservationsApiParamsKeysType[] = [
  "captive",
  "endemic",
  "identified",
  "introduced",
  "native",
  "photos",
  "popular",
  "sounds",
  "threatened",
  "verifiable",
  "reviewed",
];

export let selectFieldsObservations: ObservationsApiParamsKeysType[] = [
  "hrank",
  "lrank",
  "user_before",
  "user_after",
];

export let multipleSelectFieldsObservations: ObservationsApiParamsKeysType[] = [
  "license",
  "photo_license",
  "quality_grade",
  "sound_license",
  "month",
  "year",
  "term_value_id",
];

export let inputFieldsObservations: ObservationsApiParamsKeysType[] = [
  "d1",
  "d2",
  "on",
  "term_id",
  "q",
];

export let inputCheckedFieldsObservations: ObservationsApiParamsKeysType[] = [
  "iconic_taxa",
];

export const ObservationsApiFilterableNames =
  ObservationsFilterableImplemented.concat(
    ObservationsFilterableImplementedArrays,
  ).concat(ObservationsFilterableTodo);

export const ObservationsApiNames: string[] =
  ObservationsApiNonFilterableNames.concat(ObservationsApiFilterableNames);

export const IdentificationsApiNonFilterableNames: IdentificationsApiParamsKeysType[] =
  [
    "place_id", // array string
    "taxon_id", // array string
    "observation_taxon_id", // array string
    "user_id", // array integer
    "page",
    "per_page",
  ];

export const IdentificationsFilterableImplemented: IdentificationsApiParamsKeysType[] =
  [
    "d1",
    "d2",
    "lrank",
    "hrank",

    "observed_d1",
    "observed_d2",
    "observation_lrank",
    "observation_hrank",
    "quality_grade",
    "reviewed",
  ];
export const IdentificationsFilterableImplementedArrays: IdentificationsApiParamsKeysType[] =
  ["iconic_taxon_id", "observation_iconic_taxon_id"];

export const IdentificationsFilterableTodo: IdentificationsApiParamsKeysType[] =
  [
    // maybe
    "order",
    "order_by", // created_at,
    // no
    "rank",
    "observation_rank",
    "observation_created_d1",
    "observation_created_d2",
    "current_taxon",
    "own_observation",
    "is_change",
    "taxon_active",
    "observation_taxon_active",
    "id",
    "user_login", // array string
    "current",
    "category", // array string
    "taxon_change_id", // array string
    "without_taxon_id", // array string
    "without_observation_taxon_id", // array string
    "id_above",
    "id_below",
    "only_id",
    "taxon_of",
  ];

export const IdentificationsApiFilterableNames =
  IdentificationsFilterableImplemented.concat(
    IdentificationsFilterableImplementedArrays,
  ).concat(IdentificationsFilterableTodo);

export const IdentificationsApiNames: string[] =
  IdentificationsApiNonFilterableNames.concat(
    IdentificationsApiFilterableNames,
  );
