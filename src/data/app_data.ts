import { renderPlacesList } from "../lib/search_places";
import { renderProjectsList } from "../lib/search_projects";
import { renderTaxaList } from "../lib/search_taxa";
import { renderTaxaIdentifiedList } from "../lib/search_taxa_identified";
import { renderUsersList } from "../lib/search_users";
import { renderUsersAnnotatorsList } from "../lib/search_users_annotators";
import { renderUsersIdentifiersList } from "../lib/search_users_identifiers";
import { renderWithoutTaxaList } from "../lib/search_without_taxa";
import { renderWithoutTaxaIdentifiedList } from "../lib/search_without_taxa_identified";
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

// NOTE: update when adding selectedResource; filters
export const observationsApiNonFilterableNames: ObservationsApiParamsKeysType[] =
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
    "order_by",
    "order",
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
  ];

const observationsFilterableTodo: ObservationsApiParamsKeysType[] = [
  // maybe
  "geoprivacy", // array
  "taxon_geoprivacy", // array
  "obscuration", // array

  "term_id_or_unknown",
  "out_of_range",

  "acc_above",
  "acc_below",
  "acc_below_or_unknown",
  "acc",

  // no
  "csi",
  "observed_on",
  "licensed",
  "photo_licensed",
  "taxon_name",
  "apply_project_rules_for",
  "cs",
  "csa",
  "expected_nearby",
  "geo",
  "id",
  "identifications",
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
  "site_id",
  "search_on", // string; can only select one category at a time
  "spam",
  "taxon_is_active",
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
};

export const observationsApiFilterableNames = observationsFilterableImplemented
  .concat(observationsFilterableImplementedArrays)
  .concat(observationsFilterableTodo);

export const observationsApiNames: string[] =
  observationsApiNonFilterableNames.concat(observationsApiFilterableNames);

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
