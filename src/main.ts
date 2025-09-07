import autoComplete from "@tarekraafat/autocomplete.js";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import "./assets/leaflet.css";
import "./assets/autocomplete.css";
import "./components/TaxaListItem/component.ts";
import "./components/PlacesListItem/component.ts";
import "./components/ProjectsListItem/component.ts";
import "./components/UsersListItem/component.ts";
import "./components/ObservationsFilters/component.ts";
import {
  getMapTiles,
  addLayerToMap,
  createRefreshMapButton,
} from "./lib/map_utils.ts";
import type {
  NormalizediNatTaxon,
  AutoCompleteEvent,
  NormalizediNatPlace,
  NormalizediNatProject,
  NormalizediNatUser,
} from "./types/app.d.ts";
import mapStore from "./lib/store.ts";
import {
  processAutocompleteTaxa,
  renderAutocompleteTaxon,
  taxonSelectedHandler,
  processAutocompletePlaces,
  renderAutocompletePlace,
  placeSelectedHandler,
  renderAutocompleteProject,
  processAutocompleteProject,
  projectSelectedHandler,
  renderAutocompleteUser,
  processAutocompleteUser,
  userSelectedHandler,
} from "./lib/autocomplete_utils.ts";
import {
  autocomplete_projects_api,
  autocomplete_taxa_api,
  getObservationsYears,
  autocomplete_places_api,
  autocomplete_users_api,
} from "./lib/inat_api.ts";
import type {
  iNatProjectsAPI,
  iNatTaxaAPI,
  iNatSearchAPI,
  iNatUsersAPI,
} from "./types/inat_api";
import { decodeAppUrl } from "./lib/utils.ts";
import { initApp } from "./lib/init_app.ts";
import { loggerUrl } from "./lib/logger.ts";
import { renderUserSearch } from "./lib/search_users.ts";
import { renderPlacesSearch } from "./lib/search_places.ts";
import { renderProjectSearch } from "./lib/search_projects.ts";
import { renderTaxaSearch } from "./lib/search_taxa.ts";

window.app = { store: mapStore };
window.app.store.displayJsonEl = document.getElementById("display-json");
window.app.store.taxaListEl = document.getElementById("taxa-list-container");
window.app.store.placesListEl = document.getElementById(
  "places-list-container",
);

// =====================
// misc
// =====================

let data = await getObservationsYears();
if (data) {
  let years = [];
  for (let [date, _count] of Object.entries(data.year)) {
    years.push(Number(date.split("-")[0]));
  }
  window.app.store.iNatStats = { years: years.sort().reverse() };
  window.dispatchEvent(new Event("observationYearsLoaded"));
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

  if (
    store.refreshMap.refreshMapButtonEl &&
    store.refreshMap.showRefreshMapButton === false
  ) {
    store.refreshMap.refreshMapButtonEl.hidden = false;
    // refreshMap.showRefreshMapButton = true;
    store.refreshMap = {
      ...store.refreshMap,
      showRefreshMapButton: true,
    };
  }
});

// =====================
// initialize app based on url params
// =====================

let urlData = decodeAppUrl(window.location.search);
// initApp(window.app.store, urlData);

// =====================
// taxa search
// =====================

// =====================
// places search
// =====================

// =====================
// project search
// =====================

// =====================
// user search
// =====================

// =====================
// misc
// =====================
let currentSearch = "species";
let currentSearchFn;

renderTaxaSearch();
let searchSelectEl = document.querySelector(
  "#search-type",
) as HTMLSelectElement;
if (searchSelectEl) {
  searchSelectEl.addEventListener("change", (event) => {
    if (event.target === null) return;

    switch (event.target.value) {
      case "species":
        renderTaxaSearch();
        break;
      case "places":
        renderPlacesSearch();
        break;
      case "projects":
        renderProjectSearch();
        break;
      case "users":
        renderUserSearch();
        break;
      default:
        break;
    }
  });
}

// =====================
// dev
// =====================

async function initData() {
  let taxa: NormalizediNatTaxon[] = [
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
  let places: NormalizediNatPlace = {
    id: 962,
    name: "Los Angeles",
    display_name: "Los Angeles County, US, CA",
    geometry: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [-118.678551, 33.026356],
            [-118.670782, 33.057966],
            [-118.641301, 33.081882],
            [-118.542103, 33.073788],
            [-118.448863, 32.961749999999995],
            [-118.29724999999999, 32.845093999999996],
            [-118.295841, 32.798255999999995],
            [-118.323819, 32.773514],
            [-118.378377, 32.770232],
            [-118.408322, 32.751914],
            [-118.46471199999999, 32.760176],
            [-118.550515, 32.825328999999996],
            [-118.644732, 33.000033],
            [-118.670173, 33.000034],
            [-118.678551, 33.026356],
          ],
        ],
        [
          [
            [-118.667602, 33.477489],
            [-118.659924, 33.505759999999995],
            [-118.632505, 33.526466],
            [-118.533639, 33.531442],
            [-118.359393, 33.464922],
            [-118.25771399999999, 33.364131],
            [-118.24594, 33.291061],
            [-118.269178, 33.265679999999996],
            [-118.318622, 33.248472],
            [-118.486688, 33.276905],
            [-118.534885, 33.315176],
            [-118.547929, 33.376799],
            [-118.618574, 33.406191],
            [-118.667602, 33.477489],
          ],
        ],
        [
          [
            [-118.70339200000001, 34.168591],
            [-118.66815199999999, 34.168195],
            [-118.66771299999999, 34.240404],
            [-118.632495, 34.240426],
            [-118.636612, 34.291278],
            [-118.894474, 34.817972],
            [-118.863108, 34.802983999999995],
            [-118.854253, 34.817772],
            [-117.667292, 34.822525999999996],
            [-117.667034, 34.558008],
            [-117.646374, 34.28917],
            [-117.730125, 34.021370999999995],
            [-117.76769, 34.023506],
            [-117.767483, 34.004611],
            [-117.785062, 34.004809],
            [-117.802445, 33.968308],
            [-117.783287, 33.946411],
            [-117.97649799999999, 33.94605],
            [-117.976593, 33.902809999999995],
            [-118.058918, 33.846121],
            [-118.096561, 33.779467],
            [-118.09197, 33.758472],
            [-118.11950999999999, 33.737064],
            [-118.1259, 33.697151],
            [-118.237008, 33.690595],
            [-118.274239, 33.663429],
            [-118.319135, 33.659546999999996],
            [-118.466962, 33.725524],
            [-118.485577, 33.753664],
            [-118.484483, 33.803154],
            [-118.447254, 33.84876],
            [-118.557356, 33.987673],
            [-118.727459, 33.980306999999996],
            [-118.809827, 33.946905],
            [-118.873998, 33.983314],
            [-118.95172099999999, 33.992858],
            [-118.940801, 34.074967],
            [-118.788889, 34.168214],
            [-118.70339200000001, 34.168591],
          ],
        ],
      ],
    },
    bounding_box: {
      type: "Polygon",
      coordinates: [
        [
          [-118.951721, 32.75004],
          [-118.951721, 34.823302],
          [-117.646374, 34.823302],
          [-117.646374, 32.75004],
          [-118.951721, 32.75004],
        ],
      ],
    },
  };

  await taxonSelectedHandler(taxa[0], "red", window.app.store);
  await taxonSelectedHandler(taxa[1], "red", window.app.store);
  await taxonSelectedHandler(taxa[2], "red", window.app.store);
  await placeSelectedHandler(places, "los", window.app.store);
}
initData;
