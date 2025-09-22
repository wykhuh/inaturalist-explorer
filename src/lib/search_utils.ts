import type { MapStore } from "../types/app";
import {
  fetchiNatMapDataForTaxon,
  getObservationsCountForPlace,
  getObservationsCountForTaxon,
  removeOneTaxonFromMap,
} from "./data_utils";

export async function updateTilesAndCountForAllTaxa(appStore: MapStore) {
  for await (const taxon of appStore.selectedTaxa) {
    // remove existing taxon layers from map
    removeOneTaxonFromMap(appStore, taxon.id);

    let paramsTemp = {
      ...appStore.inatApiParams,
      taxon_id: taxon.id.toString(),
      colors: taxon.color,
    };

    // get new iNat map tiles
    await fetchiNatMapDataForTaxon(taxon, appStore, paramsTemp);
    // fetch new counts from api
    await getObservationsCountForTaxon(taxon, appStore, paramsTemp);
  }
}

export async function updateCountForAllTaxa(appStore: MapStore) {
  for await (const taxon of appStore.selectedTaxa) {
    let paramsTemp = {
      ...appStore.inatApiParams,
      taxon_id: taxon.id.toString(),
    };
    await getObservationsCountForTaxon(taxon, appStore, paramsTemp);
  }
}

export async function updateCountForAllPlaces(appStore: MapStore) {
  for await (const place of appStore.selectedPlaces) {
    let paramsTemp = {
      ...appStore.inatApiParams,
      place_id: place.id.toString(),
    };
    await getObservationsCountForPlace(place, appStore, paramsTemp);
  }
}

export async function updateTilesForAllTaxa(appStore: MapStore) {
  for await (const taxon of appStore.selectedTaxa) {
    // remove existing taxon layers from map
    removeOneTaxonFromMap(appStore, taxon.id);

    let paramsTemp = {
      ...appStore.inatApiParams,
      taxon_id: taxon.id.toString(),
      colors: taxon.color,
    };

    // get new iNat map tiles
    await fetchiNatMapDataForTaxon(taxon, appStore, paramsTemp);
  }
}
