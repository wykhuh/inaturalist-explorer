import type {
  NormalizediNatTaxon,
  iNatAutocompleteTaxaAPI,
  MapStore,
} from "../types/app";
import { addOverlayToMap } from "./map_utils.ts";
import { colorsSixTolBright, getColor } from "./map_colors_utils.ts";
// import { displayJson } from "./utils.ts";
import { getiNatMapTiles, getiNatObservationsTotal } from "./inat_api.ts";

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
  let color = getColor(appStore, colorsSixTolBright);
  taxonObj.color = color;

  // create params for the iNat map tiles API
  appStore.inatApiParams = {
    ...appStore.inatApiParams,
    taxon_id: taxonObj.id,
    color: color,
    spam: false,
    verifiable: true,
  };

  // get observations count
  let count = await getiNatObservationsTotal(appStore.inatApiParams);
  taxonObj.observations_count = count;

  appStore.selectedTaxa.push(taxonObj);
  // displayJson(appStore.selectedTaxa, appStore.displayJsonEl);
  renderTaxaList(appStore);

  // fetch iNaturalist map layers
  let { iNatGrid, iNatHeatmap, iNatTaxonRange, iNatPoint } = getiNatMapTiles(
    taxonObj.id,
    appStore.inatApiParams,
  );

  let { title } = formatTaxonName(taxonObj, searchTerm, false);
  let iNatGridLayer = addOverlayToMap(iNatGrid, map, layerControl, title, true);
  let iNatPointLayer = addOverlayToMap(iNatPoint, map, layerControl, title);
  let iNatHeatmapLayer = addOverlayToMap(iNatHeatmap, map, layerControl, title);
  let iNatTaxonRangeLayer = addOverlayToMap(
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
  // displayJson(appStore.selectedTaxa, appStore.displayJsonEl);
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
