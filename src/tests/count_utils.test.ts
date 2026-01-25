// @vitest-environment jsdom

import { expect, test, describe, beforeAll, afterEach, afterAll } from "vitest";

import {
  updateCountForAll,
  updateIdentificationsCountForResource,
  updateObservationsCountForResource,
  updateSelectedResourcesId,
} from "../lib/count_utils";
import { mapStore } from "../lib/store";
import {
  allTaxa,
  createMockServer,
  life,
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
    expect(store.identificationsApiParams.user_id).toBe(`${user1.id}`);
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

describe("updateCountForAll", () => {
  test("update observations_count for all selected resources", async () => {
    let life1 = life();
    let lifeCount = life1.observations_count as number;

    let store = structuredClone(mapStore);
    store.record_type = "observations";
    store.selectedTaxa = [{ ...life1, observations_count: 1 }];
    store.selectedPlaces = [{ ...losangeles, observations_count: 1 }];
    store.observationsApiParams = {
      taxon_id: life1.id.toString(),
      place_id: losangeles.id.toString(),
    };

    await updateCountForAll("all", store);

    expect(store.selectedTaxa).toStrictEqual([
      { ...life1, observations_count: lifeCount * 0.6 },
    ]);
    expect(store.selectedPlaces).toStrictEqual([
      { ...losangeles, observations_count: lifeCount * 0.6 },
    ]);
  });

  test("update observations_count for all resources except given resource", async () => {
    let life1 = life();
    let lifeCount = life1.observations_count as number;

    let store = structuredClone(mapStore);
    store.record_type = "observations";
    store.selectedTaxa = [{ ...life1, observations_count: 1 }];
    store.selectedPlaces = [{ ...losangeles, observations_count: 1 }];
    store.observationsApiParams = {
      taxon_id: life1.id.toString(),
      place_id: losangeles.id.toString(),
    };

    await updateCountForAll("selectedTaxa", store);

    expect(store.selectedTaxa).toStrictEqual([
      { ...life1, observations_count: 1 },
    ]);
    expect(store.selectedPlaces).toStrictEqual([
      { ...losangeles, observations_count: lifeCount * 0.6 },
    ]);
  });

  test("update identifications_count for all selected resources if identifications", async () => {
    let life1 = lifeIdentification();
    let lifeCount = (life().observations_count as number) * 2;

    let store = structuredClone(mapStore);
    store.record_type = "identifications";
    store.selectedTaxa = [{ ...life1, identifications_count: 1 }];
    store.selectedPlaces = [{ ...losangeles, identifications_count: 1 }];
    store.identificationsApiParams = {
      observation_taxon_id: life1.id.toString(),
      place_id: losangeles.id.toString(),
    };

    await updateCountForAll("all", store);

    expect(store.selectedTaxa).toStrictEqual([
      { ...life1, identifications_count: lifeCount * 0.6 },
    ]);
    expect(store.selectedPlaces).toStrictEqual([
      { ...losangeles, identifications_count: lifeCount * 0.6 },
    ]);
  });

  test("update identifications_count for all resources except given resource if identifications", async () => {
    let life1 = lifeIdentification();
    let lifeCount = (life().observations_count as number) * 2;

    let store = structuredClone(mapStore);
    store.record_type = "identifications";
    store.selectedTaxa = [{ ...life1, identifications_count: 1 }];
    store.selectedPlaces = [{ ...losangeles, identifications_count: 1 }];
    store.identificationsApiParams = {
      observation_taxon_id: life1.id.toString(),
      place_id: losangeles.id.toString(),
    };

    await updateCountForAll("selectedTaxa", store);

    expect(store.selectedTaxa).toStrictEqual([
      { ...life1, identifications_count: 1 },
    ]);
    expect(store.selectedPlaces).toStrictEqual([
      { ...losangeles, identifications_count: lifeCount * 0.6 },
    ]);
  });

  test("update observations_count for default taxon", async () => {
    let store = structuredClone(mapStore);
    let allCount = allTaxa.observations_count;
    store.record_type = "observations";
    store.selectedTaxa = [{ ...allTaxa, observations_count: 1 }];
    store.selectedPlaces = [{ ...losangeles, observations_count: 1 }];
    store.observationsApiParams = {
      taxon_id: allTaxa.id.toString(),
      place_id: losangeles.id.toString(),
    };

    await updateCountForAll("all", store);

    expect(store.selectedTaxa).toStrictEqual([
      { ...allTaxa, observations_count: allCount * 0.6 },
    ]);
    expect(store.selectedPlaces).toStrictEqual([
      { ...losangeles, observations_count: allCount * 0.6 },
    ]);
  });
});
