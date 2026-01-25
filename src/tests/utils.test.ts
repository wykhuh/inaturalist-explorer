// @vitest-environment jsdom

import { expect, test, describe, vi } from "vitest";

import {
  hexToRgb,
  pluralize,
  formatAppUrl,
  updateAppUrl,
  decodeAppUrl,
  removeDefaultParams,
  createHashString,
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
  defaultParams,
} from "./test_helpers.ts";
import type {
  AppStoreType,
  NameOrderType,
  ObservationViewsType,
} from "../types/app";
import {
  filtersModalAutocompleteFields,
  identificationsApiFilterableNames,
  identificationsApiNonFilterableNames,
  observationsApiFilterableNames,
  observationsApiNonFilterableNames,
  selectedResourcesIdIdentifications,
  selectedResourcesIdObservations,
  validIdentificationsSubviews,
  validIdentificationsViews,
} from "../data/app_data.ts";
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
    let appStore: AppStoreType = {
      ...mapStore,
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(``);
  });
  test("format parameters for one taxon", () => {
    let appStore: AppStoreType = {
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
    let appStore: AppStoreType = {
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
    let appStore: AppStoreType = {
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
    let appStore: AppStoreType = {
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
    let appStore: AppStoreType = {
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
    let appStore: AppStoreType = {
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
    let appStore: AppStoreType = {
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
    let appStore: AppStoreType = {
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
    let appStore: AppStoreType = {
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
    let appStore: AppStoreType = {
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

  test.each(
    validViews.filter(
      (v) =>
        v !== "observations_observations" &&
        v !== "identifications_identifications",
    ),
  )("return parameters if view is not observations_observations", (view) => {
    let appStore: AppStoreType = {
      ...mapStore,
      currentView: view as ObservationViewsType,
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(`${defaultQuery}&view=${view}`);
  });

  test("return empty string if view is observations_observations", () => {
    let appStore: AppStoreType = {
      ...mapStore,
      currentView: "observations_observations",
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(``);
  });

  test.each([
    "observations_observations",
    "identifications_identifications",
  ] as ObservationViewsType[])(
    "return empty string if subview is map ",
    (view) => {
      let appStore: AppStoreType = {
        ...mapStore,
        currentView: view as ObservationViewsType,
        viewMetadata: {
          ...mapStore.viewMetadata,
          [view]: { subview: "map" },
        },
      };

      let result = formatAppUrl(appStore);

      expect(result).toBe(``);
    },
  );

  test.each(["observations_observations"] as ObservationViewsType[])(
    "return view & subview if subview is table ",
    (view) => {
      let appStore: AppStoreType = {
        ...mapStore,
        currentView: view as ObservationViewsType,
        viewMetadata: {
          ...mapStore.viewMetadata,
          [view]: { subview: "table" },
        },
      };

      let result = formatAppUrl(appStore);

      expect(result).toBe(`${defaultQuery}&view=${view}&subview=table`);
    },
  );

  test.each(["observations_observations"] as ObservationViewsType[])(
    "return view & subview if subview is photos ",
    (view) => {
      let appStore: AppStoreType = {
        ...mapStore,
        currentView: view as ObservationViewsType,
        viewMetadata: {
          ...mapStore.viewMetadata,
          [view]: { subview: "media" },
        },
      };

      let result = formatAppUrl(appStore);

      expect(result).toBe(`${defaultQuery}&view=${view}&subview=media`);
    },
  );

  test.each(["cs", "sc", "s"] as NameOrderType[])(
    "ignores name_order",
    (name_order) => {
      let appStore: AppStoreType = {
        ...mapStore,
        currentView: "observations_observations",
        viewMetadata: {
          ...mapStore.viewMetadata,
          name_order: name_order as NameOrderType,
        },
      };

      let result = formatAppUrl(appStore);

      expect(result).toBe(``);
    },
  );

  test("return params for page, order, order_by if observation", () => {
    let appStore: AppStoreType = {
      ...mapStore,
      observationsApiParams: {
        verifiable: true,
        spam: false,
        page: 1,
        order: "desc",
        order_by: "id",
      },

      selectedPlaces: [],
      currentView: "observations_observations",
      viewMetadata: {
        ...mapStore.viewMetadata,
        observations_observations: { page: 1, order: "desc", order_by: "id" },
        observations_identifiers: { page: 2 },
        observations_species: { page: 3 },
        observations_observers: { page: 4 },
        name_order: "cs",
      },
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(
      "verifiable=true&spam=false&page=1&order=desc&order_by=id",
    );
  });

  test.each(
    validViews.filter(
      (v) =>
        v !== "observations_observations" &&
        v !== "identifications_identifications",
    ),
  )("return params for page, order, order_by if not observation", (name) => {
    let appStore: AppStoreType = {
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
        ...mapStore.viewMetadata,
        observations_observations: {
          page: 10,
          order: "desc",
          order_by: "id",
        },
        observations_identifiers: { page: 11, order: "desc", order_by: "id" },
        observations_species: { page: 12, order: "desc", order_by: "id" },
        observations_observers: { page: 13, order: "desc", order_by: "id" },
        name_order: "cs",
      },
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(
      `verifiable=true&spam=false&page=1&order=desc&order_by=id&view=${name}`,
    );
  });

  test.each(["es", "fr"])("return params for locale that is not en", (lang) => {
    let appStore: AppStoreType = {
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

describe("formatAppUrl with identifications", () => {
  test("formats url when record type is set", () => {
    let store = structuredClone(mapStore);
    store.selectedTaxa = [life()];
    store.observationsApiParams = {
      ...defaultParams,
      colors: "blue",
      page: 2,
      per_page: 20,
    };
    store.identificationsApiParams = {
      taxon_id: life().id.toString(),
      colors: "red",
      page: 3,
      per_page: 30,
    };

    let result = formatAppUrl(store);

    expect(result).toBe(
      `taxon_id=${life().id}&colors=${colorsEncoded[0]}&${defaultQuery}&page=2&per_page=20`,
    );

    let result2 = formatAppUrl(store, "identifications");

    expect(result2).toBe(
      `observation_taxon_id=${life().id}&colors=${colorsEncoded[0]}&page=3&per_page=30`,
    );
  });
});

describe("formatAppUrl with about record_type", () => {
  test("returns '' for default store", () => {
    let appStore: AppStoreType = {
      ...mapStore,
      record_type: "about",
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe(``);
  });

  test("returns '' for selected resources", () => {
    let appStore: AppStoreType = {
      ...mapStore,
      observationsApiParams: {
        ...mapStore.observationsApiParams,
        taxon_id: life().id.toString(),
        place_id: losangeles.id.toString(),
        project_id: project_cnc1.id.toString(),
        user_id: user1.id.toString(),
        colors: life().color,
      },
      selectedTaxa: [life()],
      selectedPlaces: [losangeles],
      selectedProjects: [project_cnc1],
      selectedUsers: [user1],
      record_type: "about",
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe("");
  });
});

describe("updateAppUrl", () => {
  test("uses push state to change location url with default store", () => {
    const pushSpy = vi.spyOn(history, "pushState");
    let appStore = mapStore;

    updateAppUrl(global.window.location, appStore);

    expect(pushSpy).toHaveBeenCalledWith(
      {
        path: "/",
        recordType: "observations",
        view: "observations_observations",
      },
      "",
      "/",
    );

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
      {
        path: "/?taxon_id=48460&colors=%234477aa&spam=false",
        recordType: "observations",
        view: "observations_observations",
      },
      "",
      `/?taxon_id=${life().id}&colors=${colorsEncoded[0]}&spam=false`,
    );

    pushSpy.mockRestore();
  });
});

let defaultUrlStore = {
  observationsApiParams: {},
  identificationsApiParams: {},
  viewMetadata: {
    observations_observations: {},
    observations_identifiers: {},
    observations_observers: {},
    observations_species: {},
    identifications_identifiers: {},
    identifications_observers: {},
    identifications_species: {},
    identifications_identifications: {},
  },
} as AppStoreType;

// NOTE: update when adding selectedResource
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
      currentView: "observations_observations",
      record_type: "observations",
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test("returns object with taxa data if without_taxon_id is present", () => {
    let searchParams = "?without_taxon_id=1";

    let expected = {
      ...structuredClone(defaultUrlStore),
      selectedWithoutTaxa: [{ id: 1 }],
      observationsApiParams: {},
      currentView: "observations_observations",
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
      currentView: "observations_observations",
      record_type: "observations",
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test("returns object with place data if not_in_place is present", () => {
    let searchParams = "?not_in_place=987&spam=false&verifiable=true";

    let expected = {
      ...structuredClone(defaultUrlStore),
      selectedWithoutPlaces: [{ id: 987 }],
      observationsApiParams: {
        verifiable: true,
        spam: false,
      },
      currentView: "observations_observations",
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
      currentView: "observations_observations",
      record_type: "observations",
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test("returns object with project data if not_in_project is present", () => {
    let searchParams = "?not_in_project=1";

    let expected = {
      ...structuredClone(defaultUrlStore),
      selectedWithoutProjects: [{ id: 1 }],
      observationsApiParams: {},
      currentView: "observations_observations",
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
      currentView: "observations_observations",
      record_type: "observations",
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test("returns object with user data if not_user_id is present", () => {
    let searchParams = "?not_user_id=987&spam=false&verifiable=true";

    let expected = {
      ...structuredClone(defaultUrlStore),
      selectedWithoutUsers: [{ id: 987 }],
      observationsApiParams: {
        verifiable: true,
        spam: false,
      },
      currentView: "observations_observations",
      record_type: "observations",
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test("returns object with user data if without_ident_user_id is present", () => {
    let searchParams = "?without_ident_user_id=987&spam=false&verifiable=true";

    let expected = {
      ...structuredClone(defaultUrlStore),
      selectedWithoutUsersIdentifiers: [{ id: 987 }],
      observationsApiParams: {
        verifiable: true,
        spam: false,
      },
      currentView: "observations_observations",
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
      currentView: "observations_observations",
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
      currentView: "observations_observations",
      record_type: "observations",
      selectedUnobservedByUser: { id: 1 },
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test("returns object with user data if viewer_id is present", () => {
    let searchParams = "?viewer_id=1";

    let expected = {
      ...structuredClone(defaultUrlStore),
      selectedReviewer: { id: 1 },
      observationsApiParams: {
        viewer_id: 1,
      },
      currentView: "observations_observations",
      record_type: "observations",
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test("returns object with user data if annotation_user_id is present", () => {
    let searchParams = "?annotation_user_id=1";

    let expected = {
      ...structuredClone(defaultUrlStore),
      selectedUsersAnnotators: [{ id: 1 }],
      observationsApiParams: {},
      currentView: "observations_observations",
      record_type: "observations",
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test("returns object with bounding box if nelat is present", () => {
    let searchParams = "?nelat=0&nelng=-1&swlat=2&swlng=-3";

    let expected = {
      ...structuredClone(defaultUrlStore),
      observationsApiParams: {
        nelat: 0,
        nelng: -1,
        swlat: 2,
        swlng: -3,
      },
      currentView: "observations_observations",
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
        currentView: "observations_observations",
        record_type: "observations",
      };

      let result = decodeAppUrl(searchParams, "/");

      expect(result).toStrictEqual(expected);
    },
  );

  test("returns object with record_type about for about path", () => {
    let expected = {
      ...structuredClone(defaultUrlStore),
      record_type: "about",
    };

    let result = decodeAppUrl("", "/about/");

    expect(result).toStrictEqual(expected);
  });
});

describe("decodeAppUrl options", () => {
  test.each(observationsApiFilterableNames)(
    "adds params to observationsApiParams, selected resouces, and metadata",
    (name) => {
      let value;
      if (filtersModalAutocompleteFields.includes(name)) {
        value = 1;
      } else {
        value = true;
      }
      let searchParams = `?${name}=${value}`;
      let expected = {
        ...structuredClone(defaultUrlStore),
        observationsApiParams: { [name]: value },
        currentView: "observations_observations",
        record_type: "observations",
      } as any;
      if (name == "order_by" || name == "order") {
        expected.viewMetadata.observations_observations[name] = "true";
      }
      // NOTE: update when adding selectedResource; autocomplete
      if (name == "unobserved_by_user_id") {
        expected.selectedUnobservedByUser = { id: value };
        expected.observationsApiParams.unobserved_by_user_id = value;
      }
      if (name == "viewer_id") {
        expected.selectedReviewer = { id: value };
        expected.observationsApiParams.viewer_id = value;
      }
      if (name == "not_in_project") {
        expected.selectedNotInProject = { id: value };
        expected.observationsApiParams.not_in_project = value;
      }

      let result = decodeAppUrl(searchParams, "/");

      expect(result).toStrictEqual(expected);
    },
  );

  test.each(
    observationsApiNonFilterableNames
      .filter(
        (p) => !Object.values(selectedResourcesIdObservations).includes(p),
      )
      .filter((p) => !["locale", "page", "order_by", "order"].includes(p)),
  )("selected params do not update observationsApiParams", (name) => {
    let value = "123";
    let searchParams = `?${name}=${value}`;
    let expected = {
      ...structuredClone(defaultUrlStore),
      currentView: "observations_observations",
      record_type: "observations",
    } as any;

    let result = decodeAppUrl(searchParams, "/");
    expect(result).toStrictEqual(expected);
  });

  test.each(observationsApiNonFilterableNames)(
    "ignore any value for observationsApiNonFilterableNames",
    (name) => {
      let value = "any";

      let searchParams = `?${name}=${value}`;
      let expected = {
        ...structuredClone(defaultUrlStore),
        currentView: "observations_observations",
        record_type: "observations",
      } as any;

      let result = decodeAppUrl(searchParams, "/");

      expect(result).toStrictEqual(expected);
    },
  );

  test("updates observationsApiParams if spam and verifiable are false", () => {
    let searchParams = "?spam=false&verifiable=false";
    let expected = {
      ...structuredClone(defaultUrlStore),
      observationsApiParams: {
        verifiable: false,
        spam: false,
      },
      currentView: "observations_observations",
      record_type: "observations",
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test("updates observationsApiParams  if spam and verifiable are true", () => {
    let searchParams = "?spam=true&verifiable=true";
    let expected = {
      ...structuredClone(defaultUrlStore),
      observationsApiParams: {
        verifiable: true,
        spam: true,
      },
      currentView: "observations_observations",
      record_type: "observations",
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test("updates observationsApiParams if verifiable is any", () => {
    let searchParams = "?verifiable=any";
    let expected = {
      ...structuredClone(defaultUrlStore),
      observationsApiParams: {
        verifiable: "any",
      },
      currentView: "observations_observations",
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
    if (view === "identifications_identifications") {
      expected.viewMetadata.identifications_identifications = {};
    }

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test.each(validObservationsSubviews)(
    "returns view and subview if view is observations and subview is valid",
    (subview) => {
      let searchParams = "?view=observations_observations&subview=" + subview;
      let expected = {
        ...structuredClone(defaultUrlStore),
        currentView: "observations_observations",
        record_type: "observations",
        observationsApiParams: {},
        viewMetadata: {
          ...structuredClone(defaultUrlStore.viewMetadata),
          observations_observations: {
            subview: subview,
          },
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
    if (view === "identifications_identifications") {
      expected.viewMetadata.identifications_identifications = {};
    }

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test("ignore invalid views and subview", () => {
    let searchParams = "?view=boo&subview=boo";
    let expected = {
      ...structuredClone(defaultUrlStore),
      currentView: "observations_observations",
      record_type: "observations",
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test("ignores invalid params", () => {
    let searchParams = "?foo=boo";
    let expected = {
      ...structuredClone(defaultUrlStore),
      currentView: "observations_observations",
      record_type: "observations",
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test("returns object with page, order, order_by", () => {
    let searchParams = "?page=2&order=desc&order_by=id";
    let expected = {
      ...structuredClone(defaultUrlStore),
      observationsApiParams: { page: 2, order: "desc", order_by: "id" },
      currentView: "observations_observations",
      record_type: "observations",
      viewMetadata: {
        ...structuredClone(defaultUrlStore.viewMetadata),
        observations_observations: { page: 2, order: "desc", order_by: "id" },
      },
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test.each(validViews)(
    "updates observationsApiParams and metadata with view, page, order, order_by",
    (name) => {
      let searchParams = `?view=${name}&page=2&order=desc&order_by=id`;
      let expected = {
        ...structuredClone(defaultUrlStore),
        observationsApiParams: { page: 2, order: "desc", order_by: "id" },
        currentView: name,
        record_type: "observations",
        viewMetadata: {
          ...structuredClone(defaultUrlStore.viewMetadata),
          [name]: { page: 2, order: "desc", order_by: "id" },
        },
      };

      let result = decodeAppUrl(searchParams, "/");

      expect(result).toStrictEqual(expected);
    },
  );

  test("updates observationsApiParams with locale", () => {
    let searchParams = "?locale=fr";
    let expected = {
      ...structuredClone(defaultUrlStore),
      observationsApiParams: { locale: "fr" },
      currentView: "observations_observations",
      record_type: "observations",
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test("updates metadata with name_order", () => {
    let searchParams = "?name_order=sc";
    let expected = {
      ...structuredClone(defaultUrlStore),
      currentView: "observations_observations",
      record_type: "observations",
      viewMetadata: {
        ...structuredClone(defaultUrlStore.viewMetadata),
        name_order: "sc",
      },
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });
});

describe("decodeAppUrl  resources if identifications", () => {
  test("returns object with selectedTaxaIdentified and selectedTaxa", () => {
    let path = "/identifications/";
    let searchParams = "?taxon_id=1,2&observation_taxon_id=3,4";
    let expected = {
      ...structuredClone(defaultUrlStore),
      selectedTaxaIdentified: [
        { id: 1, color: defaultColorScheme[0] },
        { id: 2, color: defaultColorScheme[1] },
      ],
      selectedTaxa: [
        { id: 3, color: defaultColorScheme[0] },
        { id: 4, color: defaultColorScheme[1] },
      ],
      currentView: "identifications_identifications",
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
      currentView: "identifications_identifications",
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
      currentView: "identifications_identifications",
      record_type: "identifications",
    };

    let result = decodeAppUrl(searchParams, path);

    expect(result).toStrictEqual(expected);
  });

  test("returns object with taxa data if without_taxon_id is present", () => {
    let searchParams = "?without_taxon_id=1";

    let expected = {
      ...structuredClone(defaultUrlStore),
      selectedWithoutTaxaIdentified: [{ id: 1 }],
      observationsApiParams: {},
      currentView: "identifications_identifications",
      record_type: "identifications",
    };

    let result = decodeAppUrl(searchParams, "/identifications/");

    expect(result).toStrictEqual(expected);
  });

  test("returns object with taxa data if without_observation_taxon_id is present", () => {
    let searchParams = "?without_observation_taxon_id=1";

    let expected = {
      ...structuredClone(defaultUrlStore),
      selectedWithoutTaxa: [{ id: 1 }],
      observationsApiParams: {},
      currentView: "identifications_identifications",
      record_type: "identifications",
    };

    let result = decodeAppUrl(searchParams, "/identifications/");

    expect(result).toStrictEqual(expected);
  });
});

describe("decodeAppUrl options if identifications", () => {
  test.each(identificationsApiFilterableNames)(
    "adds params to identificationsApiParams, selected resouces, and metadata",
    (name) => {
      let value = true;
      let searchParams = `?${name}=${value}`;
      let expected = {
        ...structuredClone(defaultUrlStore),
        identificationsApiParams: { [name]: value },
        currentView: "identifications_identifications",
        record_type: "identifications",
      } as any;
      if (name == "order_by" || name == "order") {
        expected.viewMetadata.identifications_identifications[name] = "true";
      }

      let result = decodeAppUrl(searchParams, "/identifications/");

      expect(result).toStrictEqual(expected);
    },
  );

  test.each(
    identificationsApiNonFilterableNames
      .filter(
        (p) => !Object.values(selectedResourcesIdIdentifications).includes(p),
      )
      .filter((p) => !["page", "order_by", "order"].includes(p)),
  )("selected params do not update identificationsApiParams", (name) => {
    let value = "123";
    let searchParams = `?${name}=${value}`;
    let expected = {
      ...structuredClone(defaultUrlStore),
      currentView: "identifications_identifications",
      record_type: "identifications",
    } as any;

    let result = decodeAppUrl(searchParams, "/identifications/");
    expect(result).toStrictEqual(expected);
  });

  test.each(identificationsApiNonFilterableNames)(
    "ignore any value for observationsApiNonFilterableNames",
    (name) => {
      let value = "any";

      let searchParams = `?${name}=${value}`;
      let expected = {
        ...structuredClone(defaultUrlStore),
        currentView: "identifications_identifications",
        record_type: "identifications",
      } as any;

      let result = decodeAppUrl(searchParams, "/identifications/");

      expect(result).toStrictEqual(expected);
    },
  );

  test.each(validIdentificationsViews)(
    "returns view if view is valid",
    (view) => {
      let searchParams = "?view=" + view;
      let expected = {
        ...structuredClone(defaultUrlStore),
        currentView: view,
        record_type: "identifications",
      } as any;
      if (view === "identifications_identifications") {
        expected.viewMetadata.identifications_identifications = {};
      }

      let result = decodeAppUrl(searchParams, "/identifications/");

      expect(result).toStrictEqual(expected);
    },
  );

  test("ignores invalid params", () => {
    let searchParams = "?foo=boo";
    let expected = {
      ...structuredClone(defaultUrlStore),
      currentView: "identifications_identifications",
      record_type: "identifications",
    };

    let result = decodeAppUrl(searchParams, "/identifications/");

    expect(result).toStrictEqual(expected);
  });

  test("updates identificationsApiParams and metadata with page, order, order_by", () => {
    let searchParams = "?page=2&order=desc&order_by=id";
    let expected = {
      ...structuredClone(defaultUrlStore),
      identificationsApiParams: { page: 2, order: "desc", order_by: "id" },
      currentView: "identifications_identifications",
      record_type: "identifications",
      viewMetadata: {
        ...structuredClone(defaultUrlStore.viewMetadata),
        identifications_identifications: {
          page: 2,
          order: "desc",
          order_by: "id",
        },
      },
    };

    let result = decodeAppUrl(searchParams, "/identifications/");

    expect(result).toStrictEqual(expected);
  });

  test.each(validViews)(
    "updates identificationsApiParams and metadata with view, page, order, order_by",
    (name) => {
      let searchParams = `?view=${name}&page=2&order=desc&order_by=id`;
      let expected = {
        ...structuredClone(defaultUrlStore),
        identificationsApiParams: { page: 2, order: "desc", order_by: "id" },
        currentView: name,
        record_type: "identifications",
        viewMetadata: {
          ...structuredClone(defaultUrlStore.viewMetadata),
          [name]: { page: 2, order: "desc", order_by: "id" },
        },
      };

      let result = decodeAppUrl(searchParams, "/identifications/");

      expect(result).toStrictEqual(expected);
    },
  );

  test("updates identificationsApiParams with locale", () => {
    let searchParams = "?locale=fr";
    let expected = {
      ...structuredClone(defaultUrlStore),
      observationsApiParams: { locale: "fr" },
      currentView: "identifications_identifications",
      record_type: "identifications",
    };

    let result = decodeAppUrl(searchParams, "/identifications/");

    expect(result).toStrictEqual(expected);
  });

  test("updates metadata with name_order", () => {
    let searchParams = "?name_order=sc";
    let expected = {
      ...structuredClone(defaultUrlStore),
      currentView: "identifications_identifications",
      record_type: "identifications",
      viewMetadata: {
        ...structuredClone(defaultUrlStore.viewMetadata),
        name_order: "sc",
      },
    };

    let result = decodeAppUrl(searchParams, "/identifications/");

    expect(result).toStrictEqual(expected);
  });
});

describe("removeDefaultParams", () => {
  test("return empty object if default params ", () => {
    let params = {
      ...defaultParams,
    };

    removeDefaultParams(params);

    expect(params).toStrictEqual({});
  });

  test("return empty object if default params, view, and subview", () => {
    let params = {
      ...defaultParams,
      view: "observations_observations",
      subview: "map",
    };

    removeDefaultParams(params);

    expect(params).toStrictEqual({});
  });

  test.each(validViews.filter((v) => v !== "observations_observations"))(
    "return view if view is not observations_observations",
    (view) => {
      let params = {
        ...defaultParams,
        view: view,
      };

      removeDefaultParams(params);

      expect(params).toStrictEqual({
        spam: false,
        verifiable: true,
        view: view,
      });
    },
  );

  test.each(validObservationsSubviews.filter((v) => v !== "map"))(
    "return subview if view is observations_observations and subview is not map",
    (subview) => {
      let params = {
        ...defaultParams,
        view: "observations_observations",
        subview: subview,
      };

      removeDefaultParams(params);

      expect(params).toStrictEqual({
        spam: false,
        verifiable: true,
        view: "observations_observations",
        subview: subview,
      });
    },
  );

  test.each(validIdentificationsSubviews.filter((v) => v !== "map"))(
    "return subview if view is identifications_identifications and subview is not map",
    (subview) => {
      let params = {
        ...defaultParams,
        view: "identifications_identifications",
        subview: subview,
      };

      removeDefaultParams(params);

      expect(params).toStrictEqual({
        spam: false,
        verifiable: true,
        view: "identifications_identifications",
        subview: subview,
      });
    },
  );

  test("removes locale=en", () => {
    let params = {
      ...defaultParams,
      locale: "en",
    };

    removeDefaultParams(params);

    expect(params).toStrictEqual({});
  });

  test("return params if not default values", () => {
    let params = {
      verifiable: false,
      spam: true,
      locale: "es",
      view: "observations_observations",
      subview: "grid",
    };

    removeDefaultParams(params);

    expect(params).toStrictEqual({
      verifiable: false,
      spam: true,
      locale: "es",
      view: "observations_observations",
      subview: "grid",
    });
  });
});

describe("createHashString", () => {
  test("creates a string hash for a given value", async () => {
    let value1 = "abc";

    let results1 = await createHashString(value1);

    expect(results1).toEqual(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });

  test("returns same hash everytime for a given value", async () => {
    let value1 = "abc";

    let results1 = await createHashString(value1);
    let results2 = await createHashString(value1);
    let results3 = await createHashString(value1);

    expect(results1).toEqual(results2);
    expect(results2).toEqual(results3);
    expect(results1).toEqual(results3);
  });

  test("returns different hash for different given values", async () => {
    let value1 = "abc";
    let value2 = "bcd";

    let results1 = await createHashString(value1);
    let results2 = await createHashString(value2);

    expect(results1).not.toEqual(results2);
  });
});
