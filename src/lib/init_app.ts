import L from "leaflet";

import type {
  NormalizediNatTaxon,
  MapStore,
  CustomGeoJSON,
  iNatApiParamsKeys,
  SearchOptions,
  SearchOptionsKeys,
  ObservationViews,
  NormalizediNatProject,
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
import type {
  PlacesResult,
  ProjectsResult,
  TaxaResult,
  UserResult,
} from "../types/inat_api";
import {
  addAllTaxaRecordToMapAndStore,
  formatTaxonName,
  addValueToCommaSeparatedString,
  renderSelectedPlacesBoundaries,
  renderSelectedProjectsBoundaries,
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
import {
  renderSelectedResources,
  updateCountForAllPlaces,
  updateCountForAllProjects,
  updateCountForAllTaxa,
  updateTilesForAllTaxa,
} from "./search_utils.ts";
import {
  setupUserIdentifierSearch,
  userIdentifierSelectedHandler,
} from "./search_users_identifiers.ts";

// populate store with basic view data from app url.
// used to set view in observation header and subview in obdervation view
export async function initPopulateStore(
  appStore: MapStore,
  urlStore: MapStore,
) {
  loggerStore("++ initPopulateStore start", appStore.inatApiParams);

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
    if (typeof value === "string") {
      appStore.viewMetadata[key] = value as any;
    } else {
      appStore.viewMetadata[key] = {
        ...appStore.viewMetadata[key],
        ...value,
      };
    }
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
  loggerStore(
    "++ initPopulateStore selectedPlaces",
    appStore.inatApiParams,
    appStore.selectedPlaces,
  );

  // project data
  if (urlStore.selectedProjects?.length > 0) {
    for await (const urlStoreProject of urlStore.selectedProjects) {
      let projectData = await getProjectById(urlStoreProject.id);
      if (!projectData) {
        continue;
      }
      let placeData;
      if (projectData.place_id) {
        placeData = await getPlaceById(projectData.place_id);
      }

      processProjectData(projectData, appStore, placeData);
    }
  }
  loggerStore(
    "++ initPopulateStore selectedProjects",
    appStore.inatApiParams,
    appStore.selectedProjects,
  );

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
  loggerStore(
    "++ initPopulateStore selectedUsers",
    appStore.inatApiParams,
    appStore.selectedUsers,
  );

  // user idenifier data
  if (urlStore.selectedUsersIdentifiers?.id) {
    let data = await getUserById(urlStore.selectedUsersIdentifiers.id);
    if (data) {
      processUserIdentifierData(data, appStore);
    }
  }
  loggerStore(
    "++ initPopulateStore selectedUsers",
    appStore.inatApiParams,
    appStore.selectedUsers,
  );

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
  loggerStore(
    "++ initPopulateStore selectedTaxa",
    appStore.inatApiParams,
    appStore.selectedTaxa,
  );

  await updateCountForAllTaxa(appStore);
  await updateCountForAllPlaces(appStore);
  await updateCountForAllProjects(appStore);

  renderSelectedResources(appStore, false);

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
  renderSelectedPlacesBoundaries(appStore);

  // add project layers
  renderSelectedProjectsBoundaries(appStore);

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
  await updateTilesForAllTaxa(appStore);

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
    rank: taxonData.rank,
    id: taxonData.id,
    color: urlStoreTaxon.color,
  };

  let { title, subtitle } = formatTaxonName(taxon, appStore);
  taxon.title = title;
  taxon.subtitle = subtitle;

  appStore.selectedTaxa = [...appStore.selectedTaxa, taxon];
  appStore.inatApiParams.taxon_id = addValueToCommaSeparatedString(
    taxonData.id,
    appStore.inatApiParams.taxon_id,
  );
  appStore.inatApiParams.colors = addValueToCommaSeparatedString(
    urlStoreTaxon.color,
    appStore.inatApiParams.colors,
  );
  if (urlStoreTaxon.color) {
    appStore.color = urlStoreTaxon.color;
  }
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
  appStore.inatApiParams.place_id = addValueToCommaSeparatedString(
    placeData.id,
    appStore.inatApiParams.place_id,
  );
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
  placeData?: PlacesResult,
) {
  let project: NormalizediNatProject = {
    id: projectData.id,
    name: projectData.title,
    slug: projectData.slug,
  };

  if (placeData) {
    project.geometry = placeData.geometry_geojson;
    project.bounding_box = placeData.bounding_box_geojson;
  }
  appStore.selectedProjects = [...appStore.selectedProjects, project];

  // create comma seperated project_id
  appStore.inatApiParams.project_id = addValueToCommaSeparatedString(
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
  appStore.inatApiParams.user_id = addValueToCommaSeparatedString(
    userData.id,
    appStore.inatApiParams.user_id,
  );
}

function processUserIdentifierData(userData: UserResult, appStore: MapStore) {
  appStore.selectedUsersIdentifiers = {
    id: userData.id,
    name: userData.name,
    login: userData.login,
  };

  appStore.inatApiParams.ident_user_id = userData.id;
}

export function searchSetup(appStore: MapStore) {
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
    users_identifiers: {
      setup: setupUserIdentifierSearch,
      selectedHandler: userIdentifierSelectedHandler,
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
    setup = setupTaxaSearch(searchSelector, appStore);
    selectedHandler = taxonSelectedHandler;

    searchInputEl.addEventListener("selection", async function (event: any) {
      let selection = event.detail.selection.value;
      let query = event.detail.query;
      await selectedHandler(selection, query, window.app.store);
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

      setup = targetSearch.setup(searchSelector, appStore);
      selectedHandler = targetSearch.selectedHandler;
    });
  }
}

export function searchHeadingSetup() {
  let placesHeading = document.querySelector(
    "#home #sidebar-menu .places-heading",
  ) as HTMLElement;
  let projectsHeading = document.querySelector(
    "#home #sidebar-menu .projects-heading",
  ) as HTMLElement;
  let usersHeading = document.querySelector(
    "#home #sidebar-menu .users-heading",
  ) as HTMLElement;
  let usersIdentifiersHeading = document.querySelector(
    "#home #sidebar-menu .users-identifiers-heading",
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
  window.addEventListener("selectedUsersIdentifiersChange", () => {
    if (!usersIdentifiersHeading) return;
    let resource = window.app.store.selectedUsersIdentifiers;
    usersIdentifiersHeading.hidden = resource.id ? false : true;
  });
}
