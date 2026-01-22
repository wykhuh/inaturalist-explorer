// @vitest-environment jsdom
import {
  expect,
  test,
  describe,
  beforeEach,
  beforeAll,
  afterAll,
  afterEach,
} from "vitest";
import jsdom from "jsdom";

import { leafletVisibleLayers } from "../../lib/data_utils.ts";
import { placeSelectedHandler, removePlace } from "../../lib/search_places.ts";
import {
  projectSelectedHandler,
  removeProject,
} from "../../lib/search_projects.ts";
import { taxonSelectedHandler, removeTaxon } from "../../lib/search_taxa.ts";
import { userSelectedHandler, removeUser } from "../../lib/search_users.ts";
import {
  createMockServer,
  expectEmpytMap,
  expectLifeTaxa,
  expectLosAngelesPlace,
  expectOakTaxa,
  expectBboxPlace,
  losangeles,
  sandiego,
  life,
  lifeBasic,
  redOak,
  redOakBasic,
  colors,
  placeLabel_la,
  placeLabel_sd,
  gridLabel_life,
  gridLabel_oaks,
  bBoxLabel,
  basemapLabel_osm,
  gridLabel_allTaxaRecord,
  expectDefaultTaxaRecord,
  gridLabel_allTaxaRecord_la,
  gridLabel_allTaxaRecord_la_sd,
  gridLabel_allTaxaRecord_sd,
  expect_LA_SD_Place,
  expectSanDiegoPlace,
  colorsEncoded,
  expectLifeOakTaxa,
  project_cnc1,
  gridLabel_allTaxaRecord_project1,
  project_cnc2,
  gridLabel_allTaxaRecord_projects,
  expectProject1,
  user1,
  gridLabel_allTaxaRecord_user1,
  expectUser1,
  user2,
  gridLabel_allTaxaRecord_users,
  allTaxa,
  defaultParams,
  defaultQuery,
  expectLifeTaxaIdentification,
  expectLifeOakTaxaIdentifications,
  expectLosAngelesPlaceIdentifications,
  expect_LA_SD_Place_Identifications,
  gridLabel_allTaxaRecord_user1Identifier,
  lifeIdentification,
  redOakIdentification,
  allTaxaIdentification,
  expectDefaultTaxaRecordIdentification,
  expectEmptyResources,
  gridLabel_allTaxaRecord_project1NotInProject,
  gridLabel_allTaxaRecord_user1Reviewer,
  gridLabel_allTaxaRecord_user2Reviewer,
  gridLabel_allTaxaRecord_user1Unobserved,
  gridLabel_allTaxaRecord_user2Unobserved,
  gridLabel_allTaxaRecord_user1Annotator,
  gridLabel_allTaxaRecord_usersAnnotator,
  gridLabel_allTaxaRecord_usersIdentifiers,
  perPage,
  bbox,
  iNatBboxParams,
  bBoxPlaceLA,
  gridLabel_allTaxaRecord_withoutLife,
  gridLabel_allTaxaRecord_withoutTaxa,
  gridLabel_allTaxaRecord_projectsNotInProject,
  gridLabel_allTaxaRecordIdent,
  gridLabel_lifeIdent,
  gridLabel_oakIdent,
  expectLifeOakTaxaMapOnly,
  expectOakTaxaMapOnly,
  expectLifeTaxaMapOnly,
  expectLifeTaxaIdentifiedMapOnly,
  expectLifeOakTaxaIdentifiedMapOnly,
  expectOakTaxaIdentifiedMapOnly,
} from "../test_helpers.ts";
import { defaultColorScheme, iNatOrange } from "../../lib/map_colors_utils.ts";
import { decodeAppUrl } from "../../lib/utils.ts";
import { initPopulateStore, initRenderMap } from "../../lib/init_app.ts";
import { mapStore } from "../../lib/store.ts";
import {
  removeUserIdentifier,
  userIdentifierSelectedHandler,
} from "../../lib/search_users_identifiers.ts";
import { unobservedByUserSelectedHandler } from "../../lib/search_unobserved.ts";
import {
  removeTaxonIdentified,
  taxonIdentifiedSelectedHandler,
} from "../../lib/search_taxa_identified.ts";
import { saveBBoxToStore } from "../../lib/search_bounding_box.ts";
import { reviewerSelectedHandler } from "../../lib/search_reviewer.ts";
import {
  notInProjectSelectedHandler,
  removeWithoutProject,
} from "../../lib/search_without_project.ts";
import {
  removeUserAnnotator,
  userAnnotatorsSelectedHandler,
} from "../../lib/search_users_annotators.ts";
import {
  removeWithoutTaxon,
  withoutTaxonSelectedHandler,
} from "../../lib/search_without_taxa.ts";
import {
  removeWithoutTaxonIdentified,
  withoutTaxonIdentifiedSelectedHandler,
} from "../../lib/search_without_taxa_identified.ts";
import type { LngLatType } from "../../types/app";
import {
  removeWithoutPlace,
  withoutPlaceSelectedHandler,
} from "../../lib/search_without_places.ts";
import {
  removeWithoutUser,
  withoutUserSelectedHandler,
} from "../../lib/search_without_users.ts";
import {
  removeWithoutUserIdentifier,
  withoutUserIdentifierSelectedHandler,
} from "../../lib/search_without_users_identifiers.ts";

beforeEach(() => {
  const { JSDOM } = jsdom;

  let dom = new JSDOM(
    `<!doctype html>
<html lang="en">
  <body>
    <div id="map" style="width: 400px; height: 400px"></div>
  </body>
</html>`,
  );
  global.document = dom.window.document;
});

const server = createMockServer();
beforeAll(() => {
  server.listen();
});
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => {
  server.close();
});

// NOTE: update when adding selectedResource; resourceSelectedHandler test
describe("placeSelectedHandler", () => {
  test(`add los angeles; add san diego`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);
    await placeSelectedHandler(losangeles, "los", store);

    let allTaxaCount = allTaxa.observations_count;
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      gridLabel_allTaxaRecord_la,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedPlaces"]);
    expectDefaultTaxaRecord(store, allTaxaCount * 0.6);
    expectLosAngelesPlace(store, allTaxaCount * 0.6);
    let expectedParams1 = {
      ...defaultParams,
      colors: iNatOrange,
      place_id: losangeles.id.toString(),
      taxon_id: allTaxa.id.toString(),
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams1);
    expect(window.location.search).toBe(
      `?place_id=${losangeles.id}&${defaultQuery}&per_page=${perPage}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount * 0.6);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaCount * 0.6);

    await placeSelectedHandler(sandiego, "san", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      placeLabel_sd,
      placeLabel_sd,
      gridLabel_allTaxaRecord_la_sd,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedPlaces"]);
    expectDefaultTaxaRecord(store);
    expect_LA_SD_Place(store, [allTaxaCount * 0.6, allTaxaCount * 0.4]);
    let expectedParams2 = {
      ...defaultParams,
      colors: iNatOrange,
      place_id: `${losangeles.id},${sandiego.id}`,
      taxon_id: allTaxa.id.toString(),
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?place_id=${losangeles.id},${sandiego.id}&${defaultQuery}&per_page=${perPage}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaCount * 0.6);
    expect(store.selectedPlaces[1].observations_count).toBe(allTaxaCount * 0.4);
  });
});

describe("withoutPlaceSelectedHandler", () => {
  test(`without los angeles; without san diego`, async () => {
    let store = structuredClone(mapStore);
    let allTaxaCount = allTaxa.observations_count;
    let losangeles1 = structuredClone(losangeles);
    delete losangeles1.bounding_box;
    delete losangeles1.geometry;
    let sandiego1 = structuredClone(sandiego);
    delete sandiego1.bounding_box;
    delete sandiego1.geometry;

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);
    await withoutPlaceSelectedHandler(losangeles1, "los", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedWithoutPlaces"]);
    expectDefaultTaxaRecord(store, allTaxaCount);
    expect(store.selectedWithoutPlaces).toEqual([losangeles1]);
    let expectedParams1 = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      not_in_place: losangeles.id.toString(),
      taxon_id: allTaxa.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams1);
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}&not_in_place=${losangeles.id}`,
    );

    await withoutPlaceSelectedHandler(sandiego1, "san", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedWithoutPlaces"]);
    expectDefaultTaxaRecord(store);
    expect(store.selectedWithoutPlaces).toEqual([losangeles1, sandiego1]);
    let expectedParams2 = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      not_in_place: `${losangeles.id},${sandiego.id}`,
      taxon_id: allTaxa.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}&not_in_place=${losangeles.id},${sandiego.id}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
  });
});

describe("saveBBoxToStore", () => {
  test(`draw bounding box; draw bounding box;`, async () => {
    let store = structuredClone(mapStore);
    let coors2 = bBoxPlaceLA.bounding_box?.coordinates[0] as LngLatType[];

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);
    await saveBBoxToStore(bbox, store);

    let allTaxaCount = allTaxa.observations_count;
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      bBoxLabel,
      gridLabel_allTaxaRecord,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedPlaces"]);
    expectDefaultTaxaRecord(store);
    expectBboxPlace(store, allTaxaCount);
    let expectedParams = {
      ...defaultParams,
      nelng: -104,
      nelat: 45,
      swlat: 41,
      swlng: -111,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}&${iNatBboxParams}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaCount);

    await saveBBoxToStore(coors2, store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      bBoxLabel,
      gridLabel_allTaxaRecord,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedPlaces"]);
    expectDefaultTaxaRecord(store);
    expectBboxPlace(store, allTaxaCount, "LA");
    let expectedParams2 = {
      ...defaultParams,
      nelat: 34.30714385628804,
      nelng: -118.12500000000001,
      swlat: 34.30714385628804,
      swlng: -118.12500000000001,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}` +
        `&nelng=-118.12500000000001&nelat=34.30714385628804&swlat=34.30714385628804&swlng=-118.12500000000001`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaCount);
  });
});

describe("projectSelectedHandler", () => {
  test("add project; add project", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);
    await projectSelectedHandler(project_cnc1, "city", store);

    let allTaxaCount = allTaxa.observations_count;
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_project1,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedProjects"]);
    expectDefaultTaxaRecord(store, allTaxaCount * 0.7);
    expect(store.selectedProjects).toStrictEqual([project_cnc1]);
    let expectedParams = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      project_id: project_cnc1.id.toString(),
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?project_id=${project_cnc1.id}&${defaultQuery}&per_page=${perPage}`,
    );

    await projectSelectedHandler(project_cnc2, "city", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_projects,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedProjects"]);
    expectDefaultTaxaRecord(store);
    expect(store.selectedProjects).toStrictEqual([project_cnc1, project_cnc2]);
    let expectedParams2 = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      project_id: `${project_cnc1.id},${project_cnc2.id}`,
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?project_id=${project_cnc1.id},${project_cnc2.id}&${defaultQuery}&per_page=${perPage}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
    expect(store.selectedProjects[0].observations_count).toBe(
      allTaxaCount * 0.7,
    );
    expect(store.selectedProjects[1].observations_count).toBe(
      allTaxaCount * 0.3,
    );
  });
});

