import type {
  NormalizediNatPlaceType,
  AppStoreType,
  DataComponentType,
} from "../types/app.d.ts";
import {
  addValueToCommaSeparatedString,
  getResourceApiParams,
  isObservationsCheck,
  removeIdfromInatApiParams,
  resetPageNumber,
} from "./data_utils.ts";
import { updateCountForAll } from "./count_utils.ts";
import {
  renderSelectedResources,
  showHideHeader,
  updateTilesForSelectedTaxa,
} from "./search_utils.ts";
import { setupPlacesSearch } from "./search_places.ts";

export function setupWithoutPlacesSearch(selector: string) {
  const autoCompletePlacesJS = setupPlacesSearch(selector);

  return autoCompletePlacesJS;
}

// called by autocomplete search when an place option is selected
export async function withoutPlaceSelectedHandler(
  selection: NormalizediNatPlaceType,
  _query: string,
  appStore: AppStoreType,
) {
  let isObservations = isObservationsCheck(appStore);

  // save place to store
  let place = {
    id: selection.id,
    name: selection.name,
    display_name: selection.display_name,
    slug: selection.slug,
  };
  appStore.selectedWithoutPlaces = [...appStore.selectedWithoutPlaces, place];
  resetPageNumber(appStore);

  let resourceApiParams = getResourceApiParams(isObservations);
  appStore[resourceApiParams] = {
    ...appStore[resourceApiParams],
    not_in_place: addValueToCommaSeparatedString(
      place.id,
      appStore[resourceApiParams].not_in_place,
    ),
  };

  updateTilesForSelectedTaxa(appStore);
  await updateCountForAll("selectedWithoutPlaces", appStore);
  renderSelectedResources(appStore, true);
}

export function showHideWithoutPlacesHeader() {
  showHideHeader(
    "#sidebar-menu .without-places-heading",
    "selectedWithoutPlaces",
  );
}

export function renderWithoutPlacesList(appStore: AppStoreType) {
  let listEl = document.querySelector("#selected-without-places-list");
  if (!listEl) return;

  listEl.innerHTML = "";
  appStore.selectedWithoutPlaces.forEach((place) => {
    let templateEl = document.createElement(
      "places-list-item",
    ) as DataComponentType;
    templateEl.data = place;
    templateEl.type = "withoutPlace";

    listEl.appendChild(templateEl);
  });
}

// called when user deletes a place
export async function removeWithoutPlace(
  placeId: number,
  appStore: AppStoreType,
) {
  if (!appStore.selectedWithoutPlaces) return;

  // remove place
  removeOneWithoutPlaceFromStore(appStore, placeId);
  updateTilesForSelectedTaxa(appStore);
  await updateCountForAll("all", appStore);
  renderSelectedResources(appStore, true);
}

export function removeOneWithoutPlaceFromStore(
  appStore: AppStoreType,
  placeId: number,
) {
  appStore.selectedWithoutPlaces = appStore.selectedWithoutPlaces.filter(
    (place) => place.id !== placeId,
  );
  resetPageNumber(appStore);
  removeIdfromInatApiParams(appStore, "selectedWithoutPlaces", placeId);
}
