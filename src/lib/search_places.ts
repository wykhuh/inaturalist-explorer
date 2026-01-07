import autoComplete from "@tarekraafat/autocomplete.js";

import type {
  AutoCompleteEventType,
  NormalizediNatPlaceType,
  AppStoreType,
  CustomGeoJSONType,
  PlaceTypesKey,
} from "../types/app.d.ts";
import { autocomplete_places_api } from "../lib/inat_api.ts";
import type { iNatSearchAPI } from "../types/inat_api";
import { loggerUrl } from "../lib/logger.ts";

import {
  addValueToCommaSeparatedString,
  getResourceApiParams,
  isIdentificationsCheck,
  isObservationsCheck,
  removeIdfromInatApiParams,
  renderResourceGeometryLayer,
  resetPageNumber,
} from "./data_utils.ts";
import { updateCountForAll, updateCountForOne } from "./count_utils.ts";
import { fitBoundsPlaces } from "./map_utils.ts";
import { placeTypes } from "../data/inat_data.ts";
import {
  updateTilesForSelectedTaxa,
  renderSelectedResources,
  showHideHeader,
} from "./search_utils.ts";

export function setupPlacesSearch(selector: string) {
  const autoCompletePlacesJS = new autoComplete({
    autocomplete: "off",
    selector: selector,
    placeHolder: "Enter place name",
    threshold: 2,
    searchEngine: (_query: string, record: NormalizediNatPlaceType) => {
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
        selection: (event: AutoCompleteEventType) => {
          const selection = event.detail.selection
            .value as NormalizediNatPlaceType;
          autoCompletePlacesJS.input.value = selection.display_name;
        },
      },
    },
  });

  return autoCompletePlacesJS;
}

export function processAutocompletePlaces(
  data: iNatSearchAPI,
): NormalizediNatPlaceType[] {
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

export function renderAutocompletePlace(item: NormalizediNatPlaceType): string {
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
  selection: NormalizediNatPlaceType,
  _query: string,
  appStore: AppStoreType,
) {
  let isObservations = isObservationsCheck(appStore);

  let map = appStore.map.map;
  let layer;
  if (map) {
    // draw boundaries of selected place
    layer = renderResourceGeometryLayer(selection, map, "place layer");

    // remove selected place layer from map
    if (appStore.placesMapLayers) {
      let layers = appStore.placesMapLayers[selection.id.toString()];
      if (layers) {
        layers.forEach((layer) => {
          layer.removeFrom(map);
        });
      }
    }
  }

  // remove refresh bound box from map
  if (appStore.refreshMap.layer) {
    if (map) {
      appStore.refreshMap.layer.removeFrom(map);
      appStore.refreshMap.layer = null;
    }
    if (isObservations) {
      delete appStore.observationsApiParams.swlat;
      delete appStore.observationsApiParams.swlng;
      delete appStore.observationsApiParams.nelat;
      delete appStore.observationsApiParams.nelng;
    }
    appStore.selectedPlaces = appStore.selectedPlaces.filter((p) => p.id !== 0);
    delete appStore.placesMapLayers["0"];
  }

  // save place to store
  let place = {
    id: selection.id,
    name: selection.name,
    display_name: selection.display_name,
    bounding_box: selection.bounding_box,
    geometry: selection.geometry,
  };

  let resourceApiParams = getResourceApiParams(isObservations);
  appStore.selectedPlaces = [...appStore.selectedPlaces, place];
  resetPageNumber(appStore);
  appStore[resourceApiParams] = {
    ...appStore[resourceApiParams],
    place_id: addValueToCommaSeparatedString(
      place.id,
      appStore[resourceApiParams].place_id,
    ),
  };

  if (map && layer) {
    appStore.placesMapLayers = {
      ...appStore.placesMapLayers,
      [selection.id]: [layer as CustomGeoJSONType],
    };
  }

  let paramsTemp = {
    ...appStore[resourceApiParams],
    place_id: place.id.toString(),
  };
  await updateCountForOne(place, "selectedPlaces", appStore, paramsTemp);
  await updateTilesForSelectedTaxa(appStore);
  await updateCountForAll("selectedPlaces", appStore);

  // zoom to map to fit all selected places
  if (map) {
    fitBoundsPlaces(appStore);
  }
  renderSelectedResources(appStore, true);
}

export function showHidePlacesHeader() {
  showHideHeader("#sidebar-menu .places-heading", "selectedPlaces");
}

export function renderPlacesList(appStore: AppStoreType) {
  let listEl = document.querySelector("#selected-places-list");
  if (!listEl) return;
  let isIdentifications = isIdentificationsCheck(appStore);

  listEl.innerHTML = "";
  appStore.selectedPlaces.forEach((place) => {
    if (isIdentifications && place.id === 0) {
      return;
    }

    let templateEl = document.createElement("places-list-item");
    templateEl.dataset.place = JSON.stringify({
      id: place.id,
      name: place.name,
      display_name: place.display_name,
      observations_count: place.observations_count,
      identifications_count: place.identifications_count,
    });
    listEl.appendChild(templateEl);
  });
}

// called when user deletes a place
export async function removePlace(placeId: number, appStore: AppStoreType) {
  if (!appStore.selectedPlaces) return;

  // remove place
  removeOnePlaceFromMap(appStore, placeId);
  await removeOnePlaceFromStore(appStore, placeId);

  // remove existing taxa tiles, and refetch taxa tiles
  await updateTilesForSelectedTaxa(appStore);
  await updateCountForAll("selectedPlaces", appStore);

  renderSelectedResources(appStore, true);
}

export async function removeOnePlaceFromStore(
  appStore: AppStoreType,
  placeId: number,
) {
  appStore.selectedPlaces = appStore.selectedPlaces.filter(
    (place) => place.id !== placeId,
  );
  resetPageNumber(appStore);

  // update observationsApiParams for bounding box
  if (placeId === 0) {
    delete appStore.observationsApiParams.nelat;
    delete appStore.observationsApiParams.nelng;
    delete appStore.observationsApiParams.swlat;
    delete appStore.observationsApiParams.swlng;
    // update observationsApiParams for places
  } else {
    removeIdfromInatApiParams(appStore, "selectedPlaces", placeId);
  }
}

export function removeOnePlaceFromMap(appStore: AppStoreType, placeId: number) {
  if (!appStore.placesMapLayers) return;

  let mapLayers = appStore.placesMapLayers[placeId];
  if (!mapLayers) return;

  mapLayers.forEach((layer) => {
    layer.remove();
  });

  delete appStore.placesMapLayers[placeId];
}
