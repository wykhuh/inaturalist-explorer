import autoComplete from "@tarekraafat/autocomplete.js";
import L from "leaflet";

import type {
  AutoCompleteEvent,
  NormalizediNatPlace,
  MapStore,
  CustomGeoJSON,
  PlaceTypesKey,
} from "../types/app.d.ts";
import { autocomplete_places_api } from "../lib/inat_api.ts";
import type { iNatSearchAPI } from "../types/inat_api";
import { loggerUrl } from "../lib/logger.ts";

import {
  fetchiNatMapDataForTaxon,
  removeOneTaxonFromMap,
  addIdToCommaSeparatedString,
  getObservationsCountForTaxon,
  removeOnePlaceFromStoreAndMap,
} from "./data_utils.ts";
import { fitBoundsPlaces } from "./map_utils.ts";
import { placeTypes } from "../data/inat_data.ts";
import { updateAppUrl } from "./utils.ts";
import { renderTaxaList } from "./search_taxa.ts";

export function setupPlacesSearch(selector: string) {
  const autoCompletePlacesJS = new autoComplete({
    autocomplete: "off",
    selector: selector,
    placeHolder: "Enter place name",
    threshold: 2,
    searchEngine: (_query: string, record: NormalizediNatPlace) => {
      return renderAutocompletePlace(record);
    },
    data: {
      src: async (query: string) => {
        try {
          let url = `${autocomplete_places_api}&per_page=50&q=${query}`;
          loggerUrl(url);
          let res = await fetch(url);
          let data = (await res.json()) as iNatSearchAPI;
          return processAutocompletePlaces(data);
        } catch (error) {
          console.error("setupPlacesSearch ERROR:", error);
        }
      },
    },
    resultsList: {
      maxResults: 50,
    },
    events: {
      input: {
        selection: (event: AutoCompleteEvent) => {
          const selection = event.detail.selection.value as NormalizediNatPlace;
          autoCompletePlacesJS.input.value = selection.display_name;
        },
      },
    },
  });

  return autoCompletePlacesJS;
}

export function processAutocompletePlaces(
  data: iNatSearchAPI,
): NormalizediNatPlace[] {
  return data.results.map((item) => {
    let typeName;
    if (item.record.place_type) {
      typeName = placeTypes[item.record.place_type.toString() as PlaceTypesKey];
    }
    return {
      name: item.record.name,
      display_name: item.record.display_name,
      geometry: item.record.geometry_geojson as any,
      bounding_box: item.record.bounding_box_geojson,
      id: item.record.id,
      place_type_name: typeName,
    };
  });
}

export function renderAutocompletePlace(item: NormalizediNatPlace): string {
  let html = `
  <div class="places-ac-option" data-testid="places-ac-option">
    <div class="place-name">
    ${item.display_name}`;
  if (item.place_type_name) {
    html += ` <span class="place-type">(${item.place_type_name})</span>`;
  }
  html += `
    </div>
  </div>`;

  return html;
}

// called by autocomplete search when an place option is selected
export async function placeSelectedHandler(
  selection: NormalizediNatPlace,
  _query: string,
  appStore: MapStore,
) {
  let map = appStore.map.map;
  if (!map) return;

  // draw boundaries of selected place
  let options: any = {
    color: "red",
    fillColor: "none",
    layer_description: `place layer: ${selection.name}, ${selection.id}`,
  };
  let layer = L.geoJSON(selection.geometry as any, options);
  layer.addTo(map);

  // remove selected place layer from map
  if (appStore.placesMapLayers) {
    let layers = appStore.placesMapLayers[selection.id.toString()];
    if (layers) {
      layers.forEach((layer) => {
        layer.removeFrom(map);
      });
    }
  }

  // remove refresh bound box from map
  if (appStore.refreshMap.layer) {
    appStore.refreshMap.layer.removeFrom(map);
    appStore.refreshMap.layer = null;
    delete appStore.inatApiParams.swlat;
    delete appStore.inatApiParams.swlng;
    delete appStore.inatApiParams.nelat;
    delete appStore.inatApiParams.nelng;
    appStore.selectedPlaces = appStore.selectedPlaces.filter((p) => p.id !== 0);
    delete appStore.placesMapLayers["0"];
  }

  // save place to store
  appStore.selectedPlaces = [
    ...appStore.selectedPlaces,
    {
      id: selection.id,
      name: selection.name,
      display_name: selection.display_name,
      bounding_box: selection.bounding_box,
    },
  ];
  appStore.placesMapLayers = {
    ...appStore.placesMapLayers,
    [selection.id]: [layer as CustomGeoJSON],
  };

  // get iNat map tiles for selected place
  for await (const taxon of appStore.selectedTaxa) {
    // remove existing taxon layers from map
    removeOneTaxonFromMap(appStore, taxon.id);
    appStore.inatApiParams = {
      ...appStore.inatApiParams,
      taxon_id: taxon.id.toString(),
      colors: taxon.color,
      place_id: addIdToCommaSeparatedString(
        selection.id,
        appStore.inatApiParams.place_id,
      ),
    };

    await fetchiNatMapDataForTaxon(taxon, appStore);
    await getObservationsCountForTaxon(taxon, appStore);
  }

  // zoom to map to fit all selected places
  renderTaxaList(appStore);
  renderPlacesList(appStore);
  fitBoundsPlaces(appStore);
  updateAppUrl(window.location, appStore);
}

export function renderPlacesList(appStore: MapStore) {
  let listEl = document.querySelector("#selected-places-list");
  if (!listEl) return;

  listEl.innerHTML = "";
  appStore.selectedPlaces.forEach((place) => {
    let templateEl = document.createElement("x-places-list-item");
    templateEl.dataset.place = JSON.stringify({
      id: place.id,
      name: place.name,
      display_name: place.display_name,
    });
    listEl.appendChild(templateEl);
  });
}

// called when user deletes a place
export async function removePlace(placeId: number, appStore: MapStore) {
  if (!appStore.selectedPlaces) return;

  // remove place
  await removeOnePlaceFromStoreAndMap(appStore, placeId);

  // remove existing taxa tiles, and refetch taxa tiles
  for await (const taxon of appStore.selectedTaxa) {
    removeOneTaxonFromMap(appStore, taxon.id);

    appStore.inatApiParams = {
      ...appStore.inatApiParams,
      taxon_id: taxon.id.toString(),
      colors: taxon.color,
    };
    await fetchiNatMapDataForTaxon(taxon, appStore);
    await getObservationsCountForTaxon(taxon, appStore);
  }

  renderTaxaList(appStore);
  renderPlacesList(appStore);
  updateAppUrl(window.location, appStore);
}
