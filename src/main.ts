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
import type { NormalizediNatTaxon } from "./lib/inat_utils";

let api = "https://api.inaturalist.org/v1/taxa/autocomplete?q=";

let selectedTaxa = [];
let currentTaxon = {};
let inatTilesParams = {};

const autoCompleteJS = new autoComplete({
  selector: "#inatTaxaAutoComplete",
  placeHolder: "Search...",
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
      selection: (event) => {
        const selection = event.detail.selection.value;
        autoCompleteJS.input.value = selection.preferred_common_name;
      },
    },
  },
});

let { OpenStreetMap, OpenTopo } = getMapTiles();

let map = L.map("map", {
  center: [0, 0],
  zoom: 2,
  maxZoom: 19,
});
var layerControl = L.control.layers().addTo(map);

addLayerToMap(OpenStreetMap, map, layerControl, true);
addLayerToMap(OpenTopo, map, layerControl);

document
  .querySelector("#inatTaxaAutoComplete")
  .addEventListener("selection", function (event) {
    let selection = event.detail.selection.value;

    let bbValues = getBoundingBoxValues(map.getBounds());
    inatTilesParams = {
      ...inatTilesParams,
      ...bbValues,
      taxon_id: selection.id,
    };
    let paramsString = new URLSearchParams(inatTilesParams).toString();

    let { iNatGrid, iNatHeatmap, iNatTaxonRange, iNatPoint } = getiNatMapTiles(
      selection.id,
      paramsString
    );

    let { title } = formatTaxonName(selection, event.detail.query, false);

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
  });
