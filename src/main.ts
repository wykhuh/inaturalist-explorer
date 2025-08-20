import autoComplete from "@tarekraafat/autocomplete.js";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import "./assets/leaflet.css";
import "./assets/autocomplete.css";
import "./components/TaxaListItem/component.ts";
import { getMapTiles, addLayerToMap } from "./lib/map_utils.ts";
import { taxonSelectedHandler } from "./lib/data_utils.ts";
import type { NormalizediNatTaxon, AutoCompleteEvent } from "./types/app.d.ts";
// import { displayJson } from "./lib/utils.ts";
import { mapStore } from "./lib/store.ts";
import {
  renderAutocompleteTaxon,
  processAutocompleteTaxa,
} from "./lib/autocomplete_utils.ts";

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
  .addEventListener("selection", async function (event: any) {
    let selection = event.detail.selection.value;
    await taxonSelectedHandler(selection, event.detail.query, window.app.store);
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
// var layerControl = L.control.layers({}, {}, { collapsed: false }).addTo(map);

let { OpenStreetMap, OpenTopo } = getMapTiles();
addLayerToMap(OpenStreetMap, map, layerControl, true);
addLayerToMap(OpenTopo, map, layerControl);

window.app.store.map.map = map;
window.app.store.map.layerControl = layerControl;

// =====================
// misc
// =====================

// =====================
// dev
// =====================

// let temp: NormalizediNatTaxon[] = [
//   {
//     name: "Lobatae",
//     default_photo:
//       "https://inaturalist-open-data.s3.amazonaws.com/photos/149586607/square.jpg",
//     preferred_common_name: "red oaks",
//     matched_term: "red oaks",
//     rank: "section",
//     id: 861036,
//   },
//   {
//     name: "Turdus migratorius",
//     default_photo:
//       "https://inaturalist-open-data.s3.amazonaws.com/photos/34859026/square.jpg",
//     preferred_common_name: "American Robin",
//     matched_term: "American Robin",
//     rank: "species",
//     id: 12727,
//   },
//   {
//     name: "Cardinalis cardinalis",
//     default_photo:
//       "https://inaturalist-open-data.s3.amazonaws.com/photos/189434971/square.jpg",
//     preferred_common_name: "Northern Cardinal",
//     matched_term: "Northern Cardinal",
//     rank: "species",
//     id: 9083,
//   },
// ];

// (async () => {
//   await taxonSelectedHandler(temp[0], "red", window.app.store);
//   await taxonSelectedHandler(temp[1], "red", window.app.store);
//   await taxonSelectedHandler(temp[2], "red", window.app.store);
// })();

// displayJson(window.app.store.selectedTaxa, window.app.store.displayJsonEl);
