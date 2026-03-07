// @vitest-environment jsdom
import {
  expect,
  test,
  describe,
  beforeEach,
  beforeAll,
  afterAll,
  afterEach,
} from "vitest";
import jsdom from "jsdom";

import { placeSelectedHandler, removePlace } from "../../lib/search_places.ts";
import {
  projectSelectedHandler,
  removeProject,
} from "../../lib/search_projects.ts";
import { taxonSelectedHandler, removeTaxon } from "../../lib/search_taxa.ts";
import { userSelectedHandler, removeUser } from "../../lib/search_users.ts";
import {
  createMockServer,
  expectEmpytMap,
  allTaxa,
  defaultParams,
  perPage,
  perPageUsers,
} from "../test_helpers.ts";
import { iNatOrange } from "../../lib/map_colors_utils.ts";
import { decodeAppUrl } from "../../lib/utils.ts";
import { initPopulateStore, initRenderMap } from "../../lib/init_app.ts";
import { mapStore } from "../../lib/store.ts";
import {
  removeUserIdentifier,
  userIdentifierSelectedHandler,
} from "../../lib/search_users_identifiers.ts";
import { unobservedByUserSelectedHandler } from "../../lib/search_unobserved.ts";
import {
  removeTaxonIdentified,
  taxonIdentifiedSelectedHandler,
} from "../../lib/search_taxa_identified.ts";

import { paginationCallback as paginationCallbackIdentifications } from "../../components/ViewIdentifications/utils.ts";
import { paginationCallback as paginationCallbackIdentifiers } from "../../components/ViewIdentifiers/utils.ts";
import { paginationCallback as paginationCallbackObservations } from "../../components/ViewObservations/utils.ts";
import { paginationCallback as paginationCallbackObservers } from "../../components/ViewObservers/utils.ts";
import { paginationCallback as paginationCallbackSpecies } from "../../components/ViewSpecies/utils.ts";
import { viewChangeHandler } from "../../components/ObservationsHeader/shared_utils.ts";
import { template as observationHeaderHTML } from "../../components/ObservationsHeader/template.ts";
import type { AppStoreType } from "../../types/app";

beforeEach(() => {
  const { JSDOM } = jsdom;

  let dom = new JSDOM(
    `<!doctype html>
<html lang="en">
  <body>
    ${observationHeaderHTML}
    <div id="map" style="width: 400px; height: 400px"></div>
    <div id="view-container"></div>
  </body>
</html>`,
  );
  global.document = dom.window.document;
});

const server = createMockServer();
beforeAll(() => {
  server.listen();
});
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => {
  server.close();
});

describe("paginationCallback for ViewIdentifications", () => {
  test("add page to observationsApiParams and viewMetadata.identifications_identifications if identifications", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/identifications/"));
    await initRenderMap(store);

    expect(store.identificationsApiParams.page).toBeUndefined();
    expect(
      store.viewMetadata.identifications_identifications.page,
    ).toBeUndefined();

    paginationCallbackIdentifications(5, store);

    expect(store.identificationsApiParams.page).toBe(5);
    expect(store.viewMetadata.identifications_identifications.page).toBe(5);
  });
});

describe("paginationCallback for ViewIdentifiers", () => {
  test("add page to observationsApiParams and viewMetadata.observations_identifiers", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);

    expect(store.observationsApiParams.page).toBeUndefined();
    expect(store.viewMetadata.observations_identifiers.page).toBeUndefined();

    paginationCallbackIdentifiers(5, store);

    expect(store.observationsApiParams.page).toBe(5);
    expect(store.viewMetadata.observations_identifiers.page).toBe(5);
  });

  test("add page to identificationsApiParams and viewMetadata.identifications_identifiers if identifications", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/identifications/"));
    await initRenderMap(store);

    expect(store.identificationsApiParams.page).toBeUndefined();
    expect(store.viewMetadata.identifications_identifiers.page).toBeUndefined();

    paginationCallbackIdentifiers(5, store);

    expect(store.identificationsApiParams.page).toBe(5);
    expect(store.viewMetadata.identifications_identifiers.page).toBe(5);
  });
});

describe("paginationCallback for ViewObservers", () => {
  test("add page to observationsApiParams and viewMetadata.observations_observers", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);

    expect(store.observationsApiParams.page).toBeUndefined();
    expect(store.viewMetadata.observations_observers.page).toBeUndefined();

    paginationCallbackObservers(5, store);

    expect(store.observationsApiParams.page).toBe(5);
    expect(store.viewMetadata.observations_observers.page).toBe(5);
  });

  test("add page to identificationsApiParams and viewMetadata.identifications_observers if identifications", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/identifications/"));
    await initRenderMap(store);

    expect(store.identificationsApiParams.page).toBeUndefined();
    expect(store.viewMetadata.identifications_observers.page).toBeUndefined();

    paginationCallbackObservers(5, store);

    expect(store.identificationsApiParams.page).toBe(5);
    expect(store.viewMetadata.identifications_observers.page).toBe(5);
  });
});

