import autoComplete from "@tarekraafat/autocomplete.js";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import "./assets/leaflet.css";
import "./assets/autocomplete.css";
import "./components/TaxaListItem/component.ts";
import {
  getMapTiles,
  addLayerToMap,
  createRefreshMapButton,
} from "./lib/map_utils.ts";
import {} from "./lib/autocomplete_utils.ts";
import type {
  NormalizediNatTaxon,
  AutoCompleteEvent,
  NormalizediNatPlace,
} from "./types/app.d.ts";
import mapStore from "./lib/store.ts";
import {
  processAutocompleteTaxa,
  renderAutocompleteTaxon,
  taxonSelectedHandler,
  processAutocompletePlaces,
  renderAutocompletePlace,
  placeSelectedHandler,
} from "./lib/autocomplete_utils.ts";
import { autocomplete_taxa_api, search_places_api } from "./lib/inat_api.ts";
import type { iNatAutocompleteTaxaAPI, iNatSearchAPI } from "./types/inat_api";

window.app = { store: mapStore };
window.app.store.displayJsonEl = document.getElementById("display-json");
window.app.store.taxaListEl = document.getElementById("taxa-list-container");

// =====================
// taxa search
// =====================

const autoCompleteTaxaJS = new autoComplete({
  autocomplete: "off",
  selector: "#inatTaxaAutoComplete",
  placeHolder: "Enter species name",
  threshold: 3,
  searchEngine: (query: string, record: NormalizediNatTaxon) => {
    return renderAutocompleteTaxon(record, query);
  },
  data: {
    src: async (query: string) => {
      try {
        let res = await fetch(`${autocomplete_taxa_api}?q=${query}`);
        let data = (await res.json()) as iNatAutocompleteTaxaAPI;
        return processAutocompleteTaxa(data);
      } catch (error) {
        console.error(error);
      }
    },
  },
  resultsList: {
    maxResults: 10,
  },
  events: {
    input: {
      selection: (event: AutoCompleteEvent) => {
        const selection = event.detail.selection.value;
        autoCompleteTaxaJS.input.value = selection.preferred_common_name;
      },
    },
  },
});

document
  .querySelector("#inatTaxaAutoComplete")!
  .addEventListener("selection", async function (event: any) {
    console.log("inatTaxaAutoComplete");
    let selection = event.detail.selection.value;
    await taxonSelectedHandler(selection, event.detail.query, window.app.store);
  });

// =====================
// places search
// =====================

const autoCompletePlacesJS = new autoComplete({
  autocomplete: "off",
  selector: "#inatPlacesSearch",
  placeHolder: "Enter species name",
  threshold: 3,
  searchEngine: (_query: string, record: NormalizediNatPlace) => {
    return renderAutocompletePlace(record);
  },
  data: {
    src: async (query: string) => {
      try {
        let res = await fetch(`${search_places_api}${query}`);
        let data = (await res.json()) as iNatSearchAPI;
        return processAutocompletePlaces(data);
      } catch (error) {
        console.error(error);
      }
    },
  },
  resultsList: {
    maxResults: 10,
  },
  events: {
    input: {
      selection: (event: AutoCompleteEvent) => {
        const selection = event.detail.selection.value;
        autoCompletePlacesJS.input.value = selection.display_name;
      },
    },
  },
});

let placesEl = document.querySelector("#inatPlacesSearch");

if (placesEl) {
  placesEl.addEventListener("selection", async function (event: any) {
    let selection = event.detail.selection.value;
    await placeSelectedHandler(selection, event.detail.query, window.app.store);
  });
}

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

window.app.store.refreshMap.showRefreshMapButton = false;
let button = createRefreshMapButton(window.app.store);
window.app.store.refreshMap.refreshMapButtonEl = button;

map.on("zoomend", function () {
  let store = window.app.store;
  const { refreshMap } = store;

  if (
    refreshMap.refreshMapButtonEl &&
    refreshMap.showRefreshMapButton === false
  ) {
    refreshMap.refreshMapButtonEl.hidden = false;
    refreshMap.showRefreshMapButton = true;
    // displayUserData(store, "zoomed event");
  }
});

// =====================
// misc
// =====================

// =====================
// dev
// =====================

async function initData() {
  let temp: NormalizediNatTaxon[] = [
    {
      name: "Lobatae",
      default_photo:
        "https://inaturalist-open-data.s3.amazonaws.com/photos/149586607/square.jpg",
      preferred_common_name: "red oaks",
      matched_term: "red oaks",
      rank: "section",
      id: 861036,
    },
    {
      name: "Turdus migratorius",
      default_photo:
        "https://inaturalist-open-data.s3.amazonaws.com/photos/34859026/square.jpg",
      preferred_common_name: "American Robin",
      matched_term: "American Robin",
      rank: "species",
      id: 12727,
    },
    {
      name: "Cardinalis cardinalis",
      default_photo:
        "https://inaturalist-open-data.s3.amazonaws.com/photos/189434971/square.jpg",
      preferred_common_name: "Northern Cardinal",
      matched_term: "Northern Cardinal",
      rank: "species",
      id: 9083,
    },
  ];

  await taxonSelectedHandler(temp[0], "red", window.app.store);
  await taxonSelectedHandler(temp[1], "red", window.app.store);
  await taxonSelectedHandler(temp[2], "red", window.app.store);
}
initData;
