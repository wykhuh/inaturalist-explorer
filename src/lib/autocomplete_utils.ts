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
import {
  formatTaxonName,
  fetchiNatMapData,
  refreshiNatMapLayers,
} from "./data_utils.ts";
import { colorsSixTolBright, getColor } from "./map_colors_utils.ts";
import { getBoundingBox } from "./map_utils.ts";

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
): NormalizediNatTaxon[] {
  let taxa = response.results.map((result) => {
    return {
      name: result.name,
      default_photo: result.default_photo?.square_url,
      preferred_common_name: result.preferred_common_name,
      matched_term: result.matched_term,
      rank: result.rank,
      id: result.id,
    };
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
  let { title } = formatTaxonName(taxonObj, searchTerm, false);
  taxonObj.display_name = title;

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
  let bounds = getBoundingBox(selection.bounding_box);
  map.fitBounds(bounds);

  // draw boundaries of selected place
  let myStyle: any = {
    color: "red",
    fillColor: "none",
  };
  L.geoJSON(selection.geometry, myStyle).addTo(map);

  // get iNat map tiles for selected place
  // refreshiNatMapLayers(appStore, selection.id);

  for await (const taxon of appStore.selectedTaxa.length) {
    appStore.inatApiParams = {
      ...appStore.inatApiParams,
      taxon_id: taxon.id,
      color: taxon.color,
      place_id: selection.id,
    };

    await fetchiNatMapData(taxon, appStore);
  }
}
