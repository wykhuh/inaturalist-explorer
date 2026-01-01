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
  expectRefreshPlace,
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
  refreshBBoxLabel,
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
  expectProjects,
  user1,
  gridLabel_allTaxaRecord_user1,
  expectUser1,
  user2,
  gridLabel_allTaxaRecord_users,
  expectUsers,
  gridLabel_life_la_project1_user1,
  gridLabel_oak_la_project1_user1,
  gridLabel_life_la_sd_project1_user1,
  gridLabel_oak_la_sd_project1_user1,
  gridLabel_oak_la_sd_projects_user1,
  gridLabel_life_la_sd_projects_user1,
  allTaxa,
  defaultParams,
  defaultQuery,
  gridLabel_life_la,
  gridLabel_life_la_project1,
  gridLabel_life_places_projects_users,
  gridLabel_oaks_places_projects_users,
  expectUser1UnobservedByUser,
  expectUser1Identifier,
  gridLabel_life_places_identifier,
  gridLabel_oaks_places_identifier,
  expectLifeTaxaIdentification,
  expectLifeOakTaxaIdentifications,
  expectLosAngelesPlaceIdentifications,
  expect_LA_SD_Place_Identifications,
  gridLabel_allTaxaRecord_user1Identifier,
  gridLabel_allTaxaRecord_user2Identifier,
  expectUserIdentifiers,
  expectLifeTaxaIdentifiedIdentification,
  lifeIdentification,
  redOakIdentification,
  allTaxaIdentification,
  expectDefaultTaxaRecordIdentification,
  gridLabel_life_places_unobserved,
  gridLabel_oaks_places_unobserved,
  gridLabel_life_places_viewer,
  gridLabel_oaks_places_viewer,
  expectEmptyResources,
  gridLabel_allTaxaRecord_project1NotInProject,
  gridLabel_allTaxaRecord_project2NotInProject,
  gridLabel_allTaxaRecord_user1Reviewer,
  gridLabel_allTaxaRecord_user2Reviewer,
  gridLabel_allTaxaRecord_user1Unobserved,
  gridLabel_allTaxaRecord_user2Unobserved,
  gridLabel_allTaxaRecord_user1Annotator,
  gridLabel_allTaxaRecord_usersAnnotator,
  gridLabel_allTaxaRecord_usersIdentifiers,
} from "../test_helpers.ts";
import { iNatOrange } from "../../lib/map_colors_utils.ts";
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
import { refreshBoundingBox } from "../../lib/search_bounding_box.ts";
import { reviewerSelectedHandler } from "../../lib/search_reviewer.ts";
import { notInProjectSelectedHandler } from "../../lib/search_not_in_project.ts";
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
describe("taxonSelectedHandler", () => {
  test(`add life; add red oak`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);

    await taxonSelectedHandler(lifeBasic, "life", store);

    let oakCount = redOak().observations_count;
    let lifeCount = life().observations_count;
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectEmptyResources(store, ["selectedTaxa"]);
    expectLifeTaxa(store);
    let expectedParams1 = {
      taxon_id: life().id.toString(),
      colors: colors[0],
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams1);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&${defaultQuery}`,
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
      taxon_id: `${life().id},${redOak().id}`,
      colors: `${colors[0]},${colors[1]}`,
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id},${redOak().id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(lifeCount);
    expect(store.selectedTaxa[1].observations_count).toBe(oakCount);
  });
});

describe("taxonIdentifiedSelectedHandler", () => {
  test(`does not add oak`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);
    await taxonIdentifiedSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecord(store);
    let expectedParams = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({});
  });
});

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
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams1);
    expect(window.location.search).toBe(
      `?place_id=${losangeles.id}&${defaultQuery}`,
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
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?place_id=${losangeles.id},${sandiego.id}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaCount * 0.6);
    expect(store.selectedPlaces[1].observations_count).toBe(allTaxaCount * 0.4);
  });
});

describe("refreshBoundingBox", () => {
  test(`refresh map; refresh map;`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);
    await refreshBoundingBox(store);

    let allTaxaCount = allTaxa.observations_count;
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_allTaxaRecord,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedPlaces"]);
    expectDefaultTaxaRecord(store);
    expectRefreshPlace(store, allTaxaCount);
    let expectedParams = {
      ...defaultParams,
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    let refreshlayer1 = store.refreshMap.layer;
    expect(window.location.search).toBe(
      `?${defaultQuery}&nelat=0&nelng=0&swlat=0&swlng=0`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaCount);

    await refreshBoundingBox(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_allTaxaRecord,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedPlaces"]);
    expectDefaultTaxaRecord(store);
    expectRefreshPlace(store, allTaxaCount);
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    let refreshlayer2 = store.refreshMap.layer;
    expect(refreshlayer1).not.toStrictEqual(refreshlayer2);
    expect(window.location.search).toBe(
      `?${defaultQuery}&nelat=0&nelng=0&swlat=0&swlng=0`,
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
    expectProject1(store);
    let expectedParams = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      project_id: project_cnc1.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?project_id=${project_cnc1.id}&${defaultQuery}`,
    );

    await projectSelectedHandler(project_cnc2, "city", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_projects,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedProjects"]);
    expectDefaultTaxaRecord(store);
    expectProjects(store);
    let expectedParams2 = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      project_id: `${project_cnc1.id},${project_cnc2.id}`,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?project_id=${project_cnc1.id},${project_cnc2.id}&${defaultQuery}`,
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
    expectUser1(store);
    let expectedParams = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      user_id: user1.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(`?user_id=${user1.id}&${defaultQuery}`);

    await userSelectedHandler(user2, "user", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_users,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedUsers"]);
    expectDefaultTaxaRecord(store);
    expectUsers(store);
    let expectedParams2 = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      user_id: `${user1.id},${user2.id}`,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?user_id=${user1.id},${user2.id}&${defaultQuery}`,
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

describe("userIdentifierSelectedHandler", () => {
  test("add user; add user", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let allTaxaCount = allTaxa.observations_count;
    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);
    await userIdentifierSelectedHandler(user1, "user", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_user1Identifier,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedUsersIdentifiers"]);
    expectDefaultTaxaRecord(store, allTaxaCount * 0.75);
    expect(store.selectedUsersIdentifiers).toStrictEqual([user1]);
    let expectedParams = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      ident_user_id: user1.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?ident_user_id=${user1.id}&${defaultQuery}`,
    );

    await userIdentifierSelectedHandler(user2, "user", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_user2Identifier,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedUsersIdentifiers"]);
    expectDefaultTaxaRecord(store);
    expect(store.selectedUsersIdentifiers).toStrictEqual([user2]);
    let expectedParams2 = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      ident_user_id: `${user2.id}`,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?ident_user_id=${user2.id}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
    expect(store.selectedUsersIdentifiers[0].observations_count).toBe(
      allTaxaCount,
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
    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecord(store, allTaxaCount);
    expect(store.selectedNotInProject).toStrictEqual(projectA);
    let expectedParams = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      not_in_project: projectA.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?${defaultQuery}&not_in_project=${projectA.id}`,
    );

    await notInProjectSelectedHandler(projectB, "city", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_project2NotInProject,
    ]);
    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecord(store, allTaxaCount);
    expect(store.selectedNotInProject).toStrictEqual(projectB);
    let expectedParams2 = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      not_in_project: `${projectB.id}`,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?${defaultQuery}&not_in_project=${projectB.id}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
    expect(store.selectedNotInProject.observations_count).toBeUndefined();
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
    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecord(store, allTaxaCount);
    expect(store.selectedReviewer).toStrictEqual(userA);
    let expectedParams = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      viewer_id: userA.id,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?${defaultQuery}&viewer_id=${userA.id}`,
    );

    await reviewerSelectedHandler(userB, "user", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_user2Reviewer,
    ]);
    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecord(store);
    expect(store.selectedReviewer).toStrictEqual(userB);
    let expectedParams2 = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      viewer_id: userB.id,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?${defaultQuery}&viewer_id=${userB.id}`,
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
    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecord(store, allTaxaCount * 0.65);
    expect(store.selectedUnobservedByUser).toStrictEqual(userA);
    let expectedParams = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      unobserved_by_user_id: userA.id,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?${defaultQuery}&unobserved_by_user_id=${userA.id}`,
    );

    await unobservedByUserSelectedHandler(userB, "user", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_user2Unobserved,
    ]);
    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecord(store);
    expect(store.selectedUnobservedByUser).toStrictEqual(userB);
    let expectedParams2 = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      unobserved_by_user_id: userB.id,
    };

    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?${defaultQuery}&unobserved_by_user_id=${userB.id}`,
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
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?${defaultQuery}&annotation_user_id=${user1.id}`,
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
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?${defaultQuery}&annotation_user_id=${user1.id},${user2.id}`,
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

describe("withoutTaxonSelectedHandler", () => {
  test(`add life; add red oak`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);

    await withoutTaxonSelectedHandler(lifeBasic, "life", store);

    let life1 = life();
    delete life1.color;
    delete life1.observations_count;
    let oak1 = redOak();
    delete oak1.color;
    delete oak1.observations_count;

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedWithoutTaxa"]);
    expect(store.selectedWithoutTaxa).toStrictEqual([life1]);
    let expectedParams1 = {
      ...defaultParams,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      without_taxon_id: `${life1.id}`,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams1);
    expect(window.location.search).toBe(
      `?${defaultQuery}&without_taxon_id=${life1.id}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(
      allTaxa.observations_count,
    );

    await withoutTaxonSelectedHandler(redOakBasic, "red", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedWithoutTaxa"]);
    expect(store.selectedWithoutTaxa).toStrictEqual([life1, oak1]);
    let expectedParams2 = {
      ...defaultParams,
      taxon_id: allTaxa.id.toString(),
      without_taxon_id: `${life().id},${redOak().id}`,
      colors: iNatOrange,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?${defaultQuery}&without_taxon_id=${life1.id},${oak1.id}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(
      allTaxa.observations_count,
    );
    expect(store.selectedWithoutTaxa[0].observations_count).toBeUndefined();
    expect(store.selectedWithoutTaxa[1].observations_count).toBeUndefined();
  });
});

describe("withoutTaxonIdentifiedSelectedHandler", () => {
  test(`does not add taxa`, async () => {
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

    await withoutTaxonIdentifiedSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expectEmptyResources(store, ["selectedTaxa"]);
    expect(store.selectedTaxa).toStrictEqual([allTaxa]);
    expect(store.selectedWithoutTaxaIdentified).toStrictEqual([]);
    let expectedParams1 = {
      ...defaultParams,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams1);
  });
});

describe("combos", () => {
  test(`add taxon; refresh map;`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);
    await taxonSelectedHandler(redOakBasic, "red", store);

    let oakCount = redOak().observations_count;
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_oaks,
    ]);
    expectOakTaxa(store, colors[0]);
    let params1 = {
      ...defaultParams,
      colors: colors[0],
      taxon_id: redOak(colors[0]).id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(params1);
    expect(window.location.search).toBe(
      `?taxon_id=${redOak().id}&colors=${colorsEncoded[0]}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(oakCount);

    await refreshBoundingBox(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_oaks,
    ]);
    expectOakTaxa(store, colors[0]);
    expectRefreshPlace(store, oakCount);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      taxon_id: redOak(colors[0]).id.toString(),
      colors: colors[0],
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
    });

    expect(window.location.search).toBe(
      `?taxon_id=${redOak().id}&colors=${colorsEncoded[0]}&${defaultQuery}` +
        `&nelat=0&nelng=0&swlat=0&swlng=0`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(oakCount);
    expect(store.selectedPlaces[0].observations_count).toBe(oakCount);
  });

  test(`add place; refresh map;`, async () => {
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
      colors: iNatOrange,
      place_id: losangeles.id.toString(),
      taxon_id: allTaxa.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(params);
    expect(window.location.search).toBe(
      `?place_id=${losangeles.id}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaLACount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaLACount);

    await refreshBoundingBox(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_allTaxaRecord,
    ]);
    expectDefaultTaxaRecord(store);
    expectRefreshPlace(store, allTaxaCount, "LA");
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      nelat: 34.30714385628804,
      nelng: -118.12500000000001,
      swlat: 34.30714385628804,
      swlng: -118.12500000000001,
    });
    expect(window.location.search).toBe(
      `?${defaultQuery}&nelat=34.30714385628804&nelng=-118.12500000000001&swlat=34.30714385628804&swlng=-118.12500000000001`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaCount);
  });

  test(`add project; refresh map;`, async () => {
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
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      project_id: project_cnc1.id.toString(),
    });
    expect(window.location.search).toBe(
      `?project_id=${project_cnc1.id}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaProjectCount);
    expect(store.selectedProjects[0].observations_count).toBe(
      allTaxaProjectCount,
    );

    await refreshBoundingBox(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_allTaxaRecord_project1,
    ]);
    expectDefaultTaxaRecord(store, allTaxaProjectCount);
    expectProject1(store);
    expectRefreshPlace(store, allTaxaProjectCount);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
      project_id: project_cnc1.id.toString(),
    });
    expect(window.location.search).toBe(
      `?project_id=${project_cnc1.id}&${defaultQuery}` +
        `&nelat=0&nelng=0&swlat=0&swlng=0`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaProjectCount);
    expect(store.selectedProjects[0].observations_count).toBe(
      allTaxaProjectCount,
    );
  });

  test(`add user; refresh map;`, async () => {
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
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      user_id: user1.id.toString(),
    });
    expect(window.location.search).toBe(`?user_id=${user1.id}&${defaultQuery}`);
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount * 0.45);

    await refreshBoundingBox(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_allTaxaRecord_user1,
    ]);
    expectDefaultTaxaRecord(store, allTaxaCount * 0.45);
    expectUser1(store);
    expectRefreshPlace(store, allTaxaCount * 0.45);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
      user_id: user1.id.toString(),
    });

    expect(window.location.search).toBe(
      `?user_id=${user1.id}&${defaultQuery}` +
        `&nelat=0&nelng=0&swlat=0&swlng=0`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount * 0.45);
    expect(store.selectedPlaces[0].observations_count).toBe(
      allTaxaCount * 0.45,
    );
  });

  test(`add place; refresh map; add place`, async () => {
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
      colors: iNatOrange,
      place_id: losangeles.id.toString(),
      taxon_id: allTaxa.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(params);
    expect(window.location.search).toBe(
      `?place_id=${losangeles.id}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaLACount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaLACount);

    await refreshBoundingBox(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_allTaxaRecord,
    ]);
    expectDefaultTaxaRecord(store);
    expectRefreshPlace(store, allTaxaCount, "LA");
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      nelat: 34.30714385628804,
      nelng: -118.12500000000001,
      swlat: 34.30714385628804,
      swlng: -118.12500000000001,
    });
    expect(window.location.search).toBe(
      `?${defaultQuery}&nelat=34.30714385628804&nelng=-118.12500000000001&swlat=34.30714385628804&swlng=-118.12500000000001`,
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
      colors: iNatOrange,
      place_id: sandiego.id.toString(),
      taxon_id: allTaxa.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(params2);

    expect(window.location.search).toBe(
      `?place_id=${sandiego.id}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaSDCount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaSDCount);
  });

  test("add taxon x 2; add place x 2; add project x 2; add user x 2", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);

    await taxonSelectedHandler(lifeBasic, "life", store);
    let count1 = life().observations_count as number;

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectLifeTaxa(store, count1);
    expect(store.observationsApiParams).toStrictEqual({
      taxon_id: life().id.toString(),
      colors: colors[0],
      verifiable: true,
      spam: false,
      locale: "en",
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&verifiable=true&spam=false`,
    );

    await placeSelectedHandler(losangeles, "los", store);
    let count2 = count1 * 0.6;

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      gridLabel_life_la,
    ]);
    expectLifeTaxa(store, count2);
    expectLosAngelesPlace(store, count2);
    expect(store.observationsApiParams).toStrictEqual({
      taxon_id: life().id.toString(),
      colors: colors[0],
      place_id: losangeles.id.toString(),
      verifiable: true,
      spam: false,
      locale: "en",
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&place_id=${losangeles.id}&colors=${colorsEncoded[0]}` +
        `&verifiable=true&spam=false`,
    );

    await projectSelectedHandler(project_cnc1, "city", store);
    let count3 = count2 * 0.7;

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      gridLabel_life_la_project1,
    ]);
    expectLifeTaxa(store, count3);
    expectLosAngelesPlace(store, count3);
    expectProject1(store, count3);
    expect(store.observationsApiParams).toStrictEqual({
      taxon_id: life().id.toString(),
      colors: colors[0],
      place_id: losangeles.id.toString(),
      verifiable: true,
      spam: false,
      project_id: project_cnc1.id.toString(),
      locale: "en",
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&place_id=${losangeles.id}&project_id=${project_cnc1.id}` +
        `&colors=${colorsEncoded[0]}&verifiable=true&spam=false`,
    );

    await userSelectedHandler(user1, "user", store);
    let count4 = count3 * 0.45;

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      gridLabel_life_la_project1_user1,
    ]);
    expectLifeTaxa(store, count4);
    expectLosAngelesPlace(store, count4);
    expectProject1(store, count4);
    expectUser1(store, count4);
    expect(store.observationsApiParams).toStrictEqual({
      taxon_id: life().id.toString(),
      colors: colors[0],
      place_id: losangeles.id.toString(),
      verifiable: true,
      spam: false,
      project_id: project_cnc1.id.toString(),
      user_id: user1.id.toString(),
      locale: "en",
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&place_id=${losangeles.id}&project_id=${project_cnc1.id}` +
        `&user_id=${user1.id}&colors=${colorsEncoded[0]}&verifiable=true&spam=false`,
    );

    await taxonSelectedHandler(redOakBasic, "red", store);
    let oakCount = redOak().observations_count as number;
    let lifeCount = life().observations_count as number;
    let factor5 = 0.6 * 0.7 * 0.45;
    let count5 = (oakCount + lifeCount) * factor5;

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      gridLabel_life_la_project1_user1,
      gridLabel_oak_la_project1_user1,
    ]);
    expectLifeOakTaxa(store, [lifeCount * factor5, oakCount * factor5]);
    expectLosAngelesPlace(store, count5);
    expectProject1(store, count5);
    expectUser1(store, count5);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      taxon_id: `${life().id},${redOak().id}`,
      colors: `${colors[0]},${colors[1]}`,
      place_id: `${losangeles.id}`,
      project_id: `${project_cnc1.id}`,
      user_id: `${user1.id}`,
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id},${redOak().id}` +
        `&place_id=${losangeles.id}` +
        `&project_id=${project_cnc1.id}` +
        `&user_id=${user1.id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}&${defaultQuery}`,
    );

    await placeSelectedHandler(sandiego, "san", store);
    let factor6 = 0.7 * 0.45;
    let count6 = (oakCount + lifeCount) * factor6;

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      placeLabel_sd,
      placeLabel_sd,
      gridLabel_life_la_sd_project1_user1,
      gridLabel_oak_la_sd_project1_user1,
    ]);
    expectLifeOakTaxa(store, [lifeCount * factor6, oakCount * factor6]);
    expect_LA_SD_Place(store, [count6 * 0.6, count6 * 0.4]);
    expectProject1(store);
    expectUser1(store);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      taxon_id: `${life().id},${redOak().id}`,
      colors: `${colors[0]},${colors[1]}`,
      place_id: `${losangeles.id},${sandiego.id}`,
      project_id: `${project_cnc1.id}`,
      user_id: `${user1.id}`,
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id},${redOak().id}` +
        `&place_id=${losangeles.id},${sandiego.id}` +
        `&project_id=${project_cnc1.id}` +
        `&user_id=${user1.id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}&${defaultQuery}`,
    );
    expect(store.selectedProjects[0].observations_count).toBeCloseTo(count6);
    expect(store.selectedUsers[0].observations_count).toBeCloseTo(count6);

    await projectSelectedHandler(project_cnc2, "city", store);
    let factor7 = 0.45;
    let count7 = (oakCount + lifeCount) * factor7;

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      placeLabel_sd,
      placeLabel_sd,
      gridLabel_life_la_sd_projects_user1,
      gridLabel_oak_la_sd_projects_user1,
    ]);
    expectLifeOakTaxa(store, [lifeCount * factor7, oakCount * factor7]);
    expect_LA_SD_Place(store, [count7 * 0.6, count7 * 0.4]);
    expectProjects(store);
    expectUser1(store, count7);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      taxon_id: `${life().id},${redOak().id}`,
      colors: `${colors[0]},${colors[1]}`,
      place_id: `${losangeles.id},${sandiego.id}`,
      project_id: `${project_cnc1.id},${project_cnc2.id}`,
      user_id: `${user1.id}`,
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id},${redOak().id}` +
        `&place_id=${losangeles.id},${sandiego.id}` +
        `&project_id=${project_cnc1.id},${project_cnc2.id}` +
        `&user_id=${user1.id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}&${defaultQuery}`,
    );
    expect(store.selectedProjects[0].observations_count).toBeCloseTo(
      count7 * 0.7,
    );
    expect(store.selectedProjects[1].observations_count).toBeCloseTo(
      count7 * 0.3,
    );

    await userSelectedHandler(user2, "user", store);
    let count8 = lifeCount + oakCount;

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      placeLabel_sd,
      placeLabel_sd,
      gridLabel_life_places_projects_users,
      gridLabel_oaks_places_projects_users,
    ]);
    expectLifeOakTaxa(store, [lifeCount, oakCount]);
    expect_LA_SD_Place(store, [count8 * 0.6, count8 * 0.4]);
    expectProjects(store, [count8 * 0.7, count8 * 0.3]);
    expectUsers(store, [count8 * 0.45, count8 * 0.55]);
    let params8 = {
      ...defaultParams,
      taxon_id: `${life().id},${redOak().id}`,
      colors: `${colors[0]},${colors[1]}`,
      place_id: `${losangeles.id},${sandiego.id}`,
      project_id: `${project_cnc1.id},${project_cnc2.id}`,
      user_id: `${user1.id},${user2.id}`,
    };
    expect(store.observationsApiParams).toStrictEqual(params8);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id},${redOak().id}` +
        `&place_id=${losangeles.id},${sandiego.id}` +
        `&project_id=${project_cnc1.id},${project_cnc2.id}` +
        `&user_id=${user1.id},${user2.id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}&${defaultQuery}`,
    );

    await userIdentifierSelectedHandler(user1, "user", store);
    let factor9 = 0.75;
    let count9 = (lifeCount + oakCount) * factor9;

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      placeLabel_sd,
      placeLabel_sd,
      gridLabel_life_places_identifier,
      gridLabel_oaks_places_identifier,
    ]);
    expectLifeOakTaxa(store, [lifeCount * factor9, oakCount * factor9]);
    expect_LA_SD_Place(store, [count9 * 0.6, count9 * 0.4]);
    expectProjects(store);
    expectUsers(store, [count9 * 0.45, count9 * 0.55]);
    expectUser1Identifier(store, count9 * 0.45);
    let params9 = {
      ...defaultParams,
      taxon_id: `${life().id},${redOak().id}`,
      colors: `${colors[0]},${colors[1]}`,
      place_id: `${losangeles.id},${sandiego.id}`,
      project_id: `${project_cnc1.id},${project_cnc2.id}`,
      user_id: `${user1.id},${user2.id}`,
      ident_user_id: `${user1.id}`,
    };
    expect(store.observationsApiParams).toStrictEqual(params9);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id},${redOak().id}` +
        `&place_id=${losangeles.id},${sandiego.id}` +
        `&project_id=${project_cnc1.id},${project_cnc2.id}` +
        `&user_id=${user1.id},${user2.id}` +
        `&ident_user_id=${user1.id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}&${defaultQuery}`,
    );
    expect(store.selectedProjects[0].observations_count).toBeCloseTo(
      count9 * 0.7,
    );
    expect(store.selectedProjects[1].observations_count).toBeCloseTo(
      count9 * 0.3,
    );

    await unobservedByUserSelectedHandler(user1, "user", store);
    let factor10 = 0.75 * 0.65;
    let count10 = (lifeCount + oakCount) * factor10;

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      placeLabel_sd,
      placeLabel_sd,
      gridLabel_life_places_unobserved,
      gridLabel_oaks_places_unobserved,
    ]);
    expectLifeOakTaxa(store, [
      Math.round(lifeCount * factor10),
      Math.round(oakCount * factor10),
    ]);
    expect_LA_SD_Place(store, [
      Math.round(count10 * 0.6),
      Math.round(count10 * 0.4),
    ]);
    expectProjects(store);
    expectUsers(store);
    expectUser1Identifier(store, Math.round(count10));
    expectUser1UnobservedByUser(store, Math.round(count10));
    let params10 = {
      ...defaultParams,
      taxon_id: `${life().id},${redOak().id}`,
      colors: `${colors[0]},${colors[1]}`,
      place_id: `${losangeles.id},${sandiego.id}`,
      project_id: `${project_cnc1.id},${project_cnc2.id}`,
      user_id: `${user1.id},${user2.id}`,
      ident_user_id: `${user1.id}`,
      unobserved_by_user_id: user1.id,
    };
    expect(store.observationsApiParams).toStrictEqual(params10);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id},${redOak().id}` +
        `&place_id=${losangeles.id},${sandiego.id}` +
        `&project_id=${project_cnc1.id},${project_cnc2.id}` +
        `&user_id=${user1.id},${user2.id}` +
        `&ident_user_id=${user1.id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}` +
        `&${defaultQuery}` +
        `&unobserved_by_user_id=${user1.id}`,
    );
    expect(store.selectedProjects[0].observations_count).toBeCloseTo(
      Math.round(count10 * 0.7),
    );
    expect(store.selectedProjects[1].observations_count).toBeCloseTo(
      Math.round(count10 * 0.3),
    );
    // BUG: selectedUsers[0] should be count10 *.45
    expect(store.selectedUsers[0].observations_count).toBeCloseTo(
      Math.round(count10),
    );
    expect(store.selectedUsers[1].observations_count).toBeCloseTo(
      Math.round(count10 * 0.55),
    );

    await reviewerSelectedHandler(user1, "user", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      placeLabel_sd,
      placeLabel_sd,
      gridLabel_life_places_viewer,
      gridLabel_oaks_places_viewer,
    ]);
    expectLifeOakTaxa(store, [
      Math.round(lifeCount * factor10),
      Math.round(oakCount * factor10),
    ]);
    expect_LA_SD_Place(store, [
      Math.round(count10 * 0.6),
      Math.round(count10 * 0.4),
    ]);
    expectProjects(store);
    expectUsers(store);
    expectUser1Identifier(store, Math.round(count10));
    expectUser1UnobservedByUser(store, Math.round(count10));
    let params11 = {
      ...defaultParams,
      taxon_id: `${life().id},${redOak().id}`,
      colors: `${colors[0]},${colors[1]}`,
      place_id: `${losangeles.id},${sandiego.id}`,
      project_id: `${project_cnc1.id},${project_cnc2.id}`,
      user_id: `${user1.id},${user2.id}`,
      ident_user_id: `${user1.id}`,
      unobserved_by_user_id: user1.id,
      viewer_id: user1.id,
    };
    expect(store.observationsApiParams).toStrictEqual(params11);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id},${redOak().id}` +
        `&place_id=${losangeles.id},${sandiego.id}` +
        `&project_id=${project_cnc1.id},${project_cnc2.id}` +
        `&user_id=${user1.id},${user2.id}` +
        `&ident_user_id=${user1.id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}` +
        `&${defaultQuery}` +
        `&unobserved_by_user_id=${user1.id}` +
        `&viewer_id=${user1.id}`,
    );
    expect(store.selectedProjects[0].observations_count).toBeCloseTo(
      Math.round(count10 * 0.7),
    );
    expect(store.selectedProjects[1].observations_count).toBeCloseTo(
      Math.round(count10 * 0.3),
    );
    // BUG: selectedUsers[0] should be count10 *.45
    expect(store.selectedUsers[0].observations_count).toBeCloseTo(
      Math.round(count10),
    );
    expect(store.selectedUsers[1].observations_count).toBeCloseTo(
      Math.round(count10 * 0.55),
    );
  });
});

describe("taxonSelectedHandler with identifications", () => {
  test(`add life; add red oak`, async () => {
    let store = structuredClone(mapStore);
    store.record_type == "identifications";
    let lifeCount = lifeIdentification().identifications_count as number;
    let oakCount = redOakIdentification().identifications_count as number;

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/identifications/"));
    await initRenderMap(store);

    await taxonSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectEmptyResources(store, ["selectedTaxa"]);
    expectLifeTaxaIdentification(store, lifeCount);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams1 = {
      observation_taxon_id: life().id.toString(),
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams1);

    expect(window.location.search).toBe(
      `?observation_taxon_id=${life().id}&colors=${colorsEncoded[0]}`,
    );
    expect(store.selectedTaxa[0].identifications_count).toBe(lifeCount);

    await taxonSelectedHandler(redOakBasic, "red", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
      gridLabel_oaks,
    ]);
    expectEmptyResources(store, ["selectedTaxa"]);
    expectLifeOakTaxaIdentifications(store, [lifeCount, oakCount]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams2 = {
      observation_taxon_id: `${life().id},${redOak().id}`,
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams2);

    expect(window.location.search).toBe(
      `?observation_taxon_id=${life().id},${redOak().id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}`,
    );
    expect(store.selectedTaxa[0].identifications_count).toBe(lifeCount);
    expect(store.selectedTaxa[1].identifications_count).toBe(oakCount);
  });
});

describe("taxonSelectedHandler with identifications", () => {
  test(`add life; add red oak`, async () => {
    let store = structuredClone(mapStore);
    let oakCount = redOakIdentification().identifications_count;
    let lifeCount = lifeIdentification().identifications_count;

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/identifications/"));
    await initRenderMap(store);

    await taxonSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectEmptyResources(store, ["selectedTaxa"]);
    expectLifeTaxaIdentification(store, lifeCount);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams1 = {
      observation_taxon_id: life().id.toString(),
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams1);
    expect(window.location.search).toBe(
      `?observation_taxon_id=${life().id}&colors=${colorsEncoded[0]}`,
    );
    expect(store.selectedTaxa[0].identifications_count).toBe(lifeCount);

    await taxonSelectedHandler(redOakBasic, "red", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
      gridLabel_oaks,
    ]);
    expectEmptyResources(store, ["selectedTaxa"]);
    expectLifeOakTaxaIdentifications(store);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams2 = {
      observation_taxon_id: `${life().id},${redOak().id}`,
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?observation_taxon_id=${life().id},${redOak().id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}`,
    );
    expect(store.selectedTaxa[0].identifications_count).toBe(lifeCount);
    expect(store.selectedTaxa[1].identifications_count).toBe(oakCount);
  });
});

