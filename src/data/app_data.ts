import { dbKeys } from "../lib/localStorage";
import { renderPlacesList, showHidePlacesHeader } from "../lib/search_places";
import {
  renderProjectsList,
  showHideProjectsHeader,
} from "../lib/search_projects";
import { renderTaxaList, showHideTaxaHeader } from "../lib/search_taxa";
import {
  renderTaxaIdentifiedList,
  showHideTaxaIdentifiedHeader,
} from "../lib/search_taxa_identified";
import { renderUsersList, showHideUsersHeader } from "../lib/search_users";
import {
  renderUsersAnnotatorsList,
  showHideUsersAnnotatorsHeader,
} from "../lib/search_users_annotators";
import {
  renderUsersIdentifiersList,
  showHideUsersIdentifiersHeader,
} from "../lib/search_users_identifiers";
import {
  renderWithoutTaxaList,
  showHideWithoutTaxaHeader,
} from "../lib/search_without_taxa";
import {
  renderWithoutTaxaIdentifiedList,
  showHideWithoutTaxaIdentifiedHeader,
} from "../lib/search_without_taxa_identified";
import { objectFlip } from "../lib/utils";
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
  let obj = {
    observations_species: "view-species",
    observations_identifiers: "view-identifiers",
    observations_observers: "view-observers",
    observations_observations: "view-observations",
    identifications_species: "view-species",
    identifications_identifiers: "view-identifiers",
    identifications_observers: "view-observers",
    identifications_observations: "view-observations",
    identifications_identifications: "view-identifications",
  };

  let view = obj[targetView];
  if (view) {
    return view;
  } else {
    throw Error(`Need to add view /template: ${targetView}`);
  }
}

export function viewAndPerPageDbKeyObject(targetView: ObservationViewsType) {
  let obj = {
    observations_species: dbKeys.per_page_species,
    observations_identifiers: dbKeys.per_page_users,
    observations_observers: dbKeys.per_page_users,
    observations_observations: dbKeys.per_page_observations,
    identifications_species: dbKeys.per_page_species,
    identifications_identifiers: dbKeys.per_page_users,
    identifications_observers: dbKeys.per_page_users,
    identifications_observations: dbKeys.per_page_observations,
    identifications_identifications: dbKeys.per_page_identifications,
  };

  let dbKey = obj[targetView];
  if (dbKey) {
    return dbKey;
  } else {
    throw Error(`Need to add view /DB key: ${targetView}`);
  }
}

// NOTE: update when adding selectedResource; autocomplete sidemenu
// selected resources are the resources shown in the sidemenu with counts
export const selectedResourcesWithCount: AppStoreSelectedResourcesKeysType[] = [
  "selectedPlaces",
  "selectedProjects",
  "selectedTaxa",
  "selectedTaxaIdentified",
  "selectedUsers",
  "selectedUsersAnnotators",
  "selectedUsersIdentifiers",
];

// NOTE: update when adding selectedResource; autocomplete sidemenu
export const selectedResourcesNoCount: AppStoreSelectedResourcesKeysType[] = [
  "selectedWithoutTaxa",
  "selectedWithoutTaxaIdentified",
];

export const selectedResources: AppStoreSelectedResourcesKeysType[] =
  selectedResourcesWithCount.concat(selectedResourcesNoCount);

// NOTE: update when adding selectedResource; autocomplete filters modal
export let filtersModalAutocompleteFields: ObservationsApiParamsKeysType[] = [
  "not_in_project",
  "unobserved_by_user_id",
  "viewer_id",
];

// NOTE: update when adding selectedResource; autocomplete sidemenu
export const selectedResourcesIdObservations = {
  selectedPlaces: "place_id",
  selectedProjects: "project_id",
  selectedTaxa: "taxon_id",
  selectedWithoutTaxa: "without_taxon_id",
  selectedWithoutTaxaIdentified: null,
  selectedTaxaIdentified: null,
  selectedUsers: "user_id",
  selectedUsersAnnotators: "annotation_user_id",
  selectedUsersIdentifiers: "ident_user_id",
  selectedReviewer: "viewer_id",
  selectedUnobservedByUser: "unobserved_by_user_id",
  selectedNotInProject: "not_in_project",
};

export const idSelectedResourcesObservations = objectFlip(
  selectedResourcesIdObservations,
);