describe("notInProjectSelectedHandler", () => {
  test("add not in project; add not in project", async () => {
    let store = structuredClone(mapStore);
    let projectA = structuredClone(project_cnc1);
    delete projectA.observations_count;
    let projectB = structuredClone(project_cnc2);
    delete projectB.observations_count;

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);
    await notInProjectSelectedHandler(projectA, "city", store);

    let allTaxaCount = allTaxa.observations_count;
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_project1NotInProject,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedWithoutProjects"]);
    expectDefaultTaxaRecord(store, allTaxaCount);
    expect(store.selectedWithoutProjects).toStrictEqual([projectA]);
    let expectedParams = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      not_in_project: projectA.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}&not_in_project=${projectA.id}`,
    );

    await notInProjectSelectedHandler(projectB, "city", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_projectsNotInProject,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedWithoutProjects"]);
    expectDefaultTaxaRecord(store, allTaxaCount);
    expect(store.selectedWithoutProjects).toStrictEqual([projectA, projectB]);
    let expectedParams2 = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      not_in_project: `${projectA.id},${projectB.id}`,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}&not_in_project=${projectA.id},${projectB.id}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
    expect(store.selectedWithoutProjects[0].observations_count).toBeUndefined();
    expect(store.selectedWithoutProjects[1].observations_count).toBeUndefined();
  });
});

describe("taxonSelectedHandler", () => {
  test(`add life; add red oak`, async () => {
    let store = structuredClone(mapStore);
    let oakCount = redOak().observations_count;
    let lifeCount = life().observations_count;
    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);

    await taxonSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectEmptyResources(store, ["selectedTaxa"]);
    expectLifeTaxa(store);
    let expectedParams1 = {
      ...defaultParams,
      taxon_id: life().id.toString(),
      colors: colors[0],
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams1);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&${defaultQuery}&per_page=${perPage}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(lifeCount);

    await taxonSelectedHandler(redOakBasic, "red", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
      gridLabel_oaks,
    ]);
    expectEmptyResources(store, ["selectedTaxa"]);
    expectLifeOakTaxa(store);
    let expectedParams2 = {
      ...defaultParams,
      taxon_id: `${life().id},${redOak().id}`,
      colors: `${colors[0]},${colors[1]}`,
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id},${redOak().id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}&${defaultQuery}&per_page=${perPage}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(lifeCount);
    expect(store.selectedTaxa[1].observations_count).toBe(oakCount);
  });
});

describe("withoutTaxonSelectedHandler", () => {
  test(`add life; add red oak`, async () => {
    let store = structuredClone(mapStore);
    let life1 = life();
    delete life1.color;
    delete life1.observations_count;
    let oak1 = redOak();
    delete oak1.color;
    delete oak1.observations_count;

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);

    await withoutTaxonSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_withoutLife,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedWithoutTaxa"]);
    expect(store.selectedWithoutTaxa).toStrictEqual([life1]);
    let expectedParams1 = {
      ...defaultParams,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      without_taxon_id: `${life1.id}`,
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams1);
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}&without_taxon_id=${life1.id}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(
      allTaxa.observations_count,
    );

    await withoutTaxonSelectedHandler(redOakBasic, "red", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_withoutTaxa,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedWithoutTaxa"]);
    expect(store.selectedWithoutTaxa).toStrictEqual([life1, oak1]);
    let expectedParams2 = {
      ...defaultParams,
      taxon_id: allTaxa.id.toString(),
      without_taxon_id: `${life().id},${redOak().id}`,
      colors: iNatOrange,
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}&without_taxon_id=${life1.id},${oak1.id}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(
      allTaxa.observations_count,
    );
    expect(store.selectedWithoutTaxa[0].observations_count).toBeUndefined();
    expect(store.selectedWithoutTaxa[1].observations_count).toBeUndefined();
  });
});

describe("taxonIdentifiedSelectedHandler", () => {
  test(`add taxa identified`, async () => {
    let store = structuredClone(mapStore);
    let life1 = life();
    life1.observations_count = allTaxa.observations_count;

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);

    await taxonIdentifiedSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
      gridLabel_life,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedTaxaIdentified"]);
    expectDefaultTaxaRecord(store);
    expect(store.selectedTaxaIdentified).toStrictEqual([life1]);
    expectLifeTaxaIdentifiedMapOnly(store);

    let expectedParams = {
      ...defaultParams,
      per_page: perPage,
      colors: `${iNatOrange}`,
      taxon_id: allTaxa.id.toString(),
      ident_taxon_id: life1.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({});
  });
});

describe("withoutTaxonIdentifiedSelectedHandler", () => {
  test(`does not add taxa`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);

    await withoutTaxonIdentifiedSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecord(store);
    expect(store.selectedWithoutTaxaIdentified).toStrictEqual([]);
    let expectedParams1 = {
      ...defaultParams,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams1);
  });
});

describe("userSelectedHandler", () => {
  test("add user; add user", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let allTaxaCount = allTaxa.observations_count;
    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);
    await userSelectedHandler(user1, "user", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_user1,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedUsers"]);
    expectDefaultTaxaRecord(store, allTaxaCount * 0.45);
    expect(store.selectedUsers).toEqual([user1]);
    let expectedParams = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      user_id: user1.id.toString(),
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?user_id=${user1.id}&${defaultQuery}&per_page=${perPage}`,
    );

    await userSelectedHandler(user2, "user", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_users,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedUsers"]);
    expectDefaultTaxaRecord(store);
    expect(store.selectedUsers).toEqual([user1, user2]);
    let expectedParams2 = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      user_id: `${user1.id},${user2.id}`,
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?user_id=${user1.id},${user2.id}&${defaultQuery}&per_page=${perPage}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
    expect(store.selectedUsers[0].observations_count).toBeCloseTo(
      allTaxaCount * 0.45,
    );
    expect(store.selectedUsers[1].observations_count).toBeCloseTo(
      allTaxaCount * 0.55,
    );
  });
});

describe("withoutUserSelectedHandler", () => {
  test("add without user; add without user", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let allTaxaCount = allTaxa.observations_count;
    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);

    await withoutUserSelectedHandler(user1, "user", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedWithoutUsers"]);
    expectDefaultTaxaRecord(store, allTaxaCount);
    expect(store.selectedWithoutUsers).toEqual([user1]);
    let expectedParams = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      not_user_id: user1.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}&not_user_id=${user1.id}`,
    );

    await withoutUserSelectedHandler(user2, "user", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedWithoutUsers"]);
    expectDefaultTaxaRecord(store);
    expect(store.selectedWithoutUsers).toEqual([user1, user2]);
    let expectedParams2 = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      not_user_id: `${user1.id},${user2.id}`,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}&not_user_id=${user1.id},${user2.id}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
  });
});

describe("userIdentifierSelectedHandler", () => {
  test("add user; add user", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let allTaxaCount = allTaxa.observations_count * 0.75;
    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);

    await userIdentifierSelectedHandler(user1, "user", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_user1Identifier,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedUsersIdentifiers"]);
    expectDefaultTaxaRecord(store, allTaxaCount);
    expect(store.selectedUsersIdentifiers).toStrictEqual([user1]);
    let expectedParams = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      ident_user_id: user1.id.toString(),
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?ident_user_id=${user1.id}&${defaultQuery}&per_page=${perPage}`,
    );

    await userIdentifierSelectedHandler(user2, "user", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_usersIdentifiers,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedUsersIdentifiers"]);
    expectDefaultTaxaRecord(store, allTaxaCount);
    expect(store.selectedUsersIdentifiers).toStrictEqual([user1, user2]);
    let expectedParams2 = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      ident_user_id: `${user1.id},${user2.id}`,
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?ident_user_id=${user1.id},${user2.id}&${defaultQuery}&per_page=${perPage}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
    expect(store.selectedUsersIdentifiers[0].observations_count).toBe(
      allTaxaCount,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
  });
});

describe("withoutUserIdentifierSelectedHandler", () => {
  test("add without user; add without user", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let allTaxaCount = allTaxa.observations_count;
    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);

    await withoutUserIdentifierSelectedHandler(user1, "user", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expectEmptyResources(store, [
      "selectedTaxa",
      "selectedWithoutUsersIdentifiers",
    ]);
    expectDefaultTaxaRecord(store, allTaxaCount);
    expect(store.selectedWithoutUsersIdentifiers).toStrictEqual([user1]);
    let expectedParams = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      without_ident_user_id: user1.id.toString(),
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}&without_ident_user_id=${user1.id}`,
    );

    await withoutUserIdentifierSelectedHandler(user2, "user", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expectEmptyResources(store, [
      "selectedTaxa",
      "selectedWithoutUsersIdentifiers",
    ]);
    expectDefaultTaxaRecord(store);
    expect(store.selectedWithoutUsersIdentifiers).toStrictEqual([user1, user2]);
    let expectedParams2 = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      without_ident_user_id: `${user1.id},${user2.id}`,
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}&without_ident_user_id=${user1.id},${user2.id}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
  });
});

describe("reviewerSelectedHandler", () => {
  test("add reviewer; add reviewer", async () => {
    let store = structuredClone(mapStore);
    let userA = structuredClone(user1);
    delete userA.observations_count;
    let userB = structuredClone(user2);
    delete userB.observations_count;

    expectEmpytMap(store);

    let allTaxaCount = allTaxa.observations_count;
    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);
    await reviewerSelectedHandler(userA, "user", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_user1Reviewer,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedReviewer"]);
    expectDefaultTaxaRecord(store, allTaxaCount);
    expect(store.selectedReviewer).toStrictEqual(userA);
    let expectedParams = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      viewer_id: userA.id,
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}&viewer_id=${userA.id}`,
    );

    await reviewerSelectedHandler(userB, "user", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_user2Reviewer,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedReviewer"]);
    expectDefaultTaxaRecord(store);
    expect(store.selectedReviewer).toStrictEqual(userB);
    let expectedParams2 = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      viewer_id: userB.id,
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}&viewer_id=${userB.id}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
    expect(store.selectedReviewer.observations_count).toBeUndefined();
  });
});

