// @vitest-environment jsdom

import { expect, test, describe, afterEach } from "vitest";

import { perPageHandler } from "../../../components/MenuSettings/utils";
import { mapStore } from "../../../lib/store";
import type { ObservationViewsType, PerPageTypes } from "../../../types/app";
import { beforeEach } from "node:test";

describe("perPageHandler", () => {
  afterEach(() => {
    localStorage.clear();
  });
  beforeEach(() => {
    localStorage.clear();
  });

  test.each([
    { type: "observations", view: "observations_observations" },
    { type: "species", view: "observations_species" },
  ])("set per page if current view and type are the same", (params) => {
    let store = structuredClone(mapStore);
    let inputEl = document.createElement("input");
    inputEl.value = "4";
    let currentView = params.view as ObservationViewsType;
    let type = params.type as PerPageTypes;

    perPageHandler(inputEl, currentView, store, type);

    expect(store.observationsApiParams.per_page).toBe(4);
    expect(
      store.viewMetadata[params.view as ObservationViewsType].perPage,
    ).toBe(4);

    expect(localStorage.getItem(`per_page_${type}`)).toBe('"4"');
    expect(window.location.search).toBe(
      `?verifiable=true&spam=false&per_page=4`,
    );
  });

  test.each([
    {
      type: "observations",
      view: "observations_species",
      other_view: "observations_observations",
    },
    {
      type: "species",
      view: "observations_observations",
      other_view: "observations_species",
    },
  ])("set per page if current view and type are different", (params) => {
    let store = structuredClone(mapStore);
    let inputEl = document.createElement("input");
    inputEl.value = "3";
    let currentView = params.view as ObservationViewsType;
    let type = params.type as PerPageTypes;

    perPageHandler(inputEl, currentView, store, type);

    expect(store.observationsApiParams.per_page).toBe(undefined);
    expect(
      store.viewMetadata[params.other_view as ObservationViewsType].perPage,
    ).toBe(3);

    expect(localStorage.getItem(`per_page_${type}`)).toBe('"3"');
    expect(window.location.search).toBe(``);
  });
});
