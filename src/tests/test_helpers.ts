import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import L from "leaflet";
import { expect } from "vitest";

import { addLayerToMap, getMapTiles } from "../lib/map_utils";
import type {
  AppStoreSelectedResourceKeysType,
  AppStoreSelectedResourcesKeysType,
  AppStoreType,
  LngLatType,
  NormalizediNatPlaceType,
  NormalizediNatProjectType,
  NormalizediNatTaxonType,
  NormalizediNatUserType,
} from "../types/app";
import { mapStore } from "../lib/store.ts";
import { allTaxaRecord } from "../data/inat_data.ts";
import { loggerUrl } from "../lib/logger.ts";
import {
  cnc1ProjectApi,
  cnc2PlaceApi,
  cnc2ProjectApi,
  lifeTaxaApi,
  losangelesPlaceAPI,
  losAngelesSearchApi,
  redoakTaxaApi,
  sandiegoPlaceAPI,
  sandiegoSearchApi,
  user1UserApi,
  user2UserApi,
} from "./fixtures/inatApi.ts";
import type { PolygonJson } from "../types/inat_api";
import { selectedResourcesAll } from "../data/app_data.ts";

function adjustCount(url: string, count: number) {
  let lifeCount = life().observations_count as number;
  let oakCount = redOak().observations_count as number;
  let allCount = allTaxa.observations_count;

  if (new RegExp(`[&?]taxon_id=${allTaxa.id}`).test(url)) {
    count = allCount;
  } else if (
    new RegExp(`[&?]taxon_id=${lifeBasic.id}%2C${redOakBasic.id}`).test(url)
  ) {
    count = lifeCount + oakCount;
  } else if (new RegExp(`[&?]taxon_id=${lifeBasic.id}`).test(url)) {
    count = lifeCount;
  } else if (new RegExp(`[&?]taxon_id=${redOakBasic.id}`).test(url)) {
    count = oakCount;
  } else if (!new RegExp(`[&?]taxon_id=`).test(url)) {
    count = allCount;
  }

  count = adjustCountMore(url, count);

  if (url.includes(`&ident_user_id=${user1.id}`)) {
    count = count * 0.75;
  }
  if (url.includes(`&unobserved_by_user_id=${user1.id}`)) {
    count = count * 0.65;
  }

  return Math.round(count);
}

function adjustCountIdentification(url: string, count: number) {
  let lifeCount = lifeIdentification().identifications_count as number;
  let oakCount = redOakIdentification().identifications_count as number;
  let allCount = allTaxaIdentification.identifications_count;

  if (new RegExp(`[?&](observation_)?taxon_id=${allTaxa.id}`).test(url)) {
    count = allCount;
  } else if (
    new RegExp(
      `[?&](observation_)?taxon_id=${lifeBasic.id}%2C${redOakBasic.id}`,
    ).test(url)
  ) {
    count = lifeCount + oakCount;
  } else if (
    new RegExp(`[?&](observation_)?taxon_id=${lifeBasic.id}`).test(url)
  ) {
    count = lifeCount;
  } else if (
    new RegExp(`[?&](observation_)?taxon_id=${redOakBasic.id}`).test(url)
  ) {
    count = oakCount;
  } else {
    count = allCount;
  }

  count = adjustCountMore(url, count);

  return Math.round(count);
}

function adjustCountMore(url: string, count: number) {
  if (new RegExp(`[&?]place_id=${losangeles.id}%2C${sandiego.id}`).test(url)) {
  } else if (new RegExp(`[&?]place_id=${losangeles.id}`).test(url)) {
    count = count * 0.6;
  } else if (new RegExp(`[&?]place_id=${sandiego.id}`).test(url)) {
    count = count * 0.4;
  }

  if (
    new RegExp(`[&?]project_id=${project_cnc1.id}%2C${project_cnc2.id}`).test(
      url,
    )
  ) {
  } else if (new RegExp(`[&?]project_id=${project_cnc1.id}`).test(url)) {
    count = count * 0.7;
  } else if (new RegExp(`[&?]project_id=${project_cnc2.id}`).test(url)) {
    count = count * 0.3;
  }

  if (new RegExp(`[&?]user_id=${user1.id}%2C${user2.id}`).test(url)) {
  } else if (new RegExp(`[&?]user_id=${user1.id}`).test(url)) {
    count = count * 0.45;
  } else if (new RegExp(`[&?]user_id=${user2.id}`).test(url)) {
    count = count * 0.55;
  }

  return count;
}

