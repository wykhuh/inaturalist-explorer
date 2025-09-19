import type { MapStore } from "../types/app";
import {
  fetchiNatMapDataForTaxon,
  getObservationsCountForTaxon,
  removeOneTaxonFromMap,
} from "./data_utils";

export async function updateTilesAndCountForAllTaxa(appStore: MapStore) {
  for await (const taxon of appStore.selectedTaxa) {
    // remove existing taxon layers from map
    removeOneTaxonFromMap(appStore, taxon.id);

    appStore.inatApiParams = {
      ...appStore.inatApiParams,
      taxon_id: taxon.id.toString(),
      colors: taxon.color,
    };

    // get new iNat map tiles
    await fetchiNatMapDataForTaxon(taxon, appStore);
    // fetch new counts from api
    await getObservationsCountForTaxon(taxon, appStore);
  }
}

export async function updateCountForAllTaxa(appStore: MapStore) {
  for await (const taxon of appStore.selectedTaxa) {
    appStore.inatApiParams = {
      ...appStore.inatApiParams,
      taxon_id: taxon.id.toString(),
      colors: taxon.color,
    };

    // fetch new counts from api
    await getObservationsCountForTaxon(taxon, appStore);
  }
}

export async function updateTilesForAllTaxa(appStore: MapStore) {
  for await (const taxon of appStore.selectedTaxa) {
    // remove existing taxon layers from map
    removeOneTaxonFromMap(appStore, taxon.id);

    appStore.inatApiParams = {
      ...appStore.inatApiParams,
      taxon_id: taxon.id.toString(),
      colors: taxon.color,
    };

    // get new iNat map tiles
    await fetchiNatMapDataForTaxon(taxon, appStore);
  }
}
