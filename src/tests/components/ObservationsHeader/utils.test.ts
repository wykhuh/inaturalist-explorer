// @vitest-environment jsdom

import {
  expect,
  test,
  describe,
  beforeAll,
  afterAll,
  afterEach,
  beforeEach,
} from "vitest";
import jsdom from "jsdom";

import { mapStore } from "../../../lib/store";
import {
  createMockServer,
  defaultQuery,
  defaultParams,
} from "../../test_helpers";
import {
  createHeaderCountHash,
  updateHeaderCount,
  updateView,
} from "../../../components/ObservationsHeader/shared_utils";
import { template } from "../../../components/ObservationsHeader/template";
import type { ObservationViewsType } from "../../../types/app";
import { viewAndTemplateObject } from "../../../data/app_data";

const server = createMockServer();

beforeAll(() => {
  server.listen();
});
afterEach(() => {
  server.resetHandlers();
  // window.location.search = "xxx";
});
afterAll(() => {
  server.close();
});
beforeEach(() => {
  const { JSDOM } = jsdom;

  let dom = new JSDOM(
    `<!doctype html>
<html lang="en">
  <body>
      ${template}
      <div id="view-container">demo</div>
  </body>
</html>`,
  );

  global.document = dom.window.document;
});

describe("updateView", () => {
  test.each([
    "observations_species",
    "observations_identifiers",
    "observations_observers",
  ] as ObservationViewsType[])(
    "update store, sets currentView class, adds template tag, update url",
    (view) => {
      const store = structuredClone(mapStore);
      let template = viewAndTemplateObject(view);
      let perPage = store.viewMetadata[view].perPage;

      let parentEl = document.querySelector(
        "#view-container",
      ) as HTMLDivElement;
      let targetLI = document.querySelector(`#${view}`);
      let oldLI = document.querySelector("#observations_observations");

      // expect(oldLI?.className).toBe("currentView");
      expect(targetLI?.className).toBe("");
      // expect(parentEl?.innerHTML).toBe("demo");
      expect(store.currentView).toBe("observations_observations");

      updateView(view as any, parentEl, store, document as any);

      expect(oldLI?.className).toBe("");
      expect(targetLI?.className).toBe("currentView");
      expect(parentEl?.innerHTML).toBe(`<${template}></${template}>`);
      expect(store.currentView).toBe(view);
      expect(store.observationsApiParams).toStrictEqual({
        ...defaultParams,
        per_page: perPage,
      });
      expect(window.location.search).toBe(
        `?${defaultQuery}&per_page=${perPage}&view=${view}`,
      );
    },
  );

  test("uses viewMetadata to set page, order, order_by if viewMetadata is set", () => {
    const store = structuredClone(mapStore);
    store.currentView = "observations_observations";
    store.viewMetadata.observations_observations = {};
    store.viewMetadata.observations_observers = {
      page: 10,
      order_by: "votes",
      order: "asc",
    };

    let parentEl = document.querySelector("#view-container") as HTMLDivElement;
    let targetLI = document.querySelector("#observations_observers");

    expect(targetLI?.className).toBe("");
    expect(parentEl?.innerHTML).toBe("demo");
    expect(store.currentView).toBe("observations_observations");

    updateView("observations_observers", parentEl, store, document as any);

    expect(targetLI?.className).toBe("currentView");
    expect(parentEl?.innerHTML).toBe("<view-observers></view-observers>");
    expect(store.currentView).toBe("observations_observers");
    expect(store.observationsApiParams).toStrictEqual({
      page: 10,
      order: "asc",
      order_by: "votes",
      ...defaultParams,
    });
    expect(window.location.search).toBe(
      `?${defaultQuery}&page=10&order=asc` +
        "&order_by=votes&view=observations_observers",
    );
  });

  test("uses viewMetadata to set page, order, order_by if viewMetadata is set", () => {
    const store = structuredClone(mapStore);
    store.currentView = "observations_observations";
    store.viewMetadata.observations_observations = {
      page: 10,
      order_by: "votes",
      order: "asc",
    };
    store.viewMetadata.observations_observers = {};

    let parentEl = document.querySelector("#view-container") as HTMLDivElement;
    let targetLI = document.querySelector("#observations_observers");

    expect(targetLI?.className).toBe("");
    expect(parentEl?.innerHTML).toBe("demo");
    expect(store.currentView).toBe("observations_observations");

    updateView("observations_observers", parentEl, store, document as any);

    expect(targetLI?.className).toBe("currentView");
    expect(parentEl?.innerHTML).toBe("<view-observers></view-observers>");
    expect(store.currentView).toBe("observations_observers");
    expect(store.observationsApiParams).toStrictEqual(defaultParams);
    expect(window.location.search).toBe(
      `?${defaultQuery}&view=observations_observers`,
    );
  });
});