export function createMockServer() {
  const handlers = [
    http.get("https://api.inaturalist.org/v1/grid*", async (_args) => {
      loggerUrl("request.url", _args.request.url);
      return HttpResponse.json({ id: "abc-123456" });
    }),
    http.get("https://api.inaturalist.org/v1/taxa/48460", async (_args) => {
      return HttpResponse.json(lifeTaxaApi);
    }),
    http.get("https://api.inaturalist.org/v1/taxa/861036", async (_args) => {
      return HttpResponse.json(redoakTaxaApi);
    }),
    http.get("https://api.inaturalist.org/v1/places/962", async (_args) => {
      return HttpResponse.json(losangelesPlaceAPI);
    }),
    http.get("https://api.inaturalist.org/v1/places/829", async (_args) => {
      return HttpResponse.json(sandiegoPlaceAPI);
    }),
    http.get(
      "https://api.inaturalist.org/v1/projects/237729",
      async (_args) => {
        return HttpResponse.json(cnc1ProjectApi);
      },
    ),
    http.get(
      "https://api.inaturalist.org/v1/projects/229902",
      async (_args) => {
        return HttpResponse.json(cnc2ProjectApi);
      },
    ),
    http.get("https://api.inaturalist.org/v1/users/222137", async (_args) => {
      return HttpResponse.json(user1UserApi);
    }),
    http.get("https://api.inaturalist.org/v1/users/677256", async (_args) => {
      return HttpResponse.json(user2UserApi);
    }),
    http.get("https://api.inaturalist.org/v1/places/129542", async (_args) => {
      return HttpResponse.json(cnc2PlaceApi);
    }),
    http.get("https://api.inaturalist.org/v2/observations*", async (_args) => {
      let url = _args.request.url.split("&fields=")[0];
      loggerUrl("request.url", url);
      let count = adjustCount(url, -999);

      return HttpResponse.json({ total_results: count, results: [] });
    }),
    http.get(
      "https://api.inaturalist.org/v1/identifications/*",
      async (_args) => {
        let url = _args.request.url;
        let count = adjustCountIdentification(url, -999);

        return HttpResponse.json({ total_results: count, results: [] });
      },
    ),
    http.get("https://{*}.tile.openstreetmap.org*", async (_args) => {
      loggerUrl("request.url", _args.request.url);
      return HttpResponse.json({ total_results: 123456, results: [] });
    }),
    http.get("*", async (_args) => {
      console.error("!! request.url !!", _args.request.url);
      return HttpResponse.json({});
    }),
  ];

  const server = setupServer(...handlers);

  return server;
}

export let defaultParams = {
  verifiable: true,
  spam: false,
  locale: "en",
};
export let defaultQuery = "verifiable=true&spam=false";

export let colors = ["#4477aa", "#66ccee", "#228833"];
export let colorsEncoded = ["%234477aa", "%2366ccee", "%23228833"];

export let placeLabel_la = "place layer: Los Angeles, 962";
export let placeLabel_sd = "place layer: San Diego, 829";
export let projectLabel_cnc2 =
  "project layer: City Nature Challenge 2025: Ōtautahi/Christchurch, 229902";

export let gridLabel_life = "overlay: iNat grid, taxon_id 48460";
export let gridLabel_oaks = "overlay: iNat grid, taxon_id 861036";
export let gridLabel_monarch = "overlay: iNat grid, taxon_id 48662";
export let gridLabel_lifeoaks = "overlay: iNat grid, taxon_id 48460,861036";

export let gridLabel_withoutLife =
  "overlay: iNat grid, taxon_id 0, without_taxon_id 48460";
export let gridLabel_withoutLifeOak =
  "overlay: iNat grid, taxon_id 0, without_taxon_id 48460,861036";

export let gridLabel_life_la =
  "overlay: iNat grid, taxon_id 48460, place_id 962";
export let gridLabel_allTaxaRecord_la =
  "overlay: iNat grid, taxon_id 0, place_id 962";

export let gridLabel_life_sd =
  "overlay: iNat grid, taxon_id 48460, place_id 829";
export let gridLabel_allTaxaRecord_sd =
  "overlay: iNat grid, taxon_id 0, place_id 829";

export let gridLabel_life_la_sd =
  "overlay: iNat grid, taxon_id 48460, place_id 962,829";
export let gridLabel_allTaxaRecord_la_sd =
  "overlay: iNat grid, taxon_id 0, place_id 962,829";

export let gridLabel_oaks_la =
  "overlay: iNat grid, taxon_id 861036, place_id 962";
export let gridLabel_oaks_la_sd =
  "overlay: iNat grid, taxon_id 861036, place_id 962,829";

export let gridLabel_allTaxaRecord = "overlay: iNat grid, taxon_id 0";

export let gridLabel_allTaxaRecord_project1 =
  "overlay: iNat grid, taxon_id 0, project_id 237729";
export let gridLabel_allTaxaRecord_project2 =
  "overlay: iNat grid, taxon_id 0, project_id 229902";
export let gridLabel_allTaxaRecord_projects =
  "overlay: iNat grid, taxon_id 0, project_id 237729,229902";

export let gridLabel_allTaxaRecord_user1 =
  "overlay: iNat grid, taxon_id 0, user_id 222137";
export let gridLabel_allTaxaRecord_user2 =
  "overlay: iNat grid, taxon_id 0, user_id 677256";
export let gridLabel_allTaxaRecord_users =
  "overlay: iNat grid, taxon_id 0, user_id 222137,677256";

export let gridLabel_allTaxaRecord_user1Identifier =
  "overlay: iNat grid, taxon_id 0, ident_user_id 222137";
export let gridLabel_allTaxaRecord_user2Identifier =
  "overlay: iNat grid, taxon_id 0, ident_user_id 677256";
export let gridLabel_allTaxaRecord_usersIdentifiers =
  "overlay: iNat grid, taxon_id 0, ident_user_id 222137,677256";

export let gridLabel_allTaxaRecord_user1Unobserved =
  "overlay: iNat grid, taxon_id 0, unobserved_by_user_id 222137";
export let gridLabel_allTaxaRecord_user2Unobserved =
  "overlay: iNat grid, taxon_id 0, unobserved_by_user_id 677256";

