import autoComplete from "@tarekraafat/autocomplete.js";
import "./assets/autocomplete.css";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  getMapTiles,
  addLayerToMap,
} from "./lib/map_utils";
import {
  processAutocompleteTaxa,
  renderAutocompleteTaxon,
} from "./lib/inat_utils";
import type { NormalizediNatTaxon } from "./lib/inat_utils";

let api = "https://api.inaturalist.org/v1/taxa/autocomplete?q=";

let selectedTaxa = [];
let currentTaxon = {};

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

var map = L.map("map", {
  center: [0, 0],
  zoom: 2,
  maxZoom: 19,
});

const osmLayer = addLayerToMap(OpenStreetMap, map);
const openTopoLayer = addLayerToMap(OpenTopo, map);

var baseMaps = {
  OpenStreetMap: osmLayer,
  OpenTopo: openTopoLayer,
};

var layerControl = L.control.layers(baseMaps).addTo(map);

document
  .querySelector("#inatTaxaAutoComplete")
  .addEventListener("selection", function (event) {
    let selection = event.detail.selection.value;
    selectedTaxa.push(selection);
    currentTaxon = selection;
    console.log(">>>", selection);
  });
