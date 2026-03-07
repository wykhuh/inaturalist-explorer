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

import { leafletVisibleLayers } from "../../lib/data_utils";
import { decodeAppUrl } from "../../lib/utils";
import {
  createMockServer,
  expectEmpytMap,
  expectLifeTaxa,
  losangeles,
  life,
  colors,
  placeLabel_la,
  gridLabel_life,
  bBoxLabel,
  basemapLabel_osm,
  gridLabel_allTaxaRecord,
  expectDefaultTaxaRecord,
  colorsEncoded,
  redOak,
  sandiego,
  placeLabel_sd,
  expect_LA_SD_Place,
  project_cnc1,
  project_cnc2,
  expectLifeOakTaxa,
  expectProjects,
  user1,
  user2,
  expectUsers,
  gridLabel_oaks_bbox_resources,
  gridLabel_life_bbox_resources,
  placeBBoxLabel,
  allTaxa,
  projectLabel_cnc2,
  defaultParams,
  defaultQuery,
  expectUser1Identifier,
  expectUser1UnobservedByUser,
  gridLabel_allTaxaRecord_user1Unobserved,
  gridLabel_life_places_identifier,
  gridLabel_oaks_places_identifier,
  lifeBasic,
  allTaxaIdentification,
  lifeIdentification,
  expect_LA_SD_Place_Identifications,
  redOakIdentification,
  expectUserIdentifiersIdentifications,
  expectDefaultTaxaRecordIdentification,
  expectUser1Reviewer,
  gridLabel_allTaxaRecord_user1Reviewer,
  expectEmptyResources,
  perPage,
  perPageUsers,
  gridLabel_oaks,
  gridLabel_allTaxaRecord_la_sd,
  gridLabel_allTaxaRecord_usersIdentifiers,
  expectUserAnnotators,
  gridLabel_allTaxaRecord_usersAnnotator,
  redOakBasic,
  gridLabel_allTaxaRecord_projects,
  gridLabel_allTaxaRecord_projectsNotInProject,
  gridLabel_allTaxaRecord_users,
  gridLabel_life_identified_places_usersIdentifiers,
  gridLabel_allTaxaRecord_withoutTaxa,
  iNatBboxParams,
  expectBboxPlace,
  gridLabel_allTaxaRecordIdent,
  gridLabel_allTaxaRecordIdent_usersIdentifiers,
  gridLabel_allTaxaRecordIdent_la_sd,
  gridLabel_lifeIdent,
  gridLabel_oakIdent,
  gridLabel_allTaxaRecordIdent_withoutTaxa,
} from "../test_helpers.ts";
import type {
  IdentificationsApiParamsType,
  LngLatType,
  ObservationsApiParamsType,
} from "../../types/app";
import { allTaxaRecord } from "../../data/inat_data.ts";
import {
  identificationsApiFilterableNames,
  observationsApiFilterableNames,
  validIdentificationsSubviews,
} from "../../data/app_data.ts";
import { defaultColorScheme, iNatOrange } from "../../lib/map_colors_utils.ts";
import { initPopulateStore, initRenderMap } from "../../lib/init_app.ts";
import { mapStore } from "../../lib/store.ts";
import {
  validIdentificationsViews,
  validObservationsSubviews,
  validObservationsViews,
  fieldsWithAny,
} from "../../data/app_data.ts";
import {
  dbKeys,
  populateStoreWithLocaleStorage,
} from "../../lib/localStorage.ts";
import { saveBBoxToStore } from "../../lib/search_bounding_box.ts";

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

