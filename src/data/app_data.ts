import type {
  AppStoreSelectedResourcesKeysType,
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
