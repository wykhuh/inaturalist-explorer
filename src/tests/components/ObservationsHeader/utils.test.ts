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
import { updateView } from "../../../components/ObservationsHeader/shared_utils";
import { template } from "../../../components/ObservationsHeader/template";
import type { ObservationViews } from "../../../types/app";
import { viewAndTemplateObject } from "../../../data/app_data";

const server = createMockServer();

beforeAll(() => {
  server.listen();
});
afterEach(() => {
  server.resetHandlers();
  window.location.search = "xxx";
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
  ] as ObservationViews[])(
    "update store, sets currentView class, adds template tag, update url",
    (view) => {
      const store = structuredClone(mapStore);
      let template = viewAndTemplateObject(view);

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
      expect(store.observationsApiParams).toStrictEqual(defaultParams);
      expect(window.location.search).toBe(`?${defaultQuery}&view=${view}`);
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
