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
  defaultQuery,
} from "./test_helpers.ts";
import type { MapStore, NameOrder, ObservationViews } from "../types/app";
import {
  IdentificationsApiFilterableNames,
  ObservationsApiFilterableNames,
} from "../data/inat_data.ts";
import { validObservationsSubviews, validViews } from "../data/app_data.ts";
import { defaultColorScheme } from "../lib/map_colors_utils.ts";

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
      observationsApiParams: {
        ...mapStore.observationsApiParams,
        taxon_id: life().id.toString(),
        colors: life().color,
      },
      selectedTaxa: [life()],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(
      `taxon_id=${life().id}&colors=${colorsEncoded[0]}` + `&${defaultQuery}`,
    );
  });

  test("format parameters for multiple taxa", () => {
    let appStore: MapStore = {
      ...mapStore,
      observationsApiParams: {
        ...mapStore.observationsApiParams,
        taxon_id: redOak().id.toString(),
        colors: redOak().color,
      },
      selectedTaxa: [life(), redOak()],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(
      `taxon_id=${life().id},${redOak().id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}` +
        `&${defaultQuery}`,
    );
  });

  test("format parameters for one place", () => {
    let appStore: MapStore = {
      ...mapStore,
      observationsApiParams: {
        ...mapStore.observationsApiParams,
        place_id: losangeles.id.toString(),
      },

      selectedPlaces: [losangeles],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(`place_id=${losangeles.id}` + `&${defaultQuery}`);
  });

  test("format parameters for multiple places", () => {
    let appStore: MapStore = {
      ...mapStore,
      observationsApiParams: {
        ...mapStore.observationsApiParams,
        place_id: `${losangeles.id},${sandiego.id}`,
      },

      selectedPlaces: [losangeles, sandiego],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(
      `place_id=${losangeles.id},${sandiego.id}` + `&${defaultQuery}`,
    );
  });

  test("format parameters for one project", () => {
    let appStore: MapStore = {
      ...mapStore,
      observationsApiParams: {
        ...mapStore.observationsApiParams,
        project_id: project_cnc1.id.toString(),
      },

      selectedProjects: [project_cnc1],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(`project_id=${project_cnc1.id}` + `&${defaultQuery}`);
  });

  test("format parameters for multiple project", () => {
    let appStore: MapStore = {
      ...mapStore,
      observationsApiParams: {
        ...mapStore.observationsApiParams,
        project_id: `${project_cnc1.id.toString()},${project_cnc2.id.toString()}`,
      },

      selectedProjects: [project_cnc1, project_cnc2],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(
      `project_id=${project_cnc1.id},${project_cnc2.id}` + `&${defaultQuery}`,
    );
  });

  test("format parameters for one user", () => {
    let appStore: MapStore = {
      ...mapStore,
      observationsApiParams: {
        ...mapStore.observationsApiParams,
        user_id: user1.id.toString(),
      },

      selectedUsers: [user1],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(`user_id=${user1.id}` + `&${defaultQuery}`);
  });

  test("format parameters for multiple users", () => {
    let appStore: MapStore = {
      ...mapStore,
      observationsApiParams: {
        ...mapStore.observationsApiParams,
        user_id: `${user1.id},${user2.id}`,
      },

      selectedUsers: [user1, user2],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(`user_id=${user1.id},${user2.id}` + `&${defaultQuery}`);
  });

  test("return params if no selected resources, and observationsApiParams has additional params", () => {
    let appStore: MapStore = {
      ...mapStore,
      observationsApiParams: {
        ...mapStore.observationsApiParams,
        photos: true,
      },

      selectedPlaces: [],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(`${defaultQuery}&photos=true`);
  });

  test("ignore invalid params if no selected resources", () => {
    let appStore = {
      ...mapStore,
      observationsApiParams: {
        ...mapStore.observationsApiParams,
        foo: "boo",
      },

      selectedPlaces: [],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe("");
  });

  test("ignore invalid params if selected resources", () => {
    let appStore = {
      ...mapStore,
      observationsApiParams: {
        ...mapStore.observationsApiParams,
        foo: "boo",
        place_id: "962",
      },

      selectedPlaces: [losangeles],
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(`place_id=962&${defaultQuery}`);
  });

  test("return params if no selected resources, and spam and verifiable are not default", () => {
    let appStore: MapStore = {
      ...mapStore,
      observationsApiParams: {
        verifiable: false,
        spam: true,
      },

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

      expect(result).toBe(`${defaultQuery}&view=${view}`);
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
        identifications: {},
        species: {},
        name_order: "cs",
      },
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(`${defaultQuery}&view=observations&subview=table`);
  });

  test.each(["sc", "s"])(
    "return name_order if name_order is sc or s",
    (name_order) => {
      let appStore: MapStore = {
        ...mapStore,
        currentView: "observations",
        viewMetadata: {
          observations: {},
          observers: {},
          identifiers: {},
          identifications: {},
          species: {},
          name_order: name_order as NameOrder,
        },
      };

      let result = formatAppUrl(appStore);

      expect(result).toBe(`${defaultQuery}&name_order=${name_order}`);
    },
  );

  test("return params for page, order, order_by if observation", () => {
    let appStore: MapStore = {
      ...mapStore,
      observationsApiParams: {
        verifiable: true,
        spam: false,
        page: 1,
        order: "desc",
        order_by: "id",
      },

      selectedPlaces: [],
      currentView: "observations",
      viewMetadata: {
        observations: { page: 1, order: "desc", order_by: "id" },
        identifiers: { page: 2 },
        species: { page: 3 },
        observers: { page: 4 },
        identifications: { page: 5 },
        name_order: "cs",
      },
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(
      "verifiable=true&spam=false&page=1&order=desc&order_by=id",
    );
  });

  test.each(["identifiers", "species", "observers", "identifications"])(
    "return params for page, order, order_by if not observation",
    (name) => {
      let appStore: MapStore = {
        ...mapStore,
        observationsApiParams: {
          verifiable: true,
          spam: false,
          page: 1,
          order: "desc",
          order_by: "id",
        },

        selectedPlaces: [],
        currentView: name as any,
        viewMetadata: {
          observations: { page: 10, order: "desc", order_by: "id" },
          identifiers: { page: 11, order: "desc", order_by: "id" },
          species: { page: 12, order: "desc", order_by: "id" },
          observers: { page: 13, order: "desc", order_by: "id" },
          identifications: { page: 14, order: "desc", order_by: "id" },
          name_order: "cs",
        },
      };

      let result = formatAppUrl(appStore);

      expect(result).toBe(
        `verifiable=true&spam=false&page=1&order=desc&order_by=id&view=${name}`,
      );
    },
  );

  test.each(["es", "fr"])("return params for locale that is not en", (lang) => {
    let appStore: MapStore = {
      ...mapStore,
      observationsApiParams: {
        verifiable: true,
        spam: false,
        locale: lang,
      },
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe("verifiable=true&spam=false&locale=" + lang);
  });
});

describe("updateAppUrl", () => {
  test("uses push state to change location url with default store", () => {
    const pushSpy = vi.spyOn(history, "pushState");
    let appStore = mapStore;

    updateAppUrl(global.window.location, appStore);

    expect(pushSpy).toHaveBeenCalledWith({}, "", "http://localhost:3000/");

    pushSpy.mockRestore();
  });

  test("uses push state to change location url with store data", () => {
    const pushSpy = vi.spyOn(history, "pushState");
    let appStore = {
      ...mapStore,
      observationsApiParams: {
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
      `http://localhost:3000/?taxon_id=${life().id}&colors=${colorsEncoded[0]}&spam=false`,
    );

    pushSpy.mockRestore();
  });
});

let defaultUrlStore = {
  observationsApiParams: {},
  identificationsApiParams: {},
  viewMetadata: {
    observations: {},
    identifiers: {},
    observers: {},
    species: {},
  },
} as MapStore;

describe("decodeAppUrl resources", () => {
  test("returns object with taxa data if taxon_id is present", () => {
    let searchParams =
      "?taxon_id=123,456&colors=%23ffffff,%23eeeeee&spam=false&verifiable=true";
    let expected = {
      ...structuredClone(defaultUrlStore),
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
      observationsApiParams: {
        verifiable: true,
        spam: false,
      },
      currentView: "observations",
      record_type: "observations",
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test("returns object with place data if place_id is present", () => {
    let searchParams = "?place_id=987&spam=false&verifiable=true";

    let expected = {
      ...structuredClone(defaultUrlStore),
      selectedPlaces: [{ id: 987 }],
      observationsApiParams: {
        verifiable: true,
        spam: false,
      },
      currentView: "observations",
      record_type: "observations",
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test("returns object with project data if project_id is present", () => {
    let searchParams = "?project_id=987&spam=false&verifiable=true";

    let expected = {
      ...structuredClone(defaultUrlStore),
      selectedProjects: [{ id: 987 }],
      observationsApiParams: {
        verifiable: true,
        spam: false,
      },
      currentView: "observations",
      record_type: "observations",
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test("returns object with user data if user_id is present", () => {
    let searchParams = "?user_id=1&spam=false&verifiable=true";

    let expected = {
      ...structuredClone(defaultUrlStore),
      selectedUsers: [{ id: 1 }],
      observationsApiParams: {
        verifiable: true,
        spam: false,
      },
      currentView: "observations",
      record_type: "observations",
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test("returns object with user identifier data if ident_user_id is present", () => {
    let searchParams = "?ident_user_id=1&spam=false&verifiable=true";

    let expected = {
      ...structuredClone(defaultUrlStore),
      observationsApiParams: {
        verifiable: true,
        spam: false,
      },
      currentView: "observations",
      record_type: "observations",
      selectedUsersIdentifiers: [{ id: 1 }],
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test("returns object with unobserved by user data if unobserved_by_user_id is present", () => {
    let searchParams = "?unobserved_by_user_id=1&spam=false&verifiable=true";

    let expected = {
      ...structuredClone(defaultUrlStore),
      observationsApiParams: {
        verifiable: true,
        spam: false,
        unobserved_by_user_id: 1,
      },
      currentView: "observations",
      record_type: "observations",
      selectedUnobservedByUser: { id: 1 },
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test("returns object with bounding box if nelat is present", () => {
    let searchParams = "?place_id=0&nelat=0&nelng=-1&swlat=2&swlng=-3";

    let expected = {
      ...structuredClone(defaultUrlStore),
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
      observationsApiParams: {
        nelat: 0,
        nelng: -1,
        swlat: 2,
        swlng: -3,
      },
      currentView: "observations",
      record_type: "observations",
    };

    let result = decodeAppUrl(searchParams, "/");

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
        ...structuredClone(defaultUrlStore),
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
        observationsApiParams: {
          verifiable: true,
          spam: false,
        },
        currentView: "observations",
        record_type: "observations",
      };

      let result = decodeAppUrl(searchParams, "/");

      expect(result).toStrictEqual(expected);
    },
  );
});

describe("decodeAppUrl options", () => {
  test("returns object with if spam and verifiable are false", () => {
    let searchParams =
      "?taxon_id=123&colors=%23ffffff&spam=false&verifiable=false";
    let expected = {
      ...structuredClone(defaultUrlStore),
      color: "#ffffff",
      selectedTaxa: [
        {
          id: 123,
          color: "#ffffff",
        },
      ],
      observationsApiParams: {
        verifiable: false,
        spam: false,
      },
      currentView: "observations",
      record_type: "observations",
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test("returns object with if spam and verifiable are true", () => {
    let searchParams =
      "?taxon_id=123&colors=%23ffffff&spam=true&verifiable=true";
    let expected = {
      ...structuredClone(defaultUrlStore),
      color: "#ffffff",
      selectedTaxa: [
        {
          id: 123,
          color: "#ffffff",
        },
      ],
      observationsApiParams: {
        verifiable: true,
        spam: true,
      },
      currentView: "observations",
      record_type: "observations",
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test("returns object with if verifiable is any", () => {
    let searchParams = "?taxon_id=123&colors=%23ffffff&verifiable=any";
    let expected = {
      ...structuredClone(defaultUrlStore),
      color: "#ffffff",
      selectedTaxa: [
        {
          id: 123,
          color: "#ffffff",
        },
      ],
      observationsApiParams: {
        verifiable: "any",
      },
      currentView: "observations",
      record_type: "observations",
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test("returns object with if place_id is any", () => {
    let searchParams = "?taxon_id=123&colors=%23ffffff&place_id=any";
    let expected = {
      ...structuredClone(defaultUrlStore),
      color: "#ffffff",
      selectedTaxa: [
        {
          id: 123,
          color: "#ffffff",
        },
      ],
      currentView: "observations",
      record_type: "observations",
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test.each(validViews)("returns view if view is valid", (view) => {
    let searchParams = "?view=" + view;
    let expected = {
      ...structuredClone(defaultUrlStore),
      currentView: view,
      record_type: "observations",
    } as any;
    if (view === "identifications") {
      expected.viewMetadata.identifications = {};
    }

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test.each(validObservationsSubviews)(
    "returns view and subview if view is observations and subview is valid",
    (subview) => {
      let searchParams = "?view=observations&subview=" + subview;
      let expected = {
        ...structuredClone(defaultUrlStore),
        currentView: "observations",
        record_type: "observations",
        observationsApiParams: {},
        viewMetadata: {
          observations: {
            subview: subview,
          },
          identifiers: {},
          observers: {},
          species: {},
        },
      };

      let result = decodeAppUrl(searchParams, "/");

      expect(result).toStrictEqual(expected);
    },
  );

  test.each(validViews)("test ignore invalid subview", (view) => {
    let searchParams = `?view=${view}&subview=foo`;
    let expected = {
      ...structuredClone(defaultUrlStore),
      currentView: view,
      record_type: "observations",
    } as any;
    if (view === "identifications") {
      expected.viewMetadata.identifications = {};
    }

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test("set params if invalid views and subview", () => {
    let searchParams = "?view=boo&subview=boo";
    let expected = {
      ...structuredClone(defaultUrlStore),
      currentView: "observations",
      record_type: "observations",
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test("ignores invalid params", () => {
    let searchParams = "?foo=boo";
    let expected = {
      ...structuredClone(defaultUrlStore),
      currentView: "observations",
      record_type: "observations",
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test.each(ObservationsApiFilterableNames)(
    "adds valid params to observationsApiParams",
    (name) => {
      let value;
      if (name === "unobserved_by_user_id") {
        value = 1;
      } else if (name === "ident_user_id") {
        value = 1;
      } else {
        value = true;
      }
      let searchParams = `?${name}=${value}`;
      let expected = {
        ...structuredClone(defaultUrlStore),
        observationsApiParams: { [name]: true },
        currentView: "observations",
        record_type: "observations",
      } as any;
      if (name == "order_by" || name == "order") {
        expected.viewMetadata.observations[name] = "true";
      }
      if (name == "unobserved_by_user_id") {
        expected.selectedUnobservedByUser = { id: 1 };
        expected.observationsApiParams.unobserved_by_user_id = 1;
      }
      if (name == "ident_user_id") {
        expected.selectedUsersIdentifiers = [{ id: 1 }];
        expected.observationsApiParams.ident_user_id = 1;
      }

      let result = decodeAppUrl(searchParams, "/");

      expect(result).toStrictEqual(expected);
    },
  );

  test("returns object with page, order, order_by", () => {
    let searchParams = "?page=2&order=desc&order_by=id";
    let expected = {
      ...structuredClone(defaultUrlStore),
      observationsApiParams: { page: 2, order: "desc", order_by: "id" },
      currentView: "observations",
      record_type: "observations",
      viewMetadata: {
        observations: { page: 2, order: "desc", order_by: "id" },
        identifiers: {},
        observers: {},
        species: {},
      },
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test.each(validViews)(
    "returns object with view, page, order, order_by",
    (name) => {
      let searchParams = `?view=${name}&page=2&order=desc&order_by=id`;
      let expected = {
        ...structuredClone(defaultUrlStore),
        observationsApiParams: { page: 2, order: "desc", order_by: "id" },
        currentView: name,
        record_type: "observations",
        viewMetadata: {
          observations: {},
          identifiers: {},
          observers: {},
          species: {},
          [name]: { page: 2, order: "desc", order_by: "id" },
        },
      };

      let result = decodeAppUrl(searchParams, "/");

      expect(result).toStrictEqual(expected);
    },
  );

  test("returns object with locale", () => {
    let searchParams = "?locale=fr";
    let expected = {
      ...structuredClone(defaultUrlStore),
      observationsApiParams: { locale: "fr" },
      currentView: "observations",
      record_type: "observations",
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test("returns object with name_order", () => {
    let searchParams = "?name_order=sc";
    let expected = {
      ...structuredClone(defaultUrlStore),
      currentView: "observations",
      record_type: "observations",
      viewMetadata: {
        observations: {},
        identifiers: {},
        observers: {},
        species: {},
        name_order: "sc",
      },
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });
});

describe("if identifications path", () => {
  test("returns object with record_type = 'identifications'", () => {
    let path = "/identifications/";
    let searchParams = "";
    let expected = {
      ...structuredClone(defaultUrlStore),
      currentView: "observations",
      record_type: "identifications",
    };

    let result = decodeAppUrl(searchParams, path);

    expect(result).toStrictEqual(expected);
  });

  test.each([IdentificationsApiFilterableNames])(
    "returns object with identificationsApiParams",
    (param) => {
      let path = `/identifications/`;
      let searchParams = `?${param}=true`;
      let expected = {
        ...structuredClone(defaultUrlStore),
        currentView: "observations",
        record_type: "identifications",
        identificationsApiParams: { [param]: true },
      };

      let result = decodeAppUrl(searchParams, path);

      expect(result).toStrictEqual(expected);
    },
  );

  test("returns object with selectedTaxaIdentified and selectedTaxa", () => {
    let path = "/identifications/";
    let searchParams = "?taxon_id=1,2&observation_taxon_id=3,4";
    let expected = {
      ...structuredClone(defaultUrlStore),
      selectedTaxaIdentified: [{ id: 1 }, { id: 2 }],
      selectedTaxa: [
        { id: 3, color: defaultColorScheme[0] },
        { id: 4, color: defaultColorScheme[1] },
      ],
      currentView: "observations",
      record_type: "identifications",
      color: defaultColorScheme[1],
    };

    let result = decodeAppUrl(searchParams, path);

    expect(result).toStrictEqual(expected);
  });

  test("returns object with selectedUsersIdentifiers", () => {
    let path = "/identifications/";
    let searchParams = "?user_id=1,2";
    let expected = {
      ...structuredClone(defaultUrlStore),
      selectedUsersIdentifiers: [{ id: 1 }, { id: 2 }],
      currentView: "observations",
      record_type: "identifications",
    };

    let result = decodeAppUrl(searchParams, path);

    expect(result).toStrictEqual(expected);
  });

  test("returns object with selectedPlaces", () => {
    let path = "/identifications/";
    let searchParams = "?place_id=1,2";
    let expected = {
      ...structuredClone(defaultUrlStore),
      selectedPlaces: [{ id: 1 }, { id: 2 }],
      currentView: "observations",
      record_type: "identifications",
    };

    let result = decodeAppUrl(searchParams, path);

    expect(result).toStrictEqual(expected);
  });
});

describe("removeDefaultParams", () => {
  test("return empty string if default observationsApiParams and view", () => {
    let params = `${defaultQuery}` + `&view=observations&subview=grid`;

    let result = removeDefaultParams(params);

    expect(result).toBe("");
  });

  test("return view and subview if view observation and subview is table", () => {
    let params = `${defaultQuery}` + `&view=observations&subview=table`;

    let result = removeDefaultParams(params);

    expect(result).toBe(`${defaultQuery}&view=observations&subview=table`);
  });

  test.each(["species", "identifiers", "observers"])(
    "return view if view is not observations",
    (view) => {
      let params = `${defaultQuery}&view=${view}`;

      let result = removeDefaultParams(params);

      expect(result).toBe(`${defaultQuery}&view=${view}`);
    },
  );

  test("removes locale=en", () => {
    let params = `${defaultQuery}&locale=en`;

    let result = removeDefaultParams(params);

    expect(result).toBe("");
  });

  test("return params if not default values", () => {
    let params =
      "verifiable=false&spam=true&locale=es&view=observations&subview=grid";

    let result = removeDefaultParams(params);

    expect(result).toBe("verifiable=false&spam=true&locale=es");
  });
});
