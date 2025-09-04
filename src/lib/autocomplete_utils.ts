import L from "leaflet";

import type {
  NormalizediNatTaxon,
  NormalizediNatPlace,
  MapStore,
  CustomGeoJSON,
  PlaceTypesKey,
} from "../types/app";
import type {
  iNatAutocompleteTaxaAPI,
  iNatSearchAPI,
} from "../types/inat_api.d.ts";
import {
  formatTaxonName,
  fetchiNatMapDataForTaxon,
  removeOneTaxonFromMap,
  idStringAddId,
  removeAllTaxaFromStoreAndMap,
  getObservationsCountForTaxon,
} from "./data_utils.ts";
import { defaultColorScheme, getColor } from "./map_colors_utils.ts";
import { fitBoundsPlaces } from "./map_utils.ts";
import { placeTypes, speciesRanks } from "./inat_data.ts";
import { updateUrl } from "./utils.ts";

//=====================
// taxa search
// =====================

export function renderAutocompleteTaxon(
  item: NormalizediNatTaxon,
  inputValue: string,
): string {
  let { title, titleAriaLabel, subtitle, subtitleAriaLabel, hasCommonName } =
    formatTaxonName(item, inputValue);

  let html = `
  <div class="taxa-ac-option" data-testid="taxa-ac-option">
    <div class="thumbnail">`;

  if (item.default_photo) {
    html += `
      <img class="thumbnail" src="${item.default_photo}" alt="">`;
  }

  html += `
    </div>
    <div class="taxon-name">
      <span class="title" aria-label="${titleAriaLabel}">${title}</span>
      <span>`;
  if ((item.rank && !speciesRanks.includes(item.rank)) || !hasCommonName) {
    html += `
        <span class="rank" aria-label="taxon rank">${item.rank}</span>`;
  }
  if (hasCommonName) {
    html += `
        <span class="subtitle" aria-label="${subtitleAriaLabel}">${subtitle}</span>`;
  }
  html += `
      </span>
    </div>
  </div>`;

  return html;
}

export function processAutocompleteTaxa(
  response: iNatAutocompleteTaxaAPI,
  query: string,
): NormalizediNatTaxon[] {
  let taxa = response.results.map((result) => {
    let data: NormalizediNatTaxon = {
      name: result.name,
      default_photo: result.default_photo?.square_url,
      preferred_common_name: result.preferred_common_name,
      matched_term: result.matched_term,
      rank: result.rank,
      id: result.id,
    };
    let { title, subtitle } = formatTaxonName(data, query);
    data.title = title;
    data.subtitle = subtitle;

    return data;
  });

  return taxa;
}

// called by autocomplete search when an taxa option is selected
export async function taxonSelectedHandler(
  taxonObj: NormalizediNatTaxon,
  searchTerm: string,
  appStore: MapStore,
) {
  let map = appStore.map.map;
  let layerControl = appStore.map.layerControl;
  if (map == null) return;
  if (layerControl == null) return;

  // get color for taxon
  let color = getColor(appStore, defaultColorScheme);
  taxonObj.color = color;

  // remove all taxa if allTaxa is the current taxon
  if (appStore.inatApiParams.taxon_id === "0") {
    removeAllTaxaFromStoreAndMap(appStore);
  }

  // get display name for taxon
  let { title, subtitle } = formatTaxonName(taxonObj, searchTerm, false);
  taxonObj.display_name = title;
  taxonObj.title = title;
  taxonObj.subtitle = subtitle;

  // create params for the iNat map tiles API
  appStore.inatApiParams = {
    ...appStore.inatApiParams,
    taxon_id: taxonObj.id.toString(),
    colors: color,
  };

  await fetchiNatMapDataForTaxon(taxonObj, appStore);
  await getObservationsCountForTaxon(taxonObj, appStore);

  renderTaxaList(appStore);
  renderPlacesList(appStore);
  updateUrl(window.location, appStore);
}

export function renderTaxaList(appStore: MapStore) {
  if (!appStore.taxaListEl) return;

  appStore.taxaListEl.innerHTML = "";

  appStore.selectedTaxa.forEach((taxon) => {
    let templateEl = document.createElement("x-taxa-list-item");
    templateEl.dataset.taxon = JSON.stringify(taxon);
    appStore.taxaListEl!.appendChild(templateEl);
  });
}
// =====================
// places search
// =====================

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
  appStore.placesMapLayers = { [selection.id]: [layer as CustomGeoJSON] };

  // get iNat map tiles for selected place
  for await (const taxon of appStore.selectedTaxa) {
    // remove existing taxon layers from map
    removeOneTaxonFromMap(appStore, taxon.id);
    appStore.inatApiParams = {
      ...appStore.inatApiParams,
      taxon_id: taxon.id.toString(),
      colors: taxon.color,
      place_id: idStringAddId(selection.id, appStore.inatApiParams.place_id),
    };

    await fetchiNatMapDataForTaxon(taxon, appStore);
    await getObservationsCountForTaxon(taxon, appStore);

    renderTaxaList(appStore);
    renderPlacesList(appStore);
    fitBoundsPlaces(appStore);
  }

  // zoom to map to fit all selected places
  fitBoundsPlaces(appStore);
  updateUrl(window.location, appStore);
}

export function renderPlacesList(appStore: MapStore) {
  if (!appStore.placesListEl) return;
  appStore.placesListEl.innerHTML = "";

  appStore.selectedPlaces.forEach((place) => {
    let templateEl = document.createElement("x-places-list-item");
    templateEl.dataset.place = JSON.stringify({
      id: place.id,
      name: place.name,
      display_name: place.display_name,
    });
    appStore.placesListEl!.appendChild(templateEl);
  });
}
