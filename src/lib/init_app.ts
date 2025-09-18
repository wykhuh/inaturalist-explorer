import L from "leaflet";

import type {
  NormalizediNatTaxon,
  MapStore,
  CustomGeoJSON,
  iNatApiParamsKeys,
  SearchOptions,
  SearchOptionsKeys,
  ObservationViews,
} from "../types/app";
import {
  addLayerToMap,
  convertParamsBBoxToLngLat,
  createRefreshMapButton,
  drawMapBoundingBox,
  fitBoundsPlaces,
  getMapTiles,
} from "./map_utils.ts";
import {
  getPlaceById,
  getProjectById,
  getTaxonById,
  getUserById,
} from "./inat_api.ts";
import {
  bboxPlaceRecord,
  fieldsWithAny,
  iNatApiNames,
} from "../data/inat_data.ts";
import { renderPlacesList } from "./search_places.ts";
import { renderProjectsList } from "./search_projects.ts";
import { renderTaxaList } from "./search_taxa.ts";
import { renderUsersList } from "./search_users.ts";
import type {
  PlacesResult,
  ProjectsResult,
  TaxaResult,
  UserResult,
} from "../types/inat_api";
import {
  addAllTaxaRecordToMapAndStore,
  fetchiNatMapDataForTaxon,
  formatTaxonName,
  getObservationsCountForTaxon,
  addIdToCommaSeparatedString,
  removeOneTaxonFromMap,
} from "./data_utils";
import { loggerStore } from "./logger.ts";
import {
  placeSelectedHandler,
  setupPlacesSearch,
} from "../lib/search_places.ts";
import {
  projectSelectedHandler,
  setupProjectSearch,
} from "../lib/search_projects.ts";
import { setupUserSearch, userSelectedHandler } from "../lib/search_users.ts";
import { setupTaxaSearch, taxonSelectedHandler } from "../lib/search_taxa.ts";

// populate store with basic view data from app url.
// used to set view in observation header and subview in obdervation view
export async function initPopulateStore(
  appStore: MapStore,
  urlStore: MapStore,
) {
  loggerStore("++ initPopulateStore start");

  // use url store to populate appStore.inatApiParams
  for (const [k, value] of Object.entries(urlStore.inatApiParams)) {
    let key = k as iNatApiParamsKeys;
    // ignore params whose value is any
    if (fieldsWithAny.includes(key) && value === "any") {
      delete appStore.inatApiParams[key];
      // add valid params to inatApiParams
    } else if (iNatApiNames.includes(key)) {
      delete appStore.inatApiParams[key];
      appStore.inatApiParams[key] = value;
    }
  }

  // use url store to populate store view and and subview
  if (urlStore.currentView) {
    appStore.currentView = urlStore.currentView;
  }

  // populate viewMetadata
  for (let [k, value] of Object.entries(urlStore.viewMetadata)) {
    let key = k as ObservationViews;
    appStore.viewMetadata[key] = {
      ...appStore.viewMetadata[key],
      ...value,
    };
  }

  // HACK: trigger store proxy
  appStore.inatApiParams = appStore.inatApiParams;
  appStore.viewMetadata = appStore.viewMetadata;

  // places data
  if (
    urlStore.selectedPlaces?.length > 0 &&
    urlStore.inatApiParams.nelat === undefined
  ) {
    for await (const urlStorePlace of urlStore.selectedPlaces) {
      let placeData = await getPlaceById(urlStorePlace.id);
      if (!placeData) {
        continue;
      }
      processPlaceData(placeData, appStore);
    }
    // get bounding box data
  } else if (urlStore.inatApiParams.nelat !== undefined) {
    processBBoxData(appStore, urlStore);
  }

  // project data
  if (urlStore.selectedProjects?.length > 0) {
    for await (const urlStoreProject of urlStore.selectedProjects) {
      let projectData = await getProjectById(urlStoreProject.id);
      if (!projectData) {
        continue;
      }
      processProjectData(projectData, appStore);
    }
  }
  // user data
  if (urlStore.selectedUsers?.length > 0) {
    for await (const urlStoreUser of urlStore.selectedUsers) {
      let data = await getUserById(urlStoreUser.id);
      if (!data) {
        continue;
      }
      processUserData(data, appStore);
    }
  }
  // taxa data
  if (urlStore.selectedTaxa && urlStore.selectedTaxa.length > 0) {
    for await (const urlStoreTaxon of urlStore.selectedTaxa) {
      let taxonData = await getTaxonById(urlStoreTaxon.id);
      if (!taxonData) {
        continue;
      }
      processTaxonData(taxonData, appStore, urlStore);
    }
  }

  for await (const taxon of appStore.selectedTaxa) {
    appStore.inatApiParams = {
      ...appStore.inatApiParams,
      taxon_id: taxon.id.toString(),
      colors: taxon.color,
    };
    await getObservationsCountForTaxon(taxon, appStore);
  }

  renderTaxaList(appStore);
  renderPlacesList(appStore);
  renderProjectsList(appStore);
  renderUsersList(appStore);

  loggerStore("++ initPopulateStore end");

  window.dispatchEvent(new Event("storePopulated"));
  loggerStore("dispatch observationsChange");
}

