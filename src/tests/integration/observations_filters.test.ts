// @vitest-environment jsdom

import { expect, test, describe } from "vitest";
import { updateStoreUsingFilters } from "../../lib/data_utils.ts";
import type { MapStore } from "../../types/app.d.ts";
import { mapStore } from "../../lib/store.ts";
import { processFiltersForm } from "../../components/ObservationsFilters/utils.ts";

describe("updating observation filters", () => {
  function createFormData() {
    const formData = new FormData();
    return formData;
  }
  let defaultInatApiParams = {
    verifiable: true,
    spam: false,
  };

  test("form is in default state", () => {
    let store = structuredClone(mapStore);
    let formData = createFormData();

    expect(store.inatApiParams).toStrictEqual(defaultInatApiParams);

    formData.append("verifiable", "true");

    let filterResults = processFiltersForm(formData);

    expect(filterResults).toStrictEqual({
      params: { verifiable: true },
      string: "verifiable=true",
    });

    updateStoreUsingFilters(store, filterResults);

    expect(store.inatApiParams).toStrictEqual(defaultInatApiParams);
    expect(store.formFilters).toStrictEqual(filterResults);
  });

  test("verifiable remains checked, set iconic_taxa to Aves", () => {
    let store = structuredClone(mapStore);
    let formData = createFormData();

    expect(store.inatApiParams).toStrictEqual(defaultInatApiParams);

    formData.append("verifiable", "true");
    formData.append("iconic_taxa", "Aves");

    let filterResults = processFiltersForm(formData);

    expect(filterResults).toStrictEqual({
      params: { iconic_taxa: "Aves", verifiable: true },
      string: "verifiable=true&iconic_taxa=Aves",
    });

    updateStoreUsingFilters(store, filterResults);

    expect(store.inatApiParams).toStrictEqual({
      verifiable: true,
      spam: false,
      iconic_taxa: "Aves",
    });
    expect(store.formFilters).toStrictEqual(filterResults);
  });

  test(`verifiable remains checked, check iconic_taxa Aves; uncheck iconic_taxa Aves`, () => {
    let store = structuredClone(mapStore);
    let formData = createFormData();

    formData.append("verifiable", "true");
    formData.append("iconic_taxa", "Aves");

    let filterResults1 = processFiltersForm(formData);

    expect(filterResults1).toStrictEqual({
      params: { verifiable: true, iconic_taxa: "Aves" },
      string: "verifiable=true&iconic_taxa=Aves",
    });

    updateStoreUsingFilters(store, filterResults1);

    expect(store.inatApiParams).toStrictEqual({
      verifiable: true,
      spam: false,
      iconic_taxa: "Aves",
    });

    formData.delete("iconic_taxa");

    let filterResults2 = processFiltersForm(formData);

    expect(filterResults2).toStrictEqual({
      params: { verifiable: true },
      string: "verifiable=true",
    });

    updateStoreUsingFilters(store, filterResults2);

    expect(store.inatApiParams).toStrictEqual({
      verifiable: true,
      spam: false,
    });
  });

  test(`verifiable remains checked, set sounds to true; set sounds to false; set sounds to blank`, () => {
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

    expect(store.inatApiParams).toStrictEqual({
      verifiable: true,
      spam: false,
      sounds: true,
    });

    formData.append("sounds", "false");

    let filterResults2 = processFiltersForm(formData);

    expect(filterResults2).toStrictEqual({
      params: { verifiable: true, sounds: false },
      string: "verifiable=true&sounds=false",
    });

    updateStoreUsingFilters(store, filterResults2);

    expect(store.inatApiParams).toStrictEqual({
      verifiable: true,
      spam: false,
      sounds: false,
    });

    formData.append("sounds", "");

    let filterResults3 = processFiltersForm(formData);

    expect(filterResults3).toStrictEqual({
      params: { verifiable: true },
      string: "verifiable=true",
    });

    updateStoreUsingFilters(store, filterResults3);

    expect(store.inatApiParams).toStrictEqual({
      verifiable: true,
      spam: false,
    });
  });

  test(`uncheck verifiable, check spam; check verifiable, uncheck spam`, () => {
    let store = structuredClone(mapStore);
    let formData = createFormData();

    expect(store.inatApiParams).toStrictEqual(defaultInatApiParams);

    formData.append("spam", "true");

    let filterResults1 = processFiltersForm(formData);

    expect(filterResults1).toStrictEqual({
      params: { spam: true },
      string: "spam=true",
    });

    updateStoreUsingFilters(store, filterResults1);

    expect(store.inatApiParams).toStrictEqual({
      spam: true,
    });

    formData.append("verifiable", "true");
    formData.delete("spam");

    let filterResults2 = processFiltersForm(formData);

    expect(filterResults2).toStrictEqual({
      params: { verifiable: true },
      string: "verifiable=true",
    });

    updateStoreUsingFilters(store, filterResults2);

    expect(store.inatApiParams).toStrictEqual({
      verifiable: true,
      spam: false,
    });
    expect(store.formFilters).toStrictEqual(filterResults2);
  });
});
