// @vitest-environment jsdom

import { expect, test, describe, vi } from "vitest";

import {
  hexToRgb,
  pluralize,
  formatAppUrl,
  updateAppUrl,
  decodeAppUrl,
  removeDefaultParams,
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
  user1,
  user2,
} from "./test_helpers.ts";
import type { MapStore, ObservationViews } from "../types/app";
import { iNatApiFilterableNames } from "../data/inat_data.ts";
import { validObservationsSubviews, validViews } from "../data/app_data.ts";

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

describe("formatAppUrl", () => {
  test("format parameters for default store", () => {
    let appStore: MapStore = {
      ...mapStore,
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(``);
  });
  test("format parameters for one taxon", () => {
    let appStore: MapStore = {
      ...mapStore,
      inatApiParams: {
        ...mapStore.inatApiParams,
        taxon_id: life().id.toString(),
        colors: life().color,
      },
      selectedTaxa: [life()],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(
      `taxon_id=${life().id}&colors=${colorsEncoded[0]}` +
        `&verifiable=true&spam=false`,
    );
  });

  test("format parameters for multiple taxa", () => {
    let appStore: MapStore = {
      ...mapStore,
      inatApiParams: {
        ...mapStore.inatApiParams,
        taxon_id: redOak().id.toString(),
        colors: redOak().color,
      },
      selectedTaxa: [life(), redOak()],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(
      `taxon_id=${life().id},${redOak().id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}` +
        `&verifiable=true&spam=false`,
    );
  });

  test("format parameters for one place", () => {
    let appStore: MapStore = {
      ...mapStore,
      inatApiParams: {
        ...mapStore.inatApiParams,
        place_id: losangeles.id.toString(),
      },
      selectedTaxa: [],
      selectedPlaces: [losangeles],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(
      `place_id=${losangeles.id}` + `&verifiable=true&spam=false`,
    );
  });

  test("format parameters for multiple places", () => {
    let appStore: MapStore = {
      ...mapStore,
      inatApiParams: {
        ...mapStore.inatApiParams,
        place_id: `${losangeles.id},${sandiego.id}`,
      },
      selectedTaxa: [],
      selectedPlaces: [losangeles, sandiego],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(
      `place_id=${losangeles.id},${sandiego.id}` +
        `&verifiable=true&spam=false`,
    );
  });

  test("format parameters for one project", () => {
    let appStore: MapStore = {
      ...mapStore,
      inatApiParams: {
        ...mapStore.inatApiParams,
        project_id: project_cnc1.id.toString(),
      },
      selectedTaxa: [],
      selectedProjects: [project_cnc1],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(
      `project_id=${project_cnc1.id}` + `&verifiable=true&spam=false`,
    );
  });

  test("format parameters for multiple project", () => {
    let appStore: MapStore = {
      ...mapStore,
      inatApiParams: {
        ...mapStore.inatApiParams,
        project_id: `${project_cnc1.id.toString()},${project_cnc2.id.toString()}`,
      },
      selectedTaxa: [],
      selectedProjects: [project_cnc1, project_cnc2],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(
      `project_id=${project_cnc1.id},${project_cnc2.id}` +
        `&verifiable=true&spam=false`,
    );
  });

  test("format parameters for one user", () => {
    let appStore: MapStore = {
      ...mapStore,
      inatApiParams: {
        ...mapStore.inatApiParams,
        user_id: user1.id.toString(),
      },
      selectedTaxa: [],
      selectedUsers: [user1],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(`user_id=${user1.id}` + `&verifiable=true&spam=false`);
  });

  test("format parameters for multiple users", () => {
    let appStore: MapStore = {
      ...mapStore,
      inatApiParams: {
        ...mapStore.inatApiParams,
        user_id: `${user1.id},${user2.id}`,
      },
      selectedTaxa: [],
      selectedUsers: [user1, user2],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(
      `user_id=${user1.id},${user2.id}` + `&verifiable=true&spam=false`,
    );
  });

  test("return params if no selected resources, and inatApiParams has additional params", () => {
    let appStore: MapStore = {
      ...mapStore,
      inatApiParams: {
        ...mapStore.inatApiParams,
        photos: true,
      },
      selectedTaxa: [],
      selectedPlaces: [],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe("verifiable=true&spam=false&photos=true");
  });

  test("ignore invalid params if no selected resources", () => {
    let appStore = {
      ...mapStore,
      inatApiParams: {
        ...mapStore.inatApiParams,
        foo: "boo",
      },
      selectedTaxa: [],
      selectedPlaces: [],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe("");
  });

  test("ignore invalid params if selected resources", () => {
    let appStore = {
      ...mapStore,
      inatApiParams: {
        ...mapStore.inatApiParams,
        foo: "boo",
        place_id: "962",
      },
      selectedTaxa: [],
      selectedPlaces: [losangeles],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe("place_id=962&verifiable=true&spam=false");
  });

  test("return params if no selected resources, and spam and verifiable are not default", () => {
    let appStore: MapStore = {
      ...mapStore,
      inatApiParams: {
        verifiable: false,
        spam: true,
      },
      selectedTaxa: [],
      selectedPlaces: [],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe("verifiable=false&spam=true");
  });

  test.each(["identifiers", "observers", "species"])(
    "return parameters if view is not observations",
    (view) => {
      let appStore: MapStore = {
        ...mapStore,
        currentView: view as ObservationViews,
      };

      let result = formatAppUrl(appStore);

      expect(result).toBe(`verifiable=true&spam=false&view=${view}`);
    },
  );

  test("return empty string if view is observations", () => {
    let appStore: MapStore = {
      ...mapStore,
      currentView: "observations",
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(``);
  });

  test("return view & subview if view is observations and table ", () => {
    let appStore: MapStore = {
      ...mapStore,
      currentView: "observations",
      viewMetadata: {
        observations: { subview: "table" },
        observers: {},
        identifiers: {},
        species: {},
      },
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(
      "verifiable=true&spam=false&view=observations&subview=table",
    );
  });

  test("return params for page, order, order_by if observation", () => {
    let appStore: MapStore = {
      ...mapStore,
      inatApiParams: {
        verifiable: true,
        spam: false,
        page: 1,
        order: "desc",
        order_by: "id",
      },
      selectedTaxa: [],
      selectedPlaces: [],
      currentView: "observations",
      viewMetadata: {
        observations: { page: 1, order: "desc", order_by: "id" },
        identifiers: { page: 2 },
        species: { page: 3 },
        observers: { page: 4 },
      },
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(
      "verifiable=true&spam=false&page=1&order=desc&order_by=id",
    );
  });

  test.each(["identifiers", "species", "observers"])(
    "return params for page, order, order_by if not observation",
    (name) => {
      let appStore: MapStore = {
        ...mapStore,
        inatApiParams: {
          verifiable: true,
          spam: false,
          page: 1,
          order: "desc",
          order_by: "id",
        },
        selectedTaxa: [],
        selectedPlaces: [],
        currentView: name as any,
        viewMetadata: {
          observations: { page: 10, order: "desc", order_by: "id" },
          identifiers: { page: 11, order: "desc", order_by: "id" },
          species: { page: 12, order: "desc", order_by: "id" },
          observers: { page: 13, order: "desc", order_by: "id" },
        },
      };

      let result = formatAppUrl(appStore);

      expect(result).toBe(
        `verifiable=true&spam=false&page=1&order=desc&order_by=id&view=${name}`,
      );
    },
  );
});

describe("updateAppUrl", () => {
  test("uses push state to change location url with default store", () => {
    const pushSpy = vi.spyOn(history, "pushState");
    let appStore = mapStore;

    updateAppUrl(global.window.location, appStore);

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

    updateAppUrl(global.window.location, appStore);

    expect(pushSpy).toHaveBeenCalledWith(
      {},
      "",
      `http://localhost:3000?taxon_id=${life().id}&colors=${colorsEncoded[0]}&spam=false`,
    );

    pushSpy.mockRestore();
  });
});

describe("decodeAppUrl resources", () => {
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
      currentView: "observations",
      viewMetadata: {
        observations: {},
        identifiers: {},
        observers: {},
        species: {},
      },
    };

    let result = decodeAppUrl(searchParams);

    expect(result).toStrictEqual(expected);
  });

  test("returns object with place data if place_id is present", () => {
    let searchParams = "?place_id=987&spam=false&verifiable=true";

    let expected = {
      selectedPlaces: [{ id: 987 }],
      inatApiParams: {
        verifiable: true,
        spam: false,
      },
      selectedTaxa: [],
      currentView: "observations",
      viewMetadata: {
        observations: {},
        identifiers: {},
        observers: {},
        species: {},
      },
    };

    let result = decodeAppUrl(searchParams);

    expect(result).toStrictEqual(expected);
  });

  test("returns object with project data if project_id is present", () => {
    let searchParams = "?project_id=987&spam=false&verifiable=true";

    let expected = {
      selectedProjects: [{ id: 987 }],
      inatApiParams: {
        verifiable: true,
        spam: false,
      },
      selectedTaxa: [],
      currentView: "observations",
      viewMetadata: {
        observations: {},
        identifiers: {},
        observers: {},
        species: {},
      },
    };

    let result = decodeAppUrl(searchParams);

    expect(result).toStrictEqual(expected);
  });

  test("returns object with user data if user_id is present", () => {
    let searchParams = "?user_id=1&spam=false&verifiable=true";

    let expected = {
      selectedUsers: [{ id: 1 }],
      inatApiParams: {
        verifiable: true,
        spam: false,
      },
      selectedTaxa: [],
      currentView: "observations",
      viewMetadata: {
        observations: {},
        identifiers: {},
        observers: {},
        species: {},
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
      currentView: "observations",
      viewMetadata: {
        observations: {},
        identifiers: {},
        observers: {},
        species: {},
      },
    };

    let result = decodeAppUrl(searchParams);

    expect(result).toStrictEqual(expected);
  });

  test(
    "returns taxa, place, project, user data if taxon_id, place_id, " +
      "project_id, user_id are present",
    () => {
      let searchParams =
        "?taxon_id=12&place_id=34&project_id=56&user_id=78" +
        "&colors=%23ffffff&spam=false&verifiable=true";

      let expected = {
        color: "#ffffff",
        selectedTaxa: [
          {
            id: 12,
            color: "#ffffff",
          },
        ],
        selectedPlaces: [{ id: 34 }],
        selectedProjects: [{ id: 56 }],
        selectedUsers: [{ id: 78 }],
        inatApiParams: {
          verifiable: true,
          spam: false,
        },
        currentView: "observations",
        viewMetadata: {
          observations: {},
          identifiers: {},
          observers: {},
          species: {},
        },
      };

      let result = decodeAppUrl(searchParams);

      expect(result).toStrictEqual(expected);
    },
  );
});

describe("decodeAppUrl options", () => {
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
      currentView: "observations",
      viewMetadata: {
        observations: {},
        identifiers: {},
        observers: {},
        species: {},
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
      currentView: "observations",
      viewMetadata: {
        observations: {},
        identifiers: {},
        observers: {},
        species: {},
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
      currentView: "observations",
      viewMetadata: {
        observations: {},
        identifiers: {},
        observers: {},
        species: {},
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
      currentView: "observations",
      viewMetadata: {
        observations: {},
        identifiers: {},
        observers: {},
        species: {},
      },
    };

    let result = decodeAppUrl(searchParams);

    expect(result).toStrictEqual(expected);
  });

  test.each(validViews)("returns view if view is valid", (view) => {
    let searchParams = "?view=" + view;
    let expected = {
      currentView: view,
      inatApiParams: {},
      selectedTaxa: [],
      viewMetadata: {
        observations: {},
        identifiers: {},
        observers: {},
        species: {},
      },
    };

    let result = decodeAppUrl(searchParams);

    expect(result).toStrictEqual(expected);
  });

  test.each(validObservationsSubviews)(
    "returns view and subview if view is observations and subview is valid",
    (subview) => {
      let searchParams = "?view=observations&subview=" + subview;
      let expected = {
        currentView: "observations",
        inatApiParams: {},
        selectedTaxa: [],
        viewMetadata: {
          observations: {
            subview: subview,
          },
          identifiers: {},
          observers: {},
          species: {},
        },
      };

      let result = decodeAppUrl(searchParams);

      expect(result).toStrictEqual(expected);
    },
  );

  test.each(validViews)("test ignore invalid subview", (view) => {
    let searchParams = `?view=${view}&subview=foo`;
    let expected = {
      currentView: view,
      inatApiParams: {},
      selectedTaxa: [],
      viewMetadata: {
        observations: {},
        identifiers: {},
        observers: {},
        species: {},
      },
    };

    let result = decodeAppUrl(searchParams);

    expect(result).toStrictEqual(expected);
  });

  test("set params if invalid views and subview", () => {
    let searchParams = "?view=boo&subview=boo";
    let expected = {
      inatApiParams: {},
      selectedTaxa: [],
      currentView: "observations",
      viewMetadata: {
        observations: {},
        identifiers: {},
        observers: {},
        species: {},
      },
    };

    let result = decodeAppUrl(searchParams);

    expect(result).toStrictEqual(expected);
  });

  test("ignores invalid params", () => {
    let searchParams = "?foo=boo";
    let expected = {
      inatApiParams: {},
      selectedTaxa: [],
      currentView: "observations",
      viewMetadata: {
        observations: {},
        identifiers: {},
        observers: {},
        species: {},
      },
    };

    let result = decodeAppUrl(searchParams);

    expect(result).toStrictEqual(expected);
  });

  test.each(iNatApiFilterableNames)(
    "adds valid params to inatApiParams",
    (name) => {
      let searchParams = `?${name}=true`;
      let expected = {
        inatApiParams: { [name]: true },
        selectedTaxa: [],
        currentView: "observations",
        viewMetadata: {
          observations: {},
          identifiers: {},
          observers: {},
          species: {},
        },
      };
      if (name == "order_by" || name == "order") {
        (expected.viewMetadata.observations as any)[name] = "true";
      }

      let result = decodeAppUrl(searchParams);

      expect(result).toStrictEqual(expected);
    },
  );

  test("returns object with page, order, order_by", () => {
    let searchParams = "?page=2&order=desc&order_by=id";
    let expected = {
      inatApiParams: { page: 2, order: "desc", order_by: "id" },
      selectedTaxa: [],
      currentView: "observations",
      viewMetadata: {
        observations: { page: 2, order: "desc", order_by: "id" },
        identifiers: {},
        observers: {},
        species: {},
      },
    };

    let result = decodeAppUrl(searchParams);

    expect(result).toStrictEqual(expected);
  });

  test.each(validViews)(
    "returns object with view, page, order, order_by",
    (name) => {
      let searchParams = `?view=${name}&page=2&order=desc&order_by=id`;
      let expected = {
        inatApiParams: { page: 2, order: "desc", order_by: "id" },
        selectedTaxa: [],
        currentView: name,
        viewMetadata: {
          observations: {},
          identifiers: {},
          observers: {},
          species: {},
          [name]: { page: 2, order: "desc", order_by: "id" },
        },
      };

      let result = decodeAppUrl(searchParams);

      expect(result).toStrictEqual(expected);
    },
  );
});

describe("removeDefaultParams", () => {
  test("return empty string if default inatApiParams and view", () => {
    let params = "verifiable=true&spam=false&view=observations&subview=grid";

    let result = removeDefaultParams(params);

    expect(result).toBe("");
  });

  test("return view and subview if view observation and subview is table", () => {
    let params = "verifiable=true&spam=false&view=observations&subview=table";

    let result = removeDefaultParams(params);

    expect(result).toBe(
      "verifiable=true&spam=false&view=observations&subview=table",
    );
  });

  test.each(["species", "identifiers", "observers"])(
    "return view  if view is not observations",
    (view) => {
      let params = `verifiable=true&spam=false&view=${view}`;

      let result = removeDefaultParams(params);

      expect(result).toBe(`verifiable=true&spam=false&view=${view}`);
    },
  );

  test("return verifiable and spam if not default values", () => {
    let params = "verifiable=false&spam=true&view=observations&subview=grid";

    let result = removeDefaultParams(params);

    expect(result).toBe("verifiable=false&spam=true");
  });

  test("other params if default inatApiParams and view", () => {
    let params = "verifiable=true&spam=false&view=observations&subview=grid";

    let result = removeDefaultParams(params);

    expect(result).toBe("");
  });
});
