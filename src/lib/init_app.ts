import L from "leaflet";

import type {
  NormalizediNatTaxon,
  MapStore,
  CustomGeoJSON,
  ObservationsApiParamsKeys,
  ObservationViews,
  NormalizediNatProject,
  IdentificationsApiParamsKeys,
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
  IdentificationsApiNames,
  ObservationsApiNames,
} from "../data/inat_data.ts";
import type {
  PlacesResult,
  ProjectsResult,
  TaxaResult,
  UserResult,
} from "../types/inat_api";
import {
  formatTaxonName,
  addValueToCommaSeparatedString,
  renderSelectedPlacesBoundaries,
  renderSelectedProjectsBoundaries,
  addDefaultTaxaRecordToMap,
  addDefaultTaxaRecordToStore,
  isObservationsCheck,
  isIdentificationsCheck,
  getResourceApiParams,
} from "./data_utils";
import { loggerEvent, loggerRender, loggerStore } from "./logger.ts";
import {
  renderSelectedResources,
  updateTilesForSelectedTaxa,
} from "./search_utils.ts";
import { decodeAppUrl } from "./utils.ts";
import { updateCountForAll } from "./count_utils.ts";
import { viewAndTemplateObject } from "../components/ObservationsHeader/shared_utils.ts";

// populate store with basic view data from app url.
// used to set view in observation header and subview in obdervation view
export async function initPopulateStore(
  appStore: MapStore,
  urlStore: MapStore,
) {
  loggerStore("++ initPopulateStore start");
  if (urlStore.record_type) {
    appStore.record_type = urlStore.record_type;
  }
  let isObservations = isObservationsCheck(appStore);

  if (isObservations) {
    populateObservationsApiParams(appStore, urlStore);
  } else {
    populateIdentificationsApiParams(appStore, urlStore);
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
  appStore.observationsApiParams = appStore.observationsApiParams;

  // places data
  if (
    urlStore.selectedPlaces?.length > 0 &&
    urlStore.observationsApiParams.nelat === undefined
  ) {
    for await (const urlStorePlace of urlStore.selectedPlaces) {
      let placeData = await getPlaceById(urlStorePlace.id);
      if (!placeData) {
        continue;
      }
      processPlaceData(placeData, appStore);
    }
    // get bounding box data
  } else if (urlStore.observationsApiParams.nelat !== undefined) {
    processBBoxData(appStore, urlStore);
  }
  loggerStore("++ initPopulateStore selectedPlaces", appStore.selectedPlaces);

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
    "++ initPopulateStore selectedUsersIdentifiers",
    appStore.selectedUsersIdentifiers,
  );
  if (urlStore.selectedUsersIdentifiers?.length > 0) {
    for await (const urlStoreUser of urlStore.selectedUsersIdentifiers) {
      let data = await getUserById(urlStoreUser.id);
      if (!data) {
        continue;
      }
      processUserIdentifierData(data, appStore);
    }
  }

  loggerStore(
    "++ initPopulateStore selectedUsersIdentifiers",
    appStore.selectedUsersIdentifiers,
  );

  // unobserved user data
  if (urlStore.selectedUnobservedByUser?.id) {
    let data = await getUserById(urlStore.selectedUnobservedByUser.id);
    if (data) {
      processUnobservedByUserData(data, appStore);
    }
  }

  loggerStore(
    "++ initPopulateStore selectedUnobservedByUser",
    appStore.selectedUnobservedByUser,
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
  } else if (urlStore.record_type === "observations") {
    await addDefaultTaxaRecordToStore(appStore);
  }

  // taxa data
  if (
    urlStore.selectedTaxaIdentified &&
    urlStore.selectedTaxaIdentified.length > 0
  ) {
    for await (const urlStoreTaxon of urlStore.selectedTaxaIdentified) {
      let taxonData = await getTaxonById(urlStoreTaxon.id);
      if (!taxonData) {
        continue;
      }
      processTaxonIdentifiedData(taxonData, appStore, urlStore);
    }
  }

  await updateCountForAll("all", appStore);

  renderSelectedResources(appStore, false);

  loggerStore("++ initPopulateStore end");

  window.dispatchEvent(new Event("storePopulated"));
  loggerEvent("dispatch storePopulated");
}

function populateObservationsApiParams(appStore: MapStore, urlStore: MapStore) {
  // use url store to populate appStore.observationsApiParams
  for (const [k, value] of Object.entries(urlStore.observationsApiParams)) {
    let key = k as ObservationsApiParamsKeys;
    // ignore params whose value is any
    if (fieldsWithAny.includes(key) && value === "any") {
      delete appStore.observationsApiParams[key];
      // add valid params to observationsApiParams
    } else if (ObservationsApiNames.includes(key)) {
      delete appStore.observationsApiParams[key];
      appStore.observationsApiParams[key] = value;
    }
  }
}