describe("initPopulateStore and initRenderMap options", () => {
  test("loads default taxa if no params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = ``;
    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecord(store);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.color).toBe(iNatOrange);
    expect(store.record_type).toBe("observations");
    expect(store.currentView).toBe("observations_observations");
  });

  test.each([observationsApiFilterableNames])(
    "updates observationsApiParams with filterable params ",
    async (param) => {
      let store = structuredClone(mapStore);

      expectEmpytMap(store);

      let searchparams = `?${param}=true`;
      let urlData = decodeAppUrl(searchparams, "/");

      await initPopulateStore(store, urlData);
      await initRenderMap(store);

      expect(leafletVisibleLayers(store)).toStrictEqual([
        basemapLabel_osm,
        gridLabel_allTaxaRecord,
      ]);
      expectEmptyResources(store, ["selectedTaxa"]);
      expectDefaultTaxaRecord(store);

      let expectedParams: ObservationsApiParamsType = {
        ...defaultParams,
        colors: iNatOrange,
        taxon_id: allTaxaRecord.id.toString(),
        [param]: true,
        per_page: perPage,
      };
      expect(store.observationsApiParams).toStrictEqual(expectedParams);
      expect(store.color).toBe(iNatOrange);
    },
  );

  test("ignores invalid params ", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = "?boo=true&foo=any";
    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecord(store);

    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.color).toBe(iNatOrange);
  });

  test("loads and renders taxa data with verifiable and spam set to false", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=en&taxon_id=${life().id}&verifiable=false&spam=false`;
    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectEmptyResources(store, ["selectedTaxa"]);
    expectLifeTaxa(store);

    let expectedParams: ObservationsApiParamsType = {
      colors: colors[0],
      taxon_id: life().id.toString(),
      verifiable: false,
      spam: false,
      locale: "en",
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.color).toBe(colors[0]);
  });

  test("loads and renders taxa data with verifiable and spam set to true", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=en&taxon_id=${life().id}&verifiable=true&spam=true`;
    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectEmptyResources(store, ["selectedTaxa"]);
    expectLifeTaxa(store);

    let expectedParams: ObservationsApiParamsType = {
      colors: colors[0],
      taxon_id: life().id.toString(),
      verifiable: true,
      spam: true,
      locale: "en",
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.color).toBe(colors[0]);
  });

  test("loads and renders taxa data without verifiable and spam", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=en&taxon_id=${life().id}`;
    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectEmptyResources(store, ["selectedTaxa"]);
    expectLifeTaxa(store);

    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      colors: colors[0],
      taxon_id: life().id.toString(),
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.color).toBe(colors[0]);
  });

  test.each(fieldsWithAny)(
    " allow fieldsWithAny to have any value",
    async (field) => {
      let store = structuredClone(mapStore);

      expectEmpytMap(store);

      let searchparams = `?locale=en&${field}=any`;
      let urlData = decodeAppUrl(searchparams, "/");

      await initPopulateStore(store, urlData);
      await initRenderMap(store);

      expect(leafletVisibleLayers(store)).toStrictEqual([
        basemapLabel_osm,
        gridLabel_allTaxaRecord,
      ]);
      expectEmptyResources(store, ["selectedTaxa"]);
      expectDefaultTaxaRecord(store);

      let expectedParams: ObservationsApiParamsType = {
        colors: iNatOrange,
        taxon_id: allTaxa.id.toString(),
        spam: false,
        locale: "en",
        [field]: "any",
        per_page: perPage,
      };

      expect(store.observationsApiParams).toStrictEqual(expectedParams);
      expect(store.color).toBe(iNatOrange);
    },
  );

  test("ignore param if it has any value", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=any&place_id=any&captive=any&foo=any`;
    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecord(store);

    let expectedParams: ObservationsApiParamsType = {
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      spam: false,
      verifiable: true,
      locale: "en",
      per_page: perPage,
    };

    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.color).toBe(iNatOrange);
  });

  test("loads and renders taxa data if colors not in url", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=en&taxon_id=${life().id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectEmptyResources(store, ["selectedTaxa"]);
    expectLifeTaxa(store);

    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      colors: colors[0],
      taxon_id: life().id.toString(),
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.color).toBe(colors[0]);
  });

  test("adds page, order, order_by, and view to store", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=en&view=observations_identifiers&page=3&order=desc&order_by=id`;
    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecord(store);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      page: 3,
      order: "desc",
      order_by: "id",
      per_page: perPageUsers,
    });
    expect(store.color).toBe(iNatOrange);
    expect(store.viewMetadata).toStrictEqual({
      ...structuredClone(mapStore.viewMetadata),
      observations_identifiers: {
        page: 3,
        order: "desc",
        order_by: "id",
        perPage: perPageUsers,
      },
      name_order: "cs",
    });
    expect(store.currentView).toBe("observations_identifiers");
    expect(store.viewMetadata.observations_identifiers).toStrictEqual({
      page: 3,
      order: "desc",
      order_by: "id",
      perPage: perPageUsers,
    });
  });

  test("adds locale to store", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=es`;
    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecord(store);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      locale: "es",
      per_page: perPage,
    });
    expect(store.color).toBe(iNatOrange);
  });

  test("adds name_order to store", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=en&name_order=sc`;
    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectEmptyResources(store, ["selectedTaxa"]);
    expectDefaultTaxaRecord(store);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      per_page: perPage,
    });
    expect(store.color).toBe(iNatOrange);
    expect(store.viewMetadata.name_order).toBe("sc");
  });

  test("works with observation_iconic_taxon_id when it is one value ", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = "?observation_iconic_taxon_id=1&iconic_taxon_id=3";
    let urlData = decodeAppUrl(searchparams, "/identifications/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expect(store.observationsApiParams).toStrictEqual(defaultParams);
    expect(store.identificationsApiParams).toStrictEqual({
      observation_iconic_taxon_id: 1,
      iconic_taxon_id: 3,
      taxon_id: allTaxa.id.toString(),
      per_page: perPage,
      colors: iNatOrange,
    });
  });

  test("works with iconic_taxon_id when it is multiple values ", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = "?observation_iconic_taxon_id=1,2&iconic_taxon_id=3,4";
    let urlData = decodeAppUrl(searchparams, "/identifications/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expect(store.observationsApiParams).toStrictEqual(defaultParams);
    expect(store.identificationsApiParams).toStrictEqual({
      observation_iconic_taxon_id: "1,2",
      iconic_taxon_id: "3,4",
      taxon_id: allTaxa.id.toString(),
      per_page: perPage,
      colors: iNatOrange,
    });
  });
});

// NOTE: update when adding selectedResource
describe("initPopulateStore and initRenderMap resources", () => {
  test("loads and renders taxa data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams =
      `?locale=en&taxon_id=${life().id},${redOak().id}` +
      `&colors=${colorsEncoded[0]},${colorsEncoded[1]}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectEmptyResources(store, ["selectedTaxa"]);
    expectLifeOakTaxa(store);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
      gridLabel_oaks,
    ]);
    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      colors: `${colors[0]},${colors[1]}`,
      taxon_id: `${life().id},${redOak().id}`,
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.color).toBe(colors[1]);
  });

  test("loads and renders without taxa data based on url params", async () => {
    let store = structuredClone(mapStore);
    let life1 = life();
    delete life1.color;
    delete life1.observations_count;
    let oak = redOak();
    delete oak.color;
    delete oak.observations_count;

    expectEmpytMap(store);

    let searchparams = `?locale=en&without_taxon_id=${life1.id},${oak.id}&colors=${colorsEncoded[0]},${colorsEncoded[1]}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectEmptyResources(store, ["selectedTaxa", "selectedWithoutTaxa"]);
    expect(store.selectedWithoutTaxa).toStrictEqual([life1, oak]);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_withoutTaxa,
    ]);
    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      per_page: perPage,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      without_taxon_id: `${life1.id},${oak.id}`,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.color).toBe(iNatOrange);
  });

  test("loads and renders place data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=en&place_id=${losangeles.id},${sandiego.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/");
    let allTaxaLACount = allTaxa.observations_count;

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectEmptyResources(store, ["selectedPlaces", "selectedTaxa"]);
    expect_LA_SD_Place(store, [allTaxaLACount * 0.6, allTaxaLACount * 0.4]);
    expectDefaultTaxaRecord(store, allTaxaLACount);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      placeLabel_sd,
      placeLabel_sd,
      gridLabel_allTaxaRecord_la_sd,
    ]);
    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      per_page: perPage,
      place_id: `${losangeles.id},${sandiego.id}`,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.color).toBe(iNatOrange);
  });

  test("loads and renders without place data based on url params", async () => {
    let store = structuredClone(mapStore);
    let losangeles1 = structuredClone(losangeles);
    delete losangeles1.bounding_box;
    delete losangeles1.geometry;
    let sandiego1 = structuredClone(sandiego);
    delete sandiego1.bounding_box;
    delete sandiego1.geometry;

    expectEmpytMap(store);

    let searchparams = `?locale=en&not_in_place=${losangeles1.id},${sandiego1.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/");
    let allTaxaLACount = allTaxa.observations_count;

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectEmptyResources(store, ["selectedWithoutPlaces", "selectedTaxa"]);
    expect(store.selectedWithoutPlaces).toStrictEqual([losangeles1, sandiego1]);
    expectDefaultTaxaRecord(store, allTaxaLACount);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      per_page: perPage,
      not_in_place: `${losangeles1.id},${sandiego1.id}`,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.color).toBe(iNatOrange);
  });

  test("loads and renders bounding box data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?spam=false&verifiable=true&${iNatBboxParams}`;
    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectEmptyResources(store, ["selectedPlaces", "selectedTaxa"]);
    expectBboxPlace(store, allTaxa.observations_count);
    expectDefaultTaxaRecord(store);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeBBoxLabel,
      bBoxLabel,
      gridLabel_allTaxaRecord,
    ]);
    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      per_page: perPage,
      nelng: -104,
      nelat: 45,
      swlat: 41,
      swlng: -111,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.color).toBe(iNatOrange);
  });

  test("loads and renders project data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=en&project_id=${project_cnc1.id},${project_cnc2.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/");
    let allTaxaProjectCount = allTaxa.observations_count;

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectEmptyResources(store, ["selectedProjects", "selectedTaxa"]);
    expectProjects(store, [
      allTaxaProjectCount * 0.7,
      allTaxaProjectCount * 0.3,
    ]);
    expectDefaultTaxaRecord(store, allTaxaProjectCount);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      projectLabel_cnc2,
      projectLabel_cnc2,
      gridLabel_allTaxaRecord_projects,
    ]);
    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      project_id: `${project_cnc1.id},${project_cnc2.id}`,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.color).toBe(iNatOrange);
  });

  test("loads and renders not in project data based on url params", async () => {
    let store = structuredClone(mapStore);
    let project1 = structuredClone(project_cnc1);
    delete project1.bounding_box;
    delete project1.geometry;
    let project2 = structuredClone(project_cnc2);
    delete project2.bounding_box;
    delete project2.geometry;

    expectEmpytMap(store);

    let searchparams = `?locale=en&not_in_project=${project1.id},${project2.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/");
    let allTaxaProjectCount = allTaxa.observations_count;

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectEmptyResources(store, ["selectedTaxa", "selectedWithoutProjects"]);
    expect(store.selectedWithoutProjects).toStrictEqual([project1, project2]);
    expectDefaultTaxaRecord(store, allTaxaProjectCount);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_projectsNotInProject,
    ]);
    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      not_in_project: `${project1.id},${project2.id}`,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.color).toBe(iNatOrange);
  });

  test("loads and renders user data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=en&user_id=${user1.id},${user2.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/");
    let allTaxaCount = allTaxa.observations_count;

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectEmptyResources(store, ["selectedUsers", "selectedTaxa"]);
    expectDefaultTaxaRecord(store, allTaxaCount);
    expect(store.selectedUsers).toEqual([
      { ...user1, observations_count: allTaxaCount * 0.45 },
      { ...user2, observations_count: Math.round(allTaxaCount * 0.55) },
    ]);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_users,
    ]);
    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      user_id: `${user1.id},${user2.id}`,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.color).toBe(iNatOrange);
  });

  test("loads and renders without user data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=en&not_user_id=${user1.id},${user2.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/");
    let allTaxaCount = allTaxa.observations_count;

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectEmptyResources(store, ["selectedWithoutUsers", "selectedTaxa"]);
    expectDefaultTaxaRecord(store, allTaxaCount);
    expect(store.selectedWithoutUsers).toStrictEqual([user1, user2]);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      per_page: perPage,
      not_user_id: `${user1.id},${user2.id}`,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.color).toBe(iNatOrange);
  });

  test("loads and renders user identifier data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=en&ident_user_id=${user1.id},${user2.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/");
    let allTaxaCount = allTaxa.observations_count;

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectEmptyResources(store, ["selectedUsersIdentifiers", "selectedTaxa"]);
    expectDefaultTaxaRecord(store, allTaxaCount * 0.75);
    expect(store.selectedUsersIdentifiers).toEqual([
      { ...user1, observations_count: allTaxaCount * 0.75 },
      { ...user2, observations_count: allTaxaCount },
    ]);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_usersIdentifiers,
    ]);
    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      ident_user_id: `${user1.id},${user2.id}`,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.color).toBe(iNatOrange);
  });

  test("loads and renders without user identifier data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=en&without_ident_user_id=${user1.id},${user2.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectEmptyResources(store, [
      "selectedWithoutUsersIdentifiers",
      "selectedTaxa",
    ]);
    expectDefaultTaxaRecord(store);
    expect(store.selectedWithoutUsersIdentifiers).toStrictEqual([user1, user2]);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      without_ident_user_id: `${user1.id},${user2.id}`,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.color).toBe(iNatOrange);
  });

  test("loads and renders unobserved by user data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=en&unobserved_by_user_id=${user1.id},${user2.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/");
    let allTaxaCount = allTaxa.observations_count;

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectEmptyResources(store, ["selectedTaxa", "selectedUnobservedByUser"]);
    expectDefaultTaxaRecord(store, allTaxaCount * 0.65);
    expectUser1UnobservedByUser(store);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_user1Unobserved,
    ]);
    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      unobserved_by_user_id: user1.id,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.color).toBe(iNatOrange);
  });

  test("loads and renders reviewer data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=en&viewer_id=${user1.id},${user2.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectEmptyResources(store, ["selectedTaxa", "selectedReviewer"]);
    expectDefaultTaxaRecord(store);
    expectUser1Reviewer(store);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_user1Reviewer,
    ]);
    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      viewer_id: user1.id,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.color).toBe(iNatOrange);
  });

  test("loads and renders user annotator data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=en&annotation_user_id=${user1.id},${user2.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/");
    let allTaxaCount = allTaxa.observations_count;

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectEmptyResources(store, ["selectedUsersAnnotators", "selectedTaxa"]);
    expectDefaultTaxaRecord(store);
    expectUserAnnotators(store, [allTaxaCount, allTaxaCount]);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_usersAnnotator,
    ]);
    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      annotation_user_id: `${user1.id},${user2.id}`,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.color).toBe(iNatOrange);
  });

  test("loads and renders resources and places based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let lifeCount = life().observations_count as number;
    let oakCount = redOak().observations_count as number;
    let count = oakCount + lifeCount;

    let searchparams = `?locale=en&taxon_id=${life().id},${redOak().id}`;
    searchparams += `&place_id=${losangeles.id},${sandiego.id}`;
    searchparams += `&project_id=${project_cnc1.id},${project_cnc2.id}`;
    searchparams += `&user_id=${user1.id},${user2.id}`;
    searchparams += `&ident_user_id=${user1.id}`;
    searchparams += `&colors=${colorsEncoded[0]},${colorsEncoded[1]}`;
    searchparams += `&spam=false&verifiable=true`;
    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expect_LA_SD_Place(store, [count * 0.6 * 0.75, count * 0.4 * 0.75]);
    expectProjects(store, [count * 0.7 * 0.75, count * 0.3 * 0.75]);
    expectLifeOakTaxa(store, [lifeCount * 0.75, oakCount * 0.75]);
    expectUsers(store, [
      Math.round(count * 0.45 * 0.75),
      Math.round(count * 0.55 * 0.75),
    ]);
    expectUser1Identifier(store, count * 0.75);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      placeLabel_sd,
      placeLabel_sd,
      projectLabel_cnc2,
      projectLabel_cnc2,
      gridLabel_life_places_identifier,
      gridLabel_oaks_places_identifier,
    ]);
    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      colors: `${colors[0]},${colors[1]}`,
      taxon_id: `${life().id},${redOak().id}`,
      place_id: `${losangeles.id},${sandiego.id}`,
      project_id: `${project_cnc1.id},${project_cnc2.id}`,
      user_id: `${user1.id},${user2.id}`,
      ident_user_id: `${user1.id}`,
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.color).toBe(colors[1]);
  });

  test("loads and renders resources and bounding box based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let lifeCount = life().observations_count as number;
    let oakCount = redOak().observations_count as number;
    let count = oakCount + lifeCount;

    let searchparams = `?locale=en&taxon_id=${life().id},${redOak().id}`;
    searchparams += `&nelat=0&nelng=0&swlat=0&swlng=0`;
    searchparams += `&project_id=${project_cnc1.id},${project_cnc2.id}`;
    searchparams += `&user_id=${user1.id},${user2.id}`;
    searchparams += `&colors=${colorsEncoded[0]},${colorsEncoded[1]}`;
    searchparams += `&spam=false&verifiable=true`;
    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectProjects(store, [count * 0.7, count * 0.3]);
    expectLifeOakTaxa(store, [lifeCount, oakCount]);
    expectUsers(store, [count * 0.45, count * 0.55]);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeBBoxLabel,
      projectLabel_cnc2,
      projectLabel_cnc2,
      bBoxLabel,
      gridLabel_life_bbox_resources,
      gridLabel_oaks_bbox_resources,
    ]);
    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      colors: `${colors[0]},${colors[1]}`,
      taxon_id: `${life().id},${redOak().id}`,
      project_id: `${project_cnc1.id},${project_cnc2.id}`,
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
      user_id: `${user1.id},${user2.id}`,
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.color).toBe(colors[1]);
  });
});

describe("initPopulateStore and initRenderMap options with identifications", () => {
  test("loads default all taxa if no params in url", async () => {
    let store = structuredClone(mapStore);
    store.record_type == "identifications";

    expectEmpytMap(store);

    let searchparams = ``;
    let urlData = decodeAppUrl(searchparams, "/identifications/");
    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectEmptyResources(store, ["selectedTaxaIdentified"]);
    expect(store.selectedTaxa).toStrictEqual([]);
    expectDefaultTaxaRecordIdentification(store);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecordIdent,
    ]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      taxon_id: allTaxa.id.toString(),
      per_page: perPage,
      colors: iNatOrange,
    });
    expect(store.color).toBe(allTaxaIdentification.color);
    expect(store.record_type).toBe("identifications");
    expect(store.currentView).toBe("identifications_identifications");
  });

  test.each([identificationsApiFilterableNames])(
    "adds filterable params to identificationsApiParams",
    async (param) => {
      let store = structuredClone(mapStore);

      let searchparams = `?${param}=true`;
      let urlData = decodeAppUrl(searchparams, "/identifications/");
      await initPopulateStore(store, urlData);
      await initRenderMap(store);

      expectEmptyResources(store, ["selectedTaxaIdentified"]);
      expectDefaultTaxaRecordIdentification(store);
      expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
      expect(store.identificationsApiParams).toStrictEqual({
        [param]: true,
        taxon_id: allTaxa.id.toString(),
        per_page: perPage,
        colors: iNatOrange,
      });
      expect(store.color).toBe(iNatOrange);
    },
  );
});

describe("initPopulateStore and initRenderMap resources with identifications", () => {
  test("loads and renders taxa data based on url params", async () => {
    let store = structuredClone(mapStore);
    store.record_type == "identifications";

    let life = lifeIdentification();
    life.color = defaultColorScheme[1];
    let oak = redOakIdentification();
    oak.color = defaultColorScheme[2];

    expectEmpytMap(store);

    let searchparams = `?locale=en&observation_taxon_id=${life.id},${oak.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/identifications/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectEmptyResources(store, ["selectedTaxaIdentified", "selectedTaxa"]);
    expectDefaultTaxaRecordIdentification(store, 22000);
    expect(store.selectedTaxa).toStrictEqual([life, oak]);
    expect(store.taxaMapLayers).toStrictEqual({});
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecordIdent,
    ]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      per_page: perPage,
      observation_taxon_id: `${life.id},${oak.id}`,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    });
    expect(store.color).toBe(iNatOrange);
  });

  test("loads and renders without taxa data based on url params", async () => {
    let store = structuredClone(mapStore);
    store.record_type == "identifications";

    let life = lifeIdentification();
    delete life.color;
    delete life.identifications_count;
    let oak = redOakIdentification();
    delete oak.color;
    delete oak.identifications_count;

    expectEmpytMap(store);

    let searchparams = `?locale=en&without_observation_taxon_id=${lifeBasic.id},${redOakBasic.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/identifications/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectEmptyResources(store, [
      "selectedTaxaIdentified",
      "selectedWithoutTaxa",
    ]);
    expect(store.selectedTaxa).toStrictEqual([]);
    expectDefaultTaxaRecordIdentification(store);
    expect(store.selectedWithoutTaxa).toStrictEqual([life, oak]);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecordIdent_withoutTaxa,
    ]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      taxon_id: allTaxa.id.toString(),
      without_observation_taxon_id: `${lifeBasic.id},${redOakBasic.id}`,
      per_page: perPage,
      colors: iNatOrange,
    });
    expect(store.color).toBe(iNatOrange);
  });

  test("loads and renders taxa identified data based on url params", async () => {
    let store = structuredClone(mapStore);
    store.record_type == "identifications";

    let life = lifeIdentification();
    let oak = redOakIdentification();

    expectEmpytMap(store);

    let searchparams = `?locale=en&taxon_id=${life.id},${oak.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/identifications/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectEmptyResources(store, ["selectedTaxaIdentified"]);
    expect(store.selectedTaxa).toStrictEqual([]);
    expect(store.selectedTaxaIdentified).toStrictEqual([life, oak]);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_lifeIdent,
      gridLabel_oakIdent,
    ]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      taxon_id: `${life.id},${oak.id}`,
      per_page: perPage,
    });
    expect(store.color).toBe("");
  });

  test("loads and renders without taxa identified data based on url params", async () => {
    let store = structuredClone(mapStore);
    store.record_type == "identifications";

    let life = lifeIdentification();
    delete life.color;
    delete life.identifications_count;
    let oak = redOakIdentification();
    delete oak.color;
    delete oak.identifications_count;

    expectEmpytMap(store);

    let searchparams = `?locale=en&without_taxon_id=${life.id},${oak.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/identifications/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectEmptyResources(store, [
      "selectedTaxaIdentified",
      "selectedWithoutTaxaIdentified",
    ]);
    expect(store.selectedTaxa).toStrictEqual([]);
    expectDefaultTaxaRecordIdentification(store);
    expect(store.selectedWithoutTaxaIdentified).toStrictEqual([life, oak]);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecordIdent,
    ]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      taxon_id: allTaxa.id.toString(),
      without_taxon_id: `${life.id},${oak.id}`,
      per_page: perPage,
      colors: iNatOrange,
    });
    expect(store.color).toBe(iNatOrange);
  });

  test("loads and renders places data based on url params", async () => {
    let store = structuredClone(mapStore);

    let placeA = structuredClone(losangeles);
    placeA.identifications_count =
      allTaxaIdentification.identifications_count * 0.6;
    let placeB = structuredClone(sandiego);
    placeB.identifications_count =
      allTaxaIdentification.identifications_count * 0.4;

    expectEmpytMap(store);

    let searchparams = `?locale=en&place_id=${placeA.id},${placeB.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/identifications/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectEmptyResources(store, ["selectedPlaces", "selectedTaxaIdentified"]);
    expect(store.selectedPlaces).toStrictEqual([placeA, placeB]);
    expect(store.selectedTaxa).toStrictEqual([]);
    expectDefaultTaxaRecordIdentification(
      store,
      allTaxaIdentification.identifications_count,
    );
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      placeLabel_sd,
      placeLabel_sd,
      gridLabel_allTaxaRecordIdent_la_sd,
    ]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams2: IdentificationsApiParamsType = {
      place_id: `${placeA.id},${placeB.id}`,
      taxon_id: allTaxa.id.toString(),
      per_page: perPage,
      colors: iNatOrange,
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams2);
    expect(store.color).toBe(iNatOrange);
  });

  test("does not load bounding box data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams =
      "?spam=false&verifiable=true&nelat=0&nelng=0&swlat=0&swlng=0";
    let urlData = decodeAppUrl(searchparams, "/identifications/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectEmptyResources(store, ["selectedTaxaIdentified"]);
    expect(store.selectedTaxa).toStrictEqual([]);
    expectDefaultTaxaRecordIdentification(store);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecordIdent,
    ]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      taxon_id: allTaxaIdentification.id.toString(),
      per_page: perPage,
      colors: iNatOrange,
    });
    expect(store.color).toBe(iNatOrange);
  });

  test("does not load project data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=en&project_id=${project_cnc1.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/identifications/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectEmptyResources(store, ["selectedTaxaIdentified"]);
    expect(store.selectedTaxa).toStrictEqual([]);
    expectDefaultTaxaRecordIdentification(store);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecordIdent,
    ]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      taxon_id: allTaxaIdentification.id.toString(),
      per_page: perPage,
      colors: iNatOrange,
    });
    expect(store.color).toBe(iNatOrange);
  });

  test("loads and renders user data based on url params", async () => {
    let store = structuredClone(mapStore);

    let userA = structuredClone(user1);
    userA.identifications_count =
      allTaxaIdentification.identifications_count * 0.45;
    let userB = structuredClone(user2);
    userB.identifications_count = Math.round(
      allTaxaIdentification.identifications_count * 0.55,
    );

    expectEmpytMap(store);

    let searchparams = `?locale=en&user_id=${userA.id},${userB.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/identifications/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectEmptyResources(store, [
      "selectedTaxaIdentified",
      "selectedUsersIdentifiers",
    ]);
    expect(store.selectedTaxa).toStrictEqual([]);
    expectDefaultTaxaRecordIdentification(
      store,
      allTaxaIdentification.identifications_count,
    );
    expect(store.selectedUsersIdentifiers).toStrictEqual([userA, userB]);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecordIdent_usersIdentifiers,
    ]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams2: IdentificationsApiParamsType = {
      user_id: `${userA.id},${userB.id}`,
      taxon_id: allTaxa.id.toString(),
      per_page: perPage,
      colors: iNatOrange,
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams2);
    expect(store.color).toBe(iNatOrange);
  });

  test("does not load user identifier data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=en&ident_user_id=${user1.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/identifications/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectEmptyResources(store, ["selectedTaxaIdentified"]);
    expect(store.selectedTaxa).toStrictEqual([]);
    expectDefaultTaxaRecordIdentification(store);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecordIdent,
    ]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      per_page: perPage,
    });
    expect(store.color).toBe(iNatOrange);
  });

  test("does not load unobserved by user data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=en&unobserved_by_user_id=${user1.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/identifications/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectEmptyResources(store, ["selectedTaxaIdentified"]);
    expect(store.selectedTaxa).toStrictEqual([]);
    expectDefaultTaxaRecordIdentification(store);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecordIdent,
    ]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      per_page: perPage,
    });
    expect(store.color).toBe(iNatOrange);
  });

  test("loads and renders resources and places based on url params", async () => {
    let store = structuredClone(mapStore);

    let life = lifeIdentification();
    life.color = defaultColorScheme[1];
    let count = life.identifications_count as number;
    let oak = redOakIdentification();

    expectEmpytMap(store);

    let searchparams = `?locale=en&observation_taxon_id=${life.id}`;
    searchparams += `&taxon_id=${oak.id}`;
    searchparams += `&place_id=${losangeles.id},${sandiego.id}`;
    searchparams += `&user_id=${user1.id},${user2.id}`;
    searchparams += `&colors=${colorsEncoded[0]},${colorsEncoded[1]}`;
    searchparams += `&spam=false&verifiable=true`;
    let urlData = decodeAppUrl(searchparams, "/identifications/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expect_LA_SD_Place_Identifications(store, [count * 0.6, count * 0.4]);
    expect(store.selectedTaxa).toStrictEqual([life]);
    expect(Object.keys(store.taxaIdentifiedMapLayers)).toEqual([
      oak.id.toString(),
    ]);
    expect(store.taxaIdentifiedMapLayers[oak.id].length).toBe(4);
    expect(store.selectedTaxaIdentified).toStrictEqual([
      { ...oak, identifications_count: count, color: defaultColorScheme[2] },
    ]);
    expectUserIdentifiersIdentifications(store, [
      Math.round(count * 0.45),
      Math.round(count * 0.55),
    ]);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      placeLabel_sd,
      placeLabel_sd,
      gridLabel_life_identified_places_usersIdentifiers,
    ]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams: IdentificationsApiParamsType = {
      observation_taxon_id: `${life.id}`,
      taxon_id: `${oak.id}`,
      place_id: `${losangeles.id},${sandiego.id}`,
      user_id: `${user1.id},${user2.id}`,
      per_page: perPage,
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams);
    expect(store.color).toBe(life.color);
  });
});

describe("initPopulateStore and initRenderMap resources with about page", () => {
  test("sets record_type to about", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = ``;
    let urlData = decodeAppUrl(searchparams, "/about/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectEmptyResources(store);
    expect(store.selectedTaxa).toStrictEqual([]);
    expect(store.selectedTaxaIdentified).toStrictEqual([]);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
    });
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.color).toBe("");
    expect(store.record_type).toBe("about");
    expect(store.currentView).toBeUndefined();
  });
});

describe("initPopulateStore and initRenderMap populates views and subviews", () => {
  test.each(validObservationsViews)(
    "adds observation view to store",
    async (view) => {
      let store = structuredClone(mapStore);
      let perpage = store.viewMetadata[view].perPage;

      expectEmpytMap(store);

      let searchparams = `?locale=en&view=${view}`;
      let urlData = decodeAppUrl(searchparams, "/");
      let subview =
        view === "observations_observations"
          ? {
              subview: "map",
              perPage: perpage,
              displayFields: {},
              graphs: { category: "month_of_year" },
            }
          : { perPage: perpage };

      await initPopulateStore(store, urlData);
      await initRenderMap(store);

      expectEmptyResources(store, ["selectedTaxa"]);
      expectDefaultTaxaRecord(store);
      expect(store.observationsApiParams).toStrictEqual({
        ...defaultParams,
        colors: iNatOrange,
        taxon_id: allTaxa.id.toString(),
        per_page: perpage,
      });
      expect(store.identificationsApiParams).toStrictEqual({});
      expect(store.color).toBe(iNatOrange);
      expect(store.record_type).toBe("observations");
      expect(store.currentView).toBe(view);
      expect(store.viewMetadata[view]).toStrictEqual(subview);
    },
  );

  test.each(validIdentificationsViews)(
    "adds identifications view to store",
    async (view) => {
      let store = structuredClone(mapStore);

      expectEmpytMap(store);

      let searchparams = `?locale=en&view=${view}`;
      let urlData = decodeAppUrl(searchparams, "/identifications/");
      let subview =
        view === "identifications_identifications"
          ? { subview: "map", perPage: store.viewMetadata[view].perPage }
          : { perPage: store.viewMetadata[view].perPage };

      await initPopulateStore(store, urlData);
      await initRenderMap(store);

      expectEmptyResources(store, ["selectedTaxaIdentified"]);
      expectDefaultTaxaRecordIdentification(store);
      expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
      expect(store.identificationsApiParams).toStrictEqual({
        taxon_id: allTaxa.id.toString(),
        colors: iNatOrange,
        per_page: store.viewMetadata[view].perPage,
      });
      expect(store.color).toBe(iNatOrange);
      expect(store.record_type).toBe("identifications");
      expect(store.currentView).toBe(view);
      expect(store.viewMetadata[view]).toStrictEqual(subview);
    },
  );

  test.each(validObservationsSubviews)(
    "adds observations view and subview to store",
    async (subview) => {
      let store = structuredClone(mapStore);

      expectEmpytMap(store);

      let searchparams = `?locale=en&view=observations_observations&subview=${subview}`;
      let urlData = decodeAppUrl(searchparams, "/");

      await initPopulateStore(store, urlData);
      await initRenderMap(store);

      expectEmptyResources(store, ["selectedTaxa"]);
      expectDefaultTaxaRecord(store);
      expect(store.observationsApiParams).toStrictEqual({
        ...defaultParams,
        per_page: perPage,
        colors: iNatOrange,
        taxon_id: allTaxa.id.toString(),
      });
      expect(store.identificationsApiParams).toStrictEqual({});
      expect(store.color).toBe(iNatOrange);
      expect(store.currentView).toBe("observations_observations");
      expect(store.viewMetadata.observations_observations).toStrictEqual({
        displayFields: {},
        graphs: { category: "month_of_year" },
        perPage: 24,
        subview: subview,
      });
    },
  );

  test.each(validIdentificationsSubviews)(
    "adds observations view and subview for identifications to store",
    async (subview) => {
      let store = structuredClone(mapStore);

      expectEmpytMap(store);

      let searchparams = `?locale=en&view=identifications_identifications&subview=${subview}`;
      let urlData = decodeAppUrl(searchparams, "/identifications/");

      await initPopulateStore(store, urlData);
      await initRenderMap(store);

      expectEmptyResources(store, ["selectedTaxaIdentified"]);
      expectDefaultTaxaRecordIdentification(store);
      expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
      expect(store.identificationsApiParams).toStrictEqual({
        per_page: perPage,
        colors: iNatOrange,
        taxon_id: allTaxa.id.toString(),
      });
      expect(store.color).toBe(iNatOrange);
      expect(store.currentView).toBe("identifications_identifications");
      expect(store.viewMetadata.identifications_identifications).toStrictEqual({
        perPage: 24,
        subview: subview,
      });
    },
  );
});

describe("populateStoreWithLocaleStorage", () => {
  afterEach(() => {
    localStorage.clear();
  });
  test("does nothing if no values in local storage", () => {
    let store = structuredClone(mapStore);

    populateStoreWithLocaleStorage(store);

    let expected = structuredClone(mapStore);
    expect(store).toStrictEqual(expected);
  });

  test("sets locale if local is in locale storage", () => {
    let store = structuredClone(mapStore);
    localStorage.setItem(dbKeys.locale, JSON.stringify("fr"));

    populateStoreWithLocaleStorage(store);

    let expected = structuredClone(mapStore);
    expected.observationsApiParams.locale = "fr";
    expect(store).toStrictEqual(expected);
  });

  test("sets name order if name_order is in local storage", () => {
    let store = structuredClone(mapStore);
    localStorage.setItem(dbKeys.name_order, JSON.stringify("s"));

    populateStoreWithLocaleStorage(store);

    let expected = structuredClone(mapStore);
    expected.viewMetadata.name_order = "s";
    expect(store).toStrictEqual(expected);
  });

  test("sets page for observation if local is in local storage", () => {
    let store = structuredClone(mapStore);
    localStorage.setItem(dbKeys.per_page_observations, JSON.stringify("48"));

    populateStoreWithLocaleStorage(store);

    let expected = structuredClone(mapStore);
    expected.viewMetadata.identifications_identifications.perPage = 48;
    expected.viewMetadata.observations_observations.perPage = 48;
    expect(store).toStrictEqual(expected);
  });
});

describe("initApp when there are valus in local storage", () => {
  afterEach(() => {
    localStorage.clear();
  });
  test("sets locale and page in store", async () => {
    let store = structuredClone(mapStore);
    localStorage.setItem(dbKeys.name_order, JSON.stringify("s"));
    localStorage.setItem(dbKeys.locale, JSON.stringify("fr"));
    localStorage.setItem(dbKeys.per_page_observations, JSON.stringify("48"));

    populateStoreWithLocaleStorage(store);

    let searchparams = ``;
    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      locale: "fr",
      per_page: 48,
    });
    expect(store.viewMetadata.name_order).toBe("s");
    expect(store.viewMetadata.identifications_identifications.perPage).toBe(48);
    expect(store.viewMetadata.observations_observations.perPage).toBe(48);
  });
});

test("decodeAppUrl, initApp, and saveBBoxToStore handles bounding box", async () => {
  let store = structuredClone(mapStore);

  let coors = [
    [-111, 45],
    [-111, 41],
    [-104, 41],
    [-104, 45],
    [-111, 45],
  ] as LngLatType[];

  let searchparams = "nelng=-104&nelat=45&swlat=41&swlng=-111";
  let urlData = decodeAppUrl(searchparams, "/");
  expect(urlData.observationsApiParams).toStrictEqual({
    nelng: -104,
    nelat: 45,
    swlat: 41,
    swlng: -111,
  });

  await initPopulateStore(store, urlData);
  await initRenderMap(store);

  expect(store.selectedPlaces).toStrictEqual([
    {
      bounding_box: {
        coordinates: [coors],
        type: "Polygon",
      },
      display_name: "Custom Boundary",
      id: 0,
      name: "Custom Boundary",
      observations_count: 100000,
    },
  ]);
  expect(store.observationsApiParams).toStrictEqual({
    ...defaultParams,
    nelng: -104,
    nelat: 45,
    swlat: 41,
    swlng: -111,
    per_page: perPage,
    taxon_id: allTaxa.id.toString(),
    colors: iNatOrange,
  });

  await saveBBoxToStore(coors, store);

  expect(store.selectedPlaces).toStrictEqual([
    {
      bounding_box: {
        coordinates: [coors],
        type: "Polygon",
      },
      display_name: "Custom Boundary",
      id: 0,
      name: "Custom Boundary",
      observations_count: 100000,
    },
  ]);
  expect(store.observationsApiParams).toStrictEqual({
    ...defaultParams,
    nelng: -104,
    nelat: 45,
    swlat: 41,
    swlng: -111,
    per_page: perPage,
    taxon_id: allTaxa.id.toString(),
    colors: iNatOrange,
  });
});
