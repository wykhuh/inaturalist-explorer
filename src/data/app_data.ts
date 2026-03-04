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
  renderWithoutPlacesList,
  showHideWithoutPlacesHeader,
} from "../lib/search_without_places";
import {
  renderWithoutProjectsList,
  showHideWithoutProjectsHeader,
} from "../lib/search_without_project";
import {
  renderWithoutTaxaList,
  showHideWithoutTaxaHeader,
} from "../lib/search_without_taxa";
import {
  renderWithoutTaxaIdentifiedList,
  showHideWithoutTaxaIdentifiedHeader,
} from "../lib/search_without_taxa_identified";
import {
  renderWithoutUsersList,
  showHideWithoutUsersHeader,
} from "../lib/search_without_users";
import {
  renderWithoutUsersIdentifiersList,
  showHideWithoutUsersIdentifiersHeader,
} from "../lib/search_without_users_identifiers";
import { objectFlip } from "../lib/utils";
import type {
  AppStoreSelectedResourceKeysType,
  AppStoreSelectedResourcesKeysType,
  IdentificationsApiParamsKeysType,
  IdentificationSubviewsType,
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
  "identifications_species",
  "identifications_identifiers",
  "identifications_observers",
  "identifications_identifications",
];

export const validViews: ObservationViewsType[] = validObservationsViews.concat(
  validIdentificationsViews,
);

export const validObservationsSubviews: ObservationSubviewsType[] = [
  "map",
  "grid",
  "media",
  "graph",
  "table",
];
export const validIdentificationsSubviews: IdentificationSubviewsType[] = [
  "map",
  "grid",
  "history",
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
    identifications_identifications: dbKeys.per_page_identifications,
  };

  let dbKey = obj[targetView];
  if (dbKey) {
    return dbKey;
  } else {
    throw Error(`Need to add view /DB key: ${targetView}`);
  }
}

// NOTE: update when adding selectedResource; autocomplete filters modal
export let filtersModalAutocompleteFields: ObservationsApiParamsKeysType[] = [
  "unobserved_by_user_id",
  "viewer_id",
];

// NOTE: update when adding selectedResource; autocomplete sidemenu
export const selectedResourcesIdObservations: {
  [k: string]: ObservationsApiParamsKeysType | null;
} = {
  selectedPlaces: "place_id",
  selectedWithoutPlaces: "not_in_place",
  selectedProjects: "project_id",
  selectedWithoutProjects: "not_in_project",
  selectedTaxa: "taxon_id",
  selectedWithoutTaxa: "without_taxon_id",
  selectedTaxaIdentified: "ident_taxon_id",
  selectedWithoutTaxaIdentified: null,
  selectedUsers: "user_id",
  selectedWithoutUsers: "not_user_id",
  selectedUsersAnnotators: "annotation_user_id",
  selectedUsersIdentifiers: "ident_user_id",
  selectedWithoutUsersIdentifiers: "without_ident_user_id",
  selectedReviewer: "viewer_id",
  selectedUnobservedByUser: "unobserved_by_user_id",
};

// NOTE: update when adding selectedResource; autocomplete sidemenu
export const selectedResourcesIdIdentifications: {
  [k: string]: IdentificationsApiParamsKeysType | null;
} = {
  selectedPlaces: "place_id",
  selectedWithoutPlaces: "not_in_place",
  selectedProjects: null,
  selectedWithoutProjects: null,
  selectedTaxa: "observation_taxon_id",
  selectedWithoutTaxa: "without_observation_taxon_id",
  selectedTaxaIdentified: "taxon_id",
  selectedWithoutTaxaIdentified: "without_taxon_id",
  selectedUsers: null,
  selectedWithoutUsers: null,
  selectedUsersAnnotators: null,
  selectedUsersIdentifiers: "user_id",
  selectedWithoutUsersIdentifiers: null,
  selectedReviewer: null,
  selectedUnobservedByUser: null,
};

// NOTE: update when adding selectedResource; autocomplete sidemenu
// resources that don't have observation/identification counts
const selectedResourcesNoCount: (
  | AppStoreSelectedResourcesKeysType
  | AppStoreSelectedResourceKeysType
)[] = [
  "selectedWithoutPlaces",
  "selectedWithoutProjects",
  "selectedWithoutTaxa",
  "selectedWithoutTaxaIdentified",
  "selectedWithoutUsers",
  "selectedWithoutUsersIdentifiers",
];

// resources that are single objects
const selectedResource: AppStoreSelectedResourceKeysType[] = [
  "selectedReviewer",
  "selectedUnobservedByUser",
];

export const selectedResourcesAll = Object.keys(
  selectedResourcesIdIdentifications,
) as (AppStoreSelectedResourcesKeysType | AppStoreSelectedResourceKeysType)[];

export const selectedResources = selectedResourcesAll.filter(
  (resource) => !selectedResource.includes(resource as any),
) as AppStoreSelectedResourcesKeysType[];

export const selectedObservationsResourcesWithCount = selectedResources
  .filter((resource) => !selectedResourcesNoCount.includes(resource as any))
  .filter(
    (r) =>
      selectedResourcesIdObservations[
        r as keyof typeof selectedResourcesIdObservations
      ],
  ) as AppStoreSelectedResourcesKeysType[];

export const selectedIdentifictionsResourcesWithCount = selectedResources
  .filter((resource) => !selectedResourcesNoCount.includes(resource as any))
  .filter(
    (resource) =>
      selectedResourcesIdIdentifications[
        resource as keyof typeof selectedResourcesIdObservations
      ],
  ) as AppStoreSelectedResourcesKeysType[];

