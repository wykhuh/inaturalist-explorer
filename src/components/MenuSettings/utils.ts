import {
  validIdentificationsViews,
  validObservationsViews,
  viewAndPerPageDbKeyObject,
} from "../../data/app_data";
import { formatTaxonName } from "../../lib/data_utils";
import { setInputChecked, setSelectedOption } from "../../lib/form_utils";
import { getTaxa } from "../../lib/inat_api";
import { dbKeys, saveItem } from "../../lib/localStorage";
import { loggerEvent } from "../../lib/logger";
import { renderTaxaList } from "../../lib/search_taxa";
import { updateAppUrl } from "../../lib/utils";
import type {
  AppStoreType,
  NameOrderType,
  ObservationViewsType,
  PerPageTypes,
} from "../../types/app";

export async function updateComonNamesByLanguage(appStore: AppStoreType) {
  if (appStore.observationsApiParams.taxon_id === "0") return;

  let param = {
    locale: appStore.observationsApiParams.locale,
    id: appStore.observationsApiParams.taxon_id,
  } as any;
  let stringParam = new URLSearchParams(param).toString();

  let taxa = await getTaxa(stringParam);
  if (taxa) {
    taxa.forEach((taxon) => {
      let cachedTaxon = appStore.selectedTaxa.find((t) => t.id === taxon.id);
      if (cachedTaxon) {
        cachedTaxon.preferred_common_name = taxon.preferred_common_name;

        let { title, subtitle } = formatTaxonName(cachedTaxon, appStore);
        cachedTaxon.title = title;
        cachedTaxon.subtitle = subtitle;
      }
    });
  }
  appStore.selectedTaxa = appStore.selectedTaxa;
}

export function initSettings(appStore: AppStoreType) {
  let locale = appStore.observationsApiParams.locale;
  if (locale) {
    setSelectedOption(`#language-select [value='${locale}']`);
  }

  let nameOrder = appStore.viewMetadata.name_order;
  if (nameOrder) {
    setSelectedOption(`#name-order-select [value='${nameOrder}']`);
  }

  let perPageObservations =
    appStore.viewMetadata.observations_observations.perPage;
  if (perPageObservations) {
    setSelectedOption(
      `#per-page-observations [value='${perPageObservations}']`,
    );
  }

  let perPageSpecies = appStore.viewMetadata.observations_species.perPage;
  if (perPageSpecies) {
    setSelectedOption(`#per-page-species [value='${perPageSpecies}']`);
  }

  let perPageIdentifications =
    appStore.viewMetadata.identifications_identifications.perPage;
  if (perPageIdentifications) {
    setSelectedOption(
      `#per-page-identifications [value='${perPageIdentifications}']`,
    );
  }

  setDisplayField("media", appStore);
  setDisplayField("species_name", appStore);
  setDisplayField("observer", appStore);
  setDisplayField("media_counts", appStore);
  setDisplayField("quality_grade", appStore);
  setDisplayField("counts", appStore);
  setDisplayField("place_guess", appStore);
  setDisplayField("created_at", appStore);
  setDisplayField("updated_at", appStore);
  setDisplayField("time_observed_at", appStore);
  setDisplayField("annotations", appStore);
  setDisplayField("identifications", appStore);
  setDisplayField("ofvs", appStore);
}

function setDisplayField(field: string, appStore: AppStoreType) {
  let displayFields =
    appStore.viewMetadata.observations_observations.displayFields;
  if (!displayFields) return;

  let value = displayFields[field];
  if (value !== undefined) {
    setInputChecked(`#display_${field}`, value);
  }
}

export function perPageHandler(
  target: HTMLInputElement,
  currentView: ObservationViewsType,
  appStore: AppStoreType,
  type: PerPageTypes,
) {
  let targetObservationView = `observations_${type}` as ObservationViewsType;
  let targetIdentificationView =
    `identifications_${type}` as ObservationViewsType;

  // update viewMetadata
  if (validObservationsViews.includes(targetObservationView)) {
    // @ts-ignore
    appStore.viewMetadata[targetObservationView] = {
      ...appStore.viewMetadata[targetObservationView],
      perPage: Number(target.value),
    };
  }
  if (validIdentificationsViews.includes(targetIdentificationView)) {
    // @ts-ignore
    appStore.viewMetadata[targetIdentificationView] = {
      ...appStore.viewMetadata[targetIdentificationView],
      perPage: Number(target.value),
    };
  }

  // update resourceApiParams to change api call for currentView
  if (currentView === targetObservationView) {
    appStore.observationsApiParams = {
      ...appStore.observationsApiParams,
      per_page: Number(target.value),
    };
  } else if (currentView === targetIdentificationView) {
    appStore.identificationsApiParams = {
      ...appStore.identificationsApiParams,
      per_page: Number(target.value),
    };
  }

  // HACK: force proxy store to update
  appStore.viewMetadata = appStore.viewMetadata;

  // save page settings to database
  if (validObservationsViews.includes(targetObservationView)) {
    saveItem(viewAndPerPageDbKeyObject(targetObservationView), target.value);
  } else if (validIdentificationsViews.includes(targetIdentificationView)) {
    saveItem(viewAndPerPageDbKeyObject(targetIdentificationView), target.value);
  }

  updateAppUrl(window.location, appStore);

  if (
    currentView === targetObservationView ||
    currentView === targetIdentificationView
  ) {
    loggerEvent("[SettingsMenu dispatchEvent] perPageChanged");
    window.dispatchEvent(new Event("perPageChanged"));
  }
}

export function nameOrderHandler(
  target: HTMLInputElement,
  appStore: AppStoreType,
) {
  appStore.viewMetadata = {
    ...appStore.viewMetadata,
    name_order: target.value as NameOrderType,
  };

  saveItem(dbKeys.name_order, target.value);
  updateAppUrl(window.location, appStore);
  renderTaxaList(appStore);
  loggerEvent("[SettingsMenu dispatchEvent] nameOrderChanged");
  window.dispatchEvent(new Event("nameOrderChanged"));
}

export async function languageHandler(
  target: HTMLInputElement,
  appStore: AppStoreType,
) {
  appStore.observationsApiParams = {
    ...appStore.observationsApiParams,
    locale: target.value,
  };

  saveItem(dbKeys.locale, target.value);
  updateAppUrl(window.location, appStore);

  // make api call to get common names
  await updateComonNamesByLanguage(appStore);
  renderTaxaList(appStore);

  loggerEvent("[SettingsMenu dispatchEvent] localeChanged");
  window.dispatchEvent(new Event("localeChanged"));
}

export function displayFieldsHandler(
  target: HTMLInputElement,
  appStore: AppStoreType,
) {
  let field = target.id.replace("display_", "");

  if (appStore.viewMetadata.observations_observations.displayFields) {
    appStore.viewMetadata.observations_observations.displayFields[field] =
      target.checked;

    saveItem(dbKeys[target.id as keyof typeof dbKeys], target.checked);

    loggerEvent(
      "[SettingsMenu dispatchEvent] observationsDisplayFieldsChanged",
    );
    window.dispatchEvent(new Event("observationsDisplayFieldsChanged"));
  }
}