describe("paginationCallback for ViewObservations", () => {
  test("add page to observationsApiParams and viewMetadata.observations_observations", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);

    expect(store.observationsApiParams.page).toBeUndefined();
    expect(store.viewMetadata.observations_observations.page).toBeUndefined();

    paginationCallbackObservations(5, store);

    expect(store.observationsApiParams.page).toBe(5);
    expect(store.viewMetadata.observations_observations.page).toBe(5);
  });
});

describe("paginationCallback for ViewSpecies", () => {
  test("add page to observationsApiParams and viewMetadata.observations_species", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/"));
    await initRenderMap(store);

    expect(store.observationsApiParams.page).toBeUndefined();
    expect(store.viewMetadata.observations_species.page).toBeUndefined();

    paginationCallbackSpecies(5, store);

    expect(store.observationsApiParams.page).toBe(5);
    expect(store.viewMetadata.observations_species.page).toBe(5);
  });

  test("add page to observationsApiParams and viewMetadata.identifications_species if identifications", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", "/identifications/"));
    await initRenderMap(store);

    expect(store.identificationsApiParams.page).toBeUndefined();
    expect(store.viewMetadata.identifications_species.page).toBeUndefined();

    paginationCallbackSpecies(5, store);

    expect(store.identificationsApiParams.page).toBe(5);
    expect(store.viewMetadata.identifications_species.page).toBe(5);
  });
});

test("add page when user changes view and page for each view", async () => {
  let speciesLink = document.querySelector(
    "#observations_species",
  ) as HTMLElement;
  let observersLink = document.querySelector(
    "#observations_observers",
  ) as HTMLElement;
  let identifiersLink = document.querySelector(
    "#observations_identifiers",
  ) as HTMLElement;
  let componentThis = document.querySelector(
    ".observations-stats",
  ) as HTMLElement;
  let testParams = {
    ...defaultParams,
    colors: iNatOrange,
    taxon_id: allTaxa.id.toString(),
  };

  let store = structuredClone(mapStore);

  expectEmpytMap(store);

  await initPopulateStore(store, decodeAppUrl("", "/"));
  await initRenderMap(store);

  expect(store.observationsApiParams).toStrictEqual({
    ...testParams,
    per_page: perPage,
  });
  expect(store.viewMetadata.observations_observations).toStrictEqual({
    displayFields: {},
    graphs: { category: "month_of_year" },
    subview: "map",
    perPage: perPage,
  });
  expect(store.currentView).toBe("observations_observations");

  paginationCallbackObservations(5, store);

  expect(store.viewMetadata.observations_observations).toStrictEqual({
    displayFields: {},
    graphs: { category: "month_of_year" },
    subview: "map",
    perPage: perPage,
    page: 5,
  });

  viewChangeHandler(speciesLink, store, componentThis);
  paginationCallbackSpecies(6, store);

  expect(store.viewMetadata.observations_species).toStrictEqual({
    page: 6,
    perPage: perPage,
  });
  expect(store.currentView).toBe("observations_species");

  viewChangeHandler(observersLink, store, componentThis);
  paginationCallbackObservers(7, store);

  expect(store.viewMetadata.observations_observers).toStrictEqual({
    page: 7,
    perPage: perPageUsers,
  });
  expect(store.currentView).toBe("observations_observers");

  viewChangeHandler(identifiersLink, store, componentThis);
  paginationCallbackIdentifiers(8, store);

  expect(store.viewMetadata.observations_identifiers).toStrictEqual({
    page: 8,
    perPage: perPageUsers,
  });
  expect(store.currentView).toBe("observations_identifiers");
});

