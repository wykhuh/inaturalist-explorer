// @vitest-environment jsdom

import { describe, expect, test } from "vitest";
import { buckwheatTaxonomy } from "../../../data/inat_api_cache";
import { getSubspeciesIds } from "../../../components/ViewSpecies/utils";

describe("getSubspeciesIds", () => {
  test("returns map with subspecies id and sorted count, and array of ids", () => {
    let data = buckwheatTaxonomy.results;
    let expected = new Map();
    expected.set(80863, 67);
    expected.set(80865, 34);
    expected.set(80851, 1);

    let results = getSubspeciesIds(data);

    expect(results.taxaIdCount).toStrictEqual(expected);
    expect(results.subspeciesIds).toStrictEqual([80863, 80865, 80851]);
  });
});
