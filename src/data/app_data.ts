import type { ObservationViews } from "../types/app";

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

export const validObservationsSubviews = ["grid", "table"];
