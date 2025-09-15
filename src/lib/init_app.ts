import L from "leaflet";

import type {
  NormalizediNatTaxon,
  MapStore,
  CustomGeoJSON,
  iNatApiParamsKeys,
  ObservationTilesSetting,
} from "../types/app";
import {
  convertParamsBBoxToLngLat,
  drawMapBoundingBox,
  fitBoundsPlaces,
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
} from "./data_utils";
import { logger } from "./logger.ts";

export async function initApp(appStore: MapStore, urlStore: MapStore) {
  logger("++ initApp");

  let map = appStore.map.map;
  if (!map) return;

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
  if (urlStore.currentView === "observations") {
    appStore.currentObservationsSubview = urlStore.currentObservationsSubview;
  } else {
    appStore.currentObservationsSubview = undefined;
  }

  // HACK: trigger change in proxy store
  appStore.inatApiParams = appStore.inatApiParams;
  appStore.currentObservationsSubview = appStore.currentObservationsSubview;
  appStore.currentView = appStore.currentView;

  // get place data
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

  // get project data
  if (urlStore.selectedProjects?.length > 0) {
    for await (const urlStoreProject of urlStore.selectedProjects) {
      let projectData = await getProjectById(urlStoreProject.id);
      if (!projectData) {
        continue;
      }
      processProjectData(projectData, appStore);
    }
  }

  // get user data
  if (urlStore.selectedUsers?.length > 0) {
    for await (const urlStoreUser of urlStore.selectedUsers) {
      let data = await getUserById(urlStoreUser.id);
      if (!data) {
        continue;
      }
      processUserData(data, appStore);
    }
  }

  // get taxa data
  if (urlStore.selectedTaxa && urlStore.selectedTaxa.length > 0) {
    for await (const urlStoreTaxon of urlStore.selectedTaxa) {
      let taxonData = await getTaxonById(urlStoreTaxon.id);
      if (!taxonData) {
        continue;
      }
      let taxon = await processTaxonData(taxonData, appStore, urlStore);
      if (taxon) {
        await fetchiNatMapDataForTaxon(taxon, appStore);
        await getObservationsCountForTaxon(taxon, appStore);
      }
    }
  }

  // load allTaxon map tiles if no taxon id in the url
  if (
    urlStore.selectedTaxa === undefined ||
    urlStore.selectedTaxa.length === 0
  ) {
    await addAllTaxaRecordToMapAndStore(appStore);
  }

  fitBoundsPlaces(appStore);
  renderTaxaList(appStore);
  renderPlacesList(appStore);
  renderProjectsList(appStore);
  renderUsersList(appStore);

  window.dispatchEvent(new Event("appInitialized"));
}

export async function loadCachedStore(appStore: MapStore) {
  let map = appStore.map.map;
  if (!map) return;

  // get place data
  if (
    appStore.selectedPlaces?.length > 0 &&
    appStore.inatApiParams.nelat === undefined
  ) {
    for await (const place of appStore.selectedPlaces) {
      let oldLayers = appStore.placesMapLayers[place.id];
      if (oldLayers) {
        oldLayers.forEach((layer) => layer.addTo(map));
      } else {
        console.error("loadCachedStore selectedPlaces error.");
      }
    }
    // get bounding box data
  } else if (appStore.inatApiParams.nelat !== undefined) {
    if (appStore.refreshMap.layer) {
      appStore.refreshMap.layer.addTo(map);
    }
  }

  let layerControl = appStore.map.layerControl;

  // get taxa data
  for await (const taxon of appStore.selectedTaxa) {
    // removeOneTaxonFromMap(appStore, taxon.id);
    let layers = appStore.taxaMapLayers[taxon.id];
    layers.forEach((layer, i) => {
      if (i === 0) {
        layer.addTo(map);
      }
      if (layerControl) {
        let control_name =
          (layer as unknown as ObservationTilesSetting).options.control_name ||
          "";
        layerControl.addOverlay(layer, control_name);
      }
    });
  }

  // load allTaxon map tiles if no taxon id in the url
  if (
    appStore.selectedTaxa === undefined ||
    appStore.selectedTaxa.length === 0
  ) {
    await addAllTaxaRecordToMapAndStore(appStore);
  }

  // set map to previous position
  if (appStore.map.bounds) {
    map.fitBounds(appStore.map.bounds);
  }
}

export async function processTaxonData(
  taxonData: TaxaResult,
  appStore: MapStore,
  urlStore: MapStore,
) {
  let map = appStore.map.map;
  if (map === null) return;
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

  // update appStore
  appStore.inatApiParams = {
    ...appStore.inatApiParams,
    taxon_id: taxon.id.toString(),
    colors: urlStoreTaxon.color,
  };

  return taxon;
}

export function processPlaceData(placeData: PlacesResult, appStore: MapStore) {
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

export function processBBoxData(appStore: MapStore, urlStore: MapStore) {
  let map = appStore.map.map;
  if (!map) return;
  let lngLatCoors = convertParamsBBoxToLngLat(urlStore.inatApiParams);
  if (!lngLatCoors) return;

  let layer = drawMapBoundingBox(map, lngLatCoors) as any;
  appStore.refreshMap = {
    ...appStore.refreshMap,
    layer: layer,
  };

  appStore.inatApiParams.nelat = urlStore.inatApiParams.nelat;
  appStore.inatApiParams.nelng = urlStore.inatApiParams.nelng;
  appStore.inatApiParams.swlat = urlStore.inatApiParams.swlat;
  appStore.inatApiParams.swlng = urlStore.inatApiParams.swlng;

  appStore.selectedPlaces = [bboxPlaceRecord(lngLatCoors)];
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