function populateIdentificationsApiParams(
  appStore: MapStore,
  urlStore: MapStore,
) {
  // use url store to populate appStore.identificationsApiParams
  for (const [k, value] of Object.entries(urlStore.identificationsApiParams)) {
    let key = k as IdentificationsApiParamsKeys;
    // ignore params whose value is any
    if (fieldsWithAny.includes(key) && value === "any") {
      delete appStore.identificationsApiParams[key];
      // add valid params to identificationsApiParams
    } else if (IdentificationsApiNames.includes(key)) {
      delete appStore.identificationsApiParams[key];
      appStore.identificationsApiParams[key] = value;
    }
  }
}

// create map
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
  if (appStore.observationsApiParams.nelat !== undefined) {
    addBBoxDataToMap(appStore);
  }

  // load Default Taxa map tiles if no selected Taxa
  if (appStore.selectedTaxa.length === 0) {
    if (isObservationsCheck(appStore)) {
      await addDefaultTaxaRecordToMap(appStore);
    }
    // update default Taxa map tiles;
  } else if (appStore.selectedTaxa[0].id === 0) {
    if (isObservationsCheck(appStore)) {
      await updateTilesForSelectedTaxa(appStore);
    }
    // update taxa tiles for selected taxa
  } else {
    await updateTilesForSelectedTaxa(appStore);
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

  let isObservations = isObservationsCheck(appStore);

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

  if (isObservations) {
    appStore.observationsApiParams.taxon_id = addValueToCommaSeparatedString(
      taxonData.id,
      appStore.observationsApiParams.taxon_id,
    );
    appStore.observationsApiParams.colors = addValueToCommaSeparatedString(
      urlStoreTaxon.color,
      appStore.observationsApiParams.colors,
    );
  } else {
    appStore.identificationsApiParams.observation_taxon_id =
      addValueToCommaSeparatedString(
        taxonData.id,
        appStore.identificationsApiParams.observation_taxon_id,
      );
  }

  if (urlStoreTaxon.color) {
    appStore.color = urlStoreTaxon.color;
  }
}

export function processTaxonIdentifiedData(
  taxonData: TaxaResult,
  appStore: MapStore,
  urlStore: MapStore,
) {
  if (isObservationsCheck(appStore)) return;

  let urlStoreTaxon = urlStore.selectedTaxaIdentified.find(
    (t) => t.id === taxonData.id,
  );
  if (!urlStoreTaxon) return;

  // create taxon object
  let taxon: NormalizediNatTaxon = {
    name: taxonData.name,
    default_photo: taxonData.default_photo?.square_url,
    preferred_common_name: taxonData.preferred_common_name,
    rank: taxonData.rank,
    id: taxonData.id,
  };

  let { title, subtitle } = formatTaxonName(taxon, appStore);
  taxon.title = title;
  taxon.subtitle = subtitle;

  appStore.selectedTaxaIdentified = [...appStore.selectedTaxaIdentified, taxon];

  appStore.identificationsApiParams.taxon_id = addValueToCommaSeparatedString(
    taxonData.id,
    appStore.identificationsApiParams.taxon_id,
  );
}

export function processPlaceData(placeData: PlacesResult, appStore: MapStore) {
  let isObservations = isObservationsCheck(appStore);

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

  let resourceApiParams = getResourceApiParams(isObservations);
  // create comma seperated place_id
  appStore[resourceApiParams].place_id = addValueToCommaSeparatedString(
    placeData.id,
    appStore[resourceApiParams].place_id,
  );
}

export function processBBoxData(appStore: MapStore, urlStore: MapStore) {
  if (!isObservationsCheck(appStore)) return;
  let lngLatCoors = convertParamsBBoxToLngLat(urlStore.observationsApiParams);
  if (!lngLatCoors) return;

  appStore.observationsApiParams.nelat = urlStore.observationsApiParams.nelat;
  appStore.observationsApiParams.nelng = urlStore.observationsApiParams.nelng;
  appStore.observationsApiParams.swlat = urlStore.observationsApiParams.swlat;
  appStore.observationsApiParams.swlng = urlStore.observationsApiParams.swlng;

  appStore.selectedPlaces = [bboxPlaceRecord(lngLatCoors)];
}

