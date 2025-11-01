import { formatTaxonName } from "../../lib/data_utils";
import { getTaxa } from "../../lib/inat_api";
import type { MapStore } from "../../types/app";

export async function updateComonNamesByLanguage(appStore: MapStore) {
  if (appStore.inatApiParams.taxon_id === "0") return;

  let param = {
    locale: appStore.inatApiParams.locale,
    id: appStore.inatApiParams.taxon_id,
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
