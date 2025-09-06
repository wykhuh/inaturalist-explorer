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
import {
  colorsEncoded,
  life,
  losangeles,
  project_cnc1,
  project_cnc2,
  redOak,
  sandiego,
} from "./test_helpers.ts";
import type { MapStore } from "../types/app";

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

// let life = {
//   name: "Life",
//   matched_term: "life",
//   rank: "stateofmatter",
//   id: 48460,
//   color: "#4477aa",
// };
// let redOaks = {
//   name: "Lobatae",
//   matched_term: "red oaks",
//   rank: "section",
//   id: 861036,
//   color: "#66ccee",
// };

describe("formatAppUrl", () => {
  test("format parameters for one taxon", () => {
    let appStore: MapStore = {
      ...mapStore,
      inatApiParams: {
        taxon_id: life().id.toString(),
        colors: life().color,
        spam: false,
      },
      selectedTaxa: [life()],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(
      `taxon_id=${life().id}&colors=${colorsEncoded[0]}&spam=false`,
    );
  });

  test("format parameters for multiple taxa", () => {
    let appStore: MapStore = {
      ...mapStore,
      inatApiParams: {
        taxon_id: redOak().id.toString(),
        colors: redOak().color,
        spam: false,
      },
      selectedTaxa: [life(), redOak()],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(
      `taxon_id=${life().id},${redOak().id}&colors=${colorsEncoded[0]},${colorsEncoded[1]}&spam=false`,
    );
  });

  test("format parameters for one place", () => {
    let appStore: MapStore = {
      ...mapStore,
      inatApiParams: {
        spam: false,
        place_id: losangeles.id.toString(),
      },
      selectedTaxa: [],
      selectedPlaces: [losangeles],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(`place_id=${losangeles.id}&spam=false`);
  });

  test("format parameters for multiple places", () => {
    let appStore: MapStore = {
      ...mapStore,
      inatApiParams: {
        spam: false,
        place_id: `${losangeles.id},${sandiego.id}`,
      },
      selectedTaxa: [],
      selectedPlaces: [losangeles, sandiego],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(`place_id=${losangeles.id},${sandiego.id}&spam=false`);
  });

  test("format parameters for one project", () => {
    let appStore: MapStore = {
      ...mapStore,
      inatApiParams: {
        spam: false,
        project_id: project_cnc1.id.toString(),
      },
      selectedTaxa: [],
      selectedProjects: [project_cnc1],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(`project_id=${project_cnc1.id}&spam=false`);
  });

  test("format parameters for multiple project", () => {
    let appStore: MapStore = {
      ...mapStore,
      inatApiParams: {
        spam: false,
        project_id: `${project_cnc1.id.toString()},${project_cnc2.id.toString()}`,
      },
      selectedTaxa: [],
      selectedProjects: [project_cnc1, project_cnc2],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(
      `project_id=${project_cnc1.id},${project_cnc2.id}&spam=false`,
    );
  });

  test("return empty string if no taxa or place, and inatApiParams has default params", () => {
    let appStore: MapStore = {
      ...mapStore,
      inatApiParams: mapStore.inatApiParams,
      selectedTaxa: [],
      selectedPlaces: [],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe("");
  });

  test("return params if no taxa or place, and inatApiParams has additional params", () => {
    let appStore: MapStore = {
      ...mapStore,
      inatApiParams: {
        verifiable: true,
        spam: false,
        photos: true,
      },
      selectedTaxa: [],
      selectedPlaces: [],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe("verifiable=true&spam=false&photos=true");
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
        taxon_id: life().id.toString(),
        colors: life().color,
        spam: false,
      },
      selectedTaxa: [life()],
    };

    updateUrl(global.window.location, appStore);

    expect(pushSpy).toHaveBeenCalledWith(
      {},
      "",
      `http://localhost:3000?taxon_id=${life().id}&colors=${colorsEncoded[0]}&spam=false`,
    );

    pushSpy.mockRestore();
  });
});

describe("decodeAppUrl", () => {
  test("returns object with taxa data if taxon_id is present", () => {
    let searchParams =
      "?taxon_id=123,456&colors=%23ffffff,%23eeeeee&spam=false&verifiable=true";
    let expected = {
      color: "#eeeeee",
      selectedTaxa: [
        {
          id: 123,
          color: "#ffffff",
        },
        {
          id: 456,
          color: "#eeeeee",
        },
      ],
      inatApiParams: {
        verifiable: true,
        spam: false,
      },
    };

    let result = decodeAppUrl(searchParams);

    expect(result).toStrictEqual(expected);
  });

  test("returns object place data if place_id is present", () => {
    let searchParams = "?place_id=987&spam=false&verifiable=true";

    let expected = {
      selectedPlaces: [{ id: 987 }],
      inatApiParams: {
        verifiable: true,
        spam: false,
      },
      selectedTaxa: [],
    };

    let result = decodeAppUrl(searchParams);

    expect(result).toStrictEqual(expected);
  });

  test("returns project place data if project_id is present", () => {
    let searchParams = "?project_id=987&spam=false&verifiable=true";

    let expected = {
      selectedProjects: [{ id: 987 }],
      inatApiParams: {
        verifiable: true,
        spam: false,
      },
      selectedTaxa: [],
    };

    let result = decodeAppUrl(searchParams);

    expect(result).toStrictEqual(expected);
  });

  test("returns object with taxa and place data if place_id is present", () => {
    let searchParams =
      "?taxon_id=123&place_id=987&colors=%23ffffff&spam=false&verifiable=true";

    let expected = {
      color: "#ffffff",
      selectedTaxa: [
        {
          id: 123,
          color: "#ffffff",
        },
      ],
      selectedPlaces: [{ id: 987 }],
      inatApiParams: {
        verifiable: true,
        spam: false,
      },
    };

    let result = decodeAppUrl(searchParams);

    expect(result).toStrictEqual(expected);
  });

  test("returns object with bounding box if nelat is present", () => {
    let searchParams = "?place_id=0&nelat=0&nelng=-1&swlat=2&swlng=-3";

    let expected = {
      selectedTaxa: [],
      selectedPlaces: [
        {
          id: 0,
          name: "Custom Boundary",
          display_name: "Custom Boundary",
          bounding_box: {
            coordinates: [
              [
                [-1, 0],
                [-1, 2],
                [-3, 2],
                [-3, 0],
              ],
            ],
            type: "Polygon",
          },
        },
      ],
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

  test("returns object with if spam and verifiable are false", () => {
    let searchParams =
      "?taxon_id=123&colors=%23ffffff&spam=false&verifiable=false";
    let expected = {
      color: "#ffffff",
      selectedTaxa: [
        {
          id: 123,
          color: "#ffffff",
        },
      ],
      inatApiParams: {
        verifiable: false,
        spam: false,
      },
    };

    let result = decodeAppUrl(searchParams);

    expect(result).toStrictEqual(expected);
  });

  test("returns object with if verifiable is any", () => {
    let searchParams = "?taxon_id=123&colors=%23ffffff&verifiable=any";
    let expected = {
      color: "#ffffff",
      selectedTaxa: [
        {
          id: 123,
          color: "#ffffff",
        },
      ],
      inatApiParams: {
        verifiable: "any",
      },
    };

    let result = decodeAppUrl(searchParams);

    expect(result).toStrictEqual(expected);
  });

  test("returns object with if spam and verifiable are true", () => {
    let searchParams =
      "?taxon_id=123&colors=%23ffffff&spam=true&verifiable=true";
    let expected = {
      color: "#ffffff",
      selectedTaxa: [
        {
          id: 123,
          color: "#ffffff",
        },
      ],
      inatApiParams: {
        verifiable: true,
        spam: true,
      },
    };

    let result = decodeAppUrl(searchParams);

    expect(result).toStrictEqual(expected);
  });

  test("returns object with if place_id is any", () => {
    let searchParams = "?taxon_id=123&colors=%23ffffff&place_id=any";
    let expected = {
      color: "#ffffff",
      selectedTaxa: [
        {
          id: 123,
          color: "#ffffff",
        },
      ],
      inatApiParams: {},
    };

    let result = decodeAppUrl(searchParams);

    expect(result).toStrictEqual(expected);
  });
});
