import L from "leaflet";

import type {
  NormalizediNatTaxonType,
  AppStoreType,
  ObservationsApiParamsKeysType,
  ObservationViewsType,
  NormalizediNatProjectType,
  IdentificationsApiParamsKeysType,
  LngLatType,
} from "../types/app";
import {
  addLayerToMap,
  convertiNatBBoxToLngLat,
  createDrawRectButton,
  fitBoundsPlaces,
  getMapTiles,
  setupTerraDraw,
  addiNatBBoxToMap,
} from "./map_utils.ts";
import {
  getPlaceById,
  getProjectById,
  getTaxonById,
  getUserById,
} from "./inat_api.ts";
import { bboxPlaceRecord } from "../data/inat_data.ts";
import {
  fieldsWithAny,
  identificationsApiNames,
  observationsApiNames,
} from "../data/app_data.ts";
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
  isOtherCheck,
  setPerPage,
} from "./data_utils";
import { loggerEvent, loggerRender, loggerStore } from "./logger.ts";
import {
  renderSelectedResources,
  updateTilesForSelectedTaxa,
  updateTilesForSelectedTaxaIdentified,
} from "./search_utils.ts";
import { decodeAppUrl } from "./utils.ts";
import {
  calculateObservationsCount,
  updateCountForAll,
} from "./count_utils.ts";
import { viewAndTemplateObject } from "../data/app_data.ts";
import { addCurrentPageClass } from "../components/Header/utils.ts";
import { populateStoreWithLocaleStorage } from "./localStorage.ts";
import { saveBBoxToStore } from "./search_bounding_box.ts";