describe("unobservedByUserSelectedHandler", () => {
  test("add unobserved; add unobserved", async () => {
    let store = structuredClone(mapStore);
    let userA = structuredClone(user1);
    delete userA.observations_count;
    let userB = structuredClone(user2);
    delete userB.observations_count;

    expectEmpytMap(store);

    let allTaxaCount = allTaxa.observations_count;
    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);

    await unobservedByUserSelectedHandler(userA, "user", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_user1Unobserved,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedUnobservedByUser"]);
    expectDefaultTaxaRecord(store, allTaxaCount * 0.65);
    expect(store.selectedUnobservedByUser).toStrictEqual(userA);
    let expectedParams = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      unobserved_by_user_id: userA.id,
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}&unobserved_by_user_id=${userA.id}`,
    );

    await unobservedByUserSelectedHandler(userB, "user", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_user2Unobserved,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedUnobservedByUser"]);
    expectDefaultTaxaRecord(store);
    expect(store.selectedUnobservedByUser).toStrictEqual(userB);
    let expectedParams2 = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      unobserved_by_user_id: userB.id,
      per_page: perPage,
    };

    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}&unobserved_by_user_id=${userB.id}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);

    expect(store.selectedUnobservedByUser.observations_count).toBeUndefined();
  });
});

describe("userAnnotatorsSelectedHandler", () => {
  test("add user; add user", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let allTaxaCount = allTaxa.observations_count;
    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);
    await userAnnotatorsSelectedHandler(user1, "user", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_user1Annotator,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedUsersAnnotators"]);
    expectDefaultTaxaRecord(store, allTaxaCount);
    expect(store.selectedUsersAnnotators).toStrictEqual([user1]);
    let expectedParams = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      annotation_user_id: user1.id.toString(),
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}&annotation_user_id=${user1.id}`,
    );

    await userAnnotatorsSelectedHandler(user2, "user", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_usersAnnotator,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedUsersAnnotators"]);
    expectDefaultTaxaRecord(store);
    expect(store.selectedUsersAnnotators).toStrictEqual([user1, user2]);
    let expectedParams2 = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      annotation_user_id: `${user1.id},${user2.id}`,
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}&annotation_user_id=${user1.id},${user2.id}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
    expect(store.selectedUsersAnnotators[0].observations_count).toBeCloseTo(
      allTaxaCount,
    );
    expect(store.selectedUsersAnnotators[1].observations_count).toBeCloseTo(
      allTaxaCount,
    );
  });
});

describe("combos", () => {
  test(`add taxon; add bounding box;`, async () => {
    let store = structuredClone(mapStore);
    let oak1 = redOak();
    let oakCount = oak1.observations_count;

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);

    await taxonSelectedHandler(redOakBasic, "red", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_oaks,
    ]);
    expectOakTaxa(store, colors[0]);
    let params1 = {
      ...defaultParams,
      colors: colors[0],
      taxon_id: redOak(colors[0]).id.toString(),
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(params1);
    expect(window.location.search).toBe(
      `?taxon_id=${redOak().id}&colors=${colorsEncoded[0]}&${defaultQuery}&per_page=${perPage}`,
    );

    await saveBBoxToStore(bbox, store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      bBoxLabel,
      gridLabel_oaks,
    ]);
    expectOakTaxa(store, colors[0]);
    expectBboxPlace(store, oakCount);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      per_page: perPage,
      taxon_id: redOak(colors[0]).id.toString(),
      colors: colors[0],
      nelng: -104,
      nelat: 45,
      swlat: 41,
      swlng: -111,
    });

    expect(window.location.search).toBe(
      `?taxon_id=${redOak().id}&colors=${colorsEncoded[0]}&${defaultQuery}&per_page=${perPage}` +
        `&${iNatBboxParams}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(oakCount);
    expect(store.selectedPlaces[0].observations_count).toBe(oakCount);
  });

  test(`add place; add boundong box;`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);
    await placeSelectedHandler(losangeles, "los", store);

    let allTaxaCount = allTaxa.observations_count;
    let allTaxaLACount = allTaxaCount * 0.6;
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      gridLabel_allTaxaRecord_la,
    ]);
    expectDefaultTaxaRecord(store, allTaxaLACount);
    expectLosAngelesPlace(store, allTaxaLACount);
    let params = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      place_id: losangeles.id.toString(),
      taxon_id: allTaxa.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(params);
    expect(window.location.search).toBe(
      `?place_id=${losangeles.id}&${defaultQuery}&per_page=${perPage}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaLACount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaLACount);

    await saveBBoxToStore(bbox, store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      bBoxLabel,
      gridLabel_allTaxaRecord,
    ]);
    expectDefaultTaxaRecord(store);
    expectBboxPlace(store, allTaxaCount);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      per_page: perPage,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      nelng: -104,
      nelat: 45,
      swlat: 41,
      swlng: -111,
    });
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}` + `&${iNatBboxParams}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaCount);
  });

  test(`add project; add bounding box map;`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);
    await projectSelectedHandler(project_cnc1, "city", store);

    let allTaxaProjectCount = allTaxa.observations_count * 0.7;
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_project1,
    ]);
    expectDefaultTaxaRecord(store, allTaxaProjectCount);
    expectProject1(store);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      per_page: perPage,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      project_id: project_cnc1.id.toString(),
    });
    expect(window.location.search).toBe(
      `?project_id=${project_cnc1.id}&${defaultQuery}&per_page=${perPage}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaProjectCount);
    expect(store.selectedProjects[0].observations_count).toBe(
      allTaxaProjectCount,
    );

    await saveBBoxToStore(bbox, store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      bBoxLabel,
      gridLabel_allTaxaRecord_project1,
    ]);
    expectDefaultTaxaRecord(store, allTaxaProjectCount);
    expectProject1(store);
    expectBboxPlace(store, allTaxaProjectCount);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      per_page: perPage,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      nelng: -104,
      nelat: 45,
      swlat: 41,
      swlng: -111,
      project_id: project_cnc1.id.toString(),
    });
    expect(window.location.search).toBe(
      `?project_id=${project_cnc1.id}&${defaultQuery}&per_page=${perPage}` +
        `&${iNatBboxParams}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaProjectCount);
    expect(store.selectedProjects[0].observations_count).toBe(
      allTaxaProjectCount,
    );
  });

  test(`add user; add boundong box map;`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let allTaxaCount = allTaxa.observations_count;
    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);
    await userSelectedHandler(user1, "user", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_user1,
    ]);
    expectDefaultTaxaRecord(store, allTaxaCount * 0.45);
    expectUser1(store);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      per_page: perPage,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      user_id: user1.id.toString(),
    });
    expect(window.location.search).toBe(
      `?user_id=${user1.id}&${defaultQuery}&per_page=${perPage}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount * 0.45);

    await saveBBoxToStore(bbox, store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      bBoxLabel,
      gridLabel_allTaxaRecord_user1,
    ]);
    expectDefaultTaxaRecord(store, allTaxaCount * 0.45);
    expectUser1(store);
    expectBboxPlace(store, allTaxaCount * 0.45);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      per_page: perPage,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      nelng: -104,
      nelat: 45,
      swlat: 41,
      swlng: -111,
      user_id: user1.id.toString(),
    });

    expect(window.location.search).toBe(
      `?user_id=${user1.id}&${defaultQuery}&per_page=${perPage}` +
        `&${iNatBboxParams}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount * 0.45);
    expect(store.selectedPlaces[0].observations_count).toBe(
      allTaxaCount * 0.45,
    );
  });

  test(`add place; add bounding box; add place`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let allTaxaCount = allTaxa.observations_count;
    let allTaxaLACount = allTaxaCount * 0.6;
    let allTaxaSDCount = allTaxaCount * 0.4;
    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);
    await placeSelectedHandler(losangeles, "los", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      gridLabel_allTaxaRecord_la,
    ]);
    expectDefaultTaxaRecord(store, allTaxaLACount);
    expectLosAngelesPlace(store, allTaxaLACount);
    let params = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      place_id: losangeles.id.toString(),
      taxon_id: allTaxa.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(params);
    expect(window.location.search).toBe(
      `?place_id=${losangeles.id}&${defaultQuery}&per_page=${perPage}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaLACount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaLACount);

    await saveBBoxToStore(bbox, store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      bBoxLabel,
      gridLabel_allTaxaRecord,
    ]);
    expectDefaultTaxaRecord(store);
    expectBboxPlace(store, allTaxaCount);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      per_page: perPage,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      nelng: -104,
      nelat: 45,
      swlat: 41,
      swlng: -111,
    });
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}&${iNatBboxParams}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaCount);

    await placeSelectedHandler(sandiego, "san", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_sd,
      placeLabel_sd,
      gridLabel_allTaxaRecord_sd,
    ]);
    expectDefaultTaxaRecord(store, allTaxaSDCount);
    expectSanDiegoPlace(store, allTaxaSDCount);
    let params2 = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      place_id: sandiego.id.toString(),
      taxon_id: allTaxa.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(params2);

    expect(window.location.search).toBe(
      `?place_id=${sandiego.id}&${defaultQuery}&per_page=${perPage}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaSDCount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaSDCount);
  });
});

describe("placeSelectedHandler with identifications", () => {
  test(`add los angeles; add san diego`, async () => {
    let store = structuredClone(mapStore);
    store.record_type == "identifications";

    let count = allTaxaIdentification.identifications_count;

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/identifications/"));
    await initRenderMap(store);

    await placeSelectedHandler(losangeles, "los", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecordIdent,
      placeLabel_la,
      placeLabel_la,
    ]);
    expectEmptyResources(store, ["selectedTaxaIdentified", "selectedPlaces"]);
    expectDefaultTaxaRecordIdentification(store, count * 0.6);
    expectLosAngelesPlaceIdentifications(store, count * 0.6);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams1 = {
      per_page: perPage,
      place_id: losangeles.id.toString(),
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams1);
    expect(window.location.search).toBe(
      `?place_id=${losangeles.id}&per_page=${perPage}`,
    );

    await placeSelectedHandler(sandiego, "san", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecordIdent,
      placeLabel_la,
      placeLabel_la,
      placeLabel_sd,
      placeLabel_sd,
    ]);
    expectEmptyResources(store, ["selectedTaxaIdentified", "selectedPlaces"]);
    expectDefaultTaxaRecordIdentification(store);
    expect_LA_SD_Place_Identifications(store, [count * 0.6, count * 0.4]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams2 = {
      per_page: perPage,
      place_id: `${losangeles.id},${sandiego.id}`,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?place_id=${losangeles.id},${sandiego.id}&per_page=${perPage}`,
    );
  });
});

describe("projectSelectedHandler with identifications", () => {
  test("does not add project", async () => {
    let store = structuredClone(mapStore);
    store.record_type == "identifications";

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/identifications/"));
    await initRenderMap(store);

    await projectSelectedHandler(project_cnc1, "city", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecordIdent,
    ]);
    expectEmptyResources(store, ["selectedTaxaIdentified"]);
    expectDefaultTaxaRecordIdentification(store);
    expect(store.selectedProjects).toStrictEqual([]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      per_page: perPage,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    });
  });
});

describe("taxonSelectedHandler with identifications", () => {
  test(`add life; add red oak`, async () => {
    let store = structuredClone(mapStore);
    store.record_type == "identifications";

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/identifications/"));
    await initRenderMap(store);

    await taxonSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecordIdent,
      gridLabel_lifeIdent,
    ]);
    expectEmptyResources(store, ["selectedTaxaIdentified", "selectedTaxa"]);
    expectDefaultTaxaRecordIdentification(store, 20000);
    expectLifeTaxaIdentification(store, 20000);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams1 = {
      observation_taxon_id: life().id.toString(),
      per_page: perPage,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams1);
    expect(window.location.search).toBe(
      `?observation_taxon_id=${life().id}&colors=${colorsEncoded[0]}` +
        `&per_page=${perPage}`,
    );

    await taxonSelectedHandler(redOakBasic, "red", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecordIdent,
      gridLabel_lifeIdent,
      gridLabel_oakIdent,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedTaxaIdentified"]);
    expectDefaultTaxaRecordIdentification(store, 22000);
    expectLifeOakTaxaIdentifications(store);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams2 = {
      per_page: perPage,
      observation_taxon_id: `${life().id},${redOak().id}`,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?observation_taxon_id=${life().id},${redOak().id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}` +
        `&per_page=${perPage}`,
    );
  });
});

