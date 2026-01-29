// @vitest-environment jsdom

import { expect, test, describe } from "vitest";

import {
  cleanupIdentificationsMapParams,
  cleanupObervationsParams,
  cleanupObervationsSpeciesParams,
  cleanupObservationsMapParams,
  convertIdentificationParamsToObservationParams,
  identificationOnlyParams,
  ignoreMapParams,
  processedIdentificationsToObservationsParams,
} from "../lib/cleanup_params_utils";
import { mapStore } from "../lib/store.ts";
import { defaultQuery } from "./test_helpers.ts";
import { iNatOrange } from "../lib/map_colors_utils.ts";
import {
  fieldsWithAny,
  identificationsApiNames,
  observationsApiFilterableNames,
} from "../data/app_data.ts";
import type { ObservationsApiParamsKeysType } from "../types/app";
import {
  speciesRanks,
  subspeciesRanks,
  taxonRanks,
} from "../data/inat_data.ts";

let allowedIdentificationsParams = identificationsApiNames.filter(
  (p) =>
    !identificationOnlyParams.includes(p) &&
    !processedIdentificationsToObservationsParams.includes(p),
);

describe("cleanupObervationsParams", () => {
  test("if no changes to store params, returns spam=false", () => {
    let store = structuredClone(mapStore);

    let results = cleanupObervationsParams(store);

    expect(results).toStrictEqual("spam=false");
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

    expect(results).toStrictEqual("spam=false");
  });

  test.each(fieldsWithAny as ObservationsApiParamsKeysType[])(
    "ignores fieldsWithAny  fields if value is any",
    (field) => {
      let store = structuredClone(mapStore);
      store.observationsApiParams[field] = "any";

      let results = cleanupObervationsParams(store);

      expect(results).toStrictEqual("spam=false");
    },
  );

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
    store.currentView = "observations_observations";
    store.viewMetadata.observations_observations.subview = "grid";

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
    store.currentView = "observations_observations";

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

  test.each(
    allowedIdentificationsParams.filter((p) => !ignoreMapParams.includes(p)),
  )("returns allowed params", (param) => {
    let store = structuredClone(mapStore);
    store.identificationsApiParams = {
      colors: "#f16f3a",
      [param]: true,
    };

    let results = cleanupIdentificationsMapParams(
      store.identificationsApiParams,
    );

    if (param === "taxon_id") {
      param = "ident_taxon_id";
    }

    expect(results).toStrictEqual({
      color: "#f16f3a",
      [param]: true,
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
    };

    let results = cleanupObservationsMapParams(store.observationsApiParams);

    expect(results).toStrictEqual({ color: iNatOrange });
  });

  test.each(observationsApiFilterableNames)(
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

describe("cleanupIdentificationsObservationsParams", () => {
  test.each(allowedIdentificationsParams)("returns allowed params", (param) => {
    let store = structuredClone(mapStore);
    store.identificationsApiParams = { [param]: true };

    let res = convertIdentificationParamsToObservationParams(
      store.identificationsApiParams,
    );

    if (param === "taxon_id") {
      param = "ident_taxon_id";
    }
    expect(res).toStrictEqual({ [param]: true });
  });

  test("returns multiple params", () => {
    let store = structuredClone(mapStore);
    store.identificationsApiParams = {
      place_id: "1,2",
      reviewed: true,
    };

    let res = convertIdentificationParamsToObservationParams(
      store.identificationsApiParams,
    );

    expect(res).toStrictEqual({ place_id: "1,2", reviewed: true });
  });

  test.each([
    "observation_taxon_active",
    "observation_created_d2",
    "observation_created_d1",
    "observation_rank",
    "observation_hrank",
    "observation_lrank",
    "observation_taxon_id",
  ])("removes observations_ from params", (param) => {
    let store = structuredClone(mapStore);
    store.identificationsApiParams = { [param]: true };

    let res = convertIdentificationParamsToObservationParams(
      store.identificationsApiParams,
    );

    expect(res).toStrictEqual({ [param.replace("observation_", "")]: true });
  });

  test.each(["observed_d2", "observed_d1"])(
    "removes observed_ from params",
    (param) => {
      let store = structuredClone(mapStore);
      store.identificationsApiParams = { [param]: true };

      let res = convertIdentificationParamsToObservationParams(
        store.identificationsApiParams,
      );

      expect(res).toStrictEqual({ [param.replace("observed_", "")]: true });
    },
  );

  test("converts observation_iconic_taxon_id to taxa name", () => {
    let store = structuredClone(mapStore);
    store.identificationsApiParams = {
      observation_iconic_taxon_id:
        "3,20978,26036,40151,47178,47115,47119,47158,47126,47170,47686",
    };
    let res = convertIdentificationParamsToObservationParams(
      store.identificationsApiParams,
    );

    expect(res).toStrictEqual({
      iconic_taxa:
        "Aves,Amphibia,Reptilia,Mammalia,Actinopterygii,Mollusca,Arachnida,Insecta,Plantae,Fungi,Protozoa",
    });
  });

  test("converts without_observation_taxon_id to without_taxon_id", () => {
    let store = structuredClone(mapStore);
    store.identificationsApiParams = {
      without_observation_taxon_id: "1,3",
    };
    let res = convertIdentificationParamsToObservationParams(
      store.identificationsApiParams,
    );

    expect(res).toStrictEqual({
      without_taxon_id: "1,3",
    });
  });

  test("doe not convert taxon_id", () => {
    let store = structuredClone(mapStore);
    store.identificationsApiParams = {
      taxon_id: "1,3",
    };
    let res = convertIdentificationParamsToObservationParams(
      store.identificationsApiParams,
    );

    expect(res).toStrictEqual({ ident_taxon_id: "1,3" });
  });

  test("converts user_id to ident_user_id", () => {
    let store = structuredClone(mapStore);
    store.identificationsApiParams = {
      user_id: "1,3",
    };
    let res = convertIdentificationParamsToObservationParams(
      store.identificationsApiParams,
    );

    expect(res).toStrictEqual({
      ident_user_id: "1,3",
    });
  });

  test("ignores invalid params", () => {
    let store = structuredClone(mapStore);
    // @ts-ignore
    store.identificationsApiParams = { foo: "1" };
    let res = convertIdentificationParamsToObservationParams(
      store.identificationsApiParams,
    );

    expect(res).toStrictEqual({});
  });
});

describe("cleanupObervationsSpeciesParams", () => {
  test.each(taxonRanks.filter((r) => !speciesRanks.includes(r)))(
    "does not change rank if rank is species and higher ",
    (rank) => {
      let store = structuredClone(mapStore);
      store.observationsApiParams.rank = rank;

      let res = cleanupObervationsSpeciesParams(store);

      expect(res).toStrictEqual(`verifiable=true&spam=false&rank=${rank}`);
    },
  );

  test.each(subspeciesRanks)(
    "remove ranks lower than species from rank",
    (rank) => {
      let store = structuredClone(mapStore);
      store.observationsApiParams.rank = `class,species,${rank}`;

      let res = cleanupObervationsSpeciesParams(store);

      expect(res).toStrictEqual(
        "verifiable=true&spam=false&rank=class%2Cspecies",
      );
    },
  );
});
