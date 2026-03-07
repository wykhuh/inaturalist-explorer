// @vitest-environment jsdom

import { expect, test, describe } from "vitest";

import { mapStore } from "../../../lib/store";
import {
  formatPopularFields,
  formatPopularFieldsOptions,
} from "../../../components/ViewObservations/utils";
import {
  popular_fields_basic_milkweed,
  popular_fields_basic_monarch,
  popular_fields_milkweed,
  popular_fields_monarch,
  processedPopularFields,
} from "../../../data/api/popular_fields";
import { milkweedBasic, monarchBasic } from "../../test_helpers";
import { formatTaxonName } from "../../../lib/data_utils";
import type { NormalizedPopularFields } from "../../../types/app";

describe("formatPopularFieldsOptions", () => {
  test("takes popular fields api and returns array of label and id", () => {
    let results = formatPopularFieldsOptions([
      popular_fields_basic_milkweed,
      popular_fields_basic_monarch,
    ]);

    let expected = [
      { id: 12, label: "Flowers and Fruits" },
      { id: 36, label: "Leaves" },
      { id: 9, label: "Sex" },
      { id: 1, label: "Life Stage" },
      { id: 17, label: "Alive or Dead" },
      { id: 22, label: "Evidence of Presence" },
    ];

    expect(results).toStrictEqual(expected);
  });
});

describe("formatPopularFields", () => {
  test("takes popular fields api and returns object", () => {
    let store = structuredClone(mapStore);

    let names1 = formatTaxonName(milkweedBasic, store);
    let milkweed = structuredClone(
      popular_fields_milkweed,
    ) as NormalizedPopularFields;
    milkweed.taxon_id = milkweedBasic.id;
    milkweed.taxon_name = `${names1.title} (${names1.subtitle})`;

    let names2 = formatTaxonName(monarchBasic, store);
    let monarch = structuredClone(
      popular_fields_monarch,
    ) as NormalizedPopularFields;
    monarch.taxon_id = monarchBasic.id;
    monarch.taxon_name = `${names2.title} (${names2.subtitle})`;

    let results = formatPopularFields([milkweed, monarch]);

    expect(results).toStrictEqual(processedPopularFields);
  });
});
