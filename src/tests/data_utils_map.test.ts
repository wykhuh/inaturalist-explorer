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
import {
  createMockServer,
  monarch,
  redOak,
  setupMapAndStore,
} from "./test_helpers.ts";
import {
  fetchiNatMapDataForTaxon,
  leafletControlLayers,
  leafletMapLayers,
} from "../lib/data_utils.ts";
import type {
  AppStoreType,
  LeafletControl,
  ObservationTilesSettingType,
} from "../types/app";
import { allTaxaRecord } from "../data/inat_data.ts";

beforeEach(() => {
  const { JSDOM } = jsdom;

  let dom = new JSDOM(
    `<!doctype html>
<html lang="en">
  <body>
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

function clearMapTaxaLayers(store: AppStoreType) {
  if (store.map.layerControl) {
    let control = store.map.layerControl as LeafletControl;
    control._layers
      .filter((l) => l.layer.options.layer_type === "taxa overlay")
      .forEach((l) => {
        // remove layer from map
        l.layer.remove();
        // remove layer fron controls
        store.map.layerControl?.removeLayer(l.layer);
      });
  }
}

describe("fetchiNatMapDataForTaxon", () => {
  test("returns three iNat tiles map layers for default taxa", async () => {
    let taxon = allTaxaRecord;
    let { store } = setupMapAndStore();
    store.observationsApiParams = { taxon_id: `${taxon.id}` };

    let results = (await fetchiNatMapDataForTaxon(
      taxon,
      store,
    )) as unknown as ObservationTilesSettingType[];

    expect(results.length).toBe(3);
    expect(results[0].options.layer_description).toBe(
      `overlay: iNat grid, taxon_id ${taxon.id}`,
    );
    expect(results[1].options.layer_description).toBe(
      `overlay: iNat points, taxon_id ${taxon.id}`,
    );
    expect(results[2].options.layer_description).toBe(
      `overlay: iNat heatmap, taxon_id ${taxon.id}`,
    );
  });

  test("returns four iNat tiles map layers for a taxon", async () => {
    let taxon = redOak();
    let { store } = setupMapAndStore();
    store.observationsApiParams = { taxon_id: `${taxon.id}` };

    let results = (await fetchiNatMapDataForTaxon(
      taxon,
      store,
    )) as unknown as ObservationTilesSettingType[];

    expect(results.length).toBe(4);
    expect(results[0].options.layer_description).toBe(
      `overlay: iNat grid, taxon_id ${taxon.id}`,
    );
    expect(results[1].options.layer_description).toBe(
      `overlay: iNat points, taxon_id ${taxon.id}`,
    );
    expect(results[2].options.layer_description).toBe(
      `overlay: iNat heatmap, taxon_id ${taxon.id}`,
    );
    expect(results[3].options.layer_description).toBe(
      `overlay: iNat taxon range, taxon_id ${taxon.id}`,
    );
  });

  test("if no activeLayers, sets activeLayers to be the grid map layer for a given taxon", async () => {
    let taxon = redOak();
    let { store } = setupMapAndStore();
    store.observationsApiParams = { taxon_id: `${taxon.id}` };

    let results = (await fetchiNatMapDataForTaxon(
      taxon,
      store,
    )) as unknown as ObservationTilesSettingType[];

    expect(results.length).toBe(4);
    expect(store.map.activeLayers.size).toBe(1);
    expect(
      store.map.activeLayers.has(`overlay: iNat grid, taxon_id ${taxon.id}`),
    ).toBe(true);
    expect(leafletControlLayers(store)).toStrictEqual([
      "Open Street Map",
      "Red Oaks Grid",
      "Red Oaks Points",
      "Red Oaks Heatmap",
      "Red Oaks Taxon Range",
    ]);
    expect(leafletMapLayers(store, "control_name")).toStrictEqual([
      "Open Street Map",
      "Red Oaks Grid",
    ]);
  });

  test("if no activeLayers, sets activeLayers to be the grid map layer for multiple taxon", async () => {
    let taxon1 = redOak();
    let taxon2 = monarch();
    let { store } = setupMapAndStore();
    store.observationsApiParams = { taxon_id: `${taxon1.id},${taxon2.id}` };

    (await fetchiNatMapDataForTaxon(
      taxon1,
      store,
    )) as unknown as ObservationTilesSettingType[];
    (await fetchiNatMapDataForTaxon(
      taxon2,
      store,
    )) as unknown as ObservationTilesSettingType[];

    expect(store.map.activeLayers.size).toBe(2);
    expect(
      store.map.activeLayers.has(`overlay: iNat grid, taxon_id ${taxon1.id}`),
    ).toBe(true);
    expect(
      store.map.activeLayers.has(`overlay: iNat grid, taxon_id ${taxon2.id}`),
    ).toBe(true);
    expect(leafletControlLayers(store)).toStrictEqual([
      "Open Street Map",
      "Red Oaks Grid",
      "Red Oaks Points",
      "Red Oaks Heatmap",
      "Red Oaks Taxon Range",
      "Monarch Grid",
      "Monarch Points",
      "Monarch Heatmap",
      "Monarch Taxon Range",
    ]);
    expect(leafletMapLayers(store, "control_name")).toStrictEqual([
      "Open Street Map",
      "Red Oaks Grid",
      "Monarch Grid",
    ]);
  });

  test("if activeLayers exist, do not change existing activeLayers", async () => {
    let taxon = redOak();
    let layerName = `overlay: iNat points, taxon_id ${taxon.id}`;
    let { store } = setupMapAndStore();
    store.observationsApiParams = { taxon_id: `${taxon.id}` };
    store.map.activeLayers.add(layerName);

    (await fetchiNatMapDataForTaxon(
      taxon,
      store,
    )) as unknown as ObservationTilesSettingType[];

    expect(store.map.activeLayers.size).toBe(1);
    expect(store.map.activeLayers.has(layerName)).toStrictEqual(true);
    expect(leafletControlLayers(store)).toStrictEqual([
      "Open Street Map",
      "Red Oaks Grid",
      "Red Oaks Points",
      "Red Oaks Heatmap",
      "Red Oaks Taxon Range",
    ]);
    expect(leafletMapLayers(store, "control_name")).toStrictEqual([
      "Open Street Map",
      "Red Oaks Points",
    ]);
  });

  test("if multiple activeLayers exist, do not change existing activeLayers", async () => {
    let taxon1 = redOak();
    let taxon2 = monarch();
    let layerName1 = `overlay: iNat grid, taxon_id ${taxon1.id}`;
    let layerName2 = `overlay: iNat points, taxon_id ${taxon2.id}`;
    let { store } = setupMapAndStore();
    store.observationsApiParams = { taxon_id: `${taxon1.id},${taxon2.id}` };
    store.map.activeLayers.add(layerName1);
    store.map.activeLayers.add(layerName2);

    (await fetchiNatMapDataForTaxon(
      taxon1,
      store,
    )) as unknown as ObservationTilesSettingType[];
    (await fetchiNatMapDataForTaxon(
      taxon2,
      store,
    )) as unknown as ObservationTilesSettingType[];

    expect(store.map.activeLayers.size).toBe(2);
    expect(store.map.activeLayers.has(layerName1)).toStrictEqual(true);
    expect(store.map.activeLayers.has(layerName2)).toStrictEqual(true);
    expect(leafletControlLayers(store)).toStrictEqual([
      "Open Street Map",
      "Red Oaks Grid",
      "Red Oaks Points",
      "Red Oaks Heatmap",
      "Red Oaks Taxon Range",
      "Monarch Grid",
      "Monarch Points",
      "Monarch Heatmap",
      "Monarch Taxon Range",
    ]);
    expect(leafletMapLayers(store, "control_name")).toStrictEqual([
      "Open Street Map",
      "Red Oaks Grid",
      "Monarch Points",
    ]);
  });

  test("uses observationsApiParams for activeLayers name", async () => {
    let taxon = redOak();
    let { store } = setupMapAndStore();
    store.observationsApiParams = {
      taxon_id: `${taxon.id}`,
      place_id: `2`,
      project_id: "3",
      user_id: "4",
      ident_user_id: "5",
      unobserved_by_user_id: 6,
      viewer_id: 7,
      annotation_user_id: "8",
      not_in_project: "9",
      without_taxon_id: "10",
    };

    let results = (await fetchiNatMapDataForTaxon(
      taxon,
      store,
    )) as unknown as ObservationTilesSettingType[];

    expect(results.length).toBe(4);
    expect(store.map.activeLayers.size).toBe(1);
    expect(
      store.map.activeLayers.has(
        `overlay: iNat grid, taxon_id ${taxon.id}, ` +
          `place_id 2, project_id 3, user_id 4, ident_user_id 5,` +
          ` unobserved_by_user_id 6, viewer_id 7, annotation_user_id 8,` +
          ` not_in_project 9, without_taxon_id 10`,
      ),
    ).toStrictEqual(true);
  });

  test("when adding second layer, add grid layer to activeLayer", async () => {
    let taxon1 = redOak();
    let taxon2 = monarch();
    let layerName1 = `overlay: iNat points, taxon_id ${taxon1.id}`;
    let { store } = setupMapAndStore();
    store.map.activeLayers.add(layerName1);

    store.observationsApiParams = { taxon_id: `${taxon1.id},${taxon2.id}` };

    (await fetchiNatMapDataForTaxon(
      taxon1,
      store,
    )) as unknown as ObservationTilesSettingType[];
    (await fetchiNatMapDataForTaxon(
      taxon2,
      store,
    )) as unknown as ObservationTilesSettingType[];

    expect(store.map.activeLayers.size).toBe(2);
    expect(store.map.activeLayers.has(layerName1)).toStrictEqual(true);
    expect(
      store.map.activeLayers.has(`overlay: iNat grid, taxon_id ${taxon2.id}`),
    ).toStrictEqual(true);
    expect(leafletControlLayers(store)).toStrictEqual([
      "Open Street Map",
      "Red Oaks Grid",
      "Red Oaks Points",
      "Red Oaks Heatmap",
      "Red Oaks Taxon Range",
      "Monarch Grid",
      "Monarch Points",
      "Monarch Heatmap",
      "Monarch Taxon Range",
    ]);
    expect(leafletMapLayers(store, "control_name")).toStrictEqual([
      "Open Street Map",
      "Red Oaks Points",
      "Monarch Grid",
    ]);
  });

  test("when adding grid layer with non-taxa resource, add related layer to activeLayer, remove prevoius layer", async () => {
    let taxon1 = redOak();

    let { store } = setupMapAndStore();
    store.observationsApiParams = {
      taxon_id: `${taxon1.id} `,
    };

    (await fetchiNatMapDataForTaxon(
      taxon1,
      store,
    )) as unknown as ObservationTilesSettingType[];

    expect(store.map.activeLayers.size).toBe(1);
    let expected1 = `overlay: iNat grid, taxon_id ${taxon1.id}`;
    expect(store.map.activeLayers.has(expected1)).toStrictEqual(true);

    store.observationsApiParams = {
      taxon_id: `${taxon1.id} `,
      user_id: "1",
    };

    (await fetchiNatMapDataForTaxon(
      taxon1,
      store,
    )) as unknown as ObservationTilesSettingType[];

    expect(store.map.activeLayers.size).toBe(1);
    let expected2 = `overlay: iNat grid, taxon_id ${taxon1.id}, user_id 1`;
    expect(store.map.activeLayers.has(expected2)).toStrictEqual(true);

    store.observationsApiParams = {
      taxon_id: `${taxon1.id} `,
      user_id: "1",
      place_id: "10",
    };
    clearMapTaxaLayers(store);

    (await fetchiNatMapDataForTaxon(
      taxon1,
      store,
    )) as unknown as ObservationTilesSettingType[];

    expect(store.map.activeLayers.size).toBe(1);
    let expected3 = `overlay: iNat grid, taxon_id ${taxon1.id}, place_id 10, user_id 1`;
    expect(store.map.activeLayers.has(expected3)).toStrictEqual(true);
    expect(leafletControlLayers(store)).toStrictEqual([
      "Open Street Map",
      "Red Oaks Grid",
      "Red Oaks Points",
      "Red Oaks Heatmap",
      "Red Oaks Taxon Range",
    ]);
    expect(leafletMapLayers(store, "control_name")).toStrictEqual([
      "Open Street Map",
      "Red Oaks Grid",
    ]);
  });

  test("when adding layer with non-taxa resource, add related layer to activeLayer, remove prevoius layer", async () => {
    let taxon1 = redOak();

    let { store } = setupMapAndStore();
    store.map.activeLayers.add(`overlay: iNat points, taxon_id ${taxon1.id}`);

    store.observationsApiParams = {
      taxon_id: `${taxon1.id} `,
      user_id: "1",
    };

    (await fetchiNatMapDataForTaxon(
      taxon1,
      store,
    )) as unknown as ObservationTilesSettingType[];

    expect(store.map.activeLayers.size).toBe(1);
    let expected1 = `overlay: iNat points, taxon_id ${taxon1.id}, user_id 1`;
    expect(store.map.activeLayers.has(expected1)).toStrictEqual(true);

    store.observationsApiParams = {
      taxon_id: `${taxon1.id} `,
      user_id: "1",
      place_id: "10",
    };
    clearMapTaxaLayers(store);

    (await fetchiNatMapDataForTaxon(
      taxon1,
      store,
    )) as unknown as ObservationTilesSettingType[];

    expect(store.map.activeLayers.size).toBe(1);
    let expected2 = `overlay: iNat points, taxon_id ${taxon1.id}, place_id 10, user_id 1`;
    expect(store.map.activeLayers.has(expected2)).toStrictEqual(true);
    expect(leafletControlLayers(store)).toStrictEqual([
      "Open Street Map",
      "Red Oaks Grid",
      "Red Oaks Points",
      "Red Oaks Heatmap",
      "Red Oaks Taxon Range",
    ]);
    expect(leafletMapLayers(store, "control_name")).toStrictEqual([
      "Open Street Map",
      "Red Oaks Points",
    ]);
  });

  test("when adding multiple taxon layers with non-taxa resource, add related layer to activeLayer, remove prevoius layer", async () => {
    let taxon1 = redOak();
    let taxon2 = monarch();

    let { store } = setupMapAndStore();
    store.map.activeLayers.add(`overlay: iNat points, taxon_id ${taxon1.id}`);
    store.map.activeLayers.add(`overlay: iNat grid, taxon_id ${taxon2.id}`);

    store.observationsApiParams = {
      taxon_id: `${taxon1.id},${taxon2.id}`,
      user_id: "1",
    };

    (await fetchiNatMapDataForTaxon(
      taxon1,
      store,
    )) as unknown as ObservationTilesSettingType[];
    (await fetchiNatMapDataForTaxon(
      taxon2,
      store,
    )) as unknown as ObservationTilesSettingType[];

    expect(store.map.activeLayers.size).toBe(2);
    expect(
      store.map.activeLayers.has(
        `overlay: iNat points, taxon_id ${taxon1.id}, user_id 1`,
      ),
    ).toStrictEqual(true);
    expect(
      store.map.activeLayers.has(
        `overlay: iNat grid, taxon_id ${taxon2.id}, user_id 1`,
      ),
    ).toStrictEqual(true);

    store.observationsApiParams = {
      taxon_id: `${taxon1.id},${taxon2.id}`,
      user_id: "1",
      place_id: "10",
    };
    clearMapTaxaLayers(store);

    (await fetchiNatMapDataForTaxon(
      taxon1,
      store,
    )) as unknown as ObservationTilesSettingType[];
    (await fetchiNatMapDataForTaxon(
      taxon2,
      store,
    )) as unknown as ObservationTilesSettingType[];

    expect(store.map.activeLayers.size).toBe(2);
    expect(
      store.map.activeLayers.has(
        `overlay: iNat points, taxon_id ${taxon1.id}, place_id 10, user_id 1`,
      ),
    ).toStrictEqual(true);
    expect(
      store.map.activeLayers.has(
        `overlay: iNat grid, taxon_id ${taxon2.id}, place_id 10, user_id 1`,
      ),
    ).toStrictEqual(true);
    expect(leafletControlLayers(store)).toStrictEqual([
      "Open Street Map",
      "Red Oaks Grid",
      "Red Oaks Points",
      "Red Oaks Heatmap",
      "Red Oaks Taxon Range",
      "Monarch Grid",
      "Monarch Points",
      "Monarch Heatmap",
      "Monarch Taxon Range",
    ]);
    expect(leafletMapLayers(store, "control_name")).toStrictEqual([
      "Open Street Map",
      "Red Oaks Points",
      "Monarch Grid",
    ]);
  });
});
