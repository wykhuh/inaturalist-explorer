import autoComplete from "@tarekraafat/autocomplete.js";
import "./assets/autocomplete.css";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  getMapTiles,
  getiNatMapTiles,
  addLayerToMap,
  addOverlayToLayerControl,
  getBoundingBoxValues,
} from "./lib/map_utils";
import {
  processAutocompleteTaxa,
  renderAutocompleteTaxon,
  formatTaxonName,
} from "./lib/inat_utils";
import type { NormalizediNatTaxon, AutoCompleteEvent } from "./types.d.ts";
import { displayJson, renderTaxaList } from "./lib/utils.ts";
import { mapStore } from "./lib/store.ts";

let api = "https://api.inaturalist.org/v1/taxa/autocomplete?q=";

mapStore.displayJsonEl = document.getElementById("display-json");
mapStore.taxaListEl = document.getElementById("taxa-list-container");

// =====================
// taxa search
// =====================

const autoCompleteJS = new autoComplete({
  selector: "#inatTaxaAutoComplete",
  placeHolder: "Enter species name",
  threshold: 3,
  searchEngine: (query: string, record: NormalizediNatTaxon) => {
    return renderAutocompleteTaxon(record, query);
  },
  data: {
    src: async (query: string) => {
      let res = await fetch(api + query);
      let data = await res.json();
      return processAutocompleteTaxa(data);
    },
  },
  resultsList: {
    maxResults: 10,
  },
  events: {
    input: {
      selection: (event: AutoCompleteEvent) => {
        const selection = event.detail.selection.value;
        autoCompleteJS.input.value = selection.preferred_common_name;
      },
    },
  },
});

// =====================
// map
// =====================

let map = L.map("map", {
  center: [0, 0],
  zoom: 2,
  maxZoom: 19,
});
var layerControl = L.control.layers().addTo(map);

let { OpenStreetMap, OpenTopo } = getMapTiles();
addLayerToMap(OpenStreetMap, map, layerControl, true);
addLayerToMap(OpenTopo, map, layerControl);

document
  .querySelector("#inatTaxaAutoComplete")!
  .addEventListener("selection", function (event: any) {
    let selection = event.detail.selection.value;

    taxonSelectedHandler(selection, event.detail.query, map, layerControl);
  });

// =====================
// misc
// =====================

function taxonSelectedHandler(
  taxonObj: NormalizediNatTaxon,
  searchTerm: string,
  map: L.Map,
  layerControl: L.Control.Layers
) {
  mapStore.selectedTaxa.push(taxonObj);
  displayJson(mapStore.selectedTaxa, mapStore.displayJsonEl);
  renderTaxaList(mapStore, layerControl);

  // create iNaturalist map layers
  let bbValues = getBoundingBoxValues(map.getBounds());
  mapStore.inatTilesParams = {
    ...mapStore.inatTilesParams,
    ...bbValues,
    taxon_id: taxonObj.id,
  };
  let paramsString = new URLSearchParams(mapStore.inatTilesParams).toString();

  let { iNatGrid, iNatHeatmap, iNatTaxonRange, iNatPoint } = getiNatMapTiles(
    taxonObj.id,
    paramsString
  );

  let { title } = formatTaxonName(taxonObj, searchTerm, false);

  let iNatGridLayer = addOverlayToLayerControl(
    iNatGrid,
    map,
    layerControl,
    title,
    true
  );
  let iNatPointLayer = addOverlayToLayerControl(
    iNatPoint,
    map,
    layerControl,
    title
  );
  let iNatHeatmapLayer = addOverlayToLayerControl(
    iNatHeatmap,
    map,
    layerControl,
    title
  );
  let iNatTaxonRangeLayer = addOverlayToLayerControl(
    iNatTaxonRange,
    map,
    layerControl,
    title
  );

  mapStore.taxaMapLayers[taxonObj.id] = [
    iNatGridLayer,
    iNatPointLayer,
    iNatHeatmapLayer,
    iNatTaxonRangeLayer,
  ];
}