// NOTE: update when adding selectedResource; autocomplete sidemenu
export const selectedResourcesIdIdentifications = {
  selectedPlaces: "place_id",
  selectedProjects: null,
  selectedTaxa: "observation_taxon_id",
  selectedWithoutTaxa: "without_observation_taxon_id",
  selectedWithoutTaxaIdentified: "without_taxon_id",
  selectedTaxaIdentified: "taxon_id",
  selectedUsers: null,
  selectedUsersAnnotators: null,
  selectedUsersIdentifiers: "user_id",
  selectedReviewer: null,
  selectedUnobservedByUser: null,
  selectedNotInProject: null,
};

export const idSelectedResourcesIdentifications = objectFlip(
  selectedResourcesIdIdentifications,
);

// NOTE: update when adding selectedResource; render list
export let renderSelectResourcesLists = [
  renderTaxaList,
  renderTaxaIdentifiedList,
  renderPlacesList,
  renderProjectsList,
  renderUsersList,
  renderUsersIdentifiersList,
  renderUsersAnnotatorsList,
  renderWithoutTaxaList,
  renderWithoutTaxaIdentifiedList,
];

// NOTE: update when adding selectedResource; render headers
export const event_headerHandlerObservations = {
  selectedTaxaChange: showHideTaxaHeader,
  selectedWithoutTaxaChange: showHideWithoutTaxaHeader,
  // selectedTaxaIdentifiedChange: showHideTaxaIdentifiedHeader,
  // selectedWithoutTaxaIdentifiedChange: showHideWithoutTaxaIdentifiedHeader,
  selectedPlacesChange: showHidePlacesHeader,
  selectedProjectsChange: showHideProjectsHeader,
  selectedUsersChange: showHideUsersHeader,
  // selectedWithoutUsersChange: showHideWithoutUsersHeader,
  selectedUsersIdentifiersChange: showHideUsersIdentifiersHeader,
  // selectedWithoutUsersIdentifiersChange: showHideWithoutUsersIdentifiersHeader,
  selectedUsersAnnotatorsChange: showHideUsersAnnotatorsHeader,
};

export const event_headerHandlerIdentifications = {
  selectedTaxaChange: showHideTaxaHeader,
  selectedWithoutTaxaChange: showHideWithoutTaxaHeader,
  selectedTaxaIdentifiedChange: showHideTaxaIdentifiedHeader,
  selectedWithoutTaxaIdentifiedChange: showHideWithoutTaxaIdentifiedHeader,
  selectedPlacesChange: showHidePlacesHeader,
  selectedUsersIdentifiersChange: showHideUsersIdentifiersHeader,
};

// NOTE: update when adding selectedResource; filters
export const observationsApiNonFilterableNames: ObservationsApiParamsKeysType[] =
  [
    "annotation_user_id",
    "colors",
    "ident_user_id",
    "locale",
    "nelat",
    "nelng",
    "order",
    "order_by",
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
    "without_taxon_id",
  ];

export const observationsFilterableImplemented: ObservationsApiParamsKeysType[] =
  [
    "captive",
    "created_d1",
    "created_d2",
    "created_on",
    "d1",
    "d2",
    "disagreements",
    "endemic",
    "hrank",
    "identified",
    "introduced",
    "list_id", // no way to do autocomplete lists name
    "lrank",
    "native",
    "not_in_project",
    "on",
    "photos",
    "popular",
    "q",
    "reviewed",
    "sounds",
    "threatened",
    "unobserved_by_user_id",
    "user_after",
    "user_before",
    "verifiable",
    "viewer_id",
    "without_term_id", // integer
  ];

// used by processFiltersForm to determine if app will combine values into
// comma separated string
export const observationsFilterableImplementedArrays: ObservationsApiParamsKeysType[] =
  [
    "created_day",
    "created_month",
    "created_year",
    "day",
    "hour",
    "iconic_taxa",
    "license",
    "month",
    "photo_license",
    "quality_grade",
    "rank",
    "sound_license",
    "term_id",
    "term_value_id",
    "without_term_value_id",
    "year",
    "geoprivacy",
    "taxon_geoprivacy",
    "obscuration",
  ];

const observationsFilterableTodo: ObservationsApiParamsKeysType[] = [
  // maybe
  "term_id_or_unknown",
  "outlink_source",
  // geo
  "out_of_range",
  "acc_above",
  "acc_below",
  "acc_below_or_unknown",
  "acc",
  "geo",
  "mappable",

  "exact_taxon_id",
  "ident_taxon_id_exclusive", // array

  "not_in_place",
  "not_user_id",
  "without_direct_taxon_id",
  "without_ident_user_id",

  // no
  "apply_project_rules_for",
  "cs",
  "csa",
  "csi",
  "expected_nearby",
  "id",
  "id_above",
  "id_below",
  "id_please",
  "ident_taxon_id", // integer
  "identifications",
  "lat",
  "licensed",
  "lng",
  "not_id",
  "not_matching_project_rules_for",
  "observation_accuracy_experiment_id",
  "observed_on",
  "ofv_datatype",
  "pcid",
  "photo_licensed",
  "radius",
  "search_on", // string; can only select one category at a time
  "site_id",
  "spam",
  "taxon_is_active",
  "taxon_name",
  "updated_since",
  "user_login",
];

