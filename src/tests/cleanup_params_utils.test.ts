// @vitest-environment jsdom

import { expect, test, describe } from "vitest";

import {
  cleanupIdentificationsMapParams,
  cleanupObervationsParams,
  cleanupObservationsMapParams,
} from "../lib/cleanup_params_utils";
import { mapStore } from "../lib/store.ts";
import { defaultQuery } from "./test_helpers.ts";
import { iNatOrange } from "../lib/map_colors_utils.ts";
import { ObservationsApiFilterableNames } from "../data/inat_data.ts";

describe("cleanupObervationsParams", () => {
  test("if no changes to store params, returns empty string", () => {
    let store = structuredClone(mapStore);

    let results = cleanupObervationsParams(store);

    expect(results).toStrictEqual("");
  });

  test("returns params if params are valid properites for iNat API", () => {
    let store = structuredClone(mapStore);
    store.observationsApiParams.sounds = true;
    store.observationsApiParams.order = "desc";
    store.observationsApiParams.order_by = "id";
    store.observationsApiParams.page = 1;
    store.selectedTaxa = [
      { id: 1, color: "red" },
      { id: 2, color: "blue" },
    ];

    let results = cleanupObervationsParams(store);

    expect(results).toStrictEqual(
      `taxon_id=1%2C2&${defaultQuery}&sounds=true` +
        "&order=desc&order_by=id&page=1",
    );
  });

  test("ignores params if params are not properites for iNat API", () => {
    let store = structuredClone(mapStore);
    (store.observationsApiParams as any).foo = true;

    let results = cleanupObervationsParams(store);

    expect(results).toStrictEqual("");
  });

  test("ignores taxon_id and place_id when they are 0", () => {
    let store = structuredClone(mapStore);
    store.observationsApiParams.sounds = true;
    store.observationsApiParams.taxon_id = "0";
    store.observationsApiParams.place_id = "0";
    store.selectedTaxa = [{ id: 0, color: "red" }];
    store.selectedPlaces = [{ id: 0 }];

    let results = cleanupObervationsParams(store);

    expect(results).toStrictEqual(`${defaultQuery}&sounds=true`);
  });

  test("ignores view, colors, subview", () => {
    let store = structuredClone(mapStore);
    store.observationsApiParams.taxon_id = "1";
    store.observationsApiParams.colors = "red";
    store.selectedTaxa = [{ id: 1, color: "red" }];
    store.currentView = "observations";
    store.viewMetadata.observations.subview = "table";

    let results = cleanupObervationsParams(store);

    expect(results).toStrictEqual(`taxon_id=1&${defaultQuery}`);
  });

  test("uses page, order, order from store to update params", () => {
    let store = structuredClone(mapStore);
    store.observationsApiParams.sounds = true;
    store.observationsApiParams.taxon_id = "1";
    store.observationsApiParams.colors = "red";
    store.selectedTaxa = [{ id: 1, color: "red" }];
    store.observationsApiParams.page = 3;
    store.currentView = "observations";

    let results = cleanupObervationsParams(store);

    expect(results).toStrictEqual(
      `taxon_id=1&${defaultQuery}&sounds=true&page=3`,
    );
  });
});