describe("withoutTaxonSelectedHandler with identifications", () => {
  test(`add life; add red oak`, async () => {
    let store = structuredClone(mapStore);
    let life1 = life();
    delete life1.color;
    delete life1.observations_count;
    let oak1 = redOak();
    delete oak1.color;
    delete oak1.observations_count;

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/identifications/"));
    await initRenderMap(store);

    await withoutTaxonSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecordIdent,
    ]);
    expectEmptyResources(store, [
      "selectedTaxaIdentified",
      "selectedWithoutTaxa",
    ]);
    expectDefaultTaxaRecordIdentification(store);
    expect(store.selectedWithoutTaxa).toStrictEqual([life1]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams1 = {
      taxon_id: allTaxa.id.toString(),
      without_observation_taxon_id: `${life1.id}`,
      per_page: perPage,
      colors: iNatOrange,
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams1);
    expect(window.location.search).toBe(
      `?per_page=${perPage}&without_observation_taxon_id=${life1.id}`,
    );

    await withoutTaxonSelectedHandler(redOakBasic, "red", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecordIdent,
    ]);
    expectEmptyResources(store, [
      "selectedTaxaIdentified",
      "selectedWithoutTaxa",
    ]);
    expectDefaultTaxaRecordIdentification(store);
    expect(store.selectedWithoutTaxa).toStrictEqual([life1, oak1]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams2 = {
      taxon_id: allTaxa.id.toString(),
      without_observation_taxon_id: `${life().id},${redOak().id}`,
      per_page: perPage,
      colors: iNatOrange,
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?per_page=${perPage}&without_observation_taxon_id=${life1.id},${oak1.id}`,
    );
  });
});

describe("taxonIdentifiedSelectedHandler with identifications", () => {
  test(`add life; add red oak`, async () => {
    let store = structuredClone(mapStore);
    store.record_type == "identifications";
    let life1 = structuredClone(lifeIdentification());
    let oak1 = structuredClone(redOakIdentification());

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/identifications/"));
    await initRenderMap(store);

    await taxonIdentifiedSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_lifeIdent,
    ]);
    expectEmptyResources(store, ["selectedTaxaIdentified"]);
    expect(store.selectedTaxaIdentified).toStrictEqual([life1]);
    expectLifeTaxaIdentifiedMapOnly(store);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      per_page: perPage,
      colors: life().color,
      taxon_id: life().id.toString(),
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&per_page=${perPage}`,
    );

    await taxonIdentifiedSelectedHandler(redOakBasic, "red", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_lifeIdent,
      gridLabel_oakIdent,
    ]);
    expectEmptyResources(store, ["selectedTaxaIdentified"]);
    expect(store.selectedTaxaIdentified).toStrictEqual([life1, oak1]);
    expectLifeOakTaxaIdentifiedMapOnly(store);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      colors: `${life1.color},${oak1.color}`,
      per_page: perPage,
      taxon_id: `${life1.id},${oak1.id}`,
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life1.id},${oak1.id}&per_page=${perPage}`,
    );
  });
});

describe("withoutTaxonIdentifiedSelectedHandler with identifications", () => {
  test(`add life; add red oak`, async () => {
    let store = structuredClone(mapStore);
    let life1 = life();
    delete life1.color;
    delete life1.observations_count;
    let oak1 = redOak();
    delete oak1.color;
    delete oak1.observations_count;

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/identifications/"));
    await initRenderMap(store);

    await withoutTaxonIdentifiedSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecordIdent,
    ]);
    expectEmptyResources(store, [
      "selectedTaxaIdentified",
      "selectedWithoutTaxaIdentified",
    ]);
    expectDefaultTaxaRecordIdentification(store, 200000);
    expect(store.selectedWithoutTaxaIdentified).toStrictEqual([life1]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams1 = {
      per_page: perPage,
      taxon_id: allTaxa.id.toString(),
      without_taxon_id: `${life1.id}`,
      colors: iNatOrange,
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams1);
    expect(window.location.search).toBe(
      `?per_page=${perPage}&without_taxon_id=${life1.id}`,
    );

    await withoutTaxonIdentifiedSelectedHandler(redOakBasic, "red", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecordIdent,
    ]);
    expectEmptyResources(store, [
      "selectedTaxaIdentified",
      "selectedWithoutTaxaIdentified",
    ]);
    expectDefaultTaxaRecordIdentification(store, 200000);
    expect(store.selectedWithoutTaxaIdentified).toStrictEqual([life1, oak1]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams2 = {
      per_page: perPage,
      taxon_id: allTaxa.id.toString(),
      without_taxon_id: `${life().id},${redOak().id}`,
      colors: iNatOrange,
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?per_page=${perPage}&without_taxon_id=${life1.id},${oak1.id}`,
    );
  });
});

describe("userSelectedHandler with identifications", () => {
  test("does not add user", async () => {
    let store = structuredClone(mapStore);
    store.record_type == "identifications";

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/identifications/"));
    await initRenderMap(store);
    await userSelectedHandler(user1, "user", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecordIdent,
    ]);
    expectEmptyResources(store, ["selectedTaxaIdentified"]);
    expectDefaultTaxaRecordIdentification(store);
    expect(store.selectedUsers).toStrictEqual([]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      per_page: perPage,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    });
  });
});

describe("userIdentifierSelectedHandler with identifications", () => {
  test("add user identifier; add user identifier", async () => {
    let store = structuredClone(mapStore);
    store.record_type == "identifications";

    let count = allTaxaIdentification.identifications_count;

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/identifications/"));
    await initRenderMap(store);

    await userIdentifierSelectedHandler(user1, "user", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecordIdent,
    ]);
    expectEmptyResources(store, [
      "selectedTaxaIdentified",
      "selectedUsersIdentifiers",
    ]);
    expectDefaultTaxaRecordIdentification(store, count * 0.45);
    expect(store.selectedUsersIdentifiers).toStrictEqual([user1]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams = {
      per_page: perPage,
      user_id: user1.id.toString(),
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?user_id=${user1.id}&per_page=${perPage}`,
    );
    expect(store.selectedUsersIdentifiers[0].identifications_count).toBe(
      count * 0.45,
    );

    await userIdentifierSelectedHandler(user2, "user", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecordIdent,
    ]);
    expectEmptyResources(store, [
      "selectedTaxaIdentified",
      "selectedUsersIdentifiers",
    ]);
    expectDefaultTaxaRecordIdentification(store);
    expect(store.selectedUsersIdentifiers).toStrictEqual([user1, user2]);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
    });
    let expectedParams2 = {
      per_page: perPage,
      user_id: `${user1.id},${user2.id}`,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?user_id=${user1.id},${user2.id}&per_page=${perPage}`,
    );
    expect(store.selectedUsersIdentifiers[0].identifications_count).toBe(
      count * 0.45,
    );
    expect(store.selectedUsersIdentifiers[1].identifications_count).toBeCloseTo(
      count * 0.55,
    );
  });
});