describe("pagination for all views and selected resources", () => {
  async function setupPages(store: AppStoreType, path: string) {
    let speciesLink = document.querySelector(
      "#observations_species",
    ) as HTMLElement;
    let observersLink = document.querySelector(
      "#observations_observers",
    ) as HTMLElement;
    let identifiersLink = document.querySelector(
      "#observations_identifiers",
    ) as HTMLElement;
    let componentThis = document.querySelector(
      ".observations-stats",
    ) as HTMLElement;

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl("", path));
    await initRenderMap(store);

    paginationCallbackObservations(5, store);
    viewChangeHandler(speciesLink, store, componentThis);
    paginationCallbackSpecies(6, store);
    viewChangeHandler(observersLink, store, componentThis);
    paginationCallbackObservers(7, store);
    viewChangeHandler(identifiersLink, store, componentThis);
    paginationCallbackIdentifiers(8, store);
  }

  test.each([
    placeSelectedHandler,
    projectSelectedHandler,
    taxonSelectedHandler,
    unobservedByUserSelectedHandler,
    userSelectedHandler,
  ])("removes pages when adding selected resource", async (selectedHandler) => {
    let store = structuredClone(mapStore);

    await setupPages(store, "/");

    expect(store.viewMetadata.observations_observations.page).toBe(5);
    expect(store.viewMetadata.observations_species.page).toBe(6);
    expect(store.viewMetadata.observations_observers.page).toBe(7);
    expect(store.viewMetadata.observations_identifiers.page).toBe(8);
    expect(store.observationsApiParams.page).toBe(8);

    let fakeRecord = { id: 1 } as any;
    selectedHandler(fakeRecord, "", store);

    expect(store.viewMetadata.observations_observations.page).toBeUndefined();
    expect(store.viewMetadata.observations_species.page).toBeUndefined();
    expect(store.viewMetadata.observations_observers.page).toBeUndefined();
    expect(store.viewMetadata.observations_identifiers.page).toBeUndefined();
    expect(store.observationsApiParams.page).toBeUndefined();
  });

  test.each([removePlace, removeProject, removeTaxon, removeUser])(
    "removes pages when removing selected resource",
    async (remove) => {
      let store = structuredClone(mapStore);

      await setupPages(store, "/");

      expect(store.viewMetadata.observations_observations.page).toBe(5);
      expect(store.viewMetadata.observations_species.page).toBe(6);
      expect(store.viewMetadata.observations_observers.page).toBe(7);
      expect(store.viewMetadata.observations_identifiers.page).toBe(8);
      expect(store.observationsApiParams.page).toBe(8);

      let fakeRecord = { id: 1 } as any;
      remove(fakeRecord, store);

      expect(store.viewMetadata.observations_observations.page).toBeUndefined();
      expect(store.viewMetadata.observations_species.page).toBeUndefined();
      expect(store.viewMetadata.observations_observers.page).toBeUndefined();
      expect(store.viewMetadata.observations_identifiers.page).toBeUndefined();
      expect(store.observationsApiParams.page).toBeUndefined();
    },
  );

  test.each([
    placeSelectedHandler,
    taxonSelectedHandler,
    taxonIdentifiedSelectedHandler,
    userIdentifierSelectedHandler,
  ])(
    "removes pages when adding selected resource if identifications",
    async (selectedHandler) => {
      let store = structuredClone(mapStore);

      await setupPages(store, "/identifications/");

      expect(store.viewMetadata.identifications_species.page).toBe(6);
      expect(store.viewMetadata.identifications_observers.page).toBe(7);
      expect(store.viewMetadata.identifications_identifiers.page).toBe(8);
      expect(store.identificationsApiParams.page).toBe(8);

      let fakeRecord = { id: 1 } as any;
      selectedHandler(fakeRecord, "", store);

      expect(
        store.viewMetadata.identifications_identifications.page,
      ).toBeUndefined();
      expect(store.viewMetadata.identifications_species.page).toBeUndefined();
      expect(store.viewMetadata.identifications_observers.page).toBeUndefined();
      expect(
        store.viewMetadata.identifications_identifiers.page,
      ).toBeUndefined();
      expect(store.identificationsApiParams.page).toBeUndefined();
    },
  );

  test.each([
    removePlace,
    removeTaxon,
    removeTaxonIdentified,
    removeUserIdentifier,
  ])(
    "removes pages when removing selected resource if identifications",
    async (remove) => {
      let store = structuredClone(mapStore);

      await setupPages(store, "/identifications/");

      expect(store.viewMetadata.identifications_species.page).toBe(6);
      expect(store.viewMetadata.identifications_observers.page).toBe(7);
      expect(store.viewMetadata.identifications_identifiers.page).toBe(8);
      expect(store.identificationsApiParams.page).toBe(8);

      let fakeRecord = { id: 1 } as any;
      remove(fakeRecord, store);

      expect(
        store.viewMetadata.identifications_identifications.page,
      ).toBeUndefined();
      expect(store.viewMetadata.identifications_species.page).toBeUndefined();
      expect(store.viewMetadata.identifications_observers.page).toBeUndefined();
      expect(
        store.viewMetadata.identifications_identifiers.page,
      ).toBeUndefined();
      expect(store.identificationsApiParams.page).toBeUndefined();
    },
  );
});
