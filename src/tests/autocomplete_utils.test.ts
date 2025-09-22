// @vitest-environment jsdom

import { expect, test, describe } from "vitest";

import {
  processAutocompleteTaxa,
  renderAutocompleteTaxon,
} from "../lib/search_taxa.ts";
import {
  processAutocompletePlaces,
  renderAutocompletePlace,
} from "../lib/search_places.ts";
import {
  losAngelesSearchApi,
  redTaxaAutocomplete,
} from "./fixtures/inatApi.js";
import type { NormalizediNatPlace } from "../types/app.js";
import type { iNatAutocompleteTaxaAPI } from "../types/inat_api";

describe("processAutocompleteTaxa", () => {
  test("formats iNat api response", () => {
    let response: iNatAutocompleteTaxaAPI = {
      total_results: 2,
      page: 1,
      per_page: 10,
      results: [redTaxaAutocomplete.results[0], redTaxaAutocomplete.results[1]],
    };
    let expected = [
      {
        default_photo: "https://inat.com/photos/11484396/square.jpg",
        id: 846366,
        matched_term: "Reduncini",
        name: "Reduncini",
        preferred_common_name: "Reduncines",
        rank: "tribe",
        title: "Reduncines",
      },
      {
        default_photo: "https://inat.com/photos/149586607/square.jpg",
        id: 861036,
        matched_term: "red oaks",
        name: "Lobatae",
        preferred_common_name: "red oaks",
        rank: "section",
        title: "Red Oaks",
      },
    ];

    let results = processAutocompleteTaxa(response, "red");

    expect(results).toStrictEqual(expected);
  });
  test("handles records with no common name", () => {
    let response: iNatAutocompleteTaxaAPI = {
      total_results: 1,
      page: 1,
      per_page: 10,
      results: [
        {
          id: 339072,
          rank: "genus",
          rank_level: 20,
          iconic_taxon_id: 48222,
          ancestor_ids: [
            48460, 48222, 792744, 1410900, 1410906, 130225, 152498, 325380,
            339072,
          ],
          is_active: true,
          name: "Prorocentrum",
          parent_id: 325380,
          ancestry: "48460/48222/792744/1410900/1410906/130225/152498/325380",
          extinct: false,
          default_photo: {
            id: 8518661,
            license_code: "cc-by-nc-sa",
            attribution:
              "(c) Sarka Martinez, some rights reserved (CC BY-NC-SA), uploaded by Sarka Martinez",
            url: "https://inat.com/photos/8518661/square.jpeg",
            original_dimensions: {
              height: 721,
              width: 1209,
            },
            flags: [],
            attribution_name: "Sarka Martinez",
            square_url: "https://inat.com/photos/8518661/square.jpeg",
            medium_url: "https://inat.com/photos/8518661/medium.jpeg",
          },
          taxon_changes_count: 0,
          taxon_schemes_count: 1,
          observations_count: 203,
          flag_counts: {
            resolved: 0,
            unresolved: 0,
          },
          current_synonymous_taxon_ids: null,
          atlas_id: null,
          complete_species_count: null,
          wikipedia_url: "http://en.wikipedia.org/wiki/Prorocentrales",
          matched_term: "Prorocentrum",
          iconic_taxon_name: "Chromista",
        },
      ],
    };
    let expected = [
      {
        name: "Prorocentrum",
        default_photo: "https://inat.com/photos/8518661/square.jpeg",
        preferred_common_name: undefined,
        matched_term: "Prorocentrum",
        rank: "genus",
        id: 339072,
        title: "Prorocentrum",
      },
    ];

    let results = processAutocompleteTaxa(response, "pro");

    expect(results).toStrictEqual(expected);
  });
  test("handles records with no photos", () => {
    let response: iNatAutocompleteTaxaAPI = {
      total_results: 1,
      page: 1,
      per_page: 10,
      results: [
        {
          id: 478775,
          rank: "species",
          rank_level: 10,
          iconic_taxon_id: 47158,
          ancestor_ids: [
            48460, 1, 47120, 372739, 47158, 184884, 47157, 49531, 49530, 123033,
            124041, 118494, 1293534, 478775,
          ],
          is_active: true,
          name: "Macaria juglandata",
          parent_id: 1293534,
          ancestry:
            "48460/1/47120/372739/47158/184884/47157/49531/49530/123033/124041/118494/1293534",
          extinct: false,
          default_photo: null,
          taxon_changes_count: 0,
          taxon_schemes_count: 1,
          observations_count: 0,
          flag_counts: {
            resolved: 0,
            unresolved: 0,
          },
          current_synonymous_taxon_ids: null,
          atlas_id: null,
          complete_species_count: null,
          wikipedia_url: null,
          matched_term: "California Walnut Angle",
          iconic_taxon_name: "Insecta",
          preferred_common_name: "California Walnut Angle",
        },
      ],
    };
    let expected = [
      {
        default_photo: undefined,
        id: 478775,
        matched_term: "California Walnut Angle",
        name: "Macaria juglandata",
        preferred_common_name: "California Walnut Angle",
        rank: "species",
        title: "California Walnut Angle",
      },
    ];

    let results = processAutocompleteTaxa(response, "cal");

    expect(results).toStrictEqual(expected);
  });
});