describe("createHeaderCountHash", () => {
  let expectedHash =
    "3a50ee7ae6026e64c15ce76b50558435d6c8960343d435f807d2b4d722f5288a";
  let countLabel: ObservationViewsType = "observations_observations";

  test("creates hash using given countLabel and search parans", async () => {
    let params = "?id=1";
    let params2 = "?id=10";

    let results1 = await createHeaderCountHash(countLabel, params);
    let results2 = await createHeaderCountHash(countLabel, params);
    let results3 = await createHeaderCountHash(countLabel, params2);

    expect(results1).toEqual(expectedHash);
    expect(results1).toEqual(results2);
    expect(results2).not.toEqual(results3);
  });

  test("ignores colors params when creating hash", async () => {
    let params = "?id=1&colors=red";

    let results = await createHeaderCountHash(countLabel, params);

    expect(results).toEqual(expectedHash);
  });

  test("ignores view params when creating hash", async () => {
    let params = "?id=1&view=observations";

    let results = await createHeaderCountHash(countLabel, params);

    expect(results).toEqual(expectedHash);
  });

  test("ignores subview params when creating hash", async () => {
    let params = "?id=1&subview=grid";

    let results = await createHeaderCountHash(countLabel, params);

    expect(results).toEqual(expectedHash);
  });
});

describe("updateHeaderCount", () => {
  function getRecords(value: number) {
    return { total_results: value };
  }

  let hash1 =
    "3a50ee7ae6026e64c15ce76b50558435d6c8960343d435f807d2b4d722f5288a";
  let hash2 =
    "4157a0a5913c8893e08b9b90e0c3208debd9ede75a71d944680b61e01d4ec46b";
  let hash3 =
    "06217bb9ea07f2eb7d390936a5bbc87f3adff1504f07f1f9fb112eca5bf519a7";

  test(
    "fetches record, creates hash, saves hash to iNatStats.headerCountsIndex" +
      "and saves hash and total_results to iNatStats.headerCounts",
    async () => {
      let store = structuredClone(mapStore);

      let countLabel: ObservationViewsType = "observations_observations";
      let params1 = "?id=1";
      let params2 = "?id=2";

      await updateHeaderCount(countLabel, () => getRecords(10), params1, store);

      expect(store.iNatStats.headerCountsIndex).toStrictEqual([hash1]);
      expect(store.iNatStats.headerCounts.get(hash1)).toStrictEqual(10);

      await updateHeaderCount(countLabel, () => getRecords(20), params2, store);

      expect(store.iNatStats.headerCountsIndex).toStrictEqual([hash1, hash2]);
      expect(store.iNatStats.headerCounts.get(hash1)).toStrictEqual(10);
      expect(store.iNatStats.headerCounts.get(hash2)).toStrictEqual(20);
    },
  );

  test("delete first item in headerCountsIndex and headerCounts if cache size > maxCacheSize", async () => {
    let store = structuredClone(mapStore);

    let countLabel: ObservationViewsType = "observations_observations";
    let params1 = "?id=1";
    let params2 = "?id=2";
    let params3 = "?id=3";
    let tooltip = null;
    let perPage = 0;
    let maxSize = 2;

    await updateHeaderCount(
      countLabel,
      () => getRecords(10),
      params1,
      store,
      tooltip,
      perPage,
      maxSize,
    ).then(() => {
      expect(store.iNatStats.headerCountsIndex).toStrictEqual([hash1]);
      expect(store.iNatStats.headerCounts.get(hash1)).toStrictEqual(10);
    });

    await updateHeaderCount(
      countLabel,
      () => getRecords(20),
      params2,
      store,
      tooltip,
      perPage,
      maxSize,
    );

    expect(store.iNatStats.headerCountsIndex).toStrictEqual([hash1, hash2]);
    expect(store.iNatStats.headerCounts.get(hash1)).toStrictEqual(10);
    expect(store.iNatStats.headerCounts.get(hash2)).toStrictEqual(20);

    await updateHeaderCount(
      countLabel,
      () => getRecords(30),
      params3,
      store,
      tooltip,
      perPage,
      maxSize,
    );

    expect(store.iNatStats.headerCountsIndex).toStrictEqual([hash2, hash3]);
    expect(store.iNatStats.headerCounts.get(hash2)).toStrictEqual(20);
    expect(store.iNatStats.headerCounts.get(hash3)).toStrictEqual(30);
  });
});