export let gridLabel_allTaxaRecord_user1Reviewer =
  "overlay: iNat grid, taxon_id 0, viewer_id 222137";
export let gridLabel_allTaxaRecord_user2Reviewer =
  "overlay: iNat grid, taxon_id 0, viewer_id 677256";

export let gridLabel_allTaxaRecord_user1Annotator =
  "overlay: iNat grid, taxon_id 0, annotation_user_id 222137";
export let gridLabel_allTaxaRecord_user2Annotator =
  "overlay: iNat grid, taxon_id 0, annotation_user_id 677256";
export let gridLabel_allTaxaRecord_usersAnnotator =
  "overlay: iNat grid, taxon_id 0, annotation_user_id 222137,677256";

export let gridLabel_allTaxaRecord_project1NotInProject =
  "overlay: iNat grid, taxon_id 0, not_in_project 237729";
export let gridLabel_allTaxaRecord_project2NotInProject =
  "overlay: iNat grid, taxon_id 0, not_in_project 229902";
export let gridLabel_allTaxaRecord_projectsNotInProject =
  "overlay: iNat grid, taxon_id 0, not_in_project 237729,229902";

export let gridLabel_allTaxaRecord_withoutLife =
  "overlay: iNat grid, taxon_id 0, without_taxon_id 48460";
export let gridLabel_allTaxaRecord_withoutOak =
  "overlay: iNat grid, taxon_id 0, without_taxon_id 861036";
export let gridLabel_allTaxaRecord_withoutTaxa =
  "overlay: iNat grid, taxon_id 0, without_taxon_id 48460,861036";

export let gridLabel_allTaxaRecordIdent =
  "overlay: iNat grid, ident_taxon_id 0";

export let gridLabel_allTaxaRecordIdent_la =
  "overlay: iNat grid, ident_taxon_id 0, place_id 962";
export let gridLabel_allTaxaRecordIdent_la_sd =
  "overlay: iNat grid, ident_taxon_id 0, place_id 962,829";

export let gridLabel_allTaxaRecordIdent_user1Identifier =
  "overlay: iNat grid, ident_taxon_id 0, ident_user_id 222137";
export let gridLabel_allTaxaRecordIdent_usersIdentifiers =
  "overlay: iNat grid, ident_taxon_id 0, ident_user_id 222137,677256";

export let gridLabel_allTaxaRecordIdent_withoutTaxa =
  "overlay: iNat grid, ident_taxon_id 0, without_taxon_id 48460,861036";
export let gridLabel_allTaxaRecordIdent_withoutLife =
  "overlay: iNat grid, ident_taxon_id 0, without_taxon_id 48460";

export let gridLabel_lifeIdent = "overlay: iNat grid, ident_taxon_id 48460";
export let gridLabel_oakIdent = "overlay: iNat grid, ident_taxon_id 861036";

export let gridLabel_life_la_user1 =
  "overlay: iNat grid, taxon_id 48460, place_id 962, user_id 222137";

export let bBoxLabel = "bounding box";
export let basemapLabel_osm = "basemap: Open Street Map";
export let placeBBoxLabel = "place layer: Custom Boundary, 0";

export let gridLabel_life_la_sd_project1 =
  "overlay: iNat grid, taxon_id 48460, place_id 962,829, project_id 237729";
export let gridLabel_life_la_sd_projects =
  "overlay: iNat grid, taxon_id 48460, place_id 962,829, project_id 237729,229902";

export let gridLabel_oaks_la_sd_project1 =
  "overlay: iNat grid, taxon_id 861036, place_id 962,829, project_id 237729";
export let gridLabel_oaks_la_sd_projects =
  "overlay: iNat grid, taxon_id 861036, place_id 962,829, project_id 237729,229902";

export let gridLabel_life_la_project1 =
  "overlay: iNat grid, taxon_id 48460, place_id 962, project_id 237729";

export let gridLabel_life_la_project1_user1 =
  "overlay: iNat grid, taxon_id 48460, place_id 962, project_id 237729, user_id 222137";
export let gridLabel_oak_la_project1_user1 =
  "overlay: iNat grid, taxon_id 861036, place_id 962, project_id 237729, user_id 222137";

export let gridLabel_life_la_sd_project1_user1 =
  "overlay: iNat grid, taxon_id 48460, place_id 962,829, project_id 237729, user_id 222137";
export let gridLabel_oak_la_sd_project1_user1 =
  "overlay: iNat grid, taxon_id 861036, place_id 962,829, project_id 237729, user_id 222137";
export let gridLabel_life_la_sd_projects_user1 =
  "overlay: iNat grid, taxon_id 48460, place_id 962,829, project_id 237729,229902, user_id 222137";
export let gridLabel_oak_la_sd_projects_user1 =
  "overlay: iNat grid, taxon_id 861036, place_id 962,829, project_id 237729,229902, user_id 222137";

export let gridLabel_life_places_projects_users =
  "overlay: iNat grid, taxon_id 48460, place_id 962,829, project_id 237729,229902, user_id 222137,677256";
export let gridLabel_oaks_places_projects_users =
  "overlay: iNat grid, taxon_id 861036, place_id 962,829, project_id 237729,229902, user_id 222137,677256";

export let gridLabel_life_places_users =
  "overlay: iNat grid, taxon_id 48460, place_id 962,829, user_id 222137,677256";
export let gridLabel_oaks_places_users =
  "overlay: iNat grid, taxon_id 861036, place_id 962,829, user_id 222137,677256";

