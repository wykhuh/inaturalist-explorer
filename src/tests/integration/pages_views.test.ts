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

import { template as observationHeaderHTML } from "../../components/ObservationsHeader/template.ts";
import { leafletVisibleLayers } from "../../lib/data_utils.ts";
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
  expectDefaultTaxaRecordIdentification,
  allTaxa,
  gridLabel_allTaxaRecord,
  allTaxaIdentification,
  expectDefaultTaxaRecord,
} from "../test_helpers.ts";
import { decodeAppUrl } from "../../lib/utils.ts";
import { initPopulateStore, initRenderMap } from "../../lib/init_app.ts";
import { mapStore } from "../../lib/store.ts";
import { pageChangeHandler } from "../../components/Header/utils.ts";
import Router from "../../lib/router.ts";
import { taxonSelectedHandler } from "../../lib/search_taxa.ts";
import { viewChangeHandler } from "../../components/ObservationsHeader/shared_utils.ts";
import { taxonIdentifiedSelectedHandler } from "../../lib/search_taxa_identified.ts";
import { iNatOrange } from "../../lib/map_colors_utils.ts";
import "../../components/ViewObservations/component.ts";

beforeEach(() => {
  const { JSDOM } = jsdom;

  let dom = new JSDOM(
    `<!doctype html>
<html lang="en">
  <body>
  <div id="app"></div>
    ${observationHeaderHTML}
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

function observationsPageClick() {
  return {
    target: {
      dataset: { recordType: "observations" },
      getAttribute: () => {
        return "/";
      },
    },
  } as unknown as CustomEvent;
}

function identificationsClickMock() {
  return {
    target: {
      dataset: { recordType: "identifications" },
      getAttribute: () => {
        return "/identifications/";
      },
    },
  } as unknown as CustomEvent;
}

describe("click on site header to change page", () => {
  test("switch from identifications page to observations page with default taxa", async () => {
    let store = structuredClone(mapStore);

    let defaultTaxa = structuredClone(allTaxaIdentification);
    let defaultTaxaCount = allTaxa.observations_count;

    let searchparams = "";
    let urlData = decodeAppUrl(searchparams, "/identifications/");
    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expectDefaultTaxaRecordIdentification(store);
    expect(store.record_type).toStrictEqual("identifications");
    expect(store.currentView).toStrictEqual("identifications_observations");
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      observation_taxon_id: `${defaultTaxa.id}`,
    });
    expect(store.selectedTaxa).toStrictEqual([defaultTaxa]);

    await pageChangeHandler(observationsPageClick(), store, Router);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expect(store.selectedTaxa).toStrictEqual([
      { ...defaultTaxa, observations_count: defaultTaxaCount },
    ]);
    expect(store.record_type).toStrictEqual("observations");
    expect(store.currentView).toStrictEqual("observations_observations");
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      taxon_id: `${defaultTaxa.id}`,
    });
    expect(store.identificationsApiParams).toStrictEqual({
      observation_taxon_id: `${defaultTaxa.id}`,
    });

    let mainEl = document.querySelector("#app") as HTMLDivElement;
    expect(mainEl?.innerHTML).toBe(`<page-observations></page-observations>`);

    let viewContainerEl = document.querySelector(
      "#view-container",
    ) as HTMLDivElement;
    expect(viewContainerEl?.innerHTML).toBe(
      `<view-observations></view-observations>`,
    );
  });

  test("switch from identifications page to observations page with selected taxa", async () => {
    let store = structuredClone(mapStore);

    let life1 = lifeIdentification();
    let life1Count = life().observations_count;
    let oak1 = redOakIdentification();
    let oak1Count = redOak().observations_count;

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
    expectLifeOakTaxaIdentifications(store);
    expect(store.record_type).toStrictEqual("identifications");
    expect(store.currentView).toStrictEqual("identifications_observations");
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      observation_taxon_id: `${life1.id},${oak1.id}`,
    });
    expect(store.selectedTaxa).toStrictEqual([life1, oak1]);

    await pageChangeHandler(observationsPageClick(), store, Router);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
      gridLabel_oaks,
    ]);
    expect(store.selectedTaxa).toStrictEqual([
      { ...life1, observations_count: life1Count },
      { ...oak1, observations_count: oak1Count },
    ]);
    expect(store.record_type).toStrictEqual("observations");
    expect(store.currentView).toStrictEqual("observations_observations");
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      taxon_id: `${life1.id},${oak1.id}`,
    });
    expect(store.identificationsApiParams).toStrictEqual({
      observation_taxon_id: `${life1.id},${oak1.id}`,
    });

    let mainEl = document.querySelector("#app") as HTMLDivElement;
    expect(mainEl?.innerHTML).toBe(`<page-observations></page-observations>`);

    let viewContainerEl = document.querySelector(
      "#view-container",
    ) as HTMLDivElement;
    expect(viewContainerEl?.innerHTML).toBe(
      `<view-observations></view-observations>`,
    );
  });

  test("switch from identifications page to observations page with selected taxa identified", async () => {
    let store = structuredClone(mapStore);

    let life1 = lifeIdentification();
    delete life1.color;
    let life1Count = allTaxa.observations_count;
    let defaultTaxa = structuredClone(allTaxa);
    let mainEl = document.querySelector("#app") as HTMLDivElement;
    let viewContainerEl = document.querySelector(
      "#view-container",
    ) as HTMLDivElement;

    let searchparams = "";
    let urlData = decodeAppUrl(searchparams, "/identifications/");
    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    await taxonIdentifiedSelectedHandler(lifeBasic, "", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([basemapLabel_osm]);

    expect(store.record_type).toStrictEqual("identifications");
    expect(store.currentView).toStrictEqual("identifications_observations");
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      taxon_id: `${life1.id}`,
    });
    expect(store.selectedTaxaIdentified).toStrictEqual([life1]);
    expect(store.selectedTaxa).toStrictEqual([]);

    await pageChangeHandler(observationsPageClick(), store, Router);

    expect(leafletVisibleLayers(store)).toStrictEqual([basemapLabel_osm]);
    expect(store.selectedTaxaIdentified).toStrictEqual([
      { ...life1, observations_count: life1Count },
    ]);
    expect(store.selectedTaxa).toStrictEqual([defaultTaxa]);
    expect(store.record_type).toStrictEqual("observations");
    expect(store.currentView).toStrictEqual("observations_observations");
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      taxon_id: `${defaultTaxa.id}`,
      colors: iNatOrange,
    });
    expect(store.identificationsApiParams).toStrictEqual({
      taxon_id: `${life1.id}`,
    });
    expect(mainEl?.innerHTML).toBe(`<page-observations></page-observations>`);
    expect(viewContainerEl?.innerHTML).toBe(
      `<view-observations></view-observations>`,
    );

    await pageChangeHandler(identificationsClickMock(), store, Router);

    expect(leafletVisibleLayers(store)).toStrictEqual([basemapLabel_osm]);
    expect(store.selectedTaxaIdentified).toStrictEqual([
      { ...life1, observations_count: life1Count },
    ]);
    expect(store.selectedTaxa).toStrictEqual([]);
    expect(store.record_type).toStrictEqual("identifications");
    expect(store.currentView).toStrictEqual("identifications_observations");
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      taxon_id: `${defaultTaxa.id}`,
      colors: iNatOrange,
    });
    expect(store.identificationsApiParams).toStrictEqual({
      taxon_id: `${life1.id}`,
      observation_taxon_id: `${defaultTaxa.id}`,
    });

    expect(mainEl?.innerHTML).toBe(
      `<page-identifications></page-identifications>`,
    );
    expect(viewContainerEl?.innerHTML).toBe(
      `<view-observations></view-observations>`,
    );
  });

  test("switch from observations page to identifications page with default taxa", async () => {
    let store = structuredClone(mapStore);

    let defaultTaxa = allTaxa;
    let defaultTaxaCount = allTaxaIdentification.identifications_count;

    let searchparams = "";
    let urlData = decodeAppUrl(searchparams, "/");
    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expectDefaultTaxaRecord(store);
    expect(store.record_type).toStrictEqual("observations");
    expect(store.currentView).toStrictEqual("observations_observations");
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      taxon_id: `${defaultTaxa.id}`,
      colors: `${defaultTaxa.color}`,
    });
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.selectedTaxa).toStrictEqual([defaultTaxa]);

    await pageChangeHandler(identificationsClickMock(), store, Router);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expect(store.selectedTaxa).toStrictEqual([
      { ...defaultTaxa, identifications_count: defaultTaxaCount },
    ]);
    expect(store.record_type).toStrictEqual("identifications");
    expect(store.currentView).toStrictEqual("identifications_observations");
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      taxon_id: `${defaultTaxa.id}`,
      colors: `${defaultTaxa.color}`,
    });
    expect(store.identificationsApiParams).toStrictEqual({
      observation_taxon_id: `${defaultTaxa.id}`,
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
  });

  test("switch from observations page to identifications page with selected taxa", async () => {
    let store = structuredClone(mapStore);

    let life1 = life();
    let life1IdentCount = lifeIdentification().identifications_count;
    let oak1 = redOak();
    let oak1IdentCount = redOakIdentification().identifications_count;

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
    expectLifeOakTaxa(store);
    expect(store.record_type).toStrictEqual("observations");
    expect(store.currentView).toStrictEqual("observations_observations");
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      taxon_id: `${life1.id},${oak1.id}`,
      colors: `${life1.color},${oak1.color}`,
    });
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.selectedTaxa).toStrictEqual([life1, oak1]);

    await pageChangeHandler(identificationsClickMock(), store, Router);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
      gridLabel_oaks,
    ]);
    expect(store.selectedTaxa).toStrictEqual([
      { ...life1, identifications_count: life1IdentCount },
      { ...oak1, identifications_count: oak1IdentCount },
    ]);
    expect(store.record_type).toStrictEqual("identifications");
    expect(store.currentView).toStrictEqual("identifications_observations");
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      taxon_id: `${life1.id},${oak1.id}`,
      colors: `${life1.color},${oak1.color}`,
    });
    expect(store.identificationsApiParams).toStrictEqual({
      observation_taxon_id: `${life1.id},${oak1.id}`,
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
  });

  test("switch from about page to observations page", async () => {
    let store = structuredClone(mapStore);

    let searchparams = "";
    let urlData = decodeAppUrl(searchparams, "/about/");
    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([basemapLabel_osm]);
    expect(store.record_type).toStrictEqual("about");
    expect(store.currentView).toBeUndefined();

    await pageChangeHandler(observationsPageClick(), store, Router);

    expect(leafletVisibleLayers(store)).toStrictEqual([basemapLabel_osm]);
    expect(store.selectedTaxa).toStrictEqual([allTaxa]);
    expect(store.record_type).toStrictEqual("observations");
    expect(store.currentView).toStrictEqual("observations_observations");
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      taxon_id: `${allTaxa.id}`,
      colors: `${allTaxa.color}`,
    });
    expect(store.identificationsApiParams).toStrictEqual({});

    let mainEl = document.querySelector("#app") as HTMLDivElement;
    expect(mainEl?.innerHTML).toBe(`<page-observations></page-observations>`);

    let viewContainerEl = document.querySelector(
      "#view-container",
    ) as HTMLDivElement;
    expect(viewContainerEl?.innerHTML).toBe(
      `<view-observations></view-observations>`,
    );
  });
});

describe("click on headers to change view and page", () => {
  test("switch from observations/observations, to observations/species, to identifications/species ", async () => {
    let store = structuredClone(mapStore);

    let viewContainerEl = document.querySelector(
      "#view-container",
    ) as HTMLDivElement;
    let mainEl = document.querySelector("#app") as HTMLDivElement;
    let speciesLink = document.querySelector(
      "#observations_species",
    ) as HTMLDivElement;
    let lifeIdentCount = lifeIdentification().identifications_count as number;

    let searchparams = "";
    let urlData = decodeAppUrl(searchparams, "/");
    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expect(store.record_type).toStrictEqual("observations");
    expect(store.currentView).toStrictEqual("observations_observations");
    expect(store.selectedTaxa).toStrictEqual([allTaxa]);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);

    await taxonSelectedHandler(lifeBasic, "", store);

    expect(store.record_type).toStrictEqual("observations");
    expect(store.currentView).toStrictEqual("observations_observations");
    expect(store.selectedTaxa).toStrictEqual([life()]);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);

    let thisMock = { querySelector: () => {} } as any;
    viewChangeHandler(speciesLink, store, thisMock);

    expect(store.record_type).toStrictEqual("observations");
    expect(store.currentView).toStrictEqual("observations_species");
    expect(store.selectedTaxa).toStrictEqual([life()]);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expect(viewContainerEl?.innerHTML).toBe(`<view-species></view-species>`);

    await pageChangeHandler(identificationsClickMock(), store, Router);

    expect(store.record_type).toStrictEqual("identifications");
    expect(store.currentView).toStrictEqual("identifications_species");
    expect(store.selectedTaxa).toStrictEqual([
      { ...life(), identifications_count: lifeIdentCount },
    ]);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expect(mainEl?.innerHTML).toBe(
      `<page-identifications></page-identifications>`,
    );
    expect(viewContainerEl?.innerHTML).toBe(`<view-species></view-species>`);
  });
});
