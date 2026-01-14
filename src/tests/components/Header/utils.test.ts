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

import { leafletVisibleLayers } from "../../../lib/data_utils.ts";
import {
  createMockServer,
  defaultParams,
  basemapLabel_osm,
  lifeBasic,
  redOakBasic,
  life,
  redOak,
  gridLabel_life,
  gridLabel_oaks,
  expectLifeOakTaxaIdentifications,
  lifeIdentification,
  redOakIdentification,
  expectLifeOakTaxa,
  gridLabel_allTaxaRecord,
  perPage,
} from "../../test_helpers.ts";
import { decodeAppUrl } from "../../../lib/utils.ts";
import { initPopulateStore, initRenderMap } from "../../../lib/init_app.ts";
import { mapStore } from "../../../lib/store.ts";
import { pageChangeHandler } from "../../../components/Header/utils.ts";
import Router from "../../../lib/router.ts";
import { taxonSelectedHandler } from "../../../lib/search_taxa.ts";
import { viewChangeHandler } from "../../../components/ObservationsHeader/shared_utils.ts";

beforeEach(() => {
  const { JSDOM } = jsdom;

  let dom = new JSDOM(
    `<!doctype html>
<html lang="en">
  <body>
  <div id="app"></div>
    <li
      id="identifications"
      data-count-label="identifications_identifications"
    >
      <span class="header-count">&nbsp;</span><span>Identifications</span>
    </li>
    <div id="map" style="width: 400px; height: 400px"></div>
    <div id="view-container"></div>
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

describe("click on header to change page", () => {
  test("switch from identifications to observations", async () => {
    let store = structuredClone(mapStore);

    let observationsPageClick = {
      target: {
        dataset: { recordType: "observations" },
        getAttribute: () => {
          return "/";
        },
      },
    } as unknown as CustomEvent;
    let life1 = lifeIdentification();
    let life2 = structuredClone(life1);
    life2.observations_count = 10000;
    let oak1 = redOakIdentification();
    let oak2 = structuredClone(oak1);
    oak2.observations_count = 1000;

    let searchparams = "";
    let urlData = decodeAppUrl(searchparams, "/identifications/");
    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    await taxonSelectedHandler(lifeBasic, "", store);
    await taxonSelectedHandler(redOakBasic, "", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
      gridLabel_oaks,
    ]);
    expectLifeOakTaxaIdentifications(store, [20000, 2000]);
    expect(store.record_type).toStrictEqual("identifications");
    expect(store.currentView).toStrictEqual("identifications_observations");
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      per_page: perPage,
      observation_taxon_id: `${life1.id},${oak1.id}`,
    });
    expect(store.selectedTaxa).toStrictEqual([life1, oak1]);

    await pageChangeHandler(observationsPageClick, store, Router);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
      gridLabel_oaks,
    ]);
    expect(store.selectedTaxa).toStrictEqual([life2, oak2]);
    expect(store.record_type).toStrictEqual("observations");
    expect(store.currentView).toStrictEqual("observations_observations");
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      taxon_id: `${life2.id},${oak2.id}`,
      per_page: perPage,
    });
    expect(store.identificationsApiParams).toStrictEqual({
      per_page: perPage,
      observation_taxon_id: `${life2.id},${oak2.id}`,
    });

    let mainEl = document.querySelector("#app") as HTMLDivElement;
    expect(mainEl?.innerHTML).toBe(`<page-observations></page-observations>`);

    let viewContainerEl = document.querySelector(
      "#view-container",
    ) as HTMLDivElement;
    expect(viewContainerEl?.innerHTML).toBe(
      `<view-observations></view-observations>`,
    );

    expect(store.selectedTaxa[0].observations_count).toBe(10000);
    expect(store.selectedTaxa[1].observations_count).toBe(1000);
  });

  test("switch from observations to identifications", async () => {
    let store = structuredClone(mapStore);

    let identificationsClickMock = {
      target: {
        dataset: { recordType: "identifications" },
        getAttribute: () => {
          return "/identifications/";
        },
      },
    } as unknown as CustomEvent;
    let life1 = life();
    let life2 = structuredClone(life1);
    life2.identifications_count = 20000;
    let oak1 = redOak();
    let oak2 = structuredClone(oak1);
    oak2.identifications_count = 2000;

    let searchparams = "";
    let urlData = decodeAppUrl(searchparams, "/");
    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    await taxonSelectedHandler(lifeBasic, "", store);
    await taxonSelectedHandler(redOakBasic, "", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
      gridLabel_oaks,
    ]);
    expectLifeOakTaxa(store, [10000, 1000]);
    expect(store.record_type).toStrictEqual("observations");
    expect(store.currentView).toStrictEqual("observations_observations");
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      per_page: perPage,
      taxon_id: `${life2.id},${oak2.id}`,
      colors: `${life2.color},${oak2.color}`,
    });
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.selectedTaxa).toStrictEqual([life1, oak1]);

    await pageChangeHandler(identificationsClickMock, store, Router);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
      gridLabel_oaks,
    ]);
    expect(store.selectedTaxa).toStrictEqual([life2, oak2]);
    expect(store.record_type).toStrictEqual("identifications");
    expect(store.currentView).toStrictEqual("identifications_observations");
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      per_page: perPage,
      taxon_id: `${life2.id},${oak2.id}`,
      colors: `${life2.color},${oak2.color}`,
    });
    expect(store.identificationsApiParams).toStrictEqual({
      observation_taxon_id: `${life2.id},${oak2.id}`,
      per_page: perPage,
    });

    let mainEl = document.querySelector("#app") as HTMLDivElement;
    expect(mainEl?.innerHTML).toBe(
      `<page-identifications></page-identifications>`,
    );

    let viewContainerEl = document.querySelector(
      "#view-container",
    ) as HTMLDivElement;
    expect(viewContainerEl?.innerHTML).toBe(
      `<view-observations></view-observations>`,
    );

    expect(store.selectedTaxa[0].identifications_count).toBe(20000);
    expect(store.selectedTaxa[1].identifications_count).toBe(2000);
  });
});

describe("click on headers to change view and page", () => {
  test("switch from identifications page, identifications view to observations", async () => {
    let store = structuredClone(mapStore);

    let observationsPageClick = {
      target: {
        dataset: { recordType: "observations" },
        getAttribute: () => {
          return "/";
        },
      },
    } as unknown as CustomEvent;

    let searchparams = "";
    let urlData = decodeAppUrl(searchparams, "/identifications/");
    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);

    await taxonSelectedHandler(lifeBasic, "", store);
    await taxonSelectedHandler(redOakBasic, "", store);

    expect(store.record_type).toStrictEqual("identifications");
    expect(store.currentView).toStrictEqual("identifications_observations");
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
      gridLabel_oaks,
    ]);

    let spanEl = document.querySelector(".header-count") as HTMLDivElement;
    let thisMock = { querySelector: () => {} } as any;
    viewChangeHandler(spanEl, store, thisMock);

    expect(store.record_type).toStrictEqual("identifications");
    expect(store.currentView).toStrictEqual("identifications_identifications");
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
      gridLabel_oaks,
    ]);

    let viewContainerEl = document.querySelector(
      "#view-container",
    ) as HTMLDivElement;
    expect(viewContainerEl?.innerHTML).toBe(
      `<view-identifications></view-identifications>`,
    );

    await pageChangeHandler(observationsPageClick, store, Router);

    expect(store.record_type).toStrictEqual("observations");
    expect(store.currentView).toStrictEqual("observations_observations");
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
      gridLabel_oaks,
    ]);

    let mainEl = document.querySelector("#app") as HTMLDivElement;
    expect(mainEl?.innerHTML).toBe(`<page-observations></page-observations>`);

    expect(viewContainerEl?.innerHTML).toBe(
      `<view-observations></view-observations>`,
    );
  });
});