export let gridLabel_life_places_user2Identifiers =
  "overlay: iNat grid, taxon_id 48460, place_id 962,829, ident_user_id 677256";

export let gridLabel_life_places_usersIdentifiers =
  "overlay: iNat grid, taxon_id 48460, place_id 962,829, ident_user_id 222137,677256";
export let gridLabel_oaks_places_usersIdentifiers =
  "overlay: iNat grid, taxon_id 861036, place_id 962,829, ident_user_id 222137,677256";

export let gridLabel_life_project1 =
  "overlay: iNat grid, taxon_id 48460, project_id 237729";
export let gridLabel_life_project1_user1 =
  "overlay: iNat grid, taxon_id 48460, project_id 237729, user_id 222137";

export let gridLabel_life_identified_places_usersIdentifiers =
  "overlay: iNat grid, ident_taxon_id 861036, place_id 962,829, ident_user_id 222137,677256";

export let gridLabel_allTaxaRecord_la_project1 =
  "overlay: iNat grid, taxon_id 0, place_id 962, project_id 237729";
export let gridLabel_allTaxaRecord_la_project1_user1 =
  "overlay: iNat grid, taxon_id 0, place_id 962, project_id 237729, user_id 222137";

export let gridLabel_life_places_projects_user1 =
  "overlay: iNat grid, taxon_id 48460, place_id 962,829, project_id 237729,229902, user_id 222137";
export let gridLabel_oak_places_projects_user1 =
  "overlay: iNat grid, taxon_id 861036, place_id 962,829, project_id 237729,229902, user_id 222137";

export let gridLabel_life_places_identifier =
  "overlay: iNat grid, taxon_id 48460, place_id 962,829, project_id 237729,229902, user_id 222137,677256, " +
  "ident_user_id 222137";
export let gridLabel_oaks_places_identifier =
  "overlay: iNat grid, taxon_id 861036, place_id 962,829, project_id 237729,229902, user_id 222137,677256, " +
  "ident_user_id 222137";

export let gridLabel_life_places_unobserved =
  "overlay: iNat grid, taxon_id 48460, place_id 962,829, project_id 237729,229902, user_id 222137,677256, " +
  "ident_user_id 222137, unobserved_by_user_id 222137";
export let gridLabel_oaks_places_unobserved =
  "overlay: iNat grid, taxon_id 861036, place_id 962,829, project_id 237729,229902, user_id 222137,677256, " +
  "ident_user_id 222137, unobserved_by_user_id 222137";

export let gridLabel_life_places_viewer =
  "overlay: iNat grid, taxon_id 48460, place_id 962,829, project_id 237729,229902, user_id 222137,677256, " +
  "ident_user_id 222137, unobserved_by_user_id 222137, viewer_id 222137";
export let gridLabel_oaks_places_viewer =
  "overlay: iNat grid, taxon_id 861036, place_id 962,829, project_id 237729,229902, user_id 222137,677256, " +
  "ident_user_id 222137, unobserved_by_user_id 222137, viewer_id 222137";

export let gridLabel_life_resource =
  "overlay: iNat grid, taxon_id 48460, place_id 962, project_id 237729, user_id 222137";

export let gridLabel_life_bbox_resources =
  "overlay: iNat grid, taxon_id 48460, project_id 237729,229902, user_id 222137,677256";
export let gridLabel_oaks_bbox_resources =
  "overlay: iNat grid, taxon_id 861036, project_id 237729,229902, user_id 222137,677256";

export let lifeBasic: NormalizediNatTaxonType = {
  name: "Life",
  default_photo: "https://inat.com/photos/347064198/square.jpeg",
  preferred_common_name: "life",
  rank: "stateofmatter",
  id: 48460,
};

export function life(color = colors[0]) {
  return {
    ...lifeBasic,
    title: "Life",
    subtitle: "Life",
    color: color,
    observations_count: 10000,
  } as NormalizediNatTaxonType;
}

export function lifeIdentification() {
  let taxon = life();
  taxon.identifications_count = 2 * (taxon.observations_count as number);
  delete taxon.observations_count;
  return taxon;
}

export let redOakBasic: NormalizediNatTaxonType = {
  name: "Lobatae",
  default_photo: "https://inat.com/photos/149586607/square.jpg",
  preferred_common_name: "red oaks",
  rank: "section",
  id: 861036,
};

export function redOak(color = colors[1]) {
  return {
    ...redOakBasic,
    title: "Red Oaks",
    subtitle: "Lobatae",
    color: color,
    observations_count: 1000,
  } as NormalizediNatTaxonType;
}

export function redOakIdentification() {
  let taxon = redOak();
  taxon.identifications_count = 2 * (taxon.observations_count as number);
  delete taxon.observations_count;
  return taxon;
}

export let monarchBasic: NormalizediNatTaxonType = {
  name: "Danaus plexippus",
  default_photo: "https://inat.com/photos/61756746/square.jpg",
  preferred_common_name: "Monarch",
  matched_term: "mon",
  rank: "species",
  id: 48662,
};

export function monarch(color = colors[2]) {
  return {
    ...monarchBasic,
    title: "Monarch",
    subtitle: "Danaus plexippus",
    color: color,
    observations_count: 100,
  };
}