export async function initRenderMap(appStore: MapStore) {
  let map = L.map("map", {
    center: [0, 0],
    zoom: 2,
    maxZoom: 19,
  });
  var layerControl = L.control.layers().addTo(map);

  appStore.map.map = map;
  appStore.map.layerControl = layerControl;

  appStore.refreshMap.showRefreshMapButton = false;
  let button = createRefreshMapButton(appStore);
  appStore.refreshMap.refreshMapButtonEl = button;

  // add basemaps
  let { OpenStreetMap, OpenTopo } = getMapTiles();
  addLayerToMap(OpenStreetMap, map, layerControl, true);
  addLayerToMap(OpenTopo, map, layerControl);

  // add places layers
  appStore.selectedPlaces.forEach((place) => {
    let options: any = {
      color: "red",
      fillColor: "none",
      layer_description: `place layer: ${place.name}, ${place.id}`,
    };
    let layer = L.geoJSON(place.geometry as any, options);
    layer.addTo(map);

    appStore.placesMapLayers = {
      ...appStore.placesMapLayers,
      [place.id]: [layer as CustomGeoJSON],
    };
  });

  // add bounding box layer
  if (appStore.inatApiParams.nelat !== undefined) {
    addBBoxDataToMap(appStore);
  }

  // load allTaxon map tiles if no taxon id in the url
  if (
    appStore.selectedTaxa === undefined ||
    appStore.selectedTaxa.length === 0
  ) {
    await addAllTaxaRecordToMapAndStore(appStore);
  }

  // add iNat taxa layers
  for await (const taxon of appStore.selectedTaxa) {
    removeOneTaxonFromMap(appStore, taxon.id);

    appStore.inatApiParams = {
      ...appStore.inatApiParams,
      taxon_id: taxon.id.toString(),
      colors: taxon.color,
    };

    await fetchiNatMapDataForTaxon(taxon, appStore);
  }

  // return map to previous position when switching views
  if (appStore.map.bounds) {
    map.fitBounds(appStore.map.bounds);
    // zoom map to places on page load
  } else {
    fitBoundsPlaces(appStore);
  }

  map.on("zoomend", function () {
    if (
      appStore.refreshMap.refreshMapButtonEl &&
      appStore.refreshMap.showRefreshMapButton === false
    ) {
      appStore.refreshMap.refreshMapButtonEl.hidden = false;
      // refreshMap.showRefreshMapButton = true;
      appStore.refreshMap = {
        ...appStore.refreshMap,
        showRefreshMapButton: true,
      };
    }
  });
}

export function processTaxonData(
  taxonData: TaxaResult,
  appStore: MapStore,
  urlStore: MapStore,
) {
  let urlStoreTaxon = urlStore.selectedTaxa.find((t) => t.id === taxonData.id);
  if (!urlStoreTaxon) return;

  // create taxon object
  let taxon: NormalizediNatTaxon = {
    name: taxonData.name,
    default_photo: taxonData.default_photo?.square_url,
    preferred_common_name: taxonData.preferred_common_name,
    matched_term: taxonData.name,
    rank: taxonData.rank,
    id: taxonData.id,
    color: urlStoreTaxon.color,
  };

  let { title, subtitle } = formatTaxonName(taxon, taxon.name as string, false);
  taxon.display_name = title;
  taxon.title = title;
  taxon.subtitle = subtitle;

  appStore.selectedTaxa = [...appStore.selectedTaxa, taxon];
}

export function processPlaceData(placeData: PlacesResult, appStore: MapStore) {
  // save place to store

  let bbox = placeData.bounding_box_geojson;
  appStore.selectedPlaces = [
    ...appStore.selectedPlaces,
    {
      id: placeData.id,
      name: placeData.name,
      display_name: placeData.display_name,
      bounding_box: bbox,
      geometry: placeData.geometry_geojson,
    },
  ];

  // create comma seperated place_id
  appStore.inatApiParams.place_id = addIdToCommaSeparatedString(
    placeData.id,
    appStore.inatApiParams.place_id,
  );
}

export function addPlaceDataToMap(placeData: PlacesResult, appStore: MapStore) {
  let map = appStore.map.map;
  if (!map) return;

  // draw boundaries of selected place
  let options: any = {
    color: "red",
    fillColor: "none",
    layer_description: `place layer: ${placeData.name}, ${placeData.id}`,
  };
  let layer = L.geoJSON(placeData.geometry_geojson as any, options);
  layer.addTo(map);

  // save place to store
  appStore.placesMapLayers[placeData.id] = [layer as CustomGeoJSON];
}

