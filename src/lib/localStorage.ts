import type { AppStoreType } from "../types/app";

export function saveItem(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getItem(key: string) {
  let value = localStorage.getItem(key);
  if (value) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
}

export function deleteItem(key: string) {
  localStorage.removeItem(key);
}

export const dbKeys = {
  locale: "locale",
  name_order: "name_order",
  per_page_observations: "per_page_observations",
  per_page_identifications: "per_page_identifications",
  per_page_species: "per_page_species",
  per_page_users: "per_page_users",
  display_place_guess: "display_place_guess",
  display_time_observed_at: "display_time_observed_at",
  display_created_at: "display_created_at",
  display_updated_at: "display_updated_at",
  display_identifications: "display_identifications",
  display_annotations: "display_annotations",
  display_ofvs: "display_ofvs",
  display_media: "display_media",
  display_species_name: "display_species_name",
  display_observer: "display_observer",
  display_media_counts: "display_media_counts",
  display_quality_grade: "display_quality_grade",
  display_counts: "display_counts",
};

export function populateStoreWithLocaleStorage(appStore: AppStoreType) {
  let savedLocale = getItem(dbKeys.locale);
  if (savedLocale) {
    appStore.observationsApiParams.locale = savedLocale;
  }

  let savedNameOrder = getItem(dbKeys.name_order);
  if (savedNameOrder) {
    appStore.viewMetadata.name_order = savedNameOrder;
  }

  let perPageObservations = getItem(dbKeys.per_page_observations);
  if (perPageObservations) {
    appStore.viewMetadata.observations_observations.perPage =
      Number(perPageObservations);
    appStore.viewMetadata.identifications_identifications.perPage =
      Number(perPageObservations);
  }

  let perPageSpecies = getItem(dbKeys.per_page_species);
  if (perPageSpecies) {
    appStore.viewMetadata.observations_species.perPage = Number(perPageSpecies);
    appStore.viewMetadata.identifications_species.perPage =
      Number(perPageSpecies);
  }

  let perPageIdentifications = getItem(dbKeys.per_page_identifications);
  if (perPageIdentifications) {
    appStore.viewMetadata.identifications_identifications.perPage = Number(
      perPageIdentifications,
    );
  }

  let displayFields =
    appStore.viewMetadata.observations_observations.displayFields || {};

  let display_place_guess = getItem(dbKeys.display_place_guess);
  if (display_place_guess !== undefined) {
    displayFields.place_guess = display_place_guess;
  }
  let display_time_observed_at = getItem(dbKeys.display_time_observed_at);
  if (display_time_observed_at !== undefined) {
    displayFields.time_observed_at = display_time_observed_at;
  }
  let display_created_at = getItem(dbKeys.display_created_at);
  if (display_created_at !== undefined) {
    displayFields.created_at = display_created_at;
  }
  let display_updated_at = getItem(dbKeys.display_updated_at);
  if (display_updated_at !== undefined) {
    displayFields.updated_at = display_updated_at;
  }
  let display_identifications = getItem(dbKeys.display_identifications);
  if (display_identifications !== undefined) {
    displayFields.display_identifications = display_identifications;
  }
  let display_annotations = getItem(dbKeys.display_annotations);
  if (display_annotations !== undefined) {
    displayFields.annotations = display_annotations;
  }
  let display_ofvs = getItem(dbKeys.display_ofvs);
  if (display_ofvs !== undefined) {
    displayFields.ofvs = display_ofvs;
  }
  let display_media = getItem(dbKeys.display_media);
  if (display_media !== undefined) {
    displayFields.media = display_media;
  }
  let display_species_name = getItem(dbKeys.display_species_name);
  if (display_species_name !== undefined) {
    displayFields.species_name = display_species_name;
  }
  let display_observer = getItem(dbKeys.display_observer);
  if (display_observer !== undefined) {
    displayFields.observer = display_observer;
  }
  let display_media_counts = getItem(dbKeys.display_media_counts);
  if (display_media_counts !== undefined) {
    displayFields.media_counts = display_media_counts;
  }
  let display_quality_grade = getItem(dbKeys.display_quality_grade);
  if (display_quality_grade !== undefined) {
    displayFields.quality_grade = display_quality_grade;
  }
  let display_counts = getItem(dbKeys.display_counts);
  if (display_counts !== undefined) {
    displayFields.counts = display_counts;
  }

  // HACK: force proxy store to update
  appStore.observationsApiParams = appStore.observationsApiParams;
}
