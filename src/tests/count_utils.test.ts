// @vitest-environment jsdom

import { expect, test, describe, beforeAll, afterEach, afterAll } from "vitest";

import {
  updateIdentificationsCountForResource,
  updateObservationsCountForResource,
  updateSelectedResourcesId,
} from "../lib/count_utils";
import { mapStore } from "../lib/store";
import {
  createMockServer,
  lifeBasic,
  lifeIdentification,
  losangeles,
  project_cnc1,
  project_cnc2,
  redOakBasic,
  redOakIdentification,
  sandiego,
  user1,
  user2,
} from "./test_helpers";

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

describe("updateIdentificationsCountForResource", () => {
  let lifeCount = lifeIdentification().identifications_count;
  let oakCount = redOakIdentification().identifications_count;

  test("adds count for specified selected resource", async () => {
    let store = structuredClone(mapStore);
    store.record_type = "identifications";
    store.selectedTaxa = [{ id: lifeBasic.id }, { id: redOakBasic.id }];

    await updateIdentificationsCountForResource("selectedTaxa", store);

    expect(store.selectedTaxa).toStrictEqual([
      { id: lifeBasic.id, identifications_count: lifeCount },
      { id: redOakBasic.id, identifications_count: oakCount },
    ]);
  });

  test("replaces existing identification count", async () => {
    let store = structuredClone(mapStore);
    store.selectedTaxa = [
      { id: lifeBasic.id, identifications_count: 123 },
      { id: redOakBasic.id, identifications_count: 456 },
    ];

    await updateIdentificationsCountForResource("selectedTaxa", store);

    expect(store.selectedTaxa).toStrictEqual([
      { id: lifeBasic.id, identifications_count: lifeCount },
      { id: redOakBasic.id, identifications_count: oakCount },
    ]);
  });

  test("update all counts if mix of existing and missing counts", async () => {
    let store = structuredClone(mapStore);
    store.selectedTaxa = [
      { id: lifeBasic.id, identifications_count: 123 },
      { id: redOakBasic.id },
    ];

    await updateIdentificationsCountForResource("selectedTaxa", store);

    expect(store.selectedTaxa).toStrictEqual([
      { id: lifeBasic.id, identifications_count: lifeCount },
      { id: redOakBasic.id, identifications_count: oakCount },
    ]);
  });

  test("adds count if onlyFetchMissingCounts is true ", async () => {
    let store = structuredClone(mapStore);
    store.selectedTaxa = [{ id: lifeBasic.id }, { id: redOakBasic.id }];

    await updateIdentificationsCountForResource("selectedTaxa", store, true);

    expect(store.selectedTaxa).toStrictEqual([
      { id: lifeBasic.id, identifications_count: lifeCount },
      { id: redOakBasic.id, identifications_count: oakCount },
    ]);
  });

  test("replace existing count if onlyFetchMissingCounts is true", async () => {
    let store = structuredClone(mapStore);
    store.selectedTaxa = [
      { id: lifeBasic.id, identifications_count: 123 },
      { id: redOakBasic.id, identifications_count: 456 },
    ];

    await updateIdentificationsCountForResource("selectedTaxa", store, true);

    expect(store.selectedTaxa).toStrictEqual([
      { id: lifeBasic.id, identifications_count: lifeCount },
      { id: redOakBasic.id, identifications_count: oakCount },
    ]);
  });

  test("only update  missing if onlyFetchMissingCounts is true and mix of existing and missing couns", async () => {
    let store = structuredClone(mapStore);
    store.selectedTaxa = [
      { id: lifeBasic.id, identifications_count: 123 },
      { id: redOakBasic.id },
    ];

    await updateIdentificationsCountForResource("selectedTaxa", store, true);

    expect(store.selectedTaxa).toStrictEqual([
      { id: lifeBasic.id, identifications_count: 123 },
      { id: redOakBasic.id, identifications_count: oakCount },
    ]);
  });

  test("only adds identification count for specified selected resource", async () => {
    let store = structuredClone(mapStore);
    store.selectedPlaces = [losangeles];
    store.selectedProjects = [project_cnc1];
    store.selectedTaxa = [lifeBasic];
    store.selectedTaxaIdentified = [redOakBasic];
    store.selectedUnobservedByUser = user1;
    store.selectedUsers = [user1];
    store.selectedUsersIdentifiers = [user2];

    await updateIdentificationsCountForResource("selectedTaxa", store);

    expect(store.selectedPlaces[0].identifications_count).toBeUndefined();
    expect(store.selectedProjects[0].identifications_count).toBeUndefined();
    expect(store.selectedTaxa[0].identifications_count).toBe(
      lifeIdentification().identifications_count,
    );
    expect(
      store.selectedUnobservedByUser.identifications_count,
    ).toBeUndefined();
    expect(store.selectedUsers[0].identifications_count).toBeUndefined();
    expect(
      store.selectedUsersIdentifiers[0].identifications_count,
    ).toBeUndefined();
  });
});

