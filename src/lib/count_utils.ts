import type {
  NormalizediNatTaxonType,
  AppStoreType,
  ObservationsApiParamsType,
  NormalizediNatPlaceType,
  NormalizediNatProjectType,
  NormalizediNatUserType,
  AppStoreSelectedResourcesKeysType,
} from "../types/app";
import { getIdentifications, getObservations } from "./inat_api.ts";
import {
  cleanupIdentificationsParamsForRecord,
  cleanupObervationsParamsForRecord,
} from "./cleanup_params_utils.ts";
import { isObservationsCheck, updateSelectedResource } from "./data_utils.ts";
import {
  selectedResources,
  selectedResourcesIdIdentifications,
  selectedResourcesIdObservations,
} from "../data/app_data.ts";

export async function updateCountForOne(
  record:
    | NormalizediNatUserType
    | NormalizediNatProjectType
    | NormalizediNatPlaceType
    | NormalizediNatTaxonType,
  resource: AppStoreSelectedResourcesKeysType,
  appStore: AppStoreType,
  paramsTemp: ObservationsApiParamsType,
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
    | NormalizediNatUserType
    | NormalizediNatProjectType
    | NormalizediNatPlaceType
    | NormalizediNatTaxonType,
  resource: AppStoreSelectedResourcesKeysType,
  appStore: AppStoreType,
  paramsTemp: ObservationsApiParamsType,
) {
  await getObservationsCountForRecord(record, paramsTemp, appStore);

  updateSelectedResource(record, resource, appStore);
}

async function getObservationsCountForRecord(
  record:
    | NormalizediNatPlaceType
    | NormalizediNatTaxonType
    | NormalizediNatProjectType
    | NormalizediNatUserType,
  paramsTemp: ObservationsApiParamsType,
  appStore: AppStoreType,
) {
  if (import.meta.env?.VITE_CACHE === "true") {
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
  record:
    | NormalizediNatPlaceType
    | NormalizediNatTaxonType
    | NormalizediNatUserType,
  resource: AppStoreSelectedResourcesKeysType,
  appStore: AppStoreType,
  paramsTemp: ObservationsApiParamsType,
) {
  await getIdentificationsCountForRecord(record, paramsTemp);

  updateSelectedResource(record, resource, appStore);
}

async function getIdentificationsCountForRecord(
  record:
    | NormalizediNatPlaceType
    | NormalizediNatTaxonType
    | NormalizediNatProjectType
    | NormalizediNatUserType,
  paramsTemp: ObservationsApiParamsType,
) {
  if (import.meta.env?.VITE_CACHE === "true") {
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
  ignoreResource: AppStoreSelectedResourcesKeysType | "all",
  appStore: AppStoreType,
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
  ignoreResource: AppStoreSelectedResourcesKeysType | "all",
  appStore: AppStoreType,
  onlyFetchMissingCounts = false,
) {
  let targetResources = selectedResources.filter((r) => r != ignoreResource);
  for await (const resource of targetResources) {
    await updateObservationsCountForResource(
      resource,
      appStore,
      onlyFetchMissingCounts,
    );
  }
}

export async function updateObservationsCountForResource(
  resource: AppStoreSelectedResourcesKeysType,
  appStore: AppStoreType,
  onlyFetchMissingCounts = false,
) {
  let idField = getIdFieldForResource(resource, appStore);
  if (!idField) return;

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
  ignoreResource: AppStoreSelectedResourcesKeysType | "all",
  appStore: AppStoreType,
  onlyFetchMissingCounts = false,
) {
  let resources = [
    "selectedTaxa",
    "selectedTaxaIdentified",
    "selectedPlaces",
    "selectedUsers",
    "selectedUsersIdentifiers",
  ] as AppStoreSelectedResourcesKeysType[];

  let targetResources = resources
    .filter((r) => r != ignoreResource)
    .filter((r) => appStore[r].length > 0);

  for await (const resource of targetResources) {
    await updateIdentificationsCountForResource(
      resource,
      appStore,
      onlyFetchMissingCounts,
    );
  }
}

export async function updateIdentificationsCountForResource(
  resource: AppStoreSelectedResourcesKeysType,
  appStore: AppStoreType,
  onlyFetchMissingCounts = false,
) {
  let idField = getIdFieldForResource(resource, appStore);
  if (!idField) return;

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
    cleanupIdentificationsParamsForRecord(paramsTemp);
    await updateIdentificationsCountForOne(
      record,
      resource,
      appStore,
      paramsTemp,
    );
  }
}

function getIdFieldForResource(
  resource: AppStoreSelectedResourcesKeysType,
  appStore: AppStoreType,
) {
  let isObservation = isObservationsCheck(appStore);
  let idField: null | string = "";

  if (isObservation) {
    idField =
      selectedResourcesIdObservations[
        resource as keyof typeof selectedResourcesIdObservations
      ];
  } else {
    idField =
      selectedResourcesIdIdentifications[
        resource as keyof typeof selectedResourcesIdObservations
      ];
  }
  if (idField === undefined) {
    throw Error("missing id field for selected resource: " + resource);
  }

  return idField;
}

// when switching pages, we need to update
// observationsApiParams/identificationsApiParams for the next page since those
// values are not updated when adding selected resources on current page
export function updateSelectedResourcesId(
  appStore: AppStoreType,
  recordType = appStore.record_type,
) {
  let place_id = appStore.selectedPlaces.map((r) => r.id);
  let project_id = appStore.selectedProjects.map((r) => r.id);
  let taxon_observed_id = appStore.selectedTaxa.map((r) => r.id);
  let taxon_identified_id = appStore.selectedTaxaIdentified.map((r) => r.id);
  let unobserved_id = appStore.selectedUnobservedByUser.id;
  let viewer_id = appStore.selectedReviewer.id;
  let user_observer_id = appStore.selectedUsers.map((r) => r.id);
  let user_identifier_id = appStore.selectedUsersIdentifiers.map((r) => r.id);
  if (recordType === "observations") {
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
    if (viewer_id) {
      appStore.observationsApiParams.viewer_id = viewer_id;
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