describe("renderAutocompleteTaxon", () => {
  test("returns html string that has taxon info", () => {
    let data = {
      name: "Buteo jamaicensis",
      default_photo: "https://inat.com/photos/101327658/square.jpg",
      preferred_common_name: "Red-tailed Hawk",
      matched_term: "Redtail",
      rank: "species",
      id: 5212,
    };

    let expected = `
  <div class="taxa-ac-option" data-testid="taxa-ac-option">
    <div class="thumbnail">
      <img class="thumbnail" src="https://inat.com/photos/101327658/square.jpg" alt="">
    </div>
    <div class="taxon-name">
      <span class="title" aria-label="taxon common name">Red-tailed Hawk</span>
      <span>
        <span class="subtitle" aria-label="taxon scientific name">Buteo jamaicensis</span>
      </span>
    </div>
  </div>`;

    let results = renderAutocompleteTaxon(data, "red");

    expect(results).toStrictEqual(expected);
  });

  test("returns taxon rank if rank higher than species", () => {
    let data = {
      name: "Reduncini",
      default_photo: "https://inat.com/photos/11484396/square.jpg",
      preferred_common_name: "Reduncines",
      matched_term: "Reduncini",
      rank: "tribe",
      id: 846366,
    };

    let expected = `
  <div class="taxa-ac-option" data-testid="taxa-ac-option">
    <div class="thumbnail">
      <img class="thumbnail" src="https://inat.com/photos/11484396/square.jpg" alt="">
    </div>
    <div class="taxon-name">
      <span class="title" aria-label="taxon common name">Reduncines</span>
      <span>
        <span class="rank" aria-label="taxon rank">tribe</span>
        <span class="subtitle" aria-label="taxon scientific name">Reduncini</span>
      </span>
    </div>
  </div>`;

    let results = renderAutocompleteTaxon(data, "red");
    expect(results).toStrictEqual(expected);
  });

  test("does not return image if no default image", () => {
    let data = {
      name: "Reduncini",
      default_photo: undefined,
      preferred_common_name: "Reduncines",
      matched_term: "Reduncini",
      rank: "tribe",
      id: 846366,
    };

    let expected = `
  <div class="taxa-ac-option" data-testid="taxa-ac-option">
    <div class="thumbnail">
    </div>
    <div class="taxon-name">
      <span class="title" aria-label="taxon common name">Reduncines</span>
      <span>
        <span class="rank" aria-label="taxon rank">tribe</span>
        <span class="subtitle" aria-label="taxon scientific name">Reduncini</span>
      </span>
    </div>
  </div>`;

    let results = renderAutocompleteTaxon(data, "red");

    expect(results).toStrictEqual(expected);
  });

  test("returns common name (match term) if common name does not have query", () => {
    let data = {
      name: "Turdus migratorius",
      default_photo: "https://inat.com/photos/34859026/square.jpg",
      preferred_common_name: "American Robin",
      matched_term: "Red Robin",
      rank: "species",
      id: 12727,
    };

    let expected = `
  <div class="taxa-ac-option" data-testid="taxa-ac-option">
    <div class="thumbnail">
      <img class="thumbnail" src="https://inat.com/photos/34859026/square.jpg" alt="">
    </div>
    <div class="taxon-name">
      <span class="title" aria-label="taxon common name">American Robin (Red Robin)</span>
      <span>
        <span class="subtitle" aria-label="taxon scientific name">Turdus migratorius</span>
      </span>
    </div>
  </div>`;

    let results = renderAutocompleteTaxon(data, "red");

    expect(results).toStrictEqual(expected);
  });

  test("returns scientific name and rank if no common name and higher taxa", () => {
    let data = {
      name: "Prorocentrum",
      default_photo: "https://inat.com/photos/8518661/square.jpg",
      preferred_common_name: undefined,
      matched_term: "Prorocentrum",
      rank: "genus",
      id: 339072,
    };

    let expected = `
  <div class="taxa-ac-option" data-testid="taxa-ac-option">
    <div class="thumbnail">
      <img class="thumbnail" src="https://inat.com/photos/8518661/square.jpg" alt="">
    </div>
    <div class="taxon-name">
      <span class="title" aria-label="taxon scientific name">Prorocentrum</span>
      <span>
        <span class="rank" aria-label="taxon rank">genus</span>
      </span>
    </div>
  </div>`;

    let results = renderAutocompleteTaxon(data, "red");

    expect(results).toStrictEqual(expected);
  });

  test("returns scientific name and rank if no common name and higher taxa 2", () => {
    let data = {
      name: "Speciosae",
      default_photo: "https://inat.com/photos/8518661/square.jpg",
      matched_term: "Speciosae",
      rank: "section",
      id: 1441533,
      color: "#228833",
      display_name: "Speciosae",
      observations_count: 30239,
    };

    let expected = `
  <div class="taxa-ac-option" data-testid="taxa-ac-option">
    <div class="thumbnail">
      <img class="thumbnail" src="https://inat.com/photos/8518661/square.jpg" alt="">
    </div>
    <div class="taxon-name">
      <span class="title" aria-label="taxon scientific name">Speciosae</span>
      <span>
        <span class="rank" aria-label="taxon rank">section</span>
      </span>
    </div>
  </div>`;

    let results = renderAutocompleteTaxon(data, "red");

    expect(results).toStrictEqual(expected);
  });

  test("returns scientific name and rank if no common name and species", () => {
    let data = {
      name: "Prorocentrum gracile",
      default_photo: "https://inat.com/photos/26078891/square.jpg",
      preferred_common_name: undefined,
      matched_term: "Prorocentrum gracile",
      rank: "species",
      id: 783155,
    };

    let expected = `
  <div class="taxa-ac-option" data-testid="taxa-ac-option">
    <div class="thumbnail">
      <img class="thumbnail" src="https://inat.com/photos/26078891/square.jpg" alt="">
    </div>
    <div class="taxon-name">
      <span class="title" aria-label="taxon scientific name">Prorocentrum gracile</span>
      <span>
        <span class="rank" aria-label="taxon rank">species</span>
      </span>
    </div>
  </div>`;

    let results = renderAutocompleteTaxon(data, "red");

    expect(results).toStrictEqual(expected);
  });
});

