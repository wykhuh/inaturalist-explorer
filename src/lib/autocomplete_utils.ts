import L from "leaflet";

import type {
  NormalizediNatTaxon,
  NormalizediNatPlace,
  MapStore,
} from "../types/app";
import type {
  iNatAutocompleteTaxaAPI,
  iNatSearchAPI,
} from "../types/inat_api.d.ts";
import { formatTaxonName, fetchiNatMapData } from "./data_utils.ts";
import { colorsSixTolBright, getColor } from "./map_colors_utils.ts";
import { getBoundingBox } from "./map_utils.ts";
import { lifeTaxon } from "./inat_api.ts";

// =====================
// taxa search
// =====================
const speciesRanks = ["species", "hybrid", "subspecies", "variety", "form"];

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
  if (!speciesRanks.includes(item.rank) || !hasCommonName) {
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

// called by autocomplete search when an option is selected
export async function taxonSelectedHandler(
  taxonObj: NormalizediNatTaxon,
  searchTerm: string,
  appStore: MapStore,
) {
  let map = appStore.map.map;
  let layerControl = appStore.map.layerControl;
  if (map == null) return;
  if (layerControl == null) return;
  // console.log(">> taxonSelectedHandler");

  // get color for taxon
  let color = getColor(appStore, colorsSixTolBright);
  taxonObj.color = color;

  // get display name for taxon
  let { title, subtitle } = formatTaxonName(taxonObj, searchTerm, false);
  taxonObj.display_name = title;
  taxonObj.title = title;
  taxonObj.subtitle = subtitle;

  // create params for the iNat map tiles API
  appStore.inatApiParams = {
    ...appStore.inatApiParams,
    taxon_id: taxonObj.id,
    color: color,
    spam: false,
    verifiable: true,
  };

  await fetchiNatMapData(taxonObj, appStore);
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
    return {
      name: item.record.name,
      display_name: item.record.display_name,
      geometry: item.record.geometry_geojson,
      bounding_box: item.record.bounding_box_geojson.coordinates[0],
      id: item.record.id,
    };
  });
}

export function renderAutocompletePlace(item: NormalizediNatPlace): string {
  let html = `
  <div class="places-ac-option" data-testid="places-ac-option">
    <div class="place-name">
    ${item.display_name}
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

  console.log("placeSelectedHandler");

  // zoom to map using bounding box
  if (selection.bounding_box) {
    let bounds = getBoundingBox(selection.bounding_box);
    map.fitBounds(bounds);
  }

  // draw boundaries of selected place
  let options: any = {
    color: "red",
    fillColor: "none",
  };
  let layer = L.geoJSON(selection.geometry, options).addTo(map);

  // remove selected place layer from map
  if (appStore.placesMapLayers) {
    appStore.placesMapLayers.removeFrom(map);
  }

  // save place to store
  appStore.selectedPlaces = {
    id: selection.id,
    name: selection.name,
    display_name: selection.display_name,
  };
  appStore.placesMapLayers = layer;

  // get iNat map tiles for selected place

  let taxa =
    appStore.selectedTaxa.length > 0 ? appStore.selectedTaxa : [lifeTaxon];
  for await (const taxon of taxa) {
    appStore.inatApiParams = {
      ...appStore.inatApiParams,
      taxon_id: taxon.id,
      color: taxon.color,
      place_id: selection.id,
    };

    await fetchiNatMapData(taxon, appStore);
  }
}

export function renderPlacesList(appStore: MapStore) {
  if (!appStore.placesListEl) return;

  appStore.placesListEl.innerHTML = "";
  if (!appStore.selectedPlaces) return;

  let templateEl = document.createElement("x-places-list-item");
  templateEl.dataset.place = JSON.stringify({
    id: appStore.selectedPlaces.id,
    name: appStore.selectedPlaces.name,
    display_name: appStore.selectedPlaces.display_name,
  });
  appStore.placesListEl.appendChild(templateEl);
}