// used to populate form on app init and delete a filter
export const observationsFieldName_InputType = {
  captive: "select",
  created_day: "multiselect",
  d1: "dateInput",
  d2: "dateInput",
  day: "multiselect",
  disagreements: "select",
  endemic: "select",
  hour: "multiselect",
  hrank: "select",
  iconic_taxa: "checkbox",
  ident_user_id: "search",
  identified: "select",
  introduced: "select",
  license: "multiselect",
  list_id: "textInput",
  lrank: "select",
  month: "multiselect",
  native: "select",
  not_in_project: "search",
  on: "dateInput",
  photo_license: "multiselect",
  photos: "select",
  popular: "select",
  q: "textInput",
  quality_grade: "multiselect",
  rank: "multiselect",
  reviewed: "select",
  sound_license: "multiselect",
  sounds: "select",
  term_id: "skip",
  term_value_id: "skip",
  threatened: "select",
  unobserved_by_user_id: "search",
  user_after: "select",
  user_before: "select",
  verifiable: "select",
  viewer_id: "search",
  without_term_id: "skip",
  without_term_value_id: "skip",
  year: "multiselect",
  geoprivacy: "multiselect",
  taxon_geoprivacy: "multiselect",
  obscuration: "multiselect",
};

// API v2 accepts true, false, or do not send field for verifiable. The default
// value is true with no params in url. Use any to not send field to API.
export const fieldsWithAny = ["verifiable"];

export const observationsApiFilterableNames = observationsFilterableImplemented
  .concat(observationsFilterableImplementedArrays)
  .concat(observationsFilterableTodo);

export const observationsApiNames: string[] =
  observationsApiNonFilterableNames.concat(observationsApiFilterableNames);

// export const observationsApiNonResources: string[] = observationsApiNames
//   .filter((p) => !Object.values(selectedResourcesIdObservations).includes(p))
//   .filter((p) => p);

export const identificationsApiNonFilterableNames: IdentificationsApiParamsKeysType[] =
  [
    "observation_taxon_id", // array string
    "page",
    "per_page",
    "place_id", // array string
    "taxon_id", // array string
    "user_id", // array integer
    "without_observation_taxon_id", // array string
    "without_taxon_id", // array string
  ];

export const identificationsFilterableImplemented: IdentificationsApiParamsKeysType[] =
  [
    "d1",
    "d2",
    "lrank",
    "hrank",
    "observed_d1",
    "observed_d2",
    "observation_lrank",
    "observation_hrank",
    "reviewed",
  ];

// used by processFiltersForm to determine if app will combine values into
// comma separated string
export const identificationsFilterableImplementedArrays: IdentificationsApiParamsKeysType[] =
  [
    "category",
    "iconic_taxon_id",
    "observation_iconic_taxon_id",
    "observation_rank",
    "quality_grade",
    "rank",
  ];

export const identificationsFilterableTodo: IdentificationsApiParamsKeysType[] =
  [
    // maybe
    "order",
    "order_by", // created_at,

    // no
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
    "taxon_change_id", // array string

    "id_above",
    "id_below",
    "only_id",
    "taxon_of",
  ];

// used to populate form on app init and delete a filter
export const identificationsFieldName_InputType = {
  d1: "dateInput",
  d2: "dateInput",
  observed_d1: "dateInput",
  observed_d2: "dateInput",
  hrank: "select",
  lrank: "select",
  observation_hrank: "select",
  observation_lrank: "select",
  rank: "multiselect",
  observation_rank: "multiselect",
  category: "multiselect",
  quality_grade: "multiselect",
  iconic_taxon_id: "checkbox",
  observation_iconic_taxon_id: "checkbox",
};

export const identificationsApiFilterableNames =
  identificationsFilterableImplemented
    .concat(identificationsFilterableImplementedArrays)
    .concat(identificationsFilterableTodo);

export const identificationsApiNames: string[] =
  identificationsApiNonFilterableNames.concat(
    identificationsApiFilterableNames,
  );

export let recordTypeToPathObj = {
  about: "/about/",
  observations: "/",
  identifications: "/identifications/",
};

export let pathToRecordType = {
  ...objectFlip(recordTypeToPathObj),
};
