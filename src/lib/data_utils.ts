import type {
  NormalizediNatTaxon,
  iNatAutocompleteTaxaAPI,
  MapStore,
} from "../types/app";
import { addOverlayToLayerControl, getBoundingBoxValues } from "./map_utils.ts";
import { colorsSixTolBright, getColor } from "./map_colors_utils.ts";
import { displayJson } from "./utils.ts";
import { getiNatMapTiles } from "./inat_api.ts";

const speciesRanks = ["species", "hybrid", "subspecies", "variety", "form"];

export function formatTaxonName(
  item: NormalizediNatTaxon,
  inputValue: string,
  includeMatchedTerm = true,
) {
  let hasCommonName = true;
  let title = item.preferred_common_name;
  let titleAriaLabel = "taxon common name";
  let subtitle;
  let subtitleAriaLabel;

  if (title) {
    subtitle = item.name;
    subtitleAriaLabel = "taxon scientific name";
    if (
      includeMatchedTerm &&
      !title.toLowerCase().includes(inputValue.toLowerCase()) &&
      !subtitle.toLowerCase().includes(inputValue.toLowerCase())
    ) {
      title += ` (${item.matched_term})`;
    }
  } else {
    hasCommonName = false;
    title = item.name;
    titleAriaLabel = "taxon scientific name";
  }

  return { title, titleAriaLabel, subtitle, subtitleAriaLabel, hasCommonName };
}

export function renderAutocompleteTaxon(
  item: NormalizediNatTaxon,
  inputValue: string,
): string {
  let { title, titleAriaLabel, subtitle, subtitleAriaLabel, hasCommonName } =
    formatTaxonName(item, inputValue);

  let html = `
  <div class="taxa-ac-option">
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

export function taxonSelectedHandler(
  taxonObj: NormalizediNatTaxon,
  searchTerm: string,
  appStore: MapStore,
) {
  let map = appStore.map.map;
  let layerControl = appStore.map.layerControl;
  if (map == null) return;
  if (layerControl == null) return;

  let color = getColor(appStore, colorsSixTolBright);
  taxonObj.color = color;

  appStore.selectedTaxa.push(taxonObj);
  displayJson(appStore.selectedTaxa, appStore.displayJsonEl);
  renderTaxaList(appStore);

  let bbValues = getBoundingBoxValues(map.getBounds());

  // create params for the iNat map tiles API
  appStore.inatTilesParams = {
    ...appStore.inatTilesParams,
    ...bbValues,
    taxon_id: taxonObj.id,
    color: color,
  };

  // fetch iNaturalist map layers
  let { iNatGrid, iNatHeatmap, iNatTaxonRange, iNatPoint } = getiNatMapTiles(
    taxonObj.id,
    appStore.inatTilesParams,
  );

  let { title } = formatTaxonName(taxonObj, searchTerm, false);

  let iNatGridLayer = addOverlayToLayerControl(
    iNatGrid,
    map,
    layerControl,
    title,
    true,
  );
  let iNatPointLayer = addOverlayToLayerControl(
    iNatPoint,
    map,
    layerControl,
    title,
  );
  let iNatHeatmapLayer = addOverlayToLayerControl(
    iNatHeatmap,
    map,
    layerControl,
    title,
  );
  let iNatTaxonRangeLayer = addOverlayToLayerControl(
    iNatTaxonRange,
    map,
    layerControl,
    title,
  );

  // keep track of map layers so the app can delete them
  appStore.taxaMapLayers[taxonObj.id] = [
    iNatGridLayer,
    iNatPointLayer,
    iNatHeatmapLayer,
    iNatTaxonRangeLayer,
  ];
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

export function removeTaxon(taxonId: number, appStore: MapStore) {
  if (appStore.map.layerControl == null) return;

  appStore.selectedTaxa = appStore.selectedTaxa.filter(
    (taxon) => taxon.id !== taxonId,
  );
  displayJson(appStore.selectedTaxa, appStore.displayJsonEl);
  renderTaxaList(appStore);

  let mapLayers = appStore.taxaMapLayers[taxonId];
  let layerControl = appStore.map.layerControl;

  mapLayers.forEach((layer) => {
    // remove layer from layer control
    layerControl.removeLayer(layer);
    // remove layer from map
    layer.remove();
  });
}