describe("processAutocompletePlaces", () => {
  test("formats api response", () => {
    let apiResponse = losAngelesSearchApi;
    let results = processAutocompletePlaces(apiResponse);
    let expected = [
      {
        display_name: "Los Angeles County, US, CA",
        name: "Los Angeles",
        id: losAngelesSearchApi.results[0].record.id,
        geometry: losAngelesSearchApi.results[0].record.geometry_geojson,
        bounding_box:
          losAngelesSearchApi.results[0].record.bounding_box_geojson,
        place_type_name: "County",
      },
      {
        display_name: "Los Angeles Area (custom), CA, US",
        name: "Los Angeles Area (custom)",
        id: losAngelesSearchApi.results[1].record.id,
        geometry: losAngelesSearchApi.results[1].record.geometry_geojson,
        bounding_box:
          losAngelesSearchApi.results[1].record.bounding_box_geojson,
        place_type_name: undefined,
      },
      {
        display_name: "Los Angeles & Ventura Metropolitan Areas",
        name: "Los Angeles & Ventura Metropolitan Areas",
        id: losAngelesSearchApi.results[2].record.id,
        geometry: losAngelesSearchApi.results[2].record.geometry_geojson,
        bounding_box:
          losAngelesSearchApi.results[2].record.bounding_box_geojson,
        place_type_name: undefined,
      },
    ];
    expect(results).toStrictEqual(expected);
  });
});

describe("renderAutocompletePlace", () => {
  test("returns html string that has place info", () => {
    let record: NormalizediNatPlace = {
      name: "Los Angeles",
      display_name: "Los Angeles County, US, CA",
      id: losAngelesSearchApi.results[0].record.id,
      geometry: losAngelesSearchApi.results[0].record.geometry_geojson as any,
      bounding_box: losAngelesSearchApi.results[0].record
        .bounding_box_geojson as any,
      place_type_name: "County",
    };
    let expected = `
  <div class="places-ac-option" data-testid="places-ac-option">
    <div class="place-name">
    Los Angeles County, US, CA <span class="place-type">(County)</span>
    </div>
  </div>`;

    let results = renderAutocompletePlace(record);

    expect(results).toBe(expected);
  });
});