export let milkweedBasic: NormalizediNatTaxonType = {
  name: "Asclepias fascicularis",
  default_photo: "https://inat.com/photos/61756746/square.jpg",
  preferred_common_name: "Narrowleaf Milkweed",
  matched_term: "nar",
  rank: "species",
  id: 56851,
};

export const allTaxa = {
  ...allTaxaRecord,
  observations_count: 100000,
  title: "All species",
};

export const allTaxaIdentification = {
  ...allTaxaRecord,
  identifications_count: 200000,
  title: "All species",
};

export let losangeles: NormalizediNatPlaceType = {
  display_name: "Los Angeles County, US, CA",
  id: 962,
  name: "Los Angeles",
  geometry: losAngelesSearchApi.results[0].record.geometry_geojson,
  bounding_box: losAngelesSearchApi.results[0].record.bounding_box_geojson,
  slug: "los-angeles-county",
};

export let sandiego: NormalizediNatPlaceType = {
  id: 829,
  name: "San Diego",
  display_name: "San Diego County, CA, US",
  bounding_box: sandiegoSearchApi.results[0].record.bounding_box_geojson,
  geometry: sandiegoSearchApi.results[0].record.geometry_geojson,
  slug: "san-diego-county",
};

export let bbox = [
  [-111, 45],
  [-111, 41],
  [-104, 41],
  [-104, 45],
  [-111, 45],
] as LngLatType[];

export let iNatBboxParams = "nelng=-104&nelat=45&swlat=41&swlng=-111";

export let bBoxPlace: NormalizediNatPlaceType = {
  id: 0,
  name: "Custom Boundary",
  display_name: "Custom Boundary",
  bounding_box: {
    type: "Polygon",
    coordinates: [bbox],
  },
};

export let bBoxPlaceLA: NormalizediNatPlaceType = {
  id: 0,
  name: "Custom Boundary",
  display_name: "Custom Boundary",
  bounding_box: {
    type: "Polygon",
    coordinates: [
      [
        [-118.12500000000001, 34.30714385628804],
        [-118.12500000000001, 34.30714385628804],
        [-118.12500000000001, 34.30714385628804],
        [-118.12500000000001, 34.30714385628804],
      ],
    ],
  },
};

export let project_cnc1: NormalizediNatProjectType = {
  id: 237729,
  name: "City Nature Challenge 2025: Aotearoa New Zealand",
  slug: "city-nature-challenge-2025-aotearoa-new-zealand",
};

export let project_cnc2: NormalizediNatProjectType = {
  id: 229902,
  name: "City Nature Challenge 2025: Ōtautahi/Christchurch",
  slug: "city-nature-challenge-2025-otautahi-christchurch",
  geometry: cnc2PlaceApi.results[0].geometry_geojson as PolygonJson,
  bounding_box: cnc2PlaceApi.results[0].bounding_box_geojson as PolygonJson,
};

export let user1: NormalizediNatUserType = {
  id: 222137,
  login: "reiner",
  name: "Reiner Richter",
};

export let user2: NormalizediNatUserType = {
  id: 677256,
  login: "alanhorstmann",
  name: "Alan Horstmann",
};

export function setupMapAndStore() {
  let map = L.map("map", {
    center: [0, 0],
    zoom: 2,
    maxZoom: 19,
  });
  var layerControl = L.control.layers().addTo(map);
  let { OpenStreetMap } = getMapTiles();
  addLayerToMap(OpenStreetMap, map, layerControl, true);

  let dup = structuredClone(mapStore);
  let store: AppStoreType = {
    ...dup,
    map: {
      ...structuredClone(mapStore.map),
      map: map,
      layerControl: layerControl,
      terraDraw: null,
    },
  };

  return { map, layerControl, store };
}

export function expectEmpytMap(store: AppStoreType) {
  expect(store.observationsApiParams).toStrictEqual(
    mapStore.observationsApiParams,
  );
  expect(store.selectedTaxa).toStrictEqual([]);
  expect(store.taxaMapLayers).toStrictEqual({});
  expect(store.selectedPlaces).toStrictEqual([]);
  expect(store.placesMapLayers).toStrictEqual({});
}

export function expectNoTaxa(store: AppStoreType) {
  expect(store.selectedTaxa).toStrictEqual([]);
  expect(store.taxaMapLayers).toStrictEqual({});
}

export function expectNoTaxaIdentified(store: AppStoreType) {
  expect(store.selectedTaxaIdentified).toStrictEqual([]);
}

export function expectDefaultTaxaRecord(store: AppStoreType, count = 0) {
  let taxa = structuredClone(allTaxa);
  if (count > 0) {
    taxa.observations_count = Math.round(count);
  }
  expect(store.selectedTaxa).toStrictEqual([taxa]);
  expect(Object.keys(store.taxaMapLayers)).toStrictEqual([taxa.id.toString()]);
  expect(store.taxaMapLayers[0].length).toBe(3);
}

export function expectDefaultTaxaRecordIdentification(
  store: AppStoreType,
  count = 0,
) {
  let taxa = structuredClone(allTaxaIdentification);
  delete taxa.observations_count;
  if (count > 0) {
    taxa.identifications_count = Math.round(count);
  }

  expect(store.selectedTaxaIdentified).toStrictEqual([taxa]);
  expect(Object.keys(store.taxaIdentifiedMapLayers)).toStrictEqual(["0"]);
  expect(store.taxaIdentifiedMapLayers["0"].length).toBe(3);
}