export function addBBoxDataToMap(appStore: MapStore) {
  let map = appStore.map.map;
  if (!map) return;
  let lngLatCoors = convertParamsBBoxToLngLat(appStore.observationsApiParams);
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
  if (isIdentificationsCheck(appStore)) return;

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
  appStore.observationsApiParams.project_id = addValueToCommaSeparatedString(
    projectData.id,
    appStore.observationsApiParams.project_id,
  );
}

function processUserData(userData: UserResult, appStore: MapStore) {
  if (isIdentificationsCheck(appStore)) return;

  appStore.selectedUsers = [
    ...appStore.selectedUsers,
    {
      id: userData.id,
      name: userData.name,
      login: userData.login,
    },
  ];

  // create comma seperated user_id
  appStore.observationsApiParams.user_id = addValueToCommaSeparatedString(
    userData.id,
    appStore.observationsApiParams.user_id,
  );
}

function processUserIdentifierData(userData: UserResult, appStore: MapStore) {
  appStore.selectedUsersIdentifiers = [
    ...appStore.selectedUsersIdentifiers,
    {
      id: userData.id,
      name: userData.name,
      login: userData.login,
    },
  ];

  if (isObservationsCheck(appStore)) {
    appStore.observationsApiParams.ident_user_id =
      addValueToCommaSeparatedString(
        userData.id,
        appStore.observationsApiParams.ident_user_id,
      );
  } else {
    appStore.identificationsApiParams.user_id = addValueToCommaSeparatedString(
      userData.id,
      appStore.identificationsApiParams.user_id,
    );
  }
}

function processUnobservedByUserData(userData: UserResult, appStore: MapStore) {
  if (isIdentificationsCheck(appStore)) return;

  appStore.selectedUnobservedByUser = {
    id: userData.id,
    name: userData.name,
    login: userData.login,
  };

  appStore.observationsApiParams.unobserved_by_user_id = userData.id;
}

function toggleSidebarHandler() {
  let toggleEl = document.querySelector("#sidebar-toggle") as HTMLButtonElement;
  if (!toggleEl) return;
  let siteLayoutEl = document.querySelector("#site-layout") as HTMLElement;
  if (!siteLayoutEl) return;
  let siteControlsEl = document.querySelector("#site-controls") as HTMLElement;
  if (!siteControlsEl) return;

  toggleEl.addEventListener("click", (event) => {
    let target = event.target as HTMLElement;
    if (target === null) return;

    if (siteLayoutEl.classList.contains("sidebar-open")) {
      siteLayoutEl.classList.replace("sidebar-open", "sidebar-close");
      siteControlsEl.classList.replace("sidebar-open", "sidebar-close");
    } else {
      siteLayoutEl.classList.replace("sidebar-close", "sidebar-open");
      siteControlsEl.classList.replace("sidebar-close", "sidebar-open");
    }
  });
}

function toggleObservationsHandler() {
  let toggleEl = document.querySelector(
    "#observations-menu-toggle",
  ) as HTMLButtonElement;
  if (!toggleEl) return;

  toggleEl.addEventListener("click", (event) => {
    let target = event.target as HTMLElement;
    if (target === null) return;

    showMenu("#observations-menu");
    hideMenu("#settings-menu");
    hideMenu("#favorites-menu");
  });
}

function toggleSettingsHandler() {
  let toggleEl = document.querySelector(
    "#settings-menu-toggle",
  ) as HTMLButtonElement;
  if (!toggleEl) return;

  toggleEl.addEventListener("click", (event) => {
    let target = event.target as HTMLElement;
    if (target === null) return;

    hideMenu("#observations-menu");
    showMenu("#settings-menu");
    hideMenu("#favorites-menu");
  });
}

function hideMenu(selector: string) {
  let menuEl = document.querySelector(selector) as HTMLElement;
  if (!menuEl) return;

  menuEl.style.display = "none";
}

function showMenu(selector: string) {
  let menuEl = document.querySelector(selector) as HTMLElement;
  if (!menuEl) return;

  menuEl.style.display = "block";
}

export async function initApp() {
  loggerRender("initApp");

  let viewContainerEl = document.querySelector("#view-container");
  if (!viewContainerEl) return;

  let appStore = window.app.store;
  if (!appStore.currentView) return;

  let urlData = decodeAppUrl(window.location.search, window.location.pathname);
  await initPopulateStore(appStore, urlData);

  let templateName = viewAndTemplateObject(appStore.currentView);
  let view = document.createElement(templateName);
  viewContainerEl.appendChild(view);

  toggleSidebarHandler();
  toggleObservationsHandler();
  toggleSettingsHandler();
}
