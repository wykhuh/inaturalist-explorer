import autoComplete from "@tarekraafat/autocomplete.js";
import "./assets/autocomplete.css";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import "./components/TaxaListItem/main.ts";
import { getMapTiles, addLayerToMap } from "./lib/map_utils.ts";
import {
  processAutocompleteTaxa,
  renderAutocompleteTaxon,
  taxonSelectedHandler,
} from "./lib/data_utils.ts";
import type { NormalizediNatTaxon, AutoCompleteEvent } from "./types/app.d.ts";
import { displayJson } from "./lib/utils.ts";
import { mapStore } from "./lib/store.ts";

let api = "https://api.inaturalist.org/v1/taxa/autocomplete?q=";

window.app = { store: mapStore };
window.app.store.displayJsonEl = document.getElementById("display-json");
window.app.store.taxaListEl = document.getElementById("taxa-list-container");

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

document
  .querySelector("#inatTaxaAutoComplete")!
  .addEventListener("selection", function (event: any) {
    let selection = event.detail.selection.value;
    taxonSelectedHandler(selection, event.detail.query, window.app.store);
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

window.app.store.map.map = map;
window.app.store.map.layerControl = layerControl;

// =====================
// misc
// =====================

