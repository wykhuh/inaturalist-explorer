// @vitest-environment jsdom

import { expect, test, describe } from "vitest";
import { updateStoreUsingFilters } from "../../lib/data_utils.ts";
import { mapStore } from "../../lib/store.ts";
import { processFiltersForm } from "../../components/ObservationsFilters/utils.ts";
import { defaultParams } from "../test_helpers.ts";

describe("updating observation filters", () => {
  function createFormData() {
    const formData = new FormData();
    return formData;
  }

  test("form is in default state", () => {
    let store = structuredClone(mapStore);
    let formData = createFormData();

    expect(store.observationsApiParams).toStrictEqual(defaultParams);

    formData.append("verifiable", "true");

    let filterResults = processFiltersForm(formData);

    expect(filterResults).toStrictEqual({
      params: { verifiable: true },
      string: "verifiable=true",
    });

    updateStoreUsingFilters(store, filterResults);

    expect(store.observationsApiParams).toStrictEqual(defaultParams);
    expect(store.formFilters).toStrictEqual(filterResults);
  });

  test(`verifiable remains true, set iconic_taxa to Aves,Fungi; uncheck iconic_taxa Aves`, () => {
    let store = structuredClone(mapStore);
    let formData = createFormData();

    formData.append("verifiable", "true");
    formData.append("iconic_taxa", "Aves,Fungi");

    let filterResults1 = processFiltersForm(formData);

    expect(filterResults1).toStrictEqual({
      params: { verifiable: true, iconic_taxa: "Aves,Fungi" },
      string: "verifiable=true&iconic_taxa=Aves,Fungi",
    });

    updateStoreUsingFilters(store, filterResults1);

    expect(store.observationsApiParams).toStrictEqual({
      iconic_taxa: "Aves,Fungi",
      ...defaultParams,
    });

    formData.delete("iconic_taxa");
    formData.append("iconic_taxa", "Fungi");

    let filterResults2 = processFiltersForm(formData);

    expect(filterResults2).toStrictEqual({
      params: { verifiable: true, iconic_taxa: "Fungi" },
      string: "verifiable=true&iconic_taxa=Fungi",
    });

    updateStoreUsingFilters(store, filterResults2);

    expect(store.observationsApiParams).toStrictEqual({
      iconic_taxa: "Fungi",
      ...defaultParams,
    });
  });

  test(`verifiable remains true, set sounds to true; set sounds to false; set sounds to blank`, () => {
    let store = structuredClone(mapStore);
    let formData = createFormData();

    formData.append("verifiable", "true");
    formData.append("sounds", "true");

    let filterResults1 = processFiltersForm(formData);

    expect(filterResults1).toStrictEqual({
      params: { verifiable: true, sounds: true },
      string: "verifiable=true&sounds=true",
    });

    updateStoreUsingFilters(store, filterResults1);

    expect(store.observationsApiParams).toStrictEqual({
      sounds: true,
      ...defaultParams,
    });

    formData.append("sounds", "false");

    let filterResults2 = processFiltersForm(formData);

    expect(filterResults2).toStrictEqual({
      params: { verifiable: true, sounds: false },
      string: "verifiable=true&sounds=false",
    });

    updateStoreUsingFilters(store, filterResults2);

    expect(store.observationsApiParams).toStrictEqual({
      sounds: false,
      ...defaultParams,
    });

    formData.append("sounds", "");

    let filterResults3 = processFiltersForm(formData);

    expect(filterResults3).toStrictEqual({
      params: { verifiable: true },
      string: "verifiable=true",
    });

    updateStoreUsingFilters(store, filterResults3);

    expect(store.observationsApiParams).toStrictEqual(defaultParams);
  });

  test(`set verifiable false; set verifiable to blank; set verifiable false;`, () => {
    let store = structuredClone(mapStore);
    let formData = createFormData();

    expect(store.observationsApiParams).toStrictEqual(defaultParams);

    formData.append("verifiable", "false");

    let filterResults1 = processFiltersForm(formData);

    expect(filterResults1).toStrictEqual({
      params: { verifiable: false },
      string: "verifiable=false",
    });

    updateStoreUsingFilters(store, filterResults1);

    expect(store.observationsApiParams).toStrictEqual({
      verifiable: false,
      spam: false,
      locale: "en",
    });

    formData.append("verifiable", "");

    let filterResults2 = processFiltersForm(formData);

    expect(filterResults2).toStrictEqual({
      params: {},
      string: "",
    });

    updateStoreUsingFilters(store, filterResults2);

    expect(store.observationsApiParams).toStrictEqual({
      spam: false,
      locale: "en",
    });

    formData.append("verifiable", "true");

    let filterResults3 = processFiltersForm(formData);

    expect(filterResults3).toStrictEqual({
      params: { verifiable: true },
      string: "verifiable=true",
    });

    updateStoreUsingFilters(store, filterResults3);

    expect(store.observationsApiParams).toStrictEqual(defaultParams);

    expect(store.formFilters).toStrictEqual(filterResults3);
  });
});