// NOTE: update when adding selectedResource; removeResource test
describe("removePlace", () => {
  test("add place; add place; remove place; remove place", async () => {
    let store = structuredClone(mapStore);

    let LosAngeles = structuredClone(losangeles);
    LosAngeles.observations_count = allTaxa.observations_count * 0.6;
    let SanDiego = structuredClone(sandiego);
    SanDiego.observations_count = allTaxa.observations_count * 0.4;

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);

    await placeSelectedHandler(LosAngeles, "los", store);
    await placeSelectedHandler(SanDiego, "san", store);

    expectEmptyResources(store, ["selectedTaxa", "selectedPlaces"]);
    expectDefaultTaxaRecord(store);
    let params2 = {
      ...defaultParams,
      colors: iNatOrange,
      per_page: perPage,
      place_id: `${LosAngeles.id},${SanDiego.id}`,
      taxon_id: allTaxa.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(params2);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(
      `?place_id=${LosAngeles.id},${SanDiego.id}&${defaultQuery}&per_page=${perPage}`,
    );
    expect(store.selectedPlaces).toStrictEqual([LosAngeles, SanDiego]);

    await removePlace(LosAngeles.id, store);

    expectEmptyResources(store, ["selectedTaxa", "selectedPlaces"]);
    expectDefaultTaxaRecord(store, SanDiego.observations_count);
    let params3 = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      place_id: SanDiego.id.toString(),
      taxon_id: allTaxa.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(params3);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(
      `?place_id=${SanDiego.id}&${defaultQuery}&per_page=${perPage}`,
    );
    expect(store.selectedPlaces).toStrictEqual([SanDiego]);

    await removePlace(SanDiego.id, store);

    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecord(store);
    let params4 = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(params4);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(`?${defaultQuery}&per_page=${perPage}`);
    expect(store.selectedPlaces).toStrictEqual([]);
  });

  test("add bounding box; remove place", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);
    await saveBBoxToStore(bbox, store);

    let allTaxaCount = allTaxa.observations_count;

    expectDefaultTaxaRecord(store);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      per_page: perPage,
      nelng: -104,
      nelat: 45,
      swlat: 41,
      swlng: -111,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    });
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}&${iNatBboxParams}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaCount);

    await removePlace(0, store);

    expectDefaultTaxaRecord(store);
    let params2 = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(params2);
    expect(window.location.search).toBe(`?${defaultQuery}&per_page=${perPage}`);
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
  });

  test("add taxon; add place; remove place", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);
    await taxonSelectedHandler(lifeBasic, "life", store);

    let lifeCount = life().observations_count as number;

    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      per_page: perPage,
      taxon_id: life().id.toString(),
      colors: colors[0],
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&${defaultQuery}` +
        `&per_page=${perPage}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(lifeCount);

    await placeSelectedHandler(losangeles, "los", store);

    let params1 = {
      ...defaultParams,
      per_page: perPage,
      colors: colors[0],
      place_id: losangeles.id.toString(),
      taxon_id: life().id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(params1);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&place_id=${losangeles.id}` +
        `&colors=${colorsEncoded[0]}&${defaultQuery}` +
        `&per_page=${perPage}`,
    );
    expectLosAngelesPlace(store, lifeCount * 0.6);
    expect(store.selectedTaxa[0].observations_count).toBe(lifeCount * 0.6);
    expect(store.selectedPlaces[0].observations_count).toBe(lifeCount * 0.6);

    await removePlace(losangeles.id, store);

    let params2 = {
      ...defaultParams,
      per_page: perPage,
      colors: colors[0],
      taxon_id: life().id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(params2);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&${defaultQuery}` +
        `&per_page=${perPage}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(lifeCount);
  });

  test("add taxon; add bounding box; remove place", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);
    await taxonSelectedHandler(lifeBasic, "life", store);

    let lifeCount = life().observations_count;
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      per_page: perPage,
      taxon_id: life().id.toString(),
      colors: colors[0],
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&${defaultQuery}` +
        `&per_page=${perPage}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(lifeCount);

    await saveBBoxToStore(bbox, store);

    let params1 = {
      ...defaultParams,
      per_page: perPage,
      colors: colors[0],
      taxon_id: life().id.toString(),
      nelng: -104,
      nelat: 45,
      swlat: 41,
      swlng: -111,
    };
    expect(store.observationsApiParams).toStrictEqual(params1);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}` +
        `&${defaultQuery}&per_page=${perPage}&${iNatBboxParams}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(lifeCount);
    expect(store.selectedPlaces[0].observations_count).toBe(lifeCount);

    await removePlace(0, store);

    let params2 = {
      ...defaultParams,
      per_page: perPage,
      colors: colors[0],
      taxon_id: life().id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(params2);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&${defaultQuery}&per_page=${perPage}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(lifeCount);
  });
});

describe("removeWithoutPlace", () => {
  test("add without place; add without place; remove without place; remove without place", async () => {
    let store = structuredClone(mapStore);

    let LosAngeles = structuredClone(losangeles);
    delete LosAngeles.observations_count;
    delete LosAngeles.geometry;
    delete LosAngeles.bounding_box;
    let SanDiego = structuredClone(sandiego);
    delete SanDiego.observations_count;
    delete SanDiego.geometry;
    delete SanDiego.bounding_box;

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);

    await withoutPlaceSelectedHandler(LosAngeles, "los", store);
    await withoutPlaceSelectedHandler(SanDiego, "san", store);

    expectEmptyResources(store, ["selectedTaxa", "selectedWithoutPlaces"]);
    expectDefaultTaxaRecord(store);
    let params2 = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      not_in_place: `${LosAngeles.id},${SanDiego.id}`,
      taxon_id: allTaxa.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(params2);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}&not_in_place=${LosAngeles.id},${SanDiego.id}`,
    );
    expect(store.selectedWithoutPlaces).toStrictEqual([LosAngeles, SanDiego]);

    await removeWithoutPlace(LosAngeles.id, store);

    expectEmptyResources(store, ["selectedTaxa", "selectedWithoutPlaces"]);
    expectDefaultTaxaRecord(store, SanDiego.observations_count);
    let params3 = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      not_in_place: SanDiego.id.toString(),
      taxon_id: allTaxa.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(params3);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}&not_in_place=${SanDiego.id}`,
    );
    expect(store.selectedWithoutPlaces).toStrictEqual([SanDiego]);

    await removeWithoutPlace(SanDiego.id, store);

    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecord(store);
    let params4 = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(params4);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(`?${defaultQuery}&per_page=${perPage}`);
    expect(store.selectedWithoutPlaces).toStrictEqual([]);
  });
});

describe("removeProject", () => {
  test("add project; add project; remove project; remove project", async () => {
    let store = structuredClone(mapStore);

    let project1 = structuredClone(project_cnc1);
    project1.identifications_count = structuredClone(
      allTaxaIdentification,
    ).identifications_count;
    let project2 = structuredClone(project_cnc2);
    project2.identifications_count = structuredClone(
      allTaxaIdentification,
    ).identifications_count;

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);
    await projectSelectedHandler(project1, "city", store);
    await projectSelectedHandler(project2, "city", store);

    expectEmptyResources(store, ["selectedTaxa", "selectedProjects"]);
    expectDefaultTaxaRecord(store);
    let expectedParams2 = {
      ...defaultParams,
      per_page: perPage,
      project_id: `${project1.id},${project2.id}`,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(
      `?project_id=${project1.id},${project2.id}&${defaultQuery}` +
        `&per_page=${perPage}`,
    );
    expect(store.selectedProjects).toStrictEqual([project1, project2]);

    await removeProject(project1.id, store);

    expectEmptyResources(store, ["selectedTaxa", "selectedProjects"]);
    expectDefaultTaxaRecord(store, allTaxa.observations_count * 0.3);
    let expectedParams3 = {
      ...defaultParams,
      per_page: perPage,
      project_id: `${project2.id}`,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams3);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(
      `?project_id=${project2.id}&${defaultQuery}` + `&per_page=${perPage}`,
    );
    expect(store.selectedProjects).toStrictEqual([project2]);

    await removeProject(project2.id, store);

    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecord(store);
    let expectedParams4 = {
      ...defaultParams,
      per_page: perPage,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams4);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(`?${defaultQuery}&per_page=${perPage}`);
    expect(store.selectedProjects).toStrictEqual([]);
  });
});

describe("removeWithoutProject", () => {
  test("add without project; add without project; remove without project; remove without project", async () => {
    let store = structuredClone(mapStore);

    let project1 = structuredClone(project_cnc1);
    let project2 = structuredClone(project_cnc2);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);
    await notInProjectSelectedHandler(project1, "city", store);
    await notInProjectSelectedHandler(project2, "city", store);

    expectEmptyResources(store, ["selectedTaxa", "selectedWithoutProjects"]);
    expectDefaultTaxaRecord(store);
    let expectedParams2 = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      not_in_project: `${project1.id},${project2.id}`,
      taxon_id: allTaxa.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}&not_in_project=${project1.id},${project2.id}`,
    );
    expect(store.selectedWithoutProjects).toStrictEqual([project1, project2]);

    await removeWithoutProject(project1.id, store);

    expectEmptyResources(store, ["selectedTaxa", "selectedWithoutProjects"]);
    expectDefaultTaxaRecord(store, allTaxa.observations_count);
    let expectedParams3 = {
      ...defaultParams,
      per_page: perPage,
      not_in_project: `${project2.id}`,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams3);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}&not_in_project=${project2.id}`,
    );
    expect(store.selectedWithoutProjects).toStrictEqual([project2]);

    await removeWithoutProject(project2.id, store);

    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecord(store);
    let expectedParams4 = {
      ...defaultParams,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams4);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(`?${defaultQuery}&per_page=${perPage}`);
    expect(store.selectedWithoutProjects).toStrictEqual([]);
  });
});

describe("removeTaxon", () => {
  test("add taxon; add taxon; remove taxon ; remove taxon", async () => {
    let store = structuredClone(mapStore);

    let Life = structuredClone(life());
    let RedOak = structuredClone(redOak());

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);
    await taxonSelectedHandler(Life, "life", store);
    await taxonSelectedHandler(RedOak, "red", store);

    expectEmptyResources(store, ["selectedTaxa"]);
    let params2 = {
      ...defaultParams,
      per_page: perPage,
      colors: `${colors[0]},${colors[1]}`,
      taxon_id: `${Life.id},${RedOak.id}`,
    };
    expect(store.observationsApiParams).toStrictEqual(params2);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(
      `?taxon_id=${Life.id},${RedOak.id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}&${defaultQuery}&per_page=${perPage}`,
    );
    expectLifeOakTaxa(store);

    await removeTaxon(Life.id, store);

    let params3 = {
      ...defaultParams,
      per_page: perPage,
      colors: colors[1],
      taxon_id: RedOak.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(params3);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(
      `?taxon_id=${RedOak.id}&colors=${colorsEncoded[1]}&${defaultQuery}&per_page=${perPage}`,
    );
    expectOakTaxa(store);

    await removeTaxon(RedOak.id, store);

    let params4 = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(params4);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(`?${defaultQuery}&per_page=${perPage}`);
    expectDefaultTaxaRecord(store);
  });
});

describe("removeWithoutTaxon", () => {
  test("add taxon; add taxon; remove taxon; remove taxon", async () => {
    let store = structuredClone(mapStore);

    let life1 = life();
    delete life1.color;
    delete life1.observations_count;
    let oak1 = redOak();
    delete oak1.color;
    delete oak1.observations_count;

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);

    await withoutTaxonSelectedHandler(lifeBasic, "life", store);
    await withoutTaxonSelectedHandler(redOakBasic, "red", store);

    expectEmptyResources(store, ["selectedTaxa", "selectedWithoutTaxa"]);
    expect(store.selectedWithoutTaxa).toStrictEqual([life1, oak1]);
    expectDefaultTaxaRecord(store);
    let expectedParams2 = {
      ...defaultParams,
      per_page: perPage,
      taxon_id: allTaxa.id.toString(),
      without_taxon_id: `${life1.id},${oak1.id}`,
      colors: iNatOrange,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}` +
        `&without_taxon_id=${life1.id},${oak1.id}`,
    );

    await removeWithoutTaxon(life1.id, store);

    expectEmptyResources(store, ["selectedTaxa", "selectedWithoutTaxa"]);
    expect(store.selectedWithoutTaxa).toStrictEqual([oak1]);
    let expectedParams3 = {
      ...defaultParams,
      per_page: perPage,
      taxon_id: allTaxa.id.toString(),
      without_taxon_id: `${oak1.id}`,
      colors: iNatOrange,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams3);
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}` + `&without_taxon_id=${oak1.id}`,
    );

    await removeWithoutTaxon(oak1.id, store);

    expectEmptyResources(store, ["selectedTaxa"]);
    expect(store.selectedWithoutTaxa).toStrictEqual([]);
    let expectedParams4 = {
      ...defaultParams,
      per_page: perPage,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams4);
    expect(window.location.search).toBe(`?${defaultQuery}&per_page=${perPage}`);
  });
});

describe("removeTaxonIdentified", () => {
  test("add taxon; add taxon; remove taxon; remove taxon", async () => {
    let store = structuredClone(mapStore);

    let Life = life();
    let RedOak = redOak();

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);

    await taxonIdentifiedSelectedHandler(Life, "life", store);
    await taxonIdentifiedSelectedHandler(RedOak, "red", store);

    expectEmptyResources(store, ["selectedTaxaIdentified", "selectedTaxa"]);
    expectDefaultTaxaRecord(store);
    expect(store.selectedTaxaIdentified).toStrictEqual([
      { ...Life, observations_count: allTaxa.observations_count },
      { ...RedOak, observations_count: allTaxa.observations_count },
    ]);
    expectLifeOakTaxaIdentifiedMapOnly(store);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      ident_taxon_id: `${Life.id},${RedOak.id}`,
      per_page: perPage,
      taxon_id: `${allTaxa.id}`,
      colors: `${allTaxa.color}`,
    });
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}&ident_taxon_id=${Life.id},${RedOak.id}`,
    );

    await removeTaxonIdentified(Life.id, store);

    expectEmptyResources(store, ["selectedTaxa", "selectedTaxaIdentified"]);
    expectDefaultTaxaRecord(store);
    expect(store.selectedTaxaIdentified).toStrictEqual([
      { ...RedOak, observations_count: allTaxa.observations_count },
    ]);
    expectOakTaxaIdentifiedMapOnly(store);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      per_page: perPage,
      ident_taxon_id: `${RedOak.id}`,
      taxon_id: `${allTaxa.id}`,
      colors: `${allTaxa.color}`,
    });
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}&ident_taxon_id=${RedOak.id}`,
    );

    await removeTaxonIdentified(RedOak.id, store);

    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecord(store);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      per_page: perPage,
      taxon_id: `${allTaxa.id}`,
      colors: `${allTaxa.color}`,
    });
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(`?${defaultQuery}&per_page=${perPage}`);
  });
});

describe("removeUser", () => {
  test("add user; add user; remove user; remove user", async () => {
    let store = structuredClone(mapStore);

    let userA = structuredClone(user1);
    let userB = structuredClone(user2);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);
    await userSelectedHandler(userA, "user", store);
    await userSelectedHandler(userB, "user", store);

    expectEmptyResources(store, ["selectedTaxa", "selectedUsers"]);
    expectDefaultTaxaRecord(store);
    let expectedParams2 = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      user_id: `${userA.id},${userB.id}`,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(
      `?user_id=${userA.id},${userB.id}&${defaultQuery}&per_page=${perPage}`,
    );
    expect(store.selectedUsers).toStrictEqual([userA, userB]);

    await removeUser(userA.id, store);

    expectEmptyResources(store, ["selectedTaxa", "selectedUsers"]);
    expectDefaultTaxaRecord(store, allTaxa.observations_count * 0.55);
    let expectedParams3 = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      user_id: `${userB.id}`,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams3);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(
      `?user_id=${userB.id}&${defaultQuery}&per_page=${perPage}`,
    );
    expect(store.selectedUsers).toStrictEqual([userB]);

    await removeUser(userB.id, store);

    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecord(store);
    let expectedParams4 = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams4);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(`?${defaultQuery}&per_page=${perPage}`);
    expect(store.selectedUsers).toStrictEqual([]);
  });
});

describe("removeWithoutUser", () => {
  test("add without user x 2;  remove without user x 2", async () => {
    let store = structuredClone(mapStore);

    let userA = structuredClone(user1);
    let userB = structuredClone(user2);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);
    await withoutUserSelectedHandler(userA, "user", store);
    await withoutUserSelectedHandler(userB, "user", store);

    expectEmptyResources(store, ["selectedTaxa", "selectedWithoutUsers"]);
    expectDefaultTaxaRecord(store);
    let expectedParams2 = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      not_user_id: `${userA.id},${userB.id}`,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}&not_user_id=${userA.id},${userB.id}`,
    );
    expect(store.selectedWithoutUsers).toStrictEqual([userA, userB]);

    await removeWithoutUser(userA.id, store);

    expectEmptyResources(store, ["selectedTaxa", "selectedWithoutUsers"]);
    expectDefaultTaxaRecord(store, allTaxa.observations_count);
    let expectedParams3 = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      not_user_id: `${userB.id}`,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams3);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}&not_user_id=${userB.id}`,
    );
    expect(store.selectedWithoutUsers).toStrictEqual([userB]);

    await removeWithoutUser(userB.id, store);

    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecord(store);
    let expectedParams4 = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams4);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(`?${defaultQuery}&per_page=${perPage}`);
    expect(store.selectedWithoutUsers).toStrictEqual([]);
  });
});

describe("removeUserIdentifier", () => {
  test("add user; add user; remove user; remove user;", async () => {
    let store = structuredClone(mapStore);
    let allTaxaount = allTaxa.observations_count * 0.75;

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);
    await userIdentifierSelectedHandler(user1, "user", store);
    await userIdentifierSelectedHandler(user2, "user", store);

    expectEmptyResources(store, ["selectedTaxa", "selectedUsersIdentifiers"]);
    expectDefaultTaxaRecord(store, allTaxaount);
    let expectedParams2 = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      ident_user_id: `${user1.id},${user2.id}`,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(
      `?ident_user_id=${user1.id},${user2.id}&${defaultQuery}&per_page=${perPage}`,
    );
    expect(store.selectedUsersIdentifiers).toStrictEqual([user1, user2]);

    await removeUserIdentifier(user2.id, store);

    expectEmptyResources(store, ["selectedTaxa", "selectedUsersIdentifiers"]);
    expectDefaultTaxaRecord(store, allTaxaount);
    let expectedParams3 = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      ident_user_id: `${user1.id}`,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams3);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(
      `?ident_user_id=${user1.id}&${defaultQuery}&per_page=${perPage}`,
    );
    expect(store.selectedUsersIdentifiers).toStrictEqual([user1]);

    await removeUserIdentifier(user1.id, store);

    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecord(store);
    let expectedParams4 = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams4);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(`?${defaultQuery}&per_page=${perPage}`);
    expect(store.selectedUsersIdentifiers).toStrictEqual([]);
  });
});

describe("removeWithoutUserIdentifier", () => {
  test("add without user identifier x 2;  remove without user identifier x 2", async () => {
    let store = structuredClone(mapStore);

    let userA = structuredClone(user1);
    let userB = structuredClone(user2);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);
    await withoutUserIdentifierSelectedHandler(userA, "user", store);
    await withoutUserIdentifierSelectedHandler(userB, "user", store);

    expectEmptyResources(store, [
      "selectedTaxa",
      "selectedWithoutUsersIdentifiers",
    ]);
    expectDefaultTaxaRecord(store);
    let expectedParams2 = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      without_ident_user_id: `${userA.id},${userB.id}`,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}&without_ident_user_id=${userA.id},${userB.id}`,
    );
    expect(store.selectedWithoutUsersIdentifiers).toStrictEqual([userA, userB]);

    await removeWithoutUserIdentifier(userA.id, store);

    expectEmptyResources(store, [
      "selectedTaxa",
      "selectedWithoutUsersIdentifiers",
    ]);
    expectDefaultTaxaRecord(store, allTaxa.observations_count);
    let expectedParams3 = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      without_ident_user_id: `${userB.id}`,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams3);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}&without_ident_user_id=${userB.id}`,
    );
    expect(store.selectedWithoutUsersIdentifiers).toStrictEqual([userB]);

    await removeWithoutUserIdentifier(userB.id, store);

    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecord(store);
    let expectedParams4 = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams4);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(`?${defaultQuery}&per_page=${perPage}`);
    expect(store.selectedWithoutUsersIdentifiers).toStrictEqual([]);
  });
});

describe("removeUserAnnotator", () => {
  test("add annotator; add annotator; remove annotator; remove annotator; ", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);
    await userAnnotatorsSelectedHandler(user1, "user", store);
    await userAnnotatorsSelectedHandler(user2, "user", store);

    expectEmptyResources(store, ["selectedTaxa", "selectedUsersAnnotators"]);
    expectDefaultTaxaRecord(store);
    expect(store.selectedUsersAnnotators).toStrictEqual([user1, user2]);
    let expectedParams2 = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      annotation_user_id: `${user1.id},${user2.id}`,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}` +
        `&annotation_user_id=${user1.id},${user2.id}`,
    );

    await removeUserAnnotator(user1.id, store);

    expectEmptyResources(store, ["selectedTaxa", "selectedUsersAnnotators"]);
    expectDefaultTaxaRecord(store);
    expect(store.selectedUsersAnnotators).toStrictEqual([user2]);
    let expectedParams3 = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      annotation_user_id: `${user2.id}`,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams3);
    expect(window.location.search).toBe(
      `?${defaultQuery}&per_page=${perPage}` +
        `&annotation_user_id=${user2.id}`,
    );

    await removeUserAnnotator(user2.id, store);

    expectEmptyResources(store, ["selectedTaxa", "selectedUsersAnnotators"]);
    expectDefaultTaxaRecord(store);
    expect(store.selectedUsersAnnotators).toStrictEqual([]);
    let expectedParams4 = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams4);
    expect(window.location.search).toBe(`?${defaultQuery}&per_page=${perPage}`);
  });
});

