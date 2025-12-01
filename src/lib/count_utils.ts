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
import { updateSelectedResource } from "./data_utils.ts";

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
  await updateObservationsCountForOne(record, resource, appStore, paramsTemp);
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
  await getObservationsCountForRecord(record, paramsTemp);

  updateSelectedResource(record, resource, appStore);
}

async function getObservationsCountForRecord(
  record:
    | NormalizediNatPlace
    | NormalizediNatTaxon
    | NormalizediNatProject
    | NormalizediNatUser,
  paramsTemp: ObservationsApiParams,
) {
  if (import.meta.env.VITE_CACHE === "true") {
    record.observations_count = -888;
    return record;
  }

  let params = cleanupObervationsParamsForRecord(paramsTemp).toString();
  let perPage = 0;
  let data = await getObservations(params, perPage);
  record.observations_count = data?.total_results;

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
) {
  await updateObservationsCountForAll(ignoreResource, appStore);
}

async function updateObservationsCountForAll(
  ignoreResource: MapStoreSelectedResourcesKeys | "all",
  appStore: MapStore,
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
  for await (const res of targetResources) {
    await updateObservationsCountForResource(res, appStore);
  }
}

async function updateObservationsCountForResource(
  resource: MapStoreSelectedResourcesKeys,
  appStore: MapStore,
) {
  let idField = "";
  if (resource === "selectedPlaces") {
    idField = "place_id";
  } else if (resource === "selectedProjects") {
    idField = "project_id";
  } else if (resource === "selectedTaxa") {
    idField = "taxon_id";
  } else if (resource === "selectedTaxaIdentified") {
    idField = "taxon_id";
  } else if (resource === "selectedUsers") {
    idField = "user_id";
  } else if (resource === "selectedUsersIdentifiers") {
    idField = "ident_user_id";
  } else {
    throw Error("invalid selected resource: " + resource);
  }

  for await (const record of appStore[resource]) {
    let paramsTemp = {
      ...appStore.observationsApiParams,
      [idField]: record.id.toString(),
    };
    await updateObservationsCountForOne(record, resource, appStore, paramsTemp);
  }
}