export function expectEmptyResources(
  store: AppStoreType,
  changedResources: (
    | AppStoreSelectedResourcesKeysType
    | AppStoreSelectedResourceKeysType
  )[] = [],
) {
  let defaultStore = structuredClone(mapStore);

  selectedResourcesAll.forEach((resource) => {
    if (changedResources.includes(resource)) return;

    expect(store[resource]).toStrictEqual(defaultStore[resource]);
  });
}

export function expectLifeTaxa(
  store: AppStoreType,
  count = 0,
  color = colors[0],
) {
  let taxa = structuredClone(life());
  if (count > 0) {
    taxa.observations_count = Math.round(count);
  }
  taxa.color = color;

  expect(store.selectedTaxa).toStrictEqual([taxa]);
  expect(Object.keys(store.taxaMapLayers)).toEqual([taxa.id.toString()]);
  expect(store.taxaMapLayers[taxa.id].length).toBe(4);
}

export function expectLifeTaxaMapOnly(store: AppStoreType) {
  let taxa = structuredClone(life());
  expect(Object.keys(store.taxaMapLayers)).toEqual([taxa.id.toString()]);
  expect(store.taxaMapLayers[taxa.id].length).toBe(4);
}

export function expectLifeTaxaIdentification(store: AppStoreType, count = 0) {
  let taxa = structuredClone(life());
  delete taxa.observations_count;
  if (count > 0) {
    taxa.identifications_count = Math.round(count);
  }

  expect(store.selectedTaxa).toStrictEqual([taxa]);
  expect(Object.keys(store.taxaMapLayers)).toEqual([taxa.id.toString()]);
  expect(store.taxaMapLayers[taxa.id].length).toBe(4);
}

export function expectLifeTaxaIdentifiedIdentification(
  store: AppStoreType,
  count = 0,
) {
  let taxa = structuredClone(life());
  delete taxa.observations_count;
  delete taxa.color;
  if (count > 0) {
    taxa.identifications_count = count;
  }

  expect(store.selectedTaxaIdentified).toStrictEqual([taxa]);
}

export function expectLifeTaxaIdentifiedMapOnly(store: AppStoreType) {
  let taxa = structuredClone(lifeIdentification());
  expect(Object.keys(store.taxaIdentifiedMapLayers)).toEqual([
    taxa.id.toString(),
  ]);
  expect(store.taxaIdentifiedMapLayers[taxa.id].length).toEqual(4);
}

export function expectOakTaxa(store: AppStoreType, color = colors[1]) {
  let oak = redOak(color);
  expect(store.selectedTaxa).toStrictEqual([oak]);
  expect(Object.keys(store.taxaMapLayers)).toEqual([oak.id.toString()]);
  expect(store.taxaMapLayers[oak.id].length).toBe(4);
}

export function expectOakTaxaMapOnly(store: AppStoreType) {
  let oak = redOak();
  expect(Object.keys(store.taxaMapLayers)).toEqual([oak.id.toString()]);
  expect(store.taxaMapLayers[oak.id].length).toBe(4);
}

export function expectLifeOakTaxa(
  store: AppStoreType,
  count = [0, 0],
  customColors = [colors[0], colors[1]],
) {
  let taxa1 = life(customColors[0]);
  let taxa2 = redOak(customColors[1]);
  if (count[0] > 0) {
    taxa1.observations_count = count[0];
  }
  if (count[1] > 0) {
    taxa2.observations_count = count[1];
  }
  expect(store.selectedTaxa).toStrictEqual([taxa1, taxa2]);
  expect(Object.keys(store.taxaMapLayers)).toEqual([
    taxa1.id.toString(),
    taxa2.id.toString(),
  ]);
  expect(store.taxaMapLayers[taxa1.id].length).toBe(4);
  expect(store.taxaMapLayers[taxa2.id].length).toBe(4);
}

export function expectLifeOakTaxaMapOnly(store: AppStoreType) {
  let taxa1 = life();
  let taxa2 = redOak();

  expect(Object.keys(store.taxaMapLayers)).toEqual([
    taxa1.id.toString(),
    taxa2.id.toString(),
  ]);
  expect(store.taxaMapLayers[taxa1.id].length).toBe(4);
  expect(store.taxaMapLayers[taxa2.id].length).toBe(4);
}

export function expectLifeOakTaxaIdentifiedMapOnly(store: AppStoreType) {
  let taxa1 = life();
  let taxa2 = redOak();

  expect(Object.keys(store.taxaIdentifiedMapLayers)).toEqual([
    taxa1.id.toString(),
    taxa2.id.toString(),
  ]);
  expect(store.taxaIdentifiedMapLayers[taxa1.id].length).toBe(4);
  expect(store.taxaIdentifiedMapLayers[taxa2.id].length).toBe(4);
}

export function expectOakTaxaIdentifiedMapOnly(store: AppStoreType) {
  let taxa2 = redOak();

  expect(Object.keys(store.taxaIdentifiedMapLayers)).toEqual([
    taxa2.id.toString(),
  ]);
  expect(store.taxaIdentifiedMapLayers[taxa2.id].length).toBe(4);
}

