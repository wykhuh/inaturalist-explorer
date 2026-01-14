import { viewAndPerPageDbKeyObject } from "../../data/app_data";
import { formatTaxonName } from "../../lib/data_utils";
import { getTaxa } from "../../lib/inat_api";
import { dbKeys, saveItem } from "../../lib/localStorage";
import { loggerEvent } from "../../lib/logger";
import { renderTaxaList } from "../../lib/search_taxa";
import { updateAppUrl } from "../../lib/utils";
import type {
  AppStoreType,
  NameOrderType,
  ObservationViewsType,
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

export function initSettings(
  appStore: AppStoreType,
  componentCtx: HTMLElement,
) {
  let locale = appStore.observationsApiParams.locale;
  if (locale) {
    let optionEl = componentCtx.querySelector<HTMLOptionElement>(
      `#language-select [value='${locale}']`,
    );
    if (optionEl) {
      optionEl.selected = true;
    }
  }

  let nameOrder = appStore.viewMetadata.name_order;
  if (nameOrder) {
    let optionEl = componentCtx.querySelector<HTMLOptionElement>(
      `#name-order-select [value='${nameOrder}']`,
    );
    if (optionEl) {
      optionEl.selected = true;
    }
  }

  let perPageObservations =
    appStore.viewMetadata.observations_observations.perPage;
  if (perPageObservations) {
    let optionEl = componentCtx.querySelector<HTMLOptionElement>(
      `#per-page-observations [value='${perPageObservations}']`,
    );
    if (optionEl) {
      optionEl.selected = true;
    }
  }
}

export function perPageHandler(
  target: HTMLInputElement,
  view: ObservationViewsType,
  appStore: AppStoreType,
  type: string,
) {
  let observationView = `observations_${type}` as ObservationViewsType;

  let identificationView = `identifications_${type}` as ObservationViewsType;

  if (type !== "identifications") {
    appStore.viewMetadata[observationView] = {
      ...appStore.viewMetadata[observationView],
      perPage: Number(target.value),
    };
  }
  appStore.viewMetadata[identificationView] = {
    ...appStore.viewMetadata[identificationView],
    perPage: Number(target.value),
  };

  if (view === observationView && type !== "identifications") {
    appStore.observationsApiParams = {
      ...appStore.observationsApiParams,
      per_page: Number(target.value),
    };
  } else if (view === identificationView) {
    appStore.identificationsApiParams = {
      ...appStore.identificationsApiParams,
      per_page: Number(target.value),
    };
  }

  // HACK: force proxy store to update
  appStore.viewMetadata = appStore.viewMetadata;

  saveItem(viewAndPerPageDbKeyObject(identificationView), target.value);
  updateAppUrl(window.location, appStore);

  if (view === observationView || view === identificationView) {
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
