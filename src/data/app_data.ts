import type { ObservationSubviews, ObservationViews } from "../types/app";

export const validViews: ObservationViews[] = [
  "observations_observations",
  "observations_species",
  "observations_identifiers",
  "observations_observers",
  "identifications_observations",
  "identifications_species",
  "identifications_identifiers",
  "identifications_observers",
  "identifications_identifications",
];

export const validObservationsSubviews: ObservationSubviews[] = [
  "grid",
  "table",
  "media",
];

export function viewAndTemplateObject(targetView: ObservationViews) {
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