describe("taxa combos", () => {
  test("add taxon; add taxon identified; remove taxon; remove taxon identified;", async () => {
    let store = structuredClone(mapStore);

    let Life = structuredClone(life());
    let RedOak = structuredClone(redOak());

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);

    await taxonSelectedHandler(Life, "life", store);
    await taxonIdentifiedSelectedHandler(RedOak, "red", store);

    expectEmptyResources(store, ["selectedTaxa", "selectedTaxaIdentified"]);
    expectLifeTaxa(store);
    expect(store.selectedTaxaIdentified).toStrictEqual([
      { ...RedOak, observations_count: Life.observations_count },
    ]);
    expectOakTaxaIdentifiedMapOnly(store);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      colors: `${Life.color}`,
      taxon_id: `${Life.id}`,
      ident_taxon_id: `${RedOak.id}`,
      per_page: perPage,
    });
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(
      `?taxon_id=${Life.id}` +
        `&colors=${colorsEncoded[0]}` +
        `&${defaultQuery}` +
        `&per_page=${perPage}` +
        `&ident_taxon_id=${RedOak.id}`,
    );

    await removeTaxon(Life.id, store);

    expectEmptyResources(store, ["selectedTaxaIdentified", "selectedTaxa"]);
    expectDefaultTaxaRecord(store);
    expect(store.selectedTaxaIdentified).toStrictEqual([
      { ...RedOak, observations_count: allTaxa.observations_count },
    ]);
    expectOakTaxaIdentifiedMapOnly(store);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: `${allTaxa.id}`,
      ident_taxon_id: `${RedOak.id}`,
      per_page: perPage,
    });
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(
      `?${defaultQuery}` +
        `&per_page=${perPage}` +
        `&ident_taxon_id=${RedOak.id}`,
    );

    await removeTaxonIdentified(RedOak.id, store);

    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecord(store);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: `${allTaxa.id}`,
      per_page: perPage,
    });
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(`?${defaultQuery}&per_page=${perPage}`);
  });

  test("add taxon; add taxon identified; remove taxon identified; remove taxon;", async () => {
    let store = structuredClone(mapStore);

    let Life = life();
    let RedOak = redOak();
    let oakColorEncode = defaultColorScheme[0].replace("#", "%23");
    let lifeCount = Life.observations_count;

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);

    await taxonSelectedHandler(Life, "life", store);
    await taxonIdentifiedSelectedHandler(RedOak, "red", store);

    expectEmptyResources(store, ["selectedTaxa", "selectedTaxaIdentified"]);
    expectLifeTaxa(store);
    expect(store.selectedTaxaIdentified).toStrictEqual([
      { ...RedOak, observations_count: lifeCount },
    ]);
    expectOakTaxaIdentifiedMapOnly(store);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      per_page: perPage,
      colors: `${Life.color}`,
      taxon_id: `${Life.id}`,
      ident_taxon_id: `${RedOak.id}`,
    });
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(
      `?taxon_id=${Life.id}` +
        `&colors=${oakColorEncode}` +
        `&${defaultQuery}` +
        `&per_page=${perPage}` +
        `&ident_taxon_id=${RedOak.id}`,
    );

    await removeTaxonIdentified(RedOak.id, store);

    expectEmptyResources(store, ["selectedTaxa"]);
    expectLifeTaxa(store);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      per_page: perPage,
      colors: Life.color,
      taxon_id: `${Life.id}`,
    });
    expect(window.location.search).toBe(
      `?taxon_id=${Life.id}` +
        `&colors=${oakColorEncode}` +
        `&${defaultQuery}` +
        `&per_page=${perPage}`,
    );

    await removeTaxon(Life.id, store);

    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecord(store);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      per_page: perPage,
      colors: allTaxa.color,
      taxon_id: `${allTaxa.id}`,
    });
    expect(window.location.search).toBe(
      `?${defaultQuery}` + `&per_page=${perPage}`,
    );
  });
});