// populate store with basic view data from app url.
// used on initial page load.
export async function initPopulateStore(
  appStore: AppStoreType,
  urlStore: AppStoreType,
) {
  loggerStore("++ initPopulateStore start");
  if (urlStore.record_type) {
    appStore.record_type = urlStore.record_type;
  }
  let isObservations = isObservationsCheck(appStore);
  let isIdentifications = isIdentificationsCheck(appStore);

  if (isObservations) {
    populateObservationsApiParams(appStore, urlStore);
  } else if (isIdentifications) {
    populateIdentificationsApiParams(appStore, urlStore);
  }
  // HACK: trigger store proxy
  appStore.observationsApiParams = appStore.observationsApiParams;
  appStore.currentView = urlStore.currentView;

  // populate viewMetadata
  setViewMetadata(appStore, urlStore);

  setPerPage(appStore);

  // NOTE: update when adding selectedResource;  initPopulateStore

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

  // without places data
  if (urlStore.selectedWithoutPlaces?.length > 0) {
    for await (const urlStorePlace of urlStore.selectedWithoutPlaces) {
      let placeData = await getPlaceById(urlStorePlace.id);
      if (!placeData) {
        continue;
      }
      processWithoutPlaceData(placeData, appStore);
    }
  }
  loggerStore(
    "++ initPopulateStore selectedWithoutPlaces",
    appStore.selectedWithoutPlaces,
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
    appStore.selectedProjects,
  );

  //  not in project data
  if (urlStore.selectedWithoutProjects) {
    for await (const urlStoreProject of urlStore.selectedWithoutProjects) {
      let data = await getProjectById(urlStoreProject.id);

      if (data) {
        processNotInProjectData(data, appStore);
      }
    }
  }
  loggerStore(
    "++ initPopulateStore selectedWithoutProjects",
    appStore.selectedWithoutProjects,
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
  loggerStore("++ initPopulateStore selectedUsers", appStore.selectedUsers);

  if (urlStore.selectedWithoutUsers?.length > 0) {
    for await (const urlStoreUser of urlStore.selectedWithoutUsers) {
      let data = await getUserById(urlStoreUser.id);
      if (!data) {
        continue;
      }
      processWithoutUserData(data, appStore);
    }
  }
  loggerStore(
    "++ initPopulateStore selectedWithoutUsers",
    appStore.selectedWithoutUsers,
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

  if (urlStore.selectedWithoutUsersIdentifiers?.length > 0) {
    for await (const urlStoreUser of urlStore.selectedWithoutUsersIdentifiers) {
      let data = await getUserById(urlStoreUser.id);
      if (!data) {
        continue;
      }
      processWithoutUserIdentifierData(data, appStore);
    }
  }
  loggerStore(
    "++ initPopulateStore selectedWithoutUsersIdentifiers",
    appStore.selectedWithoutUsersIdentifiers,
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

  if (urlStore.selectedReviewer?.id) {
    let data = await getUserById(urlStore.selectedReviewer.id);
    if (data) {
      processReviewerData(data, appStore);
    }
  }
  loggerStore(
    "++ initPopulateStore selectedReviewer",
    appStore.selectedReviewer,
  );

  if (urlStore.selectedUsersAnnotators?.length > 0) {
    for await (const urlStoreUser of urlStore.selectedUsersAnnotators) {
      let data = await getUserById(urlStoreUser.id);
      if (!data) {
        continue;
      }
      processUserAnnotatorData(data, appStore);
    }
  }
  loggerStore(
    "++ initPopulateStore selectedUsersAnnotators",
    appStore.selectedUsersAnnotators,
  );

  // load selected taxa
  if (urlStore.selectedTaxa && urlStore.selectedTaxa.length > 0) {
    for await (const urlStoreTaxon of urlStore.selectedTaxa) {
      let taxonData = await getTaxonById(urlStoreTaxon.id);
      if (!taxonData) {
        continue;
      }
      processTaxonData(taxonData, appStore, urlStore);
    }
  }
  loggerStore("++ initPopulateStore selectedTaxa", appStore.selectedTaxa);

  // load selected without taxa
  if (urlStore.selectedWithoutTaxa && urlStore.selectedWithoutTaxa.length > 0) {
    for await (const urlStoreTaxon of urlStore.selectedWithoutTaxa) {
      let taxonData = await getTaxonById(urlStoreTaxon.id);
      if (!taxonData) {
        continue;
      }
      processWithoutTaxonData(taxonData, appStore, urlStore);
    }
  }
  loggerStore(
    "++ initPopulateStore selectedWithoutTaxa",
    appStore.selectedWithoutTaxa,
  );

  // load taxa identified data
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
  loggerStore(
    "++ initPopulateStore selectedTaxaIdentified",
    appStore.selectedTaxaIdentified,
  );

  // load selected without taxa identified
  if (
    urlStore.selectedWithoutTaxaIdentified &&
    urlStore.selectedWithoutTaxaIdentified.length > 0
  ) {
    for await (const urlStoreTaxon of urlStore.selectedWithoutTaxaIdentified) {
      let taxonData = await getTaxonById(urlStoreTaxon.id);
      if (!taxonData) {
        continue;
      }
      processWithoutTaxonIdentifiedData(taxonData, appStore, urlStore);
    }
  }
  loggerStore(
    "++ initPopulateStore selectedWithoutTaxaIdentified",
    appStore.selectedWithoutTaxa,
  );

  // add default taxa
  if (isObservations && urlStore.selectedTaxa === undefined) {
    await addDefaultTaxaRecordToStore(appStore, false);
  } else if (
    isIdentifications &&
    urlStore.selectedTaxaIdentified === undefined
  ) {
    await addDefaultTaxaRecordToStore(appStore, false);
  }
  loggerStore(
    "++ initPopulateStore selectedTaxa",
    appStore.selectedWithoutTaxa,
  );

  await updateCountForAll("all", appStore);
  renderSelectedResources(appStore, false);

  loggerStore("++ initPopulateStore end");

  loggerEvent("[initPopulateStored dispatchEvent] storePopulated");
  calculateObservationsCount(appStore);
  window.dispatchEvent(new Event("storePopulated"));
}

function nonObjectCheck(value: any) {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}
export function setViewMetadata(
  appStore: AppStoreType,
  urlStore: AppStoreType,
) {
  for (let [key1, value1] of Object.entries(urlStore.viewMetadata)) {
    if (nonObjectCheck(value1)) {
      // @ts-ignore
      appStore.viewMetadata[key1] = value1;
    } else {
      for (let [key2, value2] of Object.entries(value1)) {
        if (nonObjectCheck(value2)) {
          // @ts-ignore
          appStore.viewMetadata[key1][key2] = value2;
        } else {
          for (let [key3, value3] of Object.entries(value2)) {
            if (nonObjectCheck(value3)) {
              // @ts-ignore
              appStore.viewMetadata[key1][key2][key3] = value3;
            } else {
              throw new Error(
                `need to add support for ${key3} ${typeof value3} in setViewMetadata`,
              );
            }
          }
        }
      }
    }
  }
}

function populateObservationsApiParams(
  appStore: AppStoreType,
  urlStore: AppStoreType,
) {
  // use url store to populate appStore.observationsApiParams
  for (const [k, value] of Object.entries(urlStore.observationsApiParams)) {
    let key = k as ObservationsApiParamsKeysType;
    if (!key.startsWith("field:") && !observationsApiNames.includes(key)) {
      continue;
    }

    // delete default values
    delete appStore.observationsApiParams[key];

    // only allow any for certain fields
    if (value === "any") {
      if (fieldsWithAny.includes(key)) {
        appStore.observationsApiParams[key] = value;
      }
    } else {
      appStore.observationsApiParams[key] = value;
    }
  }
}

function populateIdentificationsApiParams(
  appStore: AppStoreType,
  urlStore: AppStoreType,
) {
  // use url store to populate appStore.identificationsApiParams
  for (const [k, value] of Object.entries(urlStore.identificationsApiParams)) {
    let key = k as IdentificationsApiParamsKeysType;
    // ignore params whose value is any
    if (fieldsWithAny.includes(key) && value === "any") {
      delete appStore.identificationsApiParams[key];
      // add valid params to identificationsApiParams
    } else if (identificationsApiNames.includes(key)) {
      delete appStore.identificationsApiParams[key];
      appStore.identificationsApiParams[key] = value;
    }
  }
}

// create map.
// used on inital app load, changing views, changing pages.
export async function initRenderMap(appStore: AppStoreType) {
  loggerRender("++ initRenderMap start");
  if (!document.querySelector("#map")) return;

  let isObservations = isObservationsCheck(appStore);
  let isOther = isOtherCheck(appStore);

  // setup map
  let map = L.map("map", {
    center: [0, 0],
    zoom: 2,
    maxZoom: 19,
  });
  var layerControl = L.control.layers().addTo(map);

  // setup library to draw rectangles
  const terraDraw = setupTerraDraw(map);
  terraDraw.start();

  terraDraw.on("finish", () => {
    // add bounding box
    const snapshot = terraDraw.getSnapshot();
    let coors = snapshot[0].geometry.coordinates[0] as LngLatType[];
    saveBBoxToStore(coors, appStore);
  });

  appStore.map.map = map;
  appStore.map.layerControl = layerControl;
  appStore.map.terraDraw = terraDraw;

  if (isObservations) {
    createDrawRectButton(appStore);
  }

  // add basemaps
  let { OpenStreetMap, OpenTopo } = getMapTiles();
  addLayerToMap(OpenStreetMap, map, layerControl, true);
  addLayerToMap(OpenTopo, map, layerControl);

  // add places layers
  renderSelectedPlacesBoundaries(appStore);

  // add project layers
  renderSelectedProjectsBoundaries(appStore);

  // add bounding box layer
  if (appStore.observationsApiParams.nelat !== undefined && isObservations) {
    addiNatBBoxToMap(appStore);
  }

  // load default or selected taxa map layer
  if (isOther) {
    // do not load map tiles
  } else if (
    appStore.selectedTaxa.length === 1 &&
    appStore.selectedTaxa[0].id === 0
  ) {
    // load default Taxa map tiles
    await addDefaultTaxaRecordToMap(appStore);
  } else {
    // update taxa tiles for selected taxa
    if (isObservations) {
      await updateTilesForSelectedTaxa(appStore);
    } else {
      await updateTilesForSelectedTaxaIdentified(appStore);
    }
  }

  // return map to previous position when switching views
  if (appStore.map.bounds) {
    map.fitBounds(appStore.map.bounds);
    // zoom map to places on page load
  } else {
    fitBoundsPlaces(appStore);
  }
}

export function processPlaceData(
  placeData: PlacesResult,
  appStore: AppStoreType,
) {
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
      slug: placeData.slug,
    },
  ];

  let resourceApiParams = getResourceApiParams(isObservations);
  // create comma seperated place_id
  appStore[resourceApiParams].place_id = addValueToCommaSeparatedString(
    placeData.id,
    appStore[resourceApiParams].place_id,
  );
}

export function processWithoutPlaceData(
  placeData: PlacesResult,
  appStore: AppStoreType,
) {
  let isObservations = isObservationsCheck(appStore);

  // save place to store
  appStore.selectedWithoutPlaces = [
    ...appStore.selectedWithoutPlaces,
    {
      id: placeData.id,
      name: placeData.name,
      display_name: placeData.display_name,
      slug: placeData.slug,
    },
  ];

  // create comma seperated place_id
  let resourceApiParams = getResourceApiParams(isObservations);
  appStore[resourceApiParams].not_in_place = addValueToCommaSeparatedString(
    placeData.id,
    appStore[resourceApiParams].not_in_place,
  );
}

export function processBBoxData(
  appStore: AppStoreType,
  urlStore: AppStoreType,
) {
  if (!isObservationsCheck(appStore)) return;
  let lngLatCoors = convertiNatBBoxToLngLat(urlStore.observationsApiParams);
  if (!lngLatCoors) return;

  appStore.observationsApiParams.nelat = urlStore.observationsApiParams.nelat;
  appStore.observationsApiParams.nelng = urlStore.observationsApiParams.nelng;
  appStore.observationsApiParams.swlat = urlStore.observationsApiParams.swlat;
  appStore.observationsApiParams.swlng = urlStore.observationsApiParams.swlng;

  appStore.selectedPlaces = [bboxPlaceRecord(lngLatCoors)];
}

// NOTE: update when adding selectedResource; initPopulateStore
export function processProjectData(
  projectData: ProjectsResult,
  appStore: AppStoreType,
  placeData?: PlacesResult,
) {
  if (isIdentificationsCheck(appStore)) return;

  let project: NormalizediNatProjectType = {
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

export function processNotInProjectData(
  projectData: ProjectsResult,
  appStore: AppStoreType,
) {
  if (isIdentificationsCheck(appStore)) return;

  let project: NormalizediNatProjectType = {
    id: projectData.id,
    name: projectData.title,
    slug: projectData.slug,
  };

  appStore.selectedWithoutProjects = [
    ...appStore.selectedWithoutProjects,
    project,
  ];
  appStore.observationsApiParams.not_in_project =
    addValueToCommaSeparatedString(
      projectData.id,
      appStore.observationsApiParams.not_in_project,
    );
}

export function processTaxonData(
  taxonData: TaxaResult,
  appStore: AppStoreType,
  urlStore: AppStoreType,
) {
  let urlStoreTaxon = urlStore.selectedTaxa.find((t) => t.id === taxonData.id);
  if (!urlStoreTaxon) return;

  let isObservations = isObservationsCheck(appStore);

  // create taxon object
  let taxon: NormalizediNatTaxonType = {
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
  appStore: AppStoreType,
  urlStore: AppStoreType,
) {
  let urlStoreTaxon = urlStore.selectedTaxaIdentified.find(
    (t) => t.id === taxonData.id,
  );
  if (!urlStoreTaxon) return;

  // create taxon object
  let taxon: NormalizediNatTaxonType = {
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

  appStore.selectedTaxaIdentified = [...appStore.selectedTaxaIdentified, taxon];

  if (isObservationsCheck(appStore)) {
    appStore.observationsApiParams.ident_taxon_id =
      addValueToCommaSeparatedString(
        taxonData.id,
        appStore.observationsApiParams.ident_taxon_id,
      );
  } else {
    appStore.identificationsApiParams.taxon_id = addValueToCommaSeparatedString(
      taxonData.id,
      appStore.identificationsApiParams.taxon_id,
    );
  }
}

export function processWithoutTaxonData(
  taxonData: TaxaResult,
  appStore: AppStoreType,
  urlStore: AppStoreType,
) {
  let urlStoreTaxon = urlStore.selectedWithoutTaxa.find(
    (t) => t.id === taxonData.id,
  );
  if (!urlStoreTaxon) return;

  let isObservations = isObservationsCheck(appStore);
  let isIdentifications = isIdentificationsCheck(appStore);

  // create taxon object
  let taxon: NormalizediNatTaxonType = {
    name: taxonData.name,
    default_photo: taxonData.default_photo?.square_url,
    preferred_common_name: taxonData.preferred_common_name,
    rank: taxonData.rank,
    id: taxonData.id,
  };

  let { title, subtitle } = formatTaxonName(taxon, appStore);
  taxon.title = title;
  taxon.subtitle = subtitle;

  appStore.selectedWithoutTaxa = [...appStore.selectedWithoutTaxa, taxon];

  if (isObservations) {
    appStore.observationsApiParams.without_taxon_id =
      addValueToCommaSeparatedString(
        taxonData.id,
        appStore.observationsApiParams.without_taxon_id,
      );
  } else if (isIdentifications) {
    appStore.identificationsApiParams.without_observation_taxon_id =
      addValueToCommaSeparatedString(
        taxonData.id,
        appStore.identificationsApiParams.without_observation_taxon_id,
      );
  }
}

export function processWithoutTaxonIdentifiedData(
  taxonData: TaxaResult,
  appStore: AppStoreType,
  urlStore: AppStoreType,
) {
  let isIdentifications = isIdentificationsCheck(appStore);

  let urlStoreTaxon = urlStore.selectedWithoutTaxaIdentified.find(
    (t) => t.id === taxonData.id,
  );
  if (!urlStoreTaxon) return;

  // create taxon object
  let taxon: NormalizediNatTaxonType = {
    name: taxonData.name,
    default_photo: taxonData.default_photo?.square_url,
    preferred_common_name: taxonData.preferred_common_name,
    rank: taxonData.rank,
    id: taxonData.id,
  };

  let { title, subtitle } = formatTaxonName(taxon, appStore);
  taxon.title = title;
  taxon.subtitle = subtitle;

  appStore.selectedWithoutTaxaIdentified = [
    ...appStore.selectedWithoutTaxaIdentified,
    taxon,
  ];

  if (isIdentifications) {
    appStore.identificationsApiParams.without_taxon_id =
      addValueToCommaSeparatedString(
        taxonData.id,
        appStore.identificationsApiParams.without_taxon_id,
      );
  }
}

function processUserData(userData: UserResult, appStore: AppStoreType) {
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

function processWithoutUserData(userData: UserResult, appStore: AppStoreType) {
  if (isIdentificationsCheck(appStore)) return;

  appStore.selectedWithoutUsers = [
    ...appStore.selectedWithoutUsers,
    {
      id: userData.id,
      name: userData.name,
      login: userData.login,
    },
  ];

  // create comma seperated user_id
  appStore.observationsApiParams.not_user_id = addValueToCommaSeparatedString(
    userData.id,
    appStore.observationsApiParams.not_user_id,
  );
}

function processUserIdentifierData(
  userData: UserResult,
  appStore: AppStoreType,
) {
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

function processWithoutUserIdentifierData(
  userData: UserResult,
  appStore: AppStoreType,
) {
  if (isIdentificationsCheck(appStore)) return;

  appStore.selectedWithoutUsersIdentifiers = [
    ...appStore.selectedWithoutUsersIdentifiers,
    {
      id: userData.id,
      name: userData.name,
      login: userData.login,
    },
  ];

  // create comma seperated user_id
  appStore.observationsApiParams.without_ident_user_id =
    addValueToCommaSeparatedString(
      userData.id,
      appStore.observationsApiParams.without_ident_user_id,
    );
}

function processUnobservedByUserData(
  userData: UserResult,
  appStore: AppStoreType,
) {
  if (isIdentificationsCheck(appStore)) return;

  appStore.selectedUnobservedByUser = {
    id: userData.id,
    name: userData.name,
    login: userData.login,
  };

  appStore.observationsApiParams.unobserved_by_user_id = userData.id;
}

function processReviewerData(userData: UserResult, appStore: AppStoreType) {
  if (isIdentificationsCheck(appStore)) return;

  appStore.selectedReviewer = {
    id: userData.id,
    name: userData.name,
    login: userData.login,
  };

  appStore.observationsApiParams.viewer_id = userData.id;
}

function processUserAnnotatorData(
  userData: UserResult,
  appStore: AppStoreType,
) {
  if (isIdentificationsCheck(appStore)) return;

  appStore.selectedUsersAnnotators = [
    ...appStore.selectedUsersAnnotators,
    {
      id: userData.id,
      name: userData.name,
      login: userData.login,
    },
  ];

  // create comma seperated user_id
  appStore.observationsApiParams.annotation_user_id =
    addValueToCommaSeparatedString(
      userData.id,
      appStore.observationsApiParams.annotation_user_id,
    );
}

export async function initApp() {
  loggerRender("initApp");

  let appStore = window.app.store;
  if (!appStore.currentView) return;

  populateStoreWithLocaleStorage(appStore);

  let urlData = decodeAppUrl(window.location.search, window.location.pathname);
  await initPopulateStore(appStore, urlData);

  initRenderView(appStore);
}

function initRenderView(appStore: AppStoreType) {
  if (!appStore.currentView) return;

  addCurrentPageClass(appStore.record_type);

  // load view
  let viewContainerEl = document.querySelector("#view-container");
  if (!viewContainerEl) return;

  let templateName = viewAndTemplateObject(appStore.currentView);
  let view = document.createElement(templateName);
  viewContainerEl.appendChild(view);
}

export function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service_worker.js");
  }
}
