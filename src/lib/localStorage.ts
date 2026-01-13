import { viewAndPerPageDbKeyObject } from "../data/app_data";
import type { AppStoreType } from "../types/app";

export function saveItem(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getItem(key: string) {
  let value = localStorage.getItem(key);
  if (value) {
    return JSON.parse(value);
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

  if (!appStore.currentView) return;
  let dbKey = viewAndPerPageDbKeyObject(appStore.currentView);
  let savedPerPage = getItem(dbKey);
  if (savedPerPage) {
    appStore.viewMetadata[appStore.currentView].perPage = savedPerPage;
  }
  appStore.observationsApiParams = appStore.observationsApiParams;
}