describe("removeUserIdentifier with identifications", () => {
  test("add user identifier; add user identifier; remove user identifier", async () => {
    let store = structuredClone(mapStore);
    store.record_type == "identifications";

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/identifications/"));
    await initRenderMap(store);
    await userIdentifierSelectedHandler(user1, "user", store);
    await userIdentifierSelectedHandler(user2, "user", store);

    expectEmptyResources(store, [
      "selectedTaxaIdentified",
      "selectedUsersIdentifiers",
    ]);
    expectDefaultTaxaRecordIdentification(store);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams2 = {
      per_page: perPage,
      user_id: `${user1.id},${user2.id}`,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?user_id=${user1.id},${user2.id}&per_page=${perPage}`,
    );
    expect(store.selectedUsersIdentifiers).toStrictEqual([user1, user2]);

    await removeUserIdentifier(user1.id, store);

    expectEmptyResources(store, [
      "selectedTaxaIdentified",
      "selectedUsersIdentifiers",
    ]);
    expectDefaultTaxaRecordIdentification(
      store,
      allTaxaIdentification.identifications_count * 0.55,
    );
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
    });
    let expectedParams3 = {
      per_page: perPage,
      user_id: `${user2.id}`,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams3);
    expect(window.location.search).toBe(
      `?user_id=${user2.id}&per_page=${perPage}`,
    );
    expect(store.selectedUsersIdentifiers).toStrictEqual([user2]);

    await removeUserIdentifier(user2.id, store);

    expectEmptyResources(store, ["selectedTaxaIdentified"]);
    expectDefaultTaxaRecordIdentification(store);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
    });
    expect(store.identificationsApiParams).toStrictEqual({
      per_page: perPage,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    });
    expect(window.location.search).toBe(`?per_page=${perPage}`);
    expect(store.selectedUsersIdentifiers).toStrictEqual([]);
  });
});

describe("removePlace with identifications", () => {
  test("add place; add place; remove place; remove place", async () => {
    let store = structuredClone(mapStore);
    store.record_type == "identifications";

    let count = allTaxaIdentification.identifications_count;
    let LosAngeles = structuredClone(losangeles);
    LosAngeles.identifications_count = count * 0.6;
    let SanDiego = structuredClone(sandiego);
    SanDiego.identifications_count = count * 0.4;

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/identifications/"));
    await initRenderMap(store);

    await placeSelectedHandler(LosAngeles, "los", store);
    await placeSelectedHandler(SanDiego, "san", store);

    expectEmptyResources(store, ["selectedTaxaIdentified", "selectedPlaces"]);
    expectDefaultTaxaRecordIdentification(store);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      per_page: perPage,
      place_id: `${LosAngeles.id},${SanDiego.id}`,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    });
    expect(window.location.search).toBe(
      `?place_id=${LosAngeles.id},${SanDiego.id}` + `&per_page=${perPage}`,
    );
    expect(store.selectedPlaces).toStrictEqual([LosAngeles, SanDiego]);

    await removePlace(LosAngeles.id, store);

    expectEmptyResources(store, ["selectedTaxaIdentified", "selectedPlaces"]);
    expectDefaultTaxaRecordIdentification(
      store,
      allTaxaIdentification.identifications_count * 0.4,
    );
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      per_page: perPage,
      place_id: `${SanDiego.id}`,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    });
    expect(window.location.search).toBe(
      `?place_id=${SanDiego.id}` + `&per_page=${perPage}`,
    );
    expect(store.selectedPlaces).toStrictEqual([SanDiego]);

    await removePlace(SanDiego.id, store);

    expectEmptyResources(store, ["selectedTaxaIdentified"]);
    expectDefaultTaxaRecordIdentification(store);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      per_page: perPage,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    });
    expect(window.location.search).toBe(`?per_page=${perPage}`);
    expect(store.selectedPlaces).toStrictEqual([]);
  });
});

describe("removeTaxon with identifications", () => {
  test("add taxon; add taxon; remove taxon; remove taxon", async () => {
    let store = structuredClone(mapStore);
    store.record_type == "identifications";

    let Life = lifeIdentification();
    let RedOak = redOakIdentification();

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/identifications/"));
    await initRenderMap(store);

    await taxonSelectedHandler(Life, "life", store);
    await taxonSelectedHandler(RedOak, "red", store);

    expectEmptyResources(store, ["selectedTaxa", "selectedTaxaIdentified"]);
    expectDefaultTaxaRecordIdentification(store, 22000);
    expect(store.selectedTaxa).toStrictEqual([Life, RedOak]);
    expectLifeOakTaxaMapOnly(store);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      per_page: perPage,
      observation_taxon_id: `${Life.id},${RedOak.id}`,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
    });
    expect(window.location.search).toBe(
      `?observation_taxon_id=${Life.id},${RedOak.id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}` +
        `&per_page=${perPage}`,
    );

    await removeTaxon(Life.id, store);

    expectEmptyResources(store, ["selectedTaxa", "selectedTaxaIdentified"]);
    expectDefaultTaxaRecordIdentification(store, 2000);
    expect(store.selectedTaxa).toStrictEqual([RedOak]);
    expectOakTaxaMapOnly(store);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      observation_taxon_id: `${RedOak.id}`,
      per_page: perPage,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
    });
    expect(window.location.search).toBe(
      `?observation_taxon_id=${RedOak.id}` +
        `&colors=${colorsEncoded[1]}` +
        `&per_page=${perPage}`,
    );

    await removeTaxon(RedOak.id, store);

    expectEmptyResources(store, ["selectedTaxaIdentified"]);
    expectDefaultTaxaRecordIdentification(store, 200000);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      per_page: perPage,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    });
    expect(window.location.search).toBe(`?per_page=${perPage}`);
  });
});

describe("removeTaxonIdentified with identifications", () => {
  test("add taxon; add taxon; remove taxon; remove taxon", async () => {
    let store = structuredClone(mapStore);
    store.record_type == "identifications";

    let Life = lifeIdentification();
    let RedOak = redOakIdentification();

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/identifications/"));
    await initRenderMap(store);

    await taxonIdentifiedSelectedHandler(Life, "life", store);
    await taxonIdentifiedSelectedHandler(RedOak, "red", store);

    expectEmptyResources(store, ["selectedTaxaIdentified"]);
    expect(store.selectedTaxaIdentified).toStrictEqual([Life, RedOak]);
    expectLifeOakTaxaIdentifiedMapOnly(store);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      per_page: perPage,
      taxon_id: `${Life.id},${RedOak.id}`,
      colors: `${Life.color},${RedOak.color}`,
    });
    expect(window.location.search).toBe(
      `?taxon_id=${Life.id},${RedOak.id}` + `&per_page=${perPage}`,
    );

    await removeTaxonIdentified(Life.id, store);

    expectEmptyResources(store, ["selectedTaxaIdentified"]);
    expect(store.selectedTaxaIdentified).toStrictEqual([RedOak]);
    expectOakTaxaIdentifiedMapOnly(store);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      per_page: perPage,
      taxon_id: `${RedOak.id}`,
      colors: `${RedOak.color}`,
    });
    expect(window.location.search).toBe(
      `?taxon_id=${RedOak.id}` + `&per_page=${perPage}`,
    );

    await removeTaxonIdentified(RedOak.id, store);

    expectEmptyResources(store, ["selectedTaxaIdentified"]);
    expectDefaultTaxaRecordIdentification(store);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      per_page: perPage,
      taxon_id: `${allTaxa.id}`,
      colors: iNatOrange,
    });
    expect(window.location.search).toBe(`?per_page=${perPage}`);
  });
});

describe("removeWithoutTaxon with identifications", () => {
  test("add taxon; add taxon; remove taxon; remove taxon", async () => {
    let store = structuredClone(mapStore);

    let life1 = lifeIdentification();
    delete life1.color;
    delete life1.identifications_count;
    let oak1 = redOakIdentification();
    delete oak1.color;
    delete oak1.identifications_count;

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/identifications/"));
    await initRenderMap(store);

    await withoutTaxonSelectedHandler(lifeBasic, "life", store);
    await withoutTaxonSelectedHandler(redOakBasic, "red", store);

    expectEmptyResources(store, [
      "selectedTaxaIdentified",
      "selectedWithoutTaxa",
    ]);
    expectDefaultTaxaRecordIdentification(store);
    expect(store.selectedWithoutTaxa).toStrictEqual([life1, oak1]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams2 = {
      per_page: perPage,
      taxon_id: allTaxa.id.toString(),
      without_observation_taxon_id: `${life1.id},${oak1.id}`,
      colors: iNatOrange,
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?per_page=${perPage}&without_observation_taxon_id=${life1.id},${oak1.id}`,
    );

    await removeWithoutTaxon(life1.id, store);

    expectEmptyResources(store, [
      "selectedTaxaIdentified",
      "selectedWithoutTaxa",
    ]);
    expectDefaultTaxaRecordIdentification(store);
    expect(store.selectedWithoutTaxa).toStrictEqual([oak1]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams3 = {
      per_page: perPage,
      taxon_id: allTaxa.id.toString(),
      without_observation_taxon_id: `${oak1.id}`,
      colors: iNatOrange,
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams3);
    expect(window.location.search).toBe(
      `?per_page=${perPage}&without_observation_taxon_id=${oak1.id}`,
    );

    await removeWithoutTaxon(oak1.id, store);

    expectEmptyResources(store, ["selectedTaxaIdentified"]);
    expectDefaultTaxaRecordIdentification(store);
    expect(store.selectedWithoutTaxa).toStrictEqual([]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      per_page: perPage,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    });
    expect(window.location.search).toBe(`?per_page=${perPage}`);
  });
});

