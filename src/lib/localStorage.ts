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
    appStore.viewMetadata.identifications_observations.perPage =
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

  // HACK: force proxy store to update
  appStore.observationsApiParams = appStore.observationsApiParams;
}
