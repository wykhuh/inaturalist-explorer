// @vitest-environment jsdom

import { expect, test, describe } from "vitest";
import { formatTaxonName } from "../lib/data_utils.ts";

describe("formatTaxonName", () => {
  describe("query matches common name", () => {
    test("returns object with name data", () => {
      let query = "red";
      let data = {
        name: "Buteo jamaicensis",
        default_photo: "https://inat.com/photos/101327658/square.jpg",
        preferred_common_name: "Red-tailed Hawk",
        matched_term: "Redtail",
        rank: "species",
        id: 5212,
      };
      let expected = {
        hasCommonName: true,
        subtitle: "Buteo jamaicensis",
        subtitleAriaLabel: "taxon scientific name",
        title: "Red-tailed Hawk",
        titleAriaLabel: "taxon common name",
      };

      let results = formatTaxonName(data, query);

      expect(results).toStrictEqual(expected);
    });
  });

  describe("query matches scientific name", () => {
    test("returns object with name data", () => {
      let query = "Canis";
      let data = {
        name: "Canis familiaris",
        default_photo: "https://inat.com/photos/117465258/square.jpg",
        preferred_common_name: "Domestic Dog",
        matched_term: "Canis",
        rank: "species",
        id: 47144,
      };
      let expected = {
        hasCommonName: true,
        subtitle: "Canis familiaris",
        subtitleAriaLabel: "taxon scientific name",
        title: "Domestic Dog",
        titleAriaLabel: "taxon common name",
      };

      let results = formatTaxonName(data, query);

      expect(results).toStrictEqual(expected);
    });

    test("returns scientific name as title if no common name", () => {
      let query = "Prorocentrum";
      let data = {
        name: "Prorocentrum gracile",
        default_photo: "https://inat.com/photos/26078891/square.jpg",
        preferred_common_name: undefined,
        matched_term: "Prorocentrum gracile",
        rank: "species",
        id: 783155,
      };
      let expected = {
        hasCommonName: false,
        subtitle: undefined,
        subtitleAriaLabel: undefined,
        title: "Prorocentrum gracile",
        titleAriaLabel: "taxon scientific name",
      };

      let results = formatTaxonName(data, query);

      expect(results).toStrictEqual(expected);
    });
  });

  describe("query matches matched_term", () => {
    test("returns common name (match term) as title", () => {
      let query = "red";
      let data = {
        name: "Turdus migratorius",
        default_photo: "https://inat.com/photos/34859026/square.jpg",
        preferred_common_name: "American Robin",
        matched_term: "Red Robin",
        rank: "species",
        id: 12727,
      };
      let expected = {
        hasCommonName: true,
        subtitle: "Turdus migratorius",
        subtitleAriaLabel: "taxon scientific name",
        title: "American Robin (Red Robin)",
        titleAriaLabel: "taxon common name",
      };

      let results = formatTaxonName(data, query);

      expect(results).toStrictEqual(expected);
    });
    test("returns common name as title if includeMatchedTerm is false", () => {
      let query = "red";
      let data = {
        name: "Turdus migratorius",
        default_photo: "https://inat.com/photos/34859026/square.jpg",
        preferred_common_name: "American Robin",
        matched_term: "Red Robin",
        rank: "species",
        id: 12727,
      };
      let expected = {
        hasCommonName: true,
        subtitle: "Turdus migratorius",
        subtitleAriaLabel: "taxon scientific name",
        title: "American Robin",
        titleAriaLabel: "taxon common name",
      };

      let results = formatTaxonName(data, query, false);

      expect(results).toStrictEqual(expected);
    });
  });
});