// NOTE: update when adding selectedResource; render list
export let renderSelectResourcesLists = [
  renderPlacesList,
  renderWithoutPlacesList,
  renderProjectsList,
  renderWithoutProjectsList,
  renderTaxaList,
  renderWithoutTaxaList,
  renderTaxaIdentifiedList,
  renderWithoutTaxaIdentifiedList,
  renderUsersList,
  renderWithoutUsersList,
  renderUsersIdentifiersList,
  renderWithoutUsersIdentifiersList,
  renderUsersAnnotatorsList,
];

// NOTE: update when adding selectedResource; render headers
export const event_headerHandlerObservations = {
  selectedTaxaChange: showHideTaxaHeader,
  selectedWithoutTaxaChange: showHideWithoutTaxaHeader,
  selectedTaxaIdentifiedChange: showHideTaxaIdentifiedHeader,
  selectedWithoutTaxaIdentifiedChange: showHideWithoutTaxaIdentifiedHeader,
  selectedPlacesChange: showHidePlacesHeader,
  selectedWithoutPlacesChange: showHideWithoutPlacesHeader,
  selectedProjectsChange: showHideProjectsHeader,
  selectedWithoutProjectsChange: showHideWithoutProjectsHeader,
  selectedUsersChange: showHideUsersHeader,
  selectedWithoutUsersChange: showHideWithoutUsersHeader,
  selectedUsersIdentifiersChange: showHideUsersIdentifiersHeader,
  selectedWithoutUsersIdentifiersChange: showHideWithoutUsersIdentifiersHeader,
  selectedUsersAnnotatorsChange: showHideUsersAnnotatorsHeader,
};

export const event_headerHandlerIdentifications = {
  selectedTaxaChange: showHideTaxaHeader,
  selectedWithoutTaxaChange: showHideWithoutTaxaHeader,
  selectedTaxaIdentifiedChange: showHideTaxaIdentifiedHeader,
  selectedWithoutTaxaIdentifiedChange: showHideWithoutTaxaIdentifiedHeader,
  selectedPlacesChange: showHidePlacesHeader,
  selectedWithoutPlacesChange: showHideWithoutPlacesHeader,
  selectedUsersIdentifiersChange: showHideUsersIdentifiersHeader,
};

// NOTE: update when adding selectedResource; filters
export const observationsApiNonFilterableNames: ObservationsApiParamsKeysType[] =
  [
    "colors",
    "locale",
    "nelat",
    "nelng",
    "order",
    "order_by",
    "page",
    "per_page",
    "subview",
    "swlat",
    "swlng",
    "view",
    // selected resources
    "place_id",
    "not_in_place",
    "project_id",
    "not_in_project",
    "taxon_id",
    "without_taxon_id",
    "ident_taxon_id", // array
    "user_id",
    "not_user_id",
    "annotation_user_id",
    "ident_user_id",
    "without_ident_user_id",
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
  ];

// used by processFiltersForm to determine if app will combine values into
// comma separated string
export const observationsFilterableImplementedArrays: ObservationsApiParamsKeysType[] =
  [
    "created_day",
    "created_month",
    "created_year",
    "day",
    "geoprivacy",
    "hour",
    "iconic_taxa",
    "license",
    "month",
    "obscuration",
    "ofv_datatype",
    "photo_license",
    "quality_grade",
    "rank",
    "sound_license",
    "taxon_geoprivacy",
    "term_id",
    "term_id_or_unknown",
    "term_value_id",
    "without_term_id",
    "without_term_value_id",
    "year",
  ];

const observationsFilterableTodo: ObservationsApiParamsKeysType[] = [
  // maybe
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
  "without_direct_taxon_id",
  "ident_taxon_id_exclusive", // array

  // no
  "apply_project_rules_for",
  "coords_viewable_for_proj",
  "cs",
  "csa",
  "csi",
  "expected_nearby",
  "fails_dqa_accurate",
  "fails_dqa_date",
  "fails_dqa_evidence",
  "fails_dqa_location",
  "fails_dqa_needs_id",
  "fails_dqa_recent",
  "fails_dqa_subject",
  "fails_dqa_wild",
  "id",
  "id_above",
  "id_below",
  "id_please",
  "identifications",
  "lat",
  "licensed",
  "lng",
  "not_id",
  "not_matching_project_rules_for",
  "observation_accuracy_experiment_id",
  "observed_on",
  "ofv_datatype",
  "only_id",
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
  "fields",
  "without_field",
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
  geoprivacy: "multiselect",
  hour: "multiselect",
  hrank: "select",
  iconic_taxa: "checkbox",
  identified: "select",
  introduced: "select",
  license: "multiselect",
  list_id: "textInput",
  lrank: "select",
  month: "multiselect",
  native: "select",
  obscuration: "multiselect",
  ofv_datatype: "multiselect",
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
  taxon_geoprivacy: "multiselect",
  term_id: "checkbox",
  term_value_id: "multiselect",
  threatened: "select",
  unobserved_by_user_id: "search",
  user_after: "select",
  user_before: "select",
  verifiable: "select",
  viewer_id: "search",
  without_term_id: "checkbox",
  without_term_value_id: "multiselect",
  year: "multiselect",
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
    "not_in_place", // array string
    "order",
    "order_by", // created_at,
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
