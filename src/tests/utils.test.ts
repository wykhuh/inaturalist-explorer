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
  sortObjectByValue,
  convertObjectArrayToCSVString,
  addCommastoNumbers,
  truncateText,
  range,
} from "../lib/utils.ts";
import { mapStore } from "../lib/store.ts";
import {
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
  monarchBasic,
  createPopularFieldCache,
} from "./test_helpers.ts";
import type {
  AppStoreType,
  GraphCategory,
  NameOrderType,
  ObservationViewsType,
} from "../types/app";
import {
  filtersModalAutocompleteFields,
  histogramGraphCategory,
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
import { allTaxaRecord } from "../data/inat_data.ts";

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

    expect(result).toBe(`taxon_id=${life().id}` + `&${defaultQuery}`);
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
      `taxon_id=${life().id},${redOak().id}` + `&${defaultQuery}`,
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

  test.each(validObservationsSubviews.filter((sv) => sv !== "map"))(
    "return view & subview if observations_observations and subview is not map",
    (subview) => {
      let appStore: AppStoreType = {
        ...mapStore,
        currentView: "observations_observations",
        viewMetadata: {
          ...mapStore.viewMetadata,
          observations_observations: { subview: subview },
        },
      };

      let result = formatAppUrl(appStore);

      expect(result).toBe(
        `${defaultQuery}&view=observations_observations&subview=${subview}`,
      );
    },
  );

  test.each(validIdentificationsSubviews.filter((sv) => sv !== "map"))(
    "return view & subview if identifications_identifications and subview is not map",
    (subview) => {
      let appStore: AppStoreType = {
        ...mapStore,
        currentView: "identifications_identifications",
        viewMetadata: {
          ...mapStore.viewMetadata,
          identifications_identifications: { subview: subview },
        },
      };

      let result = formatAppUrl(appStore);

      expect(result).toBe(
        `${defaultQuery}&view=identifications_identifications&subview=${subview}`,
      );
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

    expect(result).toBe(`${defaultQuery}&page=1&order=desc&order_by=id`);
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
      `${defaultQuery}&page=1&order=desc&order_by=id&view=${name}`,
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

    expect(result).toBe(`${defaultQuery}&locale=${lang}`);
  });

  test("return params observation fields", () => {
    let appStore: AppStoreType = {
      ...mapStore,
      observationsApiParams: {
        // @ts-ignore
        "field:Habitat": "tree",
      },
    };

    let result = formatAppUrl(appStore);

    expect(result).toBe("field%3AHabitat=tree");
  });

  test.each(["month", "year"])(
    "return params with graphs category",
    (category) => {
      let store = structuredClone(mapStore);
      if (store.viewMetadata.observations_observations.graphs) {
        store.viewMetadata.observations_observations.graphs.category =
          category as GraphCategory;
      }

      let result = formatAppUrl(store);

      expect(result).toBe(`${defaultQuery}&graphs_category=${category}`);
    },
  );

  test("ignore graphs category if category is month_of_year and no group by", () => {
    let store = structuredClone(mapStore);
    if (store.viewMetadata.observations_observations.graphs) {
      store.viewMetadata.observations_observations.graphs.category =
        "month_of_year";
    }

    let result = formatAppUrl(store);

    expect(result).toBe(``);
  });

  test.each(histogramGraphCategory)(
    "return params with graphs category and group by",
    (category) => {
      let store = structuredClone(mapStore);
      if (store.viewMetadata.observations_observations.graphs) {
        store.viewMetadata.observations_observations.graphs.category = category;
        store.viewMetadata.observations_observations.graphs.groupBy = "places";
      }

      let result = formatAppUrl(store);

      expect(result).toBe(
        `${defaultQuery}&graphs_category=${category}&graphs_group_by=places`,
      );
    },
  );

  test("do not add graph category to url if category is popular field id and selected taxa is default taxa", () => {
    let store = structuredClone(mapStore);
    store.viewMetadata.observations_observations.graphs = { category: "1" };
    store.selectedTaxa = [allTaxaRecord];

    let result = formatAppUrl(store);

    expect(result).toBe(``);
  });

  test("do not add graph category to url if selected taxa does not have popular field cache for selected category", () => {
    let store = structuredClone(mapStore);
    store.viewMetadata.observations_observations.graphs = { category: "1" };
    store.selectedTaxa = [monarchBasic];
    store.cacheData.observations.popularFields = {
      10: [createPopularFieldCache(monarchBasic, 10)],
    };

    let result = formatAppUrl(store);

    expect(result).toBe(`taxon_id=${monarchBasic.id}&${defaultQuery}`);
  });

  test("add popular field id graph category to url if selected taxa does have popular field cache for selected category", () => {
    let store = structuredClone(mapStore);
    store.viewMetadata.observations_observations.graphs = { category: "1" };
    store.selectedTaxa = [monarchBasic];
    store.cacheData.observations.popularFields = {
      1: [createPopularFieldCache(monarchBasic, 1)],
    };

    let result = formatAppUrl(store);

    expect(result).toBe(
      `taxon_id=${monarchBasic.id}&${defaultQuery}&graphs_category=1`,
    );
  });

  test("add popular field id graph category to url  if no popular field cache", () => {
    let store = structuredClone(mapStore);
    store.viewMetadata.observations_observations.graphs = { category: "1" };
    store.selectedTaxa = [monarchBasic];

    let result = formatAppUrl(store);

    expect(result).toBe(
      `taxon_id=${monarchBasic.id}&${defaultQuery}&graphs_category=1`,
    );
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
      `taxon_id=${life().id}&${defaultQuery}&page=2&per_page=20`,
    );

    let result2 = formatAppUrl(store, "identifications");

    expect(result2).toBe(
      `observation_taxon_id=${life().id}&page=3&per_page=30`,
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
        path: "/?taxon_id=48460&spam=false",
        recordType: "observations",
        view: "observations_observations",
      },
      "",
      `/?taxon_id=${life().id}&spam=false`,
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
    let searchParams = "?taxon_id=123,456&spam=false&verifiable=true";
    let expected = {
      ...structuredClone(defaultUrlStore),
      color: defaultColorScheme[1],
      selectedTaxa: [
        {
          id: 123,
          color: defaultColorScheme[0],
        },
        {
          id: 456,
          color: defaultColorScheme[1],
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
        "&spam=false&verifiable=true";

      let expected = {
        ...structuredClone(defaultUrlStore),
        color: defaultColorScheme[0],
        selectedTaxa: [
          {
            id: 12,
            color: defaultColorScheme[0],
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

  test("adds observation fields to observationsApiParams", () => {
    let searchParams = "?field:Habitat=tree";
    let expected = {
      ...structuredClone(defaultUrlStore),
      currentView: "observations_observations",
      record_type: "observations",
      observationsApiParams: {
        "field:Habitat": "tree",
      },
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test("adds graph category to observation graphs metadata", () => {
    let searchParams = "?graphs_category=month";
    let expected = {
      ...structuredClone(defaultUrlStore),
      currentView: "observations_observations",
      record_type: "observations",
      viewMetadata: {
        ...structuredClone(defaultUrlStore.viewMetadata),
        observations_observations: { graphs: { category: "month" } },
      },
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test("adds graph group by to observation graphs metadata", () => {
    let searchParams = "?graphs_group_by=places";
    let expected = {
      ...structuredClone(defaultUrlStore),
      currentView: "observations_observations",
      record_type: "observations",
      viewMetadata: {
        ...structuredClone(defaultUrlStore.viewMetadata),
        observations_observations: {
          graphs: { category: "month_of_year", groupBy: "places" },
        },
      },
    };

    let result = decodeAppUrl(searchParams, "/");

    expect(result).toStrictEqual(expected);
  });

  test("ignore graph group by if bounding box is in url", () => {
    let searchParams =
      "?graphs_group_by=places&nelng=1&nelat=1&swlat=1&swlng=1";
    let expected = {
      ...structuredClone(defaultUrlStore),
      currentView: "observations_observations",
      record_type: "observations",
      observationsApiParams: {
        nelat: 1,
        nelng: 1,
        swlat: 1,
        swlng: 1,
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
        { id: 1, color: defaultColorScheme[3] },
        { id: 2, color: defaultColorScheme[4] },
      ],
      selectedTaxa: [
        { id: 3, color: defaultColorScheme[1] },
        { id: 4, color: defaultColorScheme[2] },
      ],
      currentView: "identifications_identifications",
      record_type: "identifications",
      color: defaultColorScheme[4],
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

describe("sortObjectByValue", () => {
  test("sort object with numeric values from low to high", () => {
    let obj = { a: 10, b: 15, c: 5 };

    let result = sortObjectByValue(obj);

    expect(result).toStrictEqual({ c: 5, a: 10, b: 15 });
    expect(Object.keys(result)).toStrictEqual(["c", "a", "b"]);
    expect(Object.values(result)).toStrictEqual([5, 10, 15]);
  });

  test("sort object with numeric values from high to low", () => {
    let obj = { a: 10, b: 15, c: 5 };

    let result = sortObjectByValue(obj, false);

    expect(result).toStrictEqual({ b: 15, a: 10, c: 5 });
    expect(Object.keys(result)).toStrictEqual(["b", "a", "c"]);
    expect(Object.values(result)).toStrictEqual([15, 10, 5]);
  });

  test("sort object with spaced number keys  from low to high", () => {
    let obj = {
      "25 ": 2,
      "10 ": 4,
      "15 ": 3,
    };

    let result = sortObjectByValue(obj);

    expect(result).toStrictEqual({
      "25 ": 2,
      "15 ": 3,
      "10 ": 4,
    });
    expect(Object.keys(result)).toStrictEqual(["25 ", "15 ", "10 "]);
    expect(Object.values(result)).toStrictEqual([2, 3, 4]);
  });
});

describe("convertObjectArrayToCSVString", () => {
  test("convert object to csv string", () => {
    let data = [
      { id: 1, value: 123, field: 4.5 },
      { id: 2, value: true, field: false },
      { id: 3, value: null, field: undefined },
      { id: 4, value: "can't", field: "ab cd" },
      { id: 5, value: '"hi"', field: 'a "hi" b' },
      { id: 6, value: "ab, cd", field: "ef\ngh" },
    ];

    let result = convertObjectArrayToCSVString(data);
    expect(result).toBe(`id,value,field
1,123,4.5
2,true,false
3,,
4,"can't","ab cd"
5,"""hi""","a ""hi"" b"
6,"ab, cd","ef
gh"`);
  });
});

describe("addCommastoNumbers", () => {
  test("add commas to integer", () => {
    let result = addCommastoNumbers(1234567);
    expect(result).toBe("1,234,567");
  });

  test("add commas to float", () => {
    let result = addCommastoNumbers(12345.67);
    expect(result).toBe("12,345.67");
  });

  test("add commas to negative numbers", () => {
    let result = addCommastoNumbers(-12345.67);
    expect(result).toBe("-12,345.67");
  });

  test.each([1, 12, 123])(
    "convert number to string without commas if number is 3 or less digits",
    (num) => {
      let result = addCommastoNumbers(num);
      expect(result).toBe(`${num}`);
    },
  );
});

describe("truncateText", () => {
  test("truncate text to a given length", () => {
    let result = truncateText("abcdef", 3);
    expect(result).toBe("abc...");
  });

  test("it uses spaces when calculating length", () => {
    let result = truncateText("a bcdef", 3);
    expect(result).toBe("a b...");
  });

  test("does nothing if string length matches given length", () => {
    let result = truncateText("abcdef", 6);
    expect(result).toBe("abcdef");
  });

  test("does nothing if string length is smaller than given length", () => {
    let result = truncateText("abcdef", 10);
    expect(result).toBe("abcdef");
  });
});

describe("range", () => {
  test("it returns an array of numbers from start value to end value", () => {
    let result = range(2, 5);
    expect(result).toStrictEqual([2, 3, 4, 5]);
  });
});
