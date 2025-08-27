// @vitest-environment jsdom

import { expect, test, describe } from "vitest";
import {
  processAutocompleteTaxa,
  renderAutocompleteTaxon,
  processAutocompletePlaces,
  renderAutocompletePlace,
} from "../lib/autocomplete_utils.js";
import { losAngelesSearchPlaces } from "./fixtures/inatApi.js";
import type { NormalizediNatPlace } from "../types/app.js";

describe("processAutocompleteTaxa", () => {
  test("formats iNat api response", () => {
    let response = {
      total_results: 2,
      page: 1,
      per_page: 10,
      results: [
        {
          id: 48662,
          rank: "species",
          rank_level: 10,
          iconic_taxon_id: 47158,
          ancestor_ids: [
            48460, 1, 47120, 372739, 47158, 184884, 47157, 47224, 47922, 61244,
            134169, 522900, 48663, 48662,
          ],
          is_active: true,
          name: "Danaus plexippus",
          parent_id: 48663,
          ancestry:
            "48460/1/47120/372739/47158/184884/47157/47224/47922/61244/134169/522900/48663",
          extinct: false,
          default_photo: {
            id: 61756746,
            license_code: "cc-by",
            attribution: "(c) Judy Gallagher, some rights reserved (CC BY)",
            url: "https://inat.com/photos/61756746/square.jpg",
            original_dimensions: {
              height: 1365,
              width: 2048,
            },
            flags: [],
            attribution_name: "Judy Gallagher",
            square_url: "https://inat.com/photos/61756746/square.jpg",
            medium_url: "https://inat.com/photos/61756746/medium.jpg",
          },
          taxon_changes_count: 1,
          taxon_schemes_count: 6,
          observations_count: 403609,
          flag_counts: {
            resolved: 14,
            unresolved: 2,
          },
          current_synonymous_taxon_ids: null,
          atlas_id: 1231,
          complete_species_count: null,
          wikipedia_url: "http://en.wikipedia.org/wiki/Monarch_butterfly",
          matched_term: "Monarch",
          iconic_taxon_name: "Insecta",
          preferred_common_name: "Monarch",
          conservation_status: {
            id: 298224,
            place_id: null,
            source_id: null,
            user_id: 2001523,
            authority: "NatureServe",
            status: "g4",
            status_name: "apparently secure",
            geoprivacy: "open",
            iucn: 20,
          },
        },
        {
          id: 71338,
          rank: "family",
          rank_level: 30,
          iconic_taxon_id: 3,
          ancestor_ids: [48460, 1, 2, 355675, 3, 7251, 71338],
          is_active: true,
          name: "Monarchidae",
          parent_id: 7251,
          ancestry: "48460/1/2/355675/3/7251",
          extinct: false,
          default_photo: {
            id: 23108,
            license_code: "cc-by-nc-nd",
            attribution:
              "(c) Sergey Yeliseev, some rights reserved (CC BY-NC-ND)",
            url: "https://inat.com/photos/23108/square.jpg",
            original_dimensions: {
              height: 695,
              width: 1024,
            },
            flags: [],
            attribution_name: "Sergey Yeliseev",
            square_url: "https://inat.com/photos/23108/square.jpg",
            medium_url: "https://inat.com/photos/23108/medium.jpg",
          },
          taxon_changes_count: 1,
          taxon_schemes_count: 1,
          observations_count: 49345,
          flag_counts: {
            resolved: 0,
            unresolved: 0,
          },
          current_synonymous_taxon_ids: null,
          atlas_id: null,
          complete_species_count: 101,
          wikipedia_url: "http://en.wikipedia.org/wiki/Monarch_flycatcher",
          complete_rank: "subspecies",
          matched_term: "Monarchs",
          iconic_taxon_name: "Aves",
          preferred_common_name: "Monarch Flycatchers",
        },
      ],
    };
    let expected = [
      {
        default_photo: "https://inat.com/photos/61756746/square.jpg",
        id: 48662,
        matched_term: "Monarch",
        name: "Danaus plexippus",
        preferred_common_name: "Monarch",
        rank: "species",
        title: "Monarch",
        subtitle: "Danaus plexippus",
      },
      {
        default_photo: "https://inat.com/photos/23108/square.jpg",
        id: 71338,
        matched_term: "Monarchs",
        name: "Monarchidae",
        preferred_common_name: "Monarch Flycatchers",
        rank: "family",
        title: "Monarch Flycatchers",
        subtitle: "Monarchidae",
      },
    ];

    let results = processAutocompleteTaxa(response, "mon");

    expect(results).toStrictEqual(expected);
  });
  test("handles records with no common name", () => {
    let response = {
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
        subtitle: undefined,
      },
    ];

    let results = processAutocompleteTaxa(response, "pro");

    expect(results).toStrictEqual(expected);
  });
  test("handles records with no photos", () => {
    let response = {
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
        subtitle: "Macaria juglandata",
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
    let apiResponse = losAngelesSearchPlaces;
    let results = processAutocompletePlaces(apiResponse);
    let expected = [
      {
        display_name: "Los Angeles County, US, CA",
        name: "Los Angeles",
        id: losAngelesSearchPlaces.results[0].record.id,
        geometry: losAngelesSearchPlaces.results[0].record.geometry_geojson,
        bounding_box:
          losAngelesSearchPlaces.results[0].record.bounding_box_geojson
            .coordinates[0],
      },
      {
        display_name: "Los Angeles Area (custom), CA, US",
        name: "Los Angeles Area (custom)",
        id: losAngelesSearchPlaces.results[1].record.id,
        geometry: losAngelesSearchPlaces.results[1].record.geometry_geojson,
        bounding_box:
          losAngelesSearchPlaces.results[1].record.bounding_box_geojson
            .coordinates[0],
      },
      {
        display_name: "Los Angeles & Ventura Metropolitan Areas",
        name: "Los Angeles & Ventura Metropolitan Areas",
        id: losAngelesSearchPlaces.results[2].record.id,
        geometry: losAngelesSearchPlaces.results[2].record.geometry_geojson,
        bounding_box:
          losAngelesSearchPlaces.results[2].record.bounding_box_geojson
            .coordinates[0],
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
      id: losAngelesSearchPlaces.results[0].record.id,
      geometry: losAngelesSearchPlaces.results[0].record
        .geometry_geojson as any,
      bounding_box:
        losAngelesSearchPlaces.results[0].record.bounding_box_geojson
          .coordinates[0],
    };
    let expected = `
  <div class="places-ac-option" data-testid="places-ac-option">
    <div class="place-name">
    Los Angeles County, US, CA
    </div>
  </div>`;

    let results = renderAutocompletePlace(record);

    expect(results).toBe(expected);
  });
});