describe("taxonIdentifiedSelectedHandler with identifications", () => {
  test(`add life`, async () => {
    let store = structuredClone(mapStore);
    store.record_type == "identifications";

    let lifeCount = lifeIdentification().identifications_count as number;

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/identifications/"));
    await initRenderMap(store);

    await taxonIdentifiedSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([basemapLabel_osm]);
    expectEmptyResources(store, ["selectedTaxaIdentified"]);
    expectLifeTaxaIdentifiedIdentification(store, lifeCount);
    let expectedParams = {
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({
      taxon_id: life().id.toString(),
    });
    expect(window.location.search).toBe(`?taxon_id=48460`);
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
      placeLabel_la,
      placeLabel_la,
      gridLabel_allTaxaRecord_la,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedPlaces"]);
    expectDefaultTaxaRecordIdentification(store, count * 0.6);
    expectLosAngelesPlaceIdentifications(store, count * 0.6);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams1 = {
      place_id: losangeles.id.toString(),
      observation_taxon_id: allTaxa.id.toString(),
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams1);
    expect(window.location.search).toBe(`?place_id=${losangeles.id}`);

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
    expectDefaultTaxaRecordIdentification(store);
    expect_LA_SD_Place_Identifications(store, [count * 0.6, count * 0.4]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams2 = {
      place_id: `${losangeles.id},${sandiego.id}`,
      observation_taxon_id: allTaxa.id.toString(),
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?place_id=${losangeles.id},${sandiego.id}`,
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
      gridLabel_allTaxaRecord,
    ]);
    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecordIdentification(store);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      observation_taxon_id: allTaxa.id.toString(),
    });
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
      gridLabel_allTaxaRecord,
    ]);
    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecordIdentification(store);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      observation_taxon_id: allTaxa.id.toString(),
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
      gridLabel_allTaxaRecord_user1Identifier,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedUsersIdentifiers"]);
    expectDefaultTaxaRecordIdentification(store, count * 0.45);
    expectUser1Identifier(store);
    expect(store.selectedUsersIdentifiers).toStrictEqual([user1]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams = {
      user_id: user1.id.toString(),
      observation_taxon_id: allTaxa.id.toString(),
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(`?user_id=${user1.id}`);
    expect(store.selectedUsersIdentifiers[0].identifications_count).toBe(
      count * 0.45,
    );

    await userIdentifierSelectedHandler(user2, "user", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_usersIdentifiers,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedUsersIdentifiers"]);
    expectDefaultTaxaRecordIdentification(store);
    expectUserIdentifiers(store);
    expect(store.selectedUsersIdentifiers).toStrictEqual([user1, user2]);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
    });
    let expectedParams2 = {
      user_id: `${user1.id},${user2.id}`,
      observation_taxon_id: allTaxa.id.toString(),
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(`?user_id=${user1.id},${user2.id}`);
    expect(store.selectedUsersIdentifiers[0].identifications_count).toBe(
      count * 0.45,
    );
    expect(store.selectedUsersIdentifiers[1].identifications_count).toBeCloseTo(
      count * 0.55,
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
      gridLabel_allTaxaRecord,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedWithoutTaxa"]);
    expect(store.selectedTaxa).toStrictEqual([allTaxaIdentification]);
    expect(store.selectedWithoutTaxa).toStrictEqual([life1]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams1 = {
      observation_taxon_id: allTaxa.id.toString(),
      without_observation_taxon_id: `${life1.id}`,
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams1);
    expect(window.location.search).toBe(
      `?without_observation_taxon_id=${life1.id}`,
    );

    await withoutTaxonSelectedHandler(redOakBasic, "red", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expectEmptyResources(store, ["selectedTaxa", "selectedWithoutTaxa"]);
    expect(store.selectedTaxa).toStrictEqual([allTaxaIdentification]);
    expect(store.selectedWithoutTaxa).toStrictEqual([life1, oak1]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams2 = {
      observation_taxon_id: allTaxa.id.toString(),
      without_observation_taxon_id: `${life().id},${redOak().id}`,
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?without_observation_taxon_id=${life1.id},${oak1.id}`,
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
      gridLabel_allTaxaRecord,
    ]);
    expectEmptyResources(store, [
      "selectedTaxa",
      "selectedWithoutTaxaIdentified",
    ]);
    expect(store.selectedTaxa).toStrictEqual([allTaxaIdentification]);
    expect(store.selectedWithoutTaxaIdentified).toStrictEqual([life1]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams1 = {
      observation_taxon_id: allTaxa.id.toString(),
      without_taxon_id: `${life1.id}`,
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams1);
    expect(window.location.search).toBe(`?without_taxon_id=${life1.id}`);

    await withoutTaxonIdentifiedSelectedHandler(redOakBasic, "red", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expectEmptyResources(store, [
      "selectedTaxa",
      "selectedWithoutTaxaIdentified",
    ]);
    expect(store.selectedTaxa).toStrictEqual([allTaxaIdentification]);
    expect(store.selectedWithoutTaxaIdentified).toStrictEqual([life1, oak1]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams2 = {
      observation_taxon_id: allTaxa.id.toString(),
      without_taxon_id: `${life().id},${redOak().id}`,
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?without_taxon_id=${life1.id},${oak1.id}`,
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
      place_id: `${LosAngeles.id},${SanDiego.id}`,
      taxon_id: allTaxa.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(params2);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(
      `?place_id=${LosAngeles.id},${SanDiego.id}&${defaultQuery}`,
    );
    expect(store.selectedPlaces).toStrictEqual([LosAngeles, SanDiego]);

    await removePlace(LosAngeles.id, store);

    expectEmptyResources(store, ["selectedTaxa", "selectedPlaces"]);
    expectDefaultTaxaRecord(store, SanDiego.observations_count);
    let params3 = {
      ...defaultParams,
      colors: iNatOrange,
      place_id: SanDiego.id.toString(),
      taxon_id: allTaxa.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(params3);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(
      `?place_id=${SanDiego.id}&${defaultQuery}`,
    );
    expect(store.selectedPlaces).toStrictEqual([SanDiego]);

    await removePlace(SanDiego.id, store);

    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecord(store);
    let params4 = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(params4);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe("");
  });

  test("add refresh bounding box; remove place", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);
    await refreshBoundingBox(store);

    let allTaxaCount = allTaxa.observations_count;

    expectDefaultTaxaRecord(store);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    });
    expect(window.location.search).toBe(
      `?${defaultQuery}&nelat=0&nelng=0&swlat=0&swlng=0`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaCount);

    await removePlace(0, store);

    expectDefaultTaxaRecord(store);
    let params2 = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(params2);
    expect(window.location.search).toBe("");
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
      taxon_id: life().id.toString(),
      colors: colors[0],
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(lifeCount);

    await placeSelectedHandler(losangeles, "los", store);

    let params1 = {
      ...defaultParams,
      colors: colors[0],
      place_id: losangeles.id.toString(),
      taxon_id: life().id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(params1);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&place_id=${losangeles.id}` +
        `&colors=${colorsEncoded[0]}&${defaultQuery}`,
    );
    expectLosAngelesPlace(store, lifeCount * 0.6);
    expect(store.selectedTaxa[0].observations_count).toBe(lifeCount * 0.6);
    expect(store.selectedPlaces[0].observations_count).toBe(lifeCount * 0.6);

    await removePlace(losangeles.id, store);

    let params2 = {
      ...defaultParams,
      colors: colors[0],
      taxon_id: life().id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(params2);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(lifeCount);
  });

  test("add taxon; add refresh; remove place", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);
    await taxonSelectedHandler(lifeBasic, "life", store);

    let lifeCount = life().observations_count;
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      taxon_id: life().id.toString(),
      colors: colors[0],
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(lifeCount);

    await refreshBoundingBox(store);

    let params1 = {
      ...defaultParams,
      colors: colors[0],
      taxon_id: life().id.toString(),
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
    };
    expect(store.observationsApiParams).toStrictEqual(params1);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}` +
        `&${defaultQuery}&nelat=0&nelng=0&swlat=0&swlng=0`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(lifeCount);
    expect(store.selectedPlaces[0].observations_count).toBe(lifeCount);

    await removePlace(0, store);

    let params2 = {
      ...defaultParams,
      colors: colors[0],
      taxon_id: life().id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(params2);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(lifeCount);
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
      colors: `${colors[0]},${colors[1]}`,
      taxon_id: `${Life.id},${RedOak.id}`,
    };
    expect(store.observationsApiParams).toStrictEqual(params2);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(
      `?taxon_id=${Life.id},${RedOak.id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}&${defaultQuery}`,
    );
    expect(store.selectedTaxa).toStrictEqual([Life, RedOak]);

    await removeTaxon(Life.id, store);

    let params3 = {
      ...defaultParams,
      colors: colors[1],
      taxon_id: RedOak.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(params3);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(
      `?taxon_id=${RedOak.id}&colors=${colorsEncoded[1]}&${defaultQuery}`,
    );
    expect(store.selectedTaxa).toStrictEqual([RedOak]);

    await removeTaxon(RedOak.id, store);

    let params4 = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(params4);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe("");
    expectDefaultTaxaRecord(store);
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
      project_id: `${project1.id},${project2.id}`,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(
      `?project_id=${project1.id},${project2.id}&${defaultQuery}`,
    );
    expect(store.selectedProjects).toStrictEqual([project1, project2]);

    await removeProject(project1.id, store);

    expectEmptyResources(store, ["selectedTaxa", "selectedProjects"]);
    expectDefaultTaxaRecord(store, allTaxa.observations_count * 0.3);
    let expectedParams3 = {
      ...defaultParams,
      project_id: `${project2.id}`,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams3);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(
      `?project_id=${project2.id}&${defaultQuery}`,
    );
    expect(store.selectedProjects).toStrictEqual([project2]);

    await removeProject(project2.id, store);

    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecord(store);
    let expectedParams4 = {
      ...defaultParams,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams4);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe("");
  });
});

describe("removeUser", () => {
  test("add user; add user; remove user", async () => {
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
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      user_id: `${userA.id},${userB.id}`,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(
      `?user_id=${userA.id},${userB.id}&${defaultQuery}`,
    );
    expect(store.selectedUsers).toStrictEqual([userA, userB]);

    await removeUser(userA.id, store);

    expectEmptyResources(store, ["selectedTaxa", "selectedUsers"]);
    expectDefaultTaxaRecord(store, allTaxa.observations_count * 0.55);
    let expectedParams3 = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      user_id: `${userB.id}`,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams3);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(`?user_id=${userB.id}&${defaultQuery}`);
    expect(store.selectedUsers).toStrictEqual([userB]);

    await removeUser(userB.id, store);

    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecord(store);
    let expectedParams4 = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams4);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe("");
  });
});

describe("removeUserIdentifier", () => {
  test("add user; add user; remove user;", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);
    await userIdentifierSelectedHandler(user1, "user", store);
    await userIdentifierSelectedHandler(user2, "user", store);

    expectEmptyResources(store, ["selectedTaxa", "selectedUsersIdentifiers"]);
    expectDefaultTaxaRecord(store);
    let expectedParams2 = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      ident_user_id: `${user2.id}`,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe(
      `?ident_user_id=${user2.id}&${defaultQuery}`,
    );
    expect(store.selectedUsersIdentifiers).toStrictEqual([user2]);

    await removeUserIdentifier(user2.id, store);

    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecord(store);
    let expectedParams3 = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams3);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(window.location.search).toBe("");
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
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      annotation_user_id: `${user1.id},${user2.id}`,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?${defaultQuery}&annotation_user_id=${user1.id},${user2.id}`,
    );

    await removeUserAnnotator(user1.id, store);

    expectEmptyResources(store, ["selectedTaxa", "selectedUsersAnnotators"]);
    expectDefaultTaxaRecord(store);
    expect(store.selectedUsersAnnotators).toStrictEqual([user2]);
    let expectedParams3 = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      annotation_user_id: `${user2.id}`,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams3);
    expect(window.location.search).toBe(
      `?${defaultQuery}&annotation_user_id=${user2.id}`,
    );

    await removeUserAnnotator(user2.id, store);

    expectEmptyResources(store, ["selectedTaxa", "selectedUsersAnnotators"]);
    expectDefaultTaxaRecord(store);
    expect(store.selectedUsersAnnotators).toStrictEqual([]);
    let expectedParams4 = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams4);
    expect(window.location.search).toBe("");
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
    expect(store.selectedTaxa).toStrictEqual([allTaxa]);
    let expectedParams2 = {
      ...defaultParams,
      taxon_id: allTaxa.id.toString(),
      without_taxon_id: `${life1.id},${oak1.id}`,
      colors: iNatOrange,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?${defaultQuery}&without_taxon_id=${life1.id},${oak1.id}`,
    );

    await removeWithoutTaxon(life1.id, store);

    expectEmptyResources(store, ["selectedTaxa", "selectedWithoutTaxa"]);
    expect(store.selectedWithoutTaxa).toStrictEqual([oak1]);
    let expectedParams3 = {
      ...defaultParams,
      taxon_id: allTaxa.id.toString(),
      without_taxon_id: `${oak1.id}`,
      colors: iNatOrange,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams3);
    expect(window.location.search).toBe(
      `?${defaultQuery}&without_taxon_id=${oak1.id}`,
    );

    await removeWithoutTaxon(oak1.id, store);

    expectEmptyResources(store, ["selectedTaxa"]);
    expect(store.selectedWithoutTaxa).toStrictEqual([]);
    let expectedParams4 = {
      ...defaultParams,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams4);
    expect(window.location.search).toBe("");
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

    expectEmptyResources(store, ["selectedTaxa", "selectedPlaces"]);
    expectDefaultTaxaRecordIdentification(store);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      place_id: `${LosAngeles.id},${SanDiego.id}`,
      observation_taxon_id: allTaxa.id.toString(),
    });
    expect(window.location.search).toBe(
      `?place_id=${LosAngeles.id},${SanDiego.id}`,
    );
    expect(store.selectedPlaces).toStrictEqual([LosAngeles, SanDiego]);

    await removePlace(LosAngeles.id, store);

    expectEmptyResources(store, ["selectedTaxa", "selectedPlaces"]);
    expectDefaultTaxaRecordIdentification(
      store,
      allTaxaIdentification.identifications_count * 0.4,
    );
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      place_id: `${SanDiego.id}`,
      observation_taxon_id: allTaxa.id.toString(),
    });
    expect(window.location.search).toBe(`?place_id=${SanDiego.id}`);
    expect(store.selectedPlaces).toStrictEqual([SanDiego]);

    await removePlace(SanDiego.id, store);

    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecordIdentification(store);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      observation_taxon_id: allTaxa.id.toString(),
    });
    expect(window.location.search).toBe(``);
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

    expectEmptyResources(store, ["selectedTaxa"]);
    expect(store.selectedTaxa).toStrictEqual([Life, RedOak]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      observation_taxon_id: `${Life.id},${RedOak.id}`,
    });
    expect(window.location.search).toBe(
      `?observation_taxon_id=${Life.id},${RedOak.id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}`,
    );

    await removeTaxon(Life.id, store);

    expectEmptyResources(store, ["selectedTaxa"]);
    expect(store.selectedTaxa).toStrictEqual([RedOak]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      observation_taxon_id: `${RedOak.id}`,
    });
    expect(window.location.search).toBe(
      `?observation_taxon_id=${RedOak.id}` + `&colors=${colorsEncoded[1]}`,
    );

    await removeTaxon(RedOak.id, store);

    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecordIdentification(store);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      observation_taxon_id: allTaxa.id.toString(),
    });
    expect(window.location.search).toBe("");
  });

  test("add taxon; add taxon identified; remove taxon;", async () => {
    let store = structuredClone(mapStore);
    store.record_type == "identifications";

    let Life = lifeIdentification();
    let RedOak = redOakIdentification();

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/identifications/"));
    await initRenderMap(store);

    await taxonSelectedHandler(Life, "life", store);
    await taxonIdentifiedSelectedHandler(RedOak, "red", store);

    expectEmptyResources(store, ["selectedTaxa", "selectedTaxaIdentified"]);
    expect(store.selectedTaxa).toStrictEqual([Life]);
    expect(store.selectedTaxaIdentified).toStrictEqual([
      { ...RedOak, identifications_count: Life.identifications_count },
    ]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      observation_taxon_id: `${Life.id}`,
      taxon_id: `${RedOak.id}`,
    });
    expect(window.location.search).toBe(
      `?observation_taxon_id=${Life.id}` +
        `&taxon_id=${RedOak.id}` +
        `&colors=${colorsEncoded[0]}`,
    );

    await removeTaxon(Life.id, store);

    expectEmptyResources(store, ["selectedTaxaIdentified"]);
    expect(store.selectedTaxaIdentified).toStrictEqual([RedOak]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      taxon_id: `${RedOak.id}`,
    });
    expect(window.location.search).toBe(`?taxon_id=${RedOak.id}`);

    await removeTaxonIdentified(RedOak.id, store);

    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecordIdentification(store);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      observation_taxon_id: allTaxa.id.toString(),
    });
    expect(window.location.search).toBe("");
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

    expectEmptyResources(store, ["selectedTaxa", "selectedUsersIdentifiers"]);
    expectDefaultTaxaRecordIdentification(store);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams2 = {
      user_id: `${user1.id},${user2.id}`,
      observation_taxon_id: allTaxa.id.toString(),
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(`?user_id=${user1.id},${user2.id}`);
    expect(store.selectedUsersIdentifiers).toStrictEqual([user1, user2]);

    await removeUserIdentifier(user1.id, store);

    expectEmptyResources(store, ["selectedTaxa", "selectedUsersIdentifiers"]);
    expectDefaultTaxaRecordIdentification(
      store,
      allTaxaIdentification.identifications_count * 0.55,
    );
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
    });
    let expectedParams3 = {
      user_id: `${user2.id}`,
      observation_taxon_id: allTaxa.id.toString(),
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams3);
    expect(window.location.search).toBe(`?user_id=${user2.id}`);
    expect(store.selectedUsersIdentifiers).toStrictEqual([user2]);

    await removeUserIdentifier(user2.id, store);

    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecordIdentification(store);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
    });
    expect(store.identificationsApiParams).toStrictEqual({
      observation_taxon_id: allTaxa.id.toString(),
    });
    expect(window.location.search).toBe("");
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

    expectEmptyResources(store, ["selectedTaxa", "selectedWithoutTaxa"]);
    expect(store.selectedWithoutTaxa).toStrictEqual([life1, oak1]);
    expect(store.selectedTaxa).toStrictEqual([allTaxaIdentification]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams2 = {
      observation_taxon_id: allTaxa.id.toString(),
      without_observation_taxon_id: `${life1.id},${oak1.id}`,
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?without_observation_taxon_id=${life1.id},${oak1.id}`,
    );

    await removeWithoutTaxon(life1.id, store);

    expectEmptyResources(store, ["selectedTaxa", "selectedWithoutTaxa"]);
    expect(store.selectedWithoutTaxa).toStrictEqual([oak1]);
    expect(store.selectedTaxa).toStrictEqual([allTaxaIdentification]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams3 = {
      observation_taxon_id: allTaxa.id.toString(),
      without_observation_taxon_id: `${oak1.id}`,
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams3);
    expect(window.location.search).toBe(
      `?without_observation_taxon_id=${oak1.id}`,
    );

    await removeWithoutTaxon(oak1.id, store);

    expectEmptyResources(store, ["selectedTaxa"]);
    expect(store.selectedWithoutTaxa).toStrictEqual([]);
    expect(store.selectedTaxa).toStrictEqual([allTaxaIdentification]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      observation_taxon_id: allTaxa.id.toString(),
    });
    expect(window.location.search).toBe("");
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
      "selectedTaxa",
      "selectedWithoutTaxaIdentified",
    ]);
    expect(store.selectedWithoutTaxaIdentified).toStrictEqual([life1, oak1]);
    expect(store.selectedTaxa).toStrictEqual([allTaxaIdentification]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams2 = {
      observation_taxon_id: allTaxa.id.toString(),
      without_taxon_id: `${life1.id},${oak1.id}`,
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?without_taxon_id=${life1.id},${oak1.id}`,
    );

    await removeWithoutTaxonIdentified(life1.id, store);

    expectEmptyResources(store, [
      "selectedTaxa",
      "selectedWithoutTaxaIdentified",
    ]);
    expect(store.selectedWithoutTaxaIdentified).toStrictEqual([oak1]);
    expect(store.selectedTaxa).toStrictEqual([allTaxaIdentification]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams3 = {
      observation_taxon_id: allTaxa.id.toString(),
      without_taxon_id: `${oak1.id}`,
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams3);
    expect(window.location.search).toBe(`?without_taxon_id=${oak1.id}`);

    await removeWithoutTaxonIdentified(oak1.id, store);

    expectEmptyResources(store, ["selectedTaxa"]);
    expect(store.selectedWithoutTaxaIdentified).toStrictEqual([]);
    expect(store.selectedTaxa).toStrictEqual([allTaxaIdentification]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      observation_taxon_id: allTaxa.id.toString(),
    });
    expect(window.location.search).toBe("");
  });
});
