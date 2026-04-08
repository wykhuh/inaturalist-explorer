// @vitest-environment jsdom

import { expect, test, describe } from "vitest";

import { removePopularFieldsForTaxon } from "../lib/search_taxa";
import { mapStore } from "../lib/store";
import { monarchBasic, redOak } from "./test_helpers";

describe("removePopularFieldsForTaxon", () => {
  test("remove corresponding popular fields for a given taxon", () => {
    let store = structuredClone(mapStore);
    let oak = redOak();
    store.selectedTaxa = [oak];
    store.viewMetadata.popularFieldsByTaxa = {
      12: { [oak.id]: true },
      9: { [oak.id]: true },
    };

    removePopularFieldsForTaxon(store, oak.id);

    expect(store.viewMetadata.popularFieldsByTaxa).toStrictEqual({});
  });

  test("ignore popular fields for other taxa", () => {
    let store = structuredClone(mapStore);
    let oak = redOak();

    store.selectedTaxa = [oak, monarchBasic];
    store.viewMetadata.popularFieldsByTaxa = {
      12: { [oak.id]: true },
      1: { [monarchBasic.id]: true },
      9: { [oak.id]: true, [monarchBasic.id]: true },
    };

    removePopularFieldsForTaxon(store, oak.id);

    expect(store.viewMetadata.popularFieldsByTaxa).toStrictEqual({
      1: { [monarchBasic.id]: true },
      9: { [monarchBasic.id]: true },
    });
  });
});
