import { formatTaxonName } from "../../lib/data_utils";
import { getTaxa } from "../../lib/inat_api";
import type { AppStoreType } from "../../types/app";

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
}
