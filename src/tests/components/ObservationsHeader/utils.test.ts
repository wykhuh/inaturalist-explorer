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
import { createMockServer } from "../../test_helpers";
import { updateView } from "../../../components/ObservationsHeader/utils";

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
      <ul>
        <li id="observations" class="currentView">
          <span class="observations-count">&nbsp;</span
          ><span>Observations</span>
        </li>
        <li id="species">
          <span class="species-count">&nbsp;</span><span>Species</span>
        </li>
        <li id="identifiers">
          <span class="identifiers-count">&nbsp;</span><span>Identifiers</span>
        </li>
        <li id="observers">
          <span class="observers-count">&nbsp;</span><span>Observers</span>
        </li>
      </ul>
      <div>demo</div>
  </body>
</html>`,
  );
  global.document = dom.window.document;
});

describe("updateView", () => {
  test.each(["species", "identifiers", "observers"])(
    "update store, sets currentView class, adds template tag, update url",
    (view) => {
      const store = structuredClone(mapStore);

      let parentEl = document.querySelector("div") as HTMLDivElement;
      let targetLI = document.querySelector(`#${view}`);
      let oldLI = document.querySelector("#observations");

      expect(oldLI?.className).toBe("currentView");
      expect(targetLI?.className).toBe("");
      expect(parentEl?.innerHTML).toBe("demo");
      expect(store.currentView).toBe("observations");

      updateView(view as any, parentEl, store, document as any);

      expect(oldLI?.className).toBe("");
      expect(targetLI?.className).toBe("currentView");
      expect(parentEl?.innerHTML).toBe(`<x-view-${view}></x-view-${view}>`);
      expect(store.currentView).toBe(view);
      expect(store.inatApiParams).toStrictEqual({
        spam: false,
        verifiable: true,
      });
      expect(window.location.search).toBe(
        `?verifiable=true&spam=false&view=${view}`,
      );
    },
  );

  test("uses viewMetadata to set page, order, order_by if viewMetadata is set", () => {
    const store = structuredClone(mapStore);
    store.currentView = "observations";
    store.viewMetadata.observations = {};
    store.viewMetadata.observers = {
      page: 10,
      order_by: "votes",
      order: "asc",
    };

    let parentEl = document.querySelector("div") as HTMLDivElement;
    let targetLI = document.querySelector("#observers");
    let oldLI = document.querySelector("#observations");

    expect(oldLI?.className).toBe("currentView");
    expect(targetLI?.className).toBe("");
    expect(parentEl?.innerHTML).toBe("demo");
    expect(store.currentView).toBe("observations");

    updateView("observers", parentEl, store, document as any);

    expect(oldLI?.className).toBe("");
    expect(targetLI?.className).toBe("currentView");
    expect(parentEl?.innerHTML).toBe("<x-view-observers></x-view-observers>");
    expect(store.currentView).toBe("observers");
    expect(store.inatApiParams).toStrictEqual({
      spam: false,
      verifiable: true,
      page: 10,
      order: "asc",
      order_by: "votes",
    });
    expect(window.location.search).toBe(
      "?verifiable=true&spam=false&page=10&order=asc" +
        "&order_by=votes&view=observers",
    );
  });

  test("uses viewMetadata to set page, order, order_by if viewMetadata is set", () => {
    const store = structuredClone(mapStore);
    store.currentView = "observations";
    store.viewMetadata.observations = {
      page: 10,
      order_by: "votes",
      order: "asc",
    };
    store.viewMetadata.observers = {};

    let parentEl = document.querySelector("div") as HTMLDivElement;
    let targetLI = document.querySelector("#observers");
    let oldLI = document.querySelector("#observations");

    expect(oldLI?.className).toBe("currentView");
    expect(targetLI?.className).toBe("");
    expect(parentEl?.innerHTML).toBe("demo");
    expect(store.currentView).toBe("observations");

    updateView("observers", parentEl, store, document as any);

    expect(oldLI?.className).toBe("");
    expect(targetLI?.className).toBe("currentView");
    expect(parentEl?.innerHTML).toBe("<x-view-observers></x-view-observers>");
    expect(store.currentView).toBe("observers");
    expect(store.inatApiParams).toStrictEqual({
      spam: false,
      verifiable: true,
    });
    expect(window.location.search).toBe(
      "?verifiable=true&spam=false&view=observers",
    );
  });
});