export function expectLifeOakTaxaIdentifications(
  store: AppStoreType,
  count = [0, 0],
) {
  let taxa1 = lifeIdentification();
  delete taxa1.observations_count;
  let taxa2 = redOakIdentification();
  delete taxa2.observations_count;

  if (count[0] > 0) {
    taxa1.identifications_count = count[0];
  }
  if (count[1] > 0) {
    taxa2.identifications_count = count[1];
  }
  expect(store.selectedTaxa).toStrictEqual([taxa1, taxa2]);
  expect(Object.keys(store.taxaMapLayers)).toEqual([
    taxa1.id.toString(),
    taxa2.id.toString(),
  ]);
  expect(store.taxaMapLayers[taxa1.id].length).toBe(4);
  expect(store.taxaMapLayers[taxa2.id].length).toBe(4);
}

export function expectNoPlaces(store: AppStoreType) {
  expect(store.selectedPlaces).toStrictEqual([]);
  expect(store.placesMapLayers).toStrictEqual({});
}

export function expectLosAngelesPlace(store: AppStoreType, count = 0) {
  let place = structuredClone(losangeles);
  if (count > 0) {
    place.observations_count = Math.round(count);
  }
  expect(store.selectedPlaces).toEqual([place]);
  expect(Object.keys(store.placesMapLayers)).toStrictEqual([
    place.id.toString(),
  ]);
  expect(store.placesMapLayers[place.id].length).toBe(1);
}

export function expectWithoutLosAngelesPlace(store: AppStoreType) {
  let place = structuredClone(losangeles);
  delete place.geometry;
  delete place.bounding_box;

  expect(store.selectedWithoutPlaces).toEqual([place]);
  expect(store.placesMapLayers).toStrictEqual({});
}

export function expectLosAngelesPlaceIdentifications(
  store: AppStoreType,
  count = 0,
) {
  let place = structuredClone(losangeles);
  if (count > 0) {
    place.identifications_count = count;
  }
  expect(store.selectedPlaces).toEqual([place]);
  expect(Object.keys(store.placesMapLayers)).toStrictEqual([
    place.id.toString(),
  ]);
  expect(store.placesMapLayers[place.id].length).toBe(1);
}

export function expectSanDiegoPlace(store: AppStoreType, count = 0) {
  let place = structuredClone(sandiego);
  if (count > 0) {
    place.observations_count = Math.round(count);
  }
  expect(store.selectedPlaces).toEqual([place]);
  expect(Object.keys(store.placesMapLayers)).toStrictEqual([
    place.id.toString(),
  ]);
  expect(store.placesMapLayers[place.id].length).toBe(1);
}

export function expect_LA_SD_Place(store: AppStoreType, counts = [0, 0]) {
  let place1 = structuredClone(losangeles);
  if (counts[0] > 0) {
    place1.observations_count = counts[0];
  }
  let place2 = structuredClone(sandiego);
  if (counts[1] > 0) {
    place2.observations_count = counts[1];
  }

  expect(store.selectedPlaces).toStrictEqual([place1, place2]);
  expect(Object.keys(store.placesMapLayers)).toStrictEqual([
    sandiego.id.toString(),
    losangeles.id.toString(),
  ]);
  expect(store.placesMapLayers[losangeles.id].length).toBe(1);
  expect(store.placesMapLayers[sandiego.id].length).toBe(1);
}

export function expect_withoutPlaces(store: AppStoreType) {
  let place1 = structuredClone(losangeles);
  delete place1.geometry;
  delete place1.bounding_box;
  let place2 = structuredClone(sandiego);
  delete place2.geometry;
  delete place2.bounding_box;

  expect(store.selectedWithoutPlaces).toStrictEqual([place1, place2]);
  expect(store.placesMapLayers).toStrictEqual({});
}

export function expect_LA_SD_Place_Identifications(
  store: AppStoreType,
  counts = [0, 0],
) {
  let place1 = structuredClone(losangeles);
  if (counts[0] > 0) {
    place1.identifications_count = counts[0];
  }
  let place2 = structuredClone(sandiego);
  if (counts[1] > 0) {
    place2.identifications_count = counts[1];
  }

  expect(store.selectedPlaces).toStrictEqual([place1, place2]);
  expect(Object.keys(store.placesMapLayers)).toStrictEqual([
    sandiego.id.toString(),
    losangeles.id.toString(),
  ]);
  expect(store.placesMapLayers[losangeles.id].length).toBe(1);
  expect(store.placesMapLayers[sandiego.id].length).toBe(1);
}

export function expectNoUsers(store: AppStoreType) {
  expect(store.selectedUsers).toStrictEqual([]);
}

export function expectNoUsersIdentifiers(store: AppStoreType) {
  expect(store.selectedUsersIdentifiers).toStrictEqual([]);
}

export function expectNoUnobservedUsers(store: AppStoreType) {
  expect(store.selectedUnobservedByUser).toStrictEqual({});
}

export function expectNoUsersAnnotators(store: AppStoreType) {
  expect(store.selectedUsersAnnotators).toStrictEqual({});
}

export function expectBboxPlace(store: AppStoreType, count = 0, type = "zero") {
  let place = structuredClone(bBoxPlace);
  if (type !== "zero") {
    place = structuredClone(bBoxPlaceLA);
  }
  if (count > 0) {
    place.observations_count = Math.round(count);
  }
  expect(store.selectedPlaces).toEqual([place]);
  expect(Object.keys(store.placesMapLayers)).toStrictEqual(["0"]);
  expect(store.placesMapLayers["0"].length).toBe(1);
}

export function expectNoProjects(store: AppStoreType) {
  expect(store.selectedProjects).toEqual([]);
}

