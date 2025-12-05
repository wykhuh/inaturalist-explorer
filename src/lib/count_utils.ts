import type {
  NormalizediNatTaxon,
  MapStore,
  ObservationsApiParams,
  NormalizediNatPlace,
  NormalizediNatProject,
  NormalizediNatUser,
  MapStoreSelectedResourcesKeys,
} from "../types/app";
import { getIdentifications, getObservations } from "./inat_api.ts";
import {
  cleanupIdentificationsParamsForRecord,
  cleanupObervationsParamsForRecord,
} from "./cleanup_params_utils.ts";
import { isObservationsCheck, updateSelectedResource } from "./data_utils.ts";

export async function updateCountForOne(
  record:
    | NormalizediNatUser
    | NormalizediNatProject
    | NormalizediNatPlace
    | NormalizediNatTaxon,
  resource: MapStoreSelectedResourcesKeys,
  appStore: MapStore,
  paramsTemp: ObservationsApiParams,
) {
  if (isObservationsCheck(appStore)) {
    await updateObservationsCountForOne(record, resource, appStore, paramsTemp);
  } else {
    await updateIdentificationsCountForOne(
      record,
      resource,
      appStore,
      paramsTemp,
    );
  }
}

async function updateObservationsCountForOne(
  record:
    | NormalizediNatUser
    | NormalizediNatProject
    | NormalizediNatPlace
    | NormalizediNatTaxon,
  resource: MapStoreSelectedResourcesKeys,
  appStore: MapStore,
  paramsTemp: ObservationsApiParams,
) {
  await getObservationsCountForRecord(record, paramsTemp, appStore);

  updateSelectedResource(record, resource, appStore);
}

async function getObservationsCountForRecord(
  record:
    | NormalizediNatPlace
    | NormalizediNatTaxon
    | NormalizediNatProject
    | NormalizediNatUser,
  paramsTemp: ObservationsApiParams,
  appStore: MapStore,
) {
  if (import.meta.env.VITE_CACHE === "true") {
    record.observations_count = -888;
    return record;
  }

  let params = cleanupObervationsParamsForRecord(paramsTemp).toString();
  let perPage = 0;
  let data = await getObservations(params, perPage);
  if (isObservationsCheck(appStore)) {
    record.observations_count = data?.total_results;
  } else {
    record.identifications_count = data?.total_results;
  }
  return record;
}

export async function updateIdentificationsCountForOne(
  record: NormalizediNatPlace | NormalizediNatTaxon | NormalizediNatUser,
  resource: MapStoreSelectedResourcesKeys,
  appStore: MapStore,
  paramsTemp: ObservationsApiParams,
) {
  await getIdentificationsCountForRecord(record, paramsTemp);

  updateSelectedResource(record, resource, appStore);
}

async function getIdentificationsCountForRecord(
  record:
    | NormalizediNatPlace
    | NormalizediNatTaxon
    | NormalizediNatProject
    | NormalizediNatUser,
  paramsTemp: ObservationsApiParams,
) {
  if (import.meta.env.VITE_CACHE === "true") {
    record.identifications_count = -555;
    return record;
  }

  let params = cleanupIdentificationsParamsForRecord(paramsTemp);
  let perPage = 0;
  let data = await getIdentifications(params, perPage);
  record.identifications_count = data?.total_results;

  return record;
}

export async function updateCountForAll(
  ignoreResource: MapStoreSelectedResourcesKeys | "all",
  appStore: MapStore,
  onlyFetchMissingCounts = false,
) {
  if (isObservationsCheck(appStore)) {
    await updateObservationsCountForAll(
      ignoreResource,
      appStore,
      onlyFetchMissingCounts,
    );
  } else {
    await updateIdentificationsCountForAll(
      ignoreResource,
      appStore,
      onlyFetchMissingCounts,
    );
  }
}

async function updateObservationsCountForAll(
  ignoreResource: MapStoreSelectedResourcesKeys | "all",
  appStore: MapStore,
  onlyFetchMissingCounts = false,
) {
  let resources = [
    "selectedTaxa",
    "selectedTaxaIdentified",
    "selectedPlaces",
    "selectedProjects",
    "selectedUsers",
    "selectedUsersIdentifiers",
  ] as MapStoreSelectedResourcesKeys[];

  let targetResources = resources.filter((r) => r != ignoreResource);
  for await (const resource of targetResources) {
    await updateObservationsCountForResource(
      resource,
      appStore,
      onlyFetchMissingCounts,
    );
  }
}

