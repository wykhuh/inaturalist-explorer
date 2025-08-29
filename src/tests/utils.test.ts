// @vitest-environment jsdom

import { expect, test, describe, vi } from "vitest";

import {
  hexToRgb,
  pluralize,
  formatAppUrl,
  updateUrl,
  decodeAppUrl,
} from "../lib/utils.ts";
import { mapStore } from "../lib/store.ts";

describe("hexToRgb", () => {
  test("converts 6 character hex to rgb", () => {
    let result = hexToRgb("#de2e2e");

    expect(result).toBe("222,46,46,1");
  });
  test("converts 6 character hex  and alpha to rgba", () => {
    let result = hexToRgb("#ffffff", 0.5);

    expect(result).toBe("255,255,255,0.5");
  });

  test("returns undefined if 3 character hex", () => {
    let result = hexToRgb("#fff");

    expect(result).toBe(undefined);
  });
});

describe("pluralize", () => {
  test("adds s if count is zero", () => {
    let results = pluralize(0, "dog");
    expect(results).toBe("0 dogs");
  });

  test("does not add s if count is 1", () => {
    let results = pluralize(1, "dog");
    expect(results).toBe("1 dog");
  });

  test("adds s if count greater than 1", () => {
    let results = pluralize(2, "dog");
    expect(results).toBe("2 dogs");
  });

  test("displays large number as is", () => {
    let results = pluralize(1000, "dog");
    expect(results).toBe("1000 dogs");
  });

  test("adds comma to large number if useComma is true", () => {
    let results = pluralize(1000, "dog", true);
    expect(results).toBe("1,000 dogs");
  });
});

let life = {
  name: "Life",
  matched_term: "life",
  rank: "stateofmatter",
  id: 48460,
  color: "#4477aa",
};
let redOaks = {
  name: "Lobatae",
  matched_term: "red oaks",
  rank: "section",
  id: 861036,
  color: "#66ccee",
};

describe("formatAppUrl", () => {
  test("format parameters for one taxon", () => {
    let appStore = {
      ...mapStore,
      inatApiParams: {
        taxon_id: life.id,
        color: life.color,
        spam: false,
      },
      selectedTaxa: [life],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(`taxa_id=48460&colors=%234477aa&spam=false`);
  });

  test("format parameters for multiple taxon", () => {
    let appStore = {
      ...mapStore,
      inatApiParams: {
        taxon_id: redOaks.id,
        color: redOaks.color,
        spam: false,
      },
      selectedTaxa: [life, redOaks],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(
      "taxa_id=48460%2C861036&colors=%234477aa%2C%2366ccee&spam=false",
    );
  });
});

describe("updateUrl", () => {
  test("uses push state to change location url with default store", () => {
    const pushSpy = vi.spyOn(history, "pushState");
    let appStore = mapStore;

    updateUrl(global.window.location, appStore);

    expect(pushSpy).toHaveBeenCalledWith({}, "", "http://localhost:3000");

    pushSpy.mockRestore();
  });

  test("uses push state to change location url with store data", () => {
    const pushSpy = vi.spyOn(history, "pushState");
    let appStore = {
      ...mapStore,
      inatApiParams: {
        taxon_id: life.id,
        color: life.color,
        spam: false,
      },
      selectedTaxa: [life],
    };

    updateUrl(global.window.location, appStore);

    expect(pushSpy).toHaveBeenCalledWith(
      {},
      "",
      "http://localhost:3000?taxa_id=48460&colors=%234477aa&spam=false",
    );

    pushSpy.mockRestore();
  });
});

describe("decodeAppUrl", () => {
  test("returns object with taxa data if taxa_id is present", () => {
    let searchParams =
      "?taxa_id=123%2C456&colors=%23ffffff%2C%23eeeeee&spam=false&verifiable=true";
    let expected = {
      color: "#eeeeee",
      selectedTaxa: [
        {
          taxon_id: 123,
          color: "#ffffff",
          verifiable: true,
          spam: false,
        },
        {
          taxon_id: 456,
          color: "#eeeeee",
          verifiable: true,
          spam: false,
        },
      ],
    };

    let result = decodeAppUrl(searchParams);

    expect(result).toStrictEqual(expected);
  });

  test("returns object with taxa and place data if place_id is present", () => {
    let searchParams =
      "?taxa_id=123&places_id=987&colors=%23ffffff&spam=false&verifiable=true";

    let expected = {
      color: "#ffffff",
      selectedTaxa: [
        {
          taxon_id: 123,
          color: "#ffffff",
          verifiable: true,
          spam: false,
        },
      ],
      selectedPlaces: {
        id: 987,
      },
    };

    let result = decodeAppUrl(searchParams);

    expect(result).toStrictEqual(expected);
  });

  test("returns object with bounding box if nelat is present", () => {
    let searchParams = "?places_id=0&nelat=0&nelng=-1&swlat=2&swlng=-3";

    let expected = {
      selectedTaxa: [],
      selectedPlaces: {
        id: 0,
        name: "Custom Boundary",
        display_name: "Custom Boundary",
      },
      inatApiParams: {
        nelat: 0,
        nelng: -1,
        swlat: 2,
        swlng: -3,
      },
    };

    let result = decodeAppUrl(searchParams);

    expect(result).toStrictEqual(expected);
  });
});