export function processBBoxData(appStore: MapStore, urlStore: MapStore) {
  let lngLatCoors = convertParamsBBoxToLngLat(urlStore.inatApiParams);
  if (!lngLatCoors) return;

  appStore.inatApiParams.nelat = urlStore.inatApiParams.nelat;
  appStore.inatApiParams.nelng = urlStore.inatApiParams.nelng;
  appStore.inatApiParams.swlat = urlStore.inatApiParams.swlat;
  appStore.inatApiParams.swlng = urlStore.inatApiParams.swlng;

  appStore.selectedPlaces = [bboxPlaceRecord(lngLatCoors)];
}

export function addBBoxDataToMap(appStore: MapStore) {
  let map = appStore.map.map;
  if (!map) return;
  let lngLatCoors = convertParamsBBoxToLngLat(appStore.inatApiParams);
  if (!lngLatCoors) return;

  let layer = drawMapBoundingBox(map, lngLatCoors) as any;
  appStore.refreshMap = {
    ...appStore.refreshMap,
    layer: layer,
  };

  appStore.placesMapLayers["0"] = [layer as unknown as CustomGeoJSON];
}

export function processProjectData(
  projectData: ProjectsResult,
  appStore: MapStore,
) {
  appStore.selectedProjects = [
    ...appStore.selectedProjects,
    {
      id: projectData.id,
      name: projectData.title,
      slug: projectData.slug,
    },
  ];

  // create comma seperated project_id
  appStore.inatApiParams.project_id = addIdToCommaSeparatedString(
    projectData.id,
    appStore.inatApiParams.project_id,
  );
}

function processUserData(userData: UserResult, appStore: MapStore) {
  appStore.selectedUsers = [
    ...appStore.selectedUsers,
    {
      id: userData.id,
      name: userData.name,
      login: userData.login,
    },
  ];

  // create comma seperated user_id
  appStore.inatApiParams.user_id = addIdToCommaSeparatedString(
    userData.id,
    appStore.inatApiParams.user_id,
  );
}

export function searchSetup() {
  let searchSelector = "#inatAutocomplete";
  let searchInputEl = document.querySelector(
    searchSelector,
  ) as HTMLInputElement;
  let searchSelectEl = document.querySelector(
    "#search-type",
  ) as HTMLSelectElement;

  let searchOptions: SearchOptions = {
    places: {
      setup: setupPlacesSearch,
      selectedHandler: placeSelectedHandler,
    },
    projects: {
      setup: setupProjectSearch,
      selectedHandler: projectSelectedHandler,
    },
    users: {
      setup: setupUserSearch,
      selectedHandler: userSelectedHandler,
    },
    taxa: {
      setup: setupTaxaSearch,
      selectedHandler: taxonSelectedHandler,
    },
  };
  let setup: any;
  let selectedHandler: any;
  if (searchInputEl) {
    // when user selects an search result,
    searchInputEl.innerHTML = "";
    setup = setupTaxaSearch(searchSelector);
    selectedHandler = taxonSelectedHandler;

    searchInputEl.addEventListener("selection", async function (event: any) {
      let selection = event.detail.selection.value;
      let query = event.detail.query;
      selectedHandler(selection, query, window.app.store);
    });
  }

  if (searchSelectEl && searchInputEl) {
    // update search input when user changes the search type
    searchSelectEl.addEventListener("change", (event) => {
      let target = event.target as HTMLInputElement;
      if (target === null) return;

      // remove event listerner for autocomplete search
      setup.unInit();
      // clear search input
      searchInputEl.innerHTML = "";
      searchInputEl.value = "";

      let targetSearch = searchOptions[target.value as SearchOptionsKeys];

      setup = targetSearch.setup(searchSelector);
      selectedHandler = targetSearch.selectedHandler;
    });
  }
}

export function searchHeadingSetup() {
  let placesHeading = document.querySelector(
    "#home .menu .places-heading",
  ) as HTMLElement;
  let projectsHeading = document.querySelector(
    "#home .menu .projects-heading",
  ) as HTMLElement;
  let usersHeading = document.querySelector(
    "#home .menu .users-heading",
  ) as HTMLElement;

  window.addEventListener("selectedPlacesChange", () => {
    if (!placesHeading) return;
    let resource = window.app.store.selectedPlaces;
    placesHeading.hidden = resource.length === 0 ? true : false;
  });
  window.addEventListener("selectedProjectsChange", () => {
    if (!projectsHeading) return;
    let resource = window.app.store.selectedProjects;
    projectsHeading.hidden = resource.length === 0 ? true : false;
  });
  window.addEventListener("selectedUsersChange", () => {
    if (!usersHeading) return;
    let resource = window.app.store.selectedUsers;
    usersHeading.hidden = resource.length === 0 ? true : false;
  });
}