describe("updateObservationsCountForResource", () => {
  let lifeCount = 10000;
  let oakCount = 1000;

  test("adds count for specified selected resource", async () => {
    let store = structuredClone(mapStore);
    store.selectedTaxa = [{ id: lifeBasic.id }, { id: redOakBasic.id }];

    await updateObservationsCountForResource("selectedTaxa", store);

    expect(store.selectedTaxa).toStrictEqual([
      { id: lifeBasic.id, observations_count: lifeCount },
      { id: redOakBasic.id, observations_count: oakCount },
    ]);
  });

  test("replaces existing identification count", async () => {
    let store = structuredClone(mapStore);
    store.selectedTaxa = [
      { id: lifeBasic.id, observations_count: 123 },
      { id: redOakBasic.id, observations_count: 456 },
    ];

    await updateObservationsCountForResource("selectedTaxa", store);

    expect(store.selectedTaxa).toStrictEqual([
      { id: lifeBasic.id, observations_count: lifeCount },
      { id: redOakBasic.id, observations_count: oakCount },
    ]);
  });

  test("update all counts if mix of existing and missing counts", async () => {
    let store = structuredClone(mapStore);
    store.selectedTaxa = [
      { id: lifeBasic.id, observations_count: 123 },
      { id: redOakBasic.id },
    ];

    await updateObservationsCountForResource("selectedTaxa", store);

    expect(store.selectedTaxa).toStrictEqual([
      { id: lifeBasic.id, observations_count: lifeCount },
      { id: redOakBasic.id, observations_count: oakCount },
    ]);
  });

  test("adds count if onlyFetchMissingCounts is true ", async () => {
    let store = structuredClone(mapStore);
    store.selectedTaxa = [{ id: lifeBasic.id }, { id: redOakBasic.id }];

    await updateObservationsCountForResource("selectedTaxa", store, true);

    expect(store.selectedTaxa).toStrictEqual([
      { id: lifeBasic.id, observations_count: lifeCount },
      { id: redOakBasic.id, observations_count: oakCount },
    ]);
  });

  test("replace existing count if onlyFetchMissingCounts is true", async () => {
    let store = structuredClone(mapStore);
    store.selectedTaxa = [
      { id: lifeBasic.id, observations_count: 123 },
      { id: redOakBasic.id, observations_count: 456 },
    ];

    await updateObservationsCountForResource("selectedTaxa", store, true);

    expect(store.selectedTaxa).toStrictEqual([
      { id: lifeBasic.id, observations_count: lifeCount },
      { id: redOakBasic.id, observations_count: oakCount },
    ]);
  });

  test("only update  missing if onlyFetchMissingCounts is true and mix of existing and missing couns", async () => {
    let store = structuredClone(mapStore);
    store.selectedTaxa = [
      { id: lifeBasic.id, observations_count: 123 },
      { id: redOakBasic.id },
    ];

    await updateObservationsCountForResource("selectedTaxa", store, true);

    expect(store.selectedTaxa).toStrictEqual([
      { id: lifeBasic.id, observations_count: 123 },
      { id: redOakBasic.id, observations_count: oakCount },
    ]);
  });

  test("only adds identification count for specified selected resource", async () => {
    let store = structuredClone(mapStore);
    store.selectedPlaces = [losangeles];
    store.selectedProjects = [project_cnc1];
    store.selectedTaxa = [lifeBasic];
    store.selectedTaxaIdentified = [redOakBasic];
    store.selectedUnobservedByUser = user1;
    store.selectedUsers = [user1];
    store.selectedUsersIdentifiers = [user2];

    await updateObservationsCountForResource("selectedTaxa", store);

    expect(store.selectedPlaces[0].identifications_count).toBeUndefined();
    expect(store.selectedProjects[0].identifications_count).toBeUndefined();
    expect(store.selectedTaxa[0].identifications_count).toBeDefined();
    expect(
      store.selectedUnobservedByUser.identifications_count,
    ).toBeUndefined();
    expect(store.selectedUsers[0].identifications_count).toBeUndefined();
    expect(
      store.selectedUsersIdentifiers[0].identifications_count,
    ).toBeUndefined();
  });
});

