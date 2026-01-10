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

export function populateStoreWithLocaleStorage(appStore: AppStoreType) {
  let savedLocale = getItem("locale");
  if (savedLocale) {
    appStore.observationsApiParams.locale = savedLocale;
  }

  let savedNameOrder = getItem("name_order");
  if (savedNameOrder) {
    appStore.viewMetadata.name_order = savedNameOrder;
  }
}