export async function updateObservationsCountForResource(
  resource: MapStoreSelectedResourcesKeys,
  appStore: MapStore,
  onlyFetchMissingCounts = false,
) {
  let idField = getIdFieldForResource(resource, appStore);
  for await (const record of appStore[resource]) {
    let counts = appStore[resource].map((r) => r.observations_count);
    if (
      onlyFetchMissingCounts &&
      counts.some((c) => c === undefined) &&
      record.observations_count !== undefined
    ) {
      continue;
    }

    let paramsTemp = {
      ...appStore.observationsApiParams,
      [idField]: record.id.toString(),
    };
    await updateObservationsCountForOne(record, resource, appStore, paramsTemp);
  }
}

async function updateIdentificationsCountForAll(
  ignoreResource: MapStoreSelectedResourcesKeys | "all",
  appStore: MapStore,
  onlyFetchMissingCounts = false,
) {
  let resources = [
    "selectedTaxa",
    "selectedTaxaIdentified",
    "selectedPlaces",
    "selectedUsers",
    "selectedUsersIdentifiers",
  ] as MapStoreSelectedResourcesKeys[];

  let targetResources = resources.filter((r) => r != ignoreResource);
  for await (const resource of targetResources) {
    await updateIdentificationsCountForResource(
      resource,
      appStore,
      onlyFetchMissingCounts,
    );
  }
}

export async function updateIdentificationsCountForResource(
  resource: MapStoreSelectedResourcesKeys,
  appStore: MapStore,
  onlyFetchMissingCounts = false,
) {
  let idField = getIdFieldForResource(resource, appStore);
  let counts = appStore[resource].map((r) => r.identifications_count);
  for await (const record of appStore[resource]) {
    if (
      onlyFetchMissingCounts &&
      counts.some((c) => c == undefined) &&
      record.identifications_count !== undefined
    ) {
      continue;
    }

    let paramsTemp = {
      ...appStore.identificationsApiParams,
      [idField]: record.id.toString(),
    };
    await updateIdentificationsCountForOne(
      record,
      resource,
      appStore,
      paramsTemp,
    );
  }
}

function getIdFieldForResource(
  resource: MapStoreSelectedResourcesKeys,
  appStore: MapStore,
) {
  let isObservation = isObservationsCheck(appStore);
  let idField = "";
  if (resource === "selectedPlaces") {
    idField = "place_id";
  } else if (resource === "selectedProjects") {
    idField = "project_id";
  } else if (resource === "selectedTaxa") {
    if (isObservation) {
      idField = "taxon_id";
    } else {
      idField = "observation_taxon_id";
    }
  } else if (resource === "selectedTaxaIdentified") {
    if (!isObservation) {
      idField = "taxon_id";
    }
  } else if (resource === "selectedUsers") {
    if (isObservation) {
      idField = "user_id";
    }
  } else if (resource === "selectedUsersIdentifiers") {
    if (isObservation) {
      idField = "ident_user_id";
    } else {
      idField = "user_id";
    }
  } else {
    throw Error("invalid selected resource: " + resource);
  }
  return idField;
}

// when switching pages, we need to update
// observationsApiParams/identificationsApiParams for the next page since those
// values are not updated when adding selected resources on current page
export function updateSelectedResourcesId(appStore: MapStore) {
  let place_id = appStore.selectedPlaces.map((r) => r.id);
  let project_id = appStore.selectedProjects.map((r) => r.id);
  let taxon_observed_id = appStore.selectedTaxa.map((r) => r.id);
  let taxon_identified_id = appStore.selectedTaxaIdentified.map((r) => r.id);
  let unobserved_id = appStore.selectedUnobservedByUser.id;
  let user_observer_id = appStore.selectedUsers.map((r) => r.id);
  let user_identifier_id = appStore.selectedUsersIdentifiers.map((r) => r.id);
  if (isObservationsCheck(appStore)) {
    if (place_id.length > 0) {
      appStore.observationsApiParams.place_id = place_id.join(",");
    }
    if (project_id.length > 0) {
      appStore.observationsApiParams.project_id = project_id.join(",");
    }
    if (taxon_observed_id.length > 0) {
      appStore.observationsApiParams.taxon_id = taxon_observed_id.join(",");
    }
    if (unobserved_id) {
      appStore.observationsApiParams.unobserved_by_user_id = unobserved_id;
    }
    if (user_observer_id.length > 0) {
      appStore.observationsApiParams.user_id = user_observer_id.join(",");
    }
    if (user_identifier_id.length > 0) {
      appStore.observationsApiParams.ident_user_id =
        user_identifier_id.join(",");
    }
  } else {
    if (place_id.length > 0) {
      appStore.identificationsApiParams.place_id = place_id.join(",");
    }
    if (taxon_identified_id.length > 0) {
      appStore.identificationsApiParams.taxon_id =
        taxon_identified_id.join(",");
    }
    if (taxon_observed_id.length > 0) {
      appStore.identificationsApiParams.observation_taxon_id =
        taxon_observed_id.join(",");
    }
    if (user_identifier_id.length > 0) {
      appStore.identificationsApiParams.user_id = user_identifier_id.join(",");
    }
  }
}