export function expectProject1(store: AppStoreType, count = 0) {
  let project = structuredClone(project_cnc1);
  if (count) {
    project.observations_count = Math.round(count);
  }
  expect(store.selectedProjects).toEqual([project]);

  expect(store.projectsMapLayers).toBe(undefined);
}

export function expectProject2(store: AppStoreType, count = 0) {
  let project = structuredClone(project_cnc2);
  if (count) {
    project.observations_count = Math.round(count);
  }
  expect(store.selectedProjects).toEqual([project]);

  if (!store.projectsMapLayers) return;
  expect(Object.keys(store.projectsMapLayers)).toEqual([project.id.toString()]);
  expect(store.projectsMapLayers[project.id].length).toBe(10);
}

export function expectProjects(store: AppStoreType, counts = [0, 0]) {
  let project1 = structuredClone(project_cnc1);
  let project2 = structuredClone(project_cnc2);
  if (counts[0] > 0) {
    project1.observations_count = Math.round(counts[0]);
  }
  if (counts[1] > 0) {
    project2.observations_count = Math.round(counts[1]);
  }
  expect(store.selectedProjects).toEqual([project1, project2]);

  if (!store.projectsMapLayers) return;
  expect(Object.keys(store.projectsMapLayers)).toEqual([
    project2.id.toString(),
  ]);
  expect(store.projectsMapLayers[project2.id].length).toBe(1);
}

export function expectUser1(store: AppStoreType, count = 0) {
  let userA = structuredClone(user1);
  if (count > 0) {
    userA.observations_count = Math.round(count);
  }
  expect(store.selectedUsers).toEqual([userA]);
}

export function expectWithoutUser1(store: AppStoreType) {
  let userA = structuredClone(user1);
  expect(store.selectedWithoutUsers).toEqual([userA]);
}

export function expectUser2(store: AppStoreType, count = 0) {
  let userB = structuredClone(user2);
  if (count > 0) {
    userB.observations_count = Math.round(count);
  }
  expect(store.selectedUsers).toEqual([userB]);
}

export function expectUsers(store: AppStoreType, counts = [0, 0]) {
  let userA = structuredClone(user1);
  if (counts[0] > 0) {
    userA.observations_count = Math.round(counts[0]);
  }
  let userB = structuredClone(user2);
  if (counts[0] > 0) {
    userB.observations_count = Math.round(counts[1]);
  }
  expect(store.selectedUsers).toEqual([userA, userB]);
}

export function expectWithoutUsers(store: AppStoreType) {
  let userA = structuredClone(user1);
  let userB = structuredClone(user2);

  expect(store.selectedWithoutUsers).toEqual([userA, userB]);
}

export function expectUser1Identifier(store: AppStoreType, count = 0) {
  let userA = structuredClone(user1);
  if (count > 0) {
    userA.observations_count = Math.round(count);
  }
  expect(store.selectedUsersIdentifiers).toEqual([userA]);
}

export function expectUserIdentifiers(store: AppStoreType, counts = [0, 0]) {
  let userA = structuredClone(user1);
  let userB = structuredClone(user2);

  if (counts[0] > 0) {
    userA.observations_count = counts[0];
  }
  if (counts[1] > 0) {
    userB.observations_count = counts[1];
  }
  expect(store.selectedUsersIdentifiers).toEqual([userA, userB]);
}

export function expectUserAnnotator(store: AppStoreType, count = 0) {
  let userA = structuredClone(user1);
  if (count > 0) {
    userA.observations_count = Math.round(count);
  }
  expect(store.selectedUsersAnnotators).toEqual([userA]);
}

export function expectUserAnnotators(store: AppStoreType, counts = [0, 0]) {
  let userA = structuredClone(user1);
  let userB = structuredClone(user2);

  if (counts[0] > 0) {
    userA.observations_count = counts[0];
  }
  if (counts[1] > 0) {
    userB.observations_count = counts[1];
  }
  expect(store.selectedUsersAnnotators).toEqual([userA, userB]);
}

export function expectUserIdentifiersIdentifications(
  store: AppStoreType,
  counts = [0, 0],
) {
  let userA = structuredClone(user1);
  let userB = structuredClone(user2);

  if (counts[0] > 0) {
    userA.identifications_count = counts[0];
  }
  if (counts[1] > 0) {
    userB.identifications_count = counts[1];
  }
  expect(store.selectedUsersIdentifiers).toEqual([userA, userB]);
}

export function expectUser1UnobservedByUser(store: AppStoreType, count = 0) {
  let userA = structuredClone(user1);
  if (count > 0) {
    userA.observations_count = Math.round(count);
  }
  expect(store.selectedUnobservedByUser).toEqual(userA);
}

export function expectUser1Reviewer(store: AppStoreType, count = 0) {
  let userA = structuredClone(user1);
  if (count > 0) {
    userA.observations_count = Math.round(count);
  }
  expect(store.selectedReviewer).toEqual(userA);
}

export function expectUser2Identifier(store: AppStoreType, count = 0) {
  let userB = structuredClone(user2);
  if (count > 0) {
    userB.observations_count = Math.round(count);
  }
  expect(store.selectedUsersIdentifiers).toEqual(userB);
}

export function roundCounts(number: number) {
  return Math.round(number * 10) / 10;
}

export const perPage = 24;
export const perPageUsers = 100;