describe("updateSelectedResourcesId", () => {
  function populateStore() {
    let store = structuredClone(mapStore);
    store.selectedPlaces = [losangeles, sandiego];
    store.selectedProjects = [project_cnc1, project_cnc2];
    store.selectedTaxa = [lifeBasic, redOakBasic];
    store.selectedTaxaIdentified = [redOakBasic, lifeBasic];
    store.selectedUnobservedByUser = user1;
    store.selectedUsers = [user1, user2];
    store.selectedUsersIdentifiers = [user2, user1];
    return store;
  }

  test("updates ids for store.observationsApiParams using selected resources", () => {
    let store = populateStore();
    store.record_type = "observations";

    updateSelectedResourcesId(store);

    expect(store.observationsApiParams.place_id).toBe(
      `${losangeles.id},${sandiego.id}`,
    );
    expect(store.observationsApiParams.project_id).toBe(
      `${project_cnc1.id},${project_cnc2.id}`,
    );
    expect(store.observationsApiParams.taxon_id).toBe(
      `${lifeBasic.id},${redOakBasic.id}`,
    );
    expect(store.observationsApiParams.unobserved_by_user_id).toBe(user1.id);
    expect(store.observationsApiParams.user_id).toBe(`${user1.id},${user2.id}`);
    expect(store.observationsApiParams.ident_user_id).toBe(
      `${user2.id},${user1.id}`,
    );
  });

  test("updates ids for store.identificationsApiParams using selected resources", () => {
    let store = populateStore();
    store.record_type = "identifications";

    updateSelectedResourcesId(store);

    expect(store.identificationsApiParams.place_id).toBe(
      `${losangeles.id},${sandiego.id}`,
    );
    expect(store.identificationsApiParams.taxon_id).toBe(
      `${redOakBasic.id},${lifeBasic.id}`,
    );
    expect(store.identificationsApiParams.observation_taxon_id).toBe(
      `${lifeBasic.id},${redOakBasic.id}`,
    );
    expect(store.identificationsApiParams.user_id).toBe(
      `${user2.id},${user1.id}`,
    );
  });

  test("passed-in record type overrides store record type ", () => {
    let store = populateStore();
    store.record_type = "identifications";

    updateSelectedResourcesId(store, "observations");

    expect(store.observationsApiParams.place_id).toBe(
      `${losangeles.id},${sandiego.id}`,
    );
    expect(store.observationsApiParams.project_id).toBe(
      `${project_cnc1.id},${project_cnc2.id}`,
    );
    expect(store.observationsApiParams.taxon_id).toBe(
      `${lifeBasic.id},${redOakBasic.id}`,
    );
    expect(store.observationsApiParams.unobserved_by_user_id).toBe(user1.id);
    expect(store.observationsApiParams.user_id).toBe(`${user1.id},${user2.id}`);
    expect(store.observationsApiParams.ident_user_id).toBe(
      `${user2.id},${user1.id}`,
    );
  });

  test("does not update ids for empty selected resources", () => {
    let store = structuredClone(mapStore);
    store.record_type = "observations";
    store.selectedPlaces = [losangeles, sandiego];
    store.selectedProjects = [];
    store.selectedTaxa = [];
    store.selectedUsers = [];
    store.selectedUsersIdentifiers = [];

    updateSelectedResourcesId(store);

    expect(store.observationsApiParams.place_id).toBe(
      `${losangeles.id},${sandiego.id}`,
    );
    expect(store.observationsApiParams.project_id).toBeUndefined();
    expect(store.observationsApiParams.taxon_id).toBeUndefined();
    expect(store.observationsApiParams.unobserved_by_user_id).toBeUndefined();
    expect(store.observationsApiParams.user_id).toBeUndefined();
    expect(store.observationsApiParams.ident_user_id).toBeUndefined();
  });
});