describe("cleanupIdentificationsMapParams", () => {
  test("reformats store.identificationAPIParams to work with iNat map tiles API", () => {
    let store = structuredClone(mapStore);
    store.identificationsApiParams = {
      observation_taxon_id: "20,21",
      quality_grade: "research",
      colors: "red,blue",
    };

    let results = cleanupIdentificationsMapParams(
      store.identificationsApiParams,
    );

    expect(results).toStrictEqual({
      quality_grade: "research",
      taxon_id: "20,21",
      color: "red",
    });
  });

  test("reformats store.identificationAPIParams colors", () => {
    let store = structuredClone(mapStore);
    store.identificationsApiParams = {
      colors: "red,blue",
    };

    let results = cleanupIdentificationsMapParams(
      store.identificationsApiParams,
    );

    expect(results).toStrictEqual({
      color: "red",
    });
  });

  test("adds color iNatOrange if no color specified", () => {
    let store = structuredClone(mapStore);
    store.identificationsApiParams = {
      observation_taxon_id: "20,21",
    };

    let results = cleanupIdentificationsMapParams(
      store.identificationsApiParams,
    );

    expect(results).toStrictEqual({
      taxon_id: "20,21",
      color: iNatOrange,
    });
  });

  test("converts iconic taxon ids to taxa names", () => {
    let store = structuredClone(mapStore);
    store.identificationsApiParams = {
      observation_iconic_taxon_id: "3,20978",
    };

    let results = cleanupIdentificationsMapParams(
      store.identificationsApiParams,
    );

    expect(results).toStrictEqual({
      iconic_taxa: "Aves,Amphibia",
      color: iNatOrange,
    });
  });

  test("renames params for observation fields ", () => {
    let store = structuredClone(mapStore);
    store.identificationsApiParams = {
      observation_taxon_id: "10,11",
      observed_d1: "2000-01-01",
      observed_d2: "2000-02-02",
      observation_hrank: "kingdom",
      observation_lrank: "phylum",
    };

    let results = cleanupIdentificationsMapParams(
      store.identificationsApiParams,
    );

    expect(results).toStrictEqual({
      taxon_id: "10,11",
      d1: "2000-01-01",
      d2: "2000-02-02",
      hrank: "kingdom",
      lrank: "phylum",
      color: iNatOrange,
    });
  });

  test("ignores params for identifications fields ", () => {
    let store = structuredClone(mapStore);
    store.identificationsApiParams = {
      taxon_id: "10,11",
      d1: "2000-01-01",
      d2: "2000-02-02",
      iconic_taxon_id: "1,2",
      hrank: "kingdom",
      lrank: "phylum",
    };

    let results = cleanupIdentificationsMapParams(
      store.identificationsApiParams,
    );

    expect(results).toStrictEqual({ color: iNatOrange });
  });

  test("ignores invalid params", () => {
    let store = structuredClone(mapStore);
    store.identificationsApiParams = {
      page: 1,
      per_page: 10,
      view: "observation",
      subview: "grid",
    };

    let results = cleanupIdentificationsMapParams(
      store.identificationsApiParams,
    );

    expect(results).toStrictEqual({ color: iNatOrange });
  });

  test("ignores places and taxa with 0 id", () => {
    let store = structuredClone(mapStore);
    store.identificationsApiParams = {
      taxon_id: "0",
      place_id: "0",
      observation_taxon_id: "0",
    };

    let results = cleanupIdentificationsMapParams(
      store.identificationsApiParams,
    );

    expect(results).toStrictEqual({ color: iNatOrange });
  });

  test("works with all store.identificationAPIParams", () => {
    let store = structuredClone(mapStore);
    store.identificationsApiParams = {
      place_id: "1,2",
      taxon_id: "10,11",
      observation_taxon_id: "20,21",
      user_id: "30,31",
      page: 1,
      per_page: 10,
      d1: "2000-01-01",
      d2: "2000-02-02",
      iconic_taxon_id: "1,2",
      hrank: "kingdom",
      lrank: "phylum",
      observed_d1: "2000-03-03",
      observed_d2: "2000-04-04",
      observation_iconic_taxon_id: "3,20978",
      observation_hrank: "genus",
      observation_lrank: "species",
      quality_grade: "research",
      view: "observation",
      subview: "grid",
      colors: "red,blue",
    };

    let results = cleanupIdentificationsMapParams(
      store.identificationsApiParams,
    );

    expect(results).toStrictEqual({
      color: "red",
      d1: "2000-03-03",
      d2: "2000-04-04",
      hrank: "genus",
      iconic_taxa: "Aves,Amphibia",
      lrank: "species",
      place_id: "1,2",
      quality_grade: "research",
      taxon_id: "20,21",
      user_id: "30,31",
    });
  });
});

describe("cleanupObservationsMapParams", () => {
  test("reformats store.observationsApiParams to work with iNat map tiles API", () => {
    let store = structuredClone(mapStore);
    store.observationsApiParams = {
      taxon_id: "20,21",
      quality_grade: "research",
      colors: "red,blue",
    };

    let results = cleanupObservationsMapParams(store.observationsApiParams);

    expect(results).toStrictEqual({
      quality_grade: "research",
      taxon_id: "20,21",
      color: "red",
    });
  });

  test("reformats store.observationsApiParams colors", () => {
    let store = structuredClone(mapStore);
    store.observationsApiParams = {
      colors: "red,blue",
    };

    let results = cleanupObservationsMapParams(store.observationsApiParams);

    expect(results).toStrictEqual({
      color: "red",
    });
  });

  test("adds color iNatOrange if no color specified", () => {
    let store = structuredClone(mapStore);
    store.observationsApiParams = {
      taxon_id: "20,21",
    };

    let results = cleanupObservationsMapParams(store.observationsApiParams);

    expect(results).toStrictEqual({
      taxon_id: "20,21",
      color: iNatOrange,
    });
  });

  test("ignores invalid params", () => {
    let store = structuredClone(mapStore);
    store.observationsApiParams = {
      page: 1,
      per_page: 10,
      view: "observation",
      subview: "grid",
    };

    let results = cleanupObservationsMapParams(store.observationsApiParams);

    expect(results).toStrictEqual({ color: iNatOrange });
  });

  test("ignores places and taxa with 0 id", () => {
    let store = structuredClone(mapStore);
    store.observationsApiParams = {
      taxon_id: "0",
      place_id: "0",
      observation_taxon_id: "0",
    };

    let results = cleanupObservationsMapParams(store.observationsApiParams);

    expect(results).toStrictEqual({ color: iNatOrange });
  });

  test.each(ObservationsApiFilterableNames)(
    "works with all store.observationsApiParams",
    (field) => {
      let store = structuredClone(mapStore);
      store.observationsApiParams = {
        [field]: true,
        colors: "red",
      };

      let results = cleanupObservationsMapParams(store.observationsApiParams);

      expect(results).toStrictEqual({
        [field]: true,
        color: "red",
      });
    },
  );
});