describe("removeWithoutTaxonIdentified with identifications", () => {
  test("add taxon; add taxon; remove taxon; remove taxon", async () => {
    let store = structuredClone(mapStore);

    let life1 = lifeIdentification();
    delete life1.color;
    delete life1.identifications_count;
    let oak1 = redOakIdentification();
    delete oak1.color;
    delete oak1.identifications_count;

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/identifications/"));
    await initRenderMap(store);

    await withoutTaxonIdentifiedSelectedHandler(lifeBasic, "life", store);
    await withoutTaxonIdentifiedSelectedHandler(redOakBasic, "red", store);

    expectEmptyResources(store, [
      "selectedTaxaIdentified",
      "selectedWithoutTaxaIdentified",
    ]);
    expectDefaultTaxaRecordIdentification(store);
    expect(store.selectedWithoutTaxaIdentified).toStrictEqual([life1, oak1]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams2 = {
      per_page: perPage,
      taxon_id: allTaxa.id.toString(),
      without_taxon_id: `${life1.id},${oak1.id}`,
      colors: iNatOrange,
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?per_page=${perPage}&without_taxon_id=${life1.id},${oak1.id}`,
    );

    await removeWithoutTaxonIdentified(life1.id, store);

    expectEmptyResources(store, [
      "selectedTaxaIdentified",
      "selectedWithoutTaxaIdentified",
    ]);
    expectDefaultTaxaRecordIdentification(store);
    expect(store.selectedWithoutTaxaIdentified).toStrictEqual([oak1]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams3 = {
      per_page: perPage,
      taxon_id: allTaxa.id.toString(),
      without_taxon_id: `${oak1.id}`,
      colors: iNatOrange,
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams3);
    expect(window.location.search).toBe(
      `?per_page=${perPage}&without_taxon_id=${oak1.id}`,
    );

    await removeWithoutTaxonIdentified(oak1.id, store);

    expectEmptyResources(store, ["selectedTaxaIdentified"]);
    expectDefaultTaxaRecordIdentification(store);
    expect(store.selectedWithoutTaxaIdentified).toStrictEqual([]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      per_page: perPage,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    });
    expect(window.location.search).toBe(`?per_page=${perPage}`);
  });
});

describe("taxa combo with identifications", () => {
  test("add taxon; add taxon identified; remove taxon; remove taxon identified;", async () => {
    let store = structuredClone(mapStore);
    store.record_type == "identifications";

    let Life = lifeIdentification();
    let RedOak = redOakIdentification();
    RedOak.color = defaultColorScheme[0];

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/identifications/"));
    await initRenderMap(store);

    await taxonSelectedHandler(Life, "life", store);
    await taxonIdentifiedSelectedHandler(RedOak, "red", store);

    expectEmptyResources(store, ["selectedTaxa", "selectedTaxaIdentified"]);
    expect(store.selectedTaxa).toStrictEqual([Life]);
    expectLifeTaxaMapOnly(store);
    expect(store.selectedTaxaIdentified).toStrictEqual([
      { ...RedOak, identifications_count: Life.identifications_count },
    ]);
    expectOakTaxaIdentifiedMapOnly(store);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      per_page: perPage,
      colors: `${RedOak.color}`,
      observation_taxon_id: `${Life.id}`,
      taxon_id: `${RedOak.id}`,
    });
    expect(window.location.search).toBe(
      `?observation_taxon_id=${Life.id}` +
        `&taxon_id=${RedOak.id}` +
        `&colors=${colorsEncoded[0]}` +
        `&per_page=${perPage}`,
    );

    await removeTaxon(Life.id, store);

    expectEmptyResources(store, ["selectedTaxaIdentified"]);
    expect(store.selectedTaxaIdentified).toStrictEqual([RedOak]);
    expectOakTaxaIdentifiedMapOnly(store);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      per_page: perPage,
      colors: RedOak.color,
      taxon_id: `${RedOak.id}`,
    });
    expect(window.location.search).toBe(
      `?taxon_id=${RedOak.id}` + `&per_page=${perPage}`,
    );

    await removeTaxonIdentified(RedOak.id, store);

    expectEmptyResources(store, ["selectedTaxaIdentified"]);
    expectDefaultTaxaRecordIdentification(store);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      per_page: perPage,
      colors: allTaxa.color,
      taxon_id: allTaxa.id.toString(),
    });
    expect(window.location.search).toBe(`?per_page=${perPage}`);
  });

  test("add taxon; add taxon identified; remove taxon identified; remove taxon;", async () => {
    let store = structuredClone(mapStore);
    store.record_type == "identifications";

    let Life = lifeIdentification();
    let RedOak = redOakIdentification();
    RedOak.color = defaultColorScheme[0];
    let oakColorEncode = defaultColorScheme[0].replace("#", "%23");
    let lifeCount = Life.identifications_count;

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/identifications/"));
    await initRenderMap(store);

    await taxonSelectedHandler(Life, "life", store);
    await taxonIdentifiedSelectedHandler(RedOak, "red", store);

    expectEmptyResources(store, ["selectedTaxa", "selectedTaxaIdentified"]);
    expect(store.selectedTaxa).toStrictEqual([Life]);
    expectLifeTaxaMapOnly(store);
    expect(store.selectedTaxaIdentified).toStrictEqual([
      { ...RedOak, identifications_count: lifeCount },
    ]);
    expectOakTaxaIdentifiedMapOnly(store);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      per_page: perPage,
      colors: `${RedOak.color}`,
      observation_taxon_id: `${Life.id}`,
      taxon_id: `${RedOak.id}`,
    });
    expect(window.location.search).toBe(
      `?observation_taxon_id=${Life.id}` +
        `&taxon_id=${RedOak.id}` +
        `&colors=${oakColorEncode}` +
        `&per_page=${perPage}`,
    );

    await removeTaxonIdentified(RedOak.id, store);

    expectEmptyResources(store, ["selectedTaxaIdentified", "selectedTaxa"]);
    expectDefaultTaxaRecordIdentification(store, lifeCount);
    expect(store.selectedTaxa).toStrictEqual([Life]);
    expectLifeTaxaMapOnly(store);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      per_page: perPage,
      colors: allTaxa.color,
      taxon_id: allTaxa.id.toString(),
      observation_taxon_id: `${Life.id}`,
    });
    expect(window.location.search).toBe(
      `?observation_taxon_id=${Life.id}&colors=${colorsEncoded[0]}&per_page=${perPage}`,
    );

    await removeTaxon(Life.id, store);

    expectEmptyResources(store, ["selectedTaxaIdentified"]);
    expectDefaultTaxaRecordIdentification(store);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      per_page: perPage,
      colors: allTaxa.color,
      taxon_id: allTaxa.id.toString(),
    });
    expect(window.location.search).toBe(`?per_page=${perPage}`);
  });
});

describe("taxa with no map", () => {
  test("add taxon; add taxon identified; remove taxon identified; remove taxon;", async () => {
    let store = structuredClone(mapStore);

    let Life = life();
    let RedOak = redOak();
    let oakColorEncode = defaultColorScheme[0].replace("#", "%23");
    let lifeCount = Life.observations_count;

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));

    await taxonSelectedHandler(Life, "life", store);
    await taxonIdentifiedSelectedHandler(RedOak, "red", store);

    expectEmptyResources(store, ["selectedTaxa", "selectedTaxaIdentified"]);
    expect(store.selectedTaxa).toStrictEqual([Life]);
    expect(Object.keys(store.taxaMapLayers)).toEqual([]);
    expect(store.selectedTaxaIdentified).toStrictEqual([
      { ...RedOak, observations_count: lifeCount },
    ]);
    expect(Object.keys(store.taxaIdentifiedMapLayers)).toEqual([]);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      per_page: perPage,
      colors: `${Life.color}`,
      taxon_id: `${Life.id}`,
      ident_taxon_id: `${RedOak.id}`,
    });
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(
      `?taxon_id=${Life.id}` +
        `&colors=${oakColorEncode}` +
        `&${defaultQuery}` +
        `&per_page=${perPage}` +
        `&ident_taxon_id=${RedOak.id}`,
    );

    await removeTaxonIdentified(RedOak.id, store);

    expectEmptyResources(store, ["selectedTaxa"]);
    expect(store.selectedTaxa).toStrictEqual([Life]);
    expect(Object.keys(store.taxaMapLayers)).toEqual([]);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      per_page: perPage,
      colors: Life.color,
      taxon_id: `${Life.id}`,
    });
    expect(window.location.search).toBe(
      `?taxon_id=${Life.id}` +
        `&colors=${oakColorEncode}` +
        `&${defaultQuery}` +
        `&per_page=${perPage}`,
    );

    await removeTaxon(Life.id, store);

    expectEmptyResources(store, ["selectedTaxa"]);
    expect(store.selectedTaxa).toStrictEqual([allTaxa]);
    expect(Object.keys(store.taxaMapLayers)).toEqual([]);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      per_page: perPage,
      colors: allTaxa.color,
      taxon_id: `${allTaxa.id}`,
    });
    expect(window.location.search).toBe(
      `?${defaultQuery}` + `&per_page=${perPage}`,
    );
  });
});
