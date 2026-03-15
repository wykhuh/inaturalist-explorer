import { iconicTaxaIdName, subspeciesRanks } from "../data/inat_data";
import {
  betaHacks,
  fieldsWithAny,
  identificationsApiNames,
  observationsApiNames,
} from "../data/app_data";
import type {
  IdentificationsApiParamsType,
  IdentificationsMapTilesAPIParamsType,
  AppStoreType,
  MapTilesAPIParamsType,
  ObservationsApiParamsType,
  ObservationsMapTilesAPIParamsType,
  RecordTypes,
} from "../types/app";
import { iNatOrange } from "./map_colors_utils";
import { formatAppUrl } from "./utils";
import { isObservationsCheck, isSubpeciesCheck } from "./data_utils";

function cleanupParamsStore(
  appStore: AppStoreType,
  recordType: RecordTypes = appStore.record_type,
) {
  let string = formatAppUrl(appStore, recordType);
  let params = new URLSearchParams(string);
  cleanupParams(params);
  return params;
}

function cleanupParams(params: URLSearchParams) {
  // delete properties that should not go to api
  params.delete("colors");
  params.delete("view");
  params.delete("subview");

  if (params.get("taxon_id") === "0") {
    params.delete("taxon_id");
  }
  if (params.get("ident_taxon_id") === "0") {
    params.delete("ident_taxon_id");
  }
  if (params.get("observation_taxon_id") === "0") {
    params.delete("observation_taxon_id");
  }
  if (params.get("place_id") === "0") {
    params.delete("place_id");
  }

  betaHacks.forEach((field) => {
    if (params.get(field)) {
      params.delete(field);
    }
  });

  fieldsWithAny.forEach((field) => {
    if (params.get(field) === "any") {
      params.delete(field);
    }
  });

  if (params.get("spam") === null) {
    params.append("spam", "false");
  }
}

function deleteParams(deleteParams: string[], params: URLSearchParams) {
  deleteParams.forEach((param) => {
    if (params.get(param)) {
      params.delete(param);
    }
  });
}

// =============
// observations API
// =============

export function cleanupObervationsParamsForRecord(
  inatParams: ObservationsApiParamsType,
) {
  let params = new URLSearchParams(inatParams as any);
  cleanupParams(params);

  return params.toString();
}

export function cleanupObervationsParamsObject(
  appStore: AppStoreType,
  recordType = appStore.record_type,
) {
  let params = cleanupParamsStore(appStore, recordType);
  return params;
}

export function cleanupObervationsParams(
  appStore: AppStoreType,
  recordType = appStore.record_type,
) {
  let params = cleanupObervationsParamsObject(appStore, recordType);

  return params.toString();
}

export function cleanupGraphs(
  appStore: AppStoreType,
  recordType = appStore.record_type,
) {
  let params = cleanupObervationsParamsObject(appStore, recordType);

  // set place to US if place not set
  if (params.get("place_id") === null) {
    params.set("place_id", `1`);
  }

  // set start date to 10 years ago  if d1 not set
  if (params.get("d1") === null) {
    let year = new Date().getFullYear() - 10;
    params.set("d1", `${year}-01-01`);
  }

  return params;
}

export function cleanupObervationsHistogramParams(
  appStore: AppStoreType,
  recordType = appStore.record_type,
) {
  let params = cleanupGraphs(appStore, recordType);

  if (params.get("per_page")) {
    params.delete("per_page");
  }

  params.set("date_field", `observed`);

  return params;
}

export function cleanupObervationsPopularFieldsBasicParams(
  appStore: AppStoreType,
  recordType = appStore.record_type,
) {
  let params = cleanupGraphs(appStore, recordType);

  params.set("per_page", `50`);
  params.set("no_histograms", `true`);

  return params;
}

export function cleanupObervationsPopularFieldsParams(
  appStore: AppStoreType,
  recordType = appStore.record_type,
) {
  let params = cleanupGraphs(appStore, recordType);

  params.set("per_page", `50`);
  params.set("unannotated", `true`);

  return params;
}

export function cleanupObervationsSpeciesParams(
  appStore: AppStoreType,
  recordType = appStore.record_type,
) {
  let params = cleanupParamsStore(appStore, recordType);
  // to handle how api/v1/observations/taxomony handles subspecies, if rank
  // has subspecies, remove subspecies
  if (isSubpeciesCheck(appStore)) {
    let rank = params.get("rank");
    if (rank) {
      let higherRanks = rank
        .split(",")
        .filter((r) => !subspeciesRanks.includes(r))
        .join(",");
      if (higherRanks == "") {
        params.delete("rank");
      } else {
        params.set("rank", higherRanks);
      }
    }
  }

  return params.toString();
}

export function cleanupObervationsObserversParams(
  appStore: AppStoreType,
  recordType = appStore.record_type,
) {
  let params = cleanupParamsStore(appStore, recordType);

  params.delete("order");
  params.delete("order_by");

  return params.toString();
}

export function cleanupIdentificationsObservationsParams(
  appStore: AppStoreType,
) {
  let cleanParams = convertIdentificationParamsToObservationParams(
    appStore.identificationsApiParams,
  );
  let params = new URLSearchParams(cleanParams as any);
  cleanupParams(params);

  return params.toString();
}

export function cleanupObervationsTaxonomyParams(
  inatParams: ObservationsApiParamsType,
) {
  let params = new URLSearchParams(inatParams as any);
  cleanupParams(params);

  params.delete("order");
  params.delete("order_by");
  params.delete("page");
  params.delete("per_page");
  params.delete("locale");
  params.delete("verifiable");
  params.delete("spam");
  params.delete("rank");

  return params.toString();
}

// =============
// identifications API
// =============

export function cleanupIdentificationsParamsForRecord(
  inatParams: IdentificationsApiParamsType,
) {
  let params = new URLSearchParams(inatParams as any);
  cleanupParams(params);

  return params.toString();
}

export function cleanupIdentificationParamsObject(
  appStore: AppStoreType,
  recordType = appStore.record_type,
) {
  let params = cleanupParamsStore(appStore, recordType);

  // NOTE: iNat API only allows one identifier for identifications,
  let identifierId = params.get("user_id");
  if (identifierId) {
    let ids = identifierId.split(",");
    params.set("user_id", ids[ids.length - 1]);
  }

  return params;
}

export function cleanupIdentificationParams(
  appStore: AppStoreType,
  recordType = appStore.record_type,
) {
  let params = cleanupIdentificationParamsObject(appStore, recordType);

  return params.toString();
}

export function cleanupIdentificationsObserversParams(
  appStore: AppStoreType,
  recordType = appStore.record_type,
) {
  let params = cleanupParamsStore(appStore, recordType);

  params.delete("order");
  params.delete("order_by");

  // NOTE: iNat API only allows one identifier for identifications,
  let identifierId = params.get("user_id");
  if (identifierId) {
    let ids = identifierId.split(",");
    params.set("user_id", ids[ids.length - 1]);
  }

  return params.toString();
}

// =============
// tiles API
// =============

export let identificationOnlyParams = [
  "d1",
  "d2",
  "iconic_taxon_id",
  "hrank",
  "lrank",
  "rank",
  "without_taxon_id",
  "category",
];

export const processedIdentificationsToObservationsParams = [
  "observation_taxon_active",
  "observation_created_d2",
  "observation_created_d1",
  "observation_rank",
  "observation_hrank",
  "observation_lrank",
  "observation_taxon_id",
  "observed_d2",
  "observed_d1",
  "observation_iconic_taxon_id",
  "user_id",
  "without_observation_taxon_id",
];

export function convertIdentificationParamsToObservationParams(
  params: IdentificationsMapTilesAPIParamsType,
) {
  let cleanedParms = {} as any;

  for (const [key, value] of Object.entries(params)) {
    if (["color", "colors"].includes(key)) {
      cleanedParms[key] = value;
    } else if (!identificationsApiNames.includes(key)) {
      continue;
    } else if (identificationOnlyParams.includes(key)) {
      continue;
    } else if (key === "observation_iconic_taxon_id") {
      cleanedParms.iconic_taxa = value
        .toString()
        .split(",")
        .map((id: string) => (iconicTaxaIdName as any)[id])
        .join(",");
    } else if (key.startsWith("user_id")) {
      cleanedParms.ident_user_id = value;
    } else if (key === "taxon_id") {
      cleanedParms.ident_taxon_id = value;
    } else if (key === "without_observation_taxon_id") {
      cleanedParms.without_taxon_id = value;
    } else if (key.startsWith("observed_")) {
      let k = key.replace("observed_", "");
      cleanedParms[k] = value;
    } else if (key.startsWith("observation_")) {
      cleanedParms[key.replace("observation_", "")] = value;
    } else if (value !== "") {
      cleanedParms[key] = value;
    }
  }

  return cleanedParms;
}

export const ignoreMapParams = ["page", "per_page", "view", "subview"];

function cleanupMapParams(rawParams: MapTilesAPIParamsType) {
  let validParams = observationsApiNames.concat(identificationsApiNames);
  Object.keys(rawParams).forEach((key) => {
    if (!validParams.includes(key)) {
      delete (rawParams as any).key;
    }
  });

  if (rawParams.taxon_id == "0") {
    delete rawParams.taxon_id;
  }
  if (rawParams.observation_taxon_id == "0") {
    delete rawParams.observation_taxon_id;
  }
  if (rawParams.ident_taxon_id == "0") {
    delete rawParams.ident_taxon_id;
  }
  if (rawParams.place_id == "0") {
    delete rawParams.place_id;
  }
  if (rawParams.colors) {
    (rawParams as any)["color"] = rawParams.colors?.split(",")[0];
    delete rawParams.colors;
  }

  ignoreMapParams.forEach((param) => {
    if (rawParams[param]) {
      delete rawParams[param];
    }
  });
}

// convert fields for /identifications to work with map tiles
export function cleanupIdentificationsMapParams(
  rawParams: IdentificationsMapTilesAPIParamsType,
) {
  let params = structuredClone(rawParams);
  cleanupMapParams(params);
  let cleanedParms = convertIdentificationParamsToObservationParams(params);

  if (!cleanedParms.color) {
    cleanedParms.color = iNatOrange;
  }
  return cleanedParms;
}

export function cleanupObservationsMapParams(
  rawParams: ObservationsMapTilesAPIParamsType,
) {
  let params = structuredClone(rawParams);
  cleanupMapParams(params);

  if (!params.color) {
    params.color = iNatOrange;
  }
  return params;
}

// =============
// iNaturalist site
// =============

let ignoreWebsiteSpecificParams = [
  "per_page",
  "page",
  "colors",
  "name_order",
  "locale",
];

function cleaniNatSiteParams(params: URLSearchParams) {
  deleteParams(ignoreWebsiteSpecificParams, params);

  let taxon_id = params.get("taxon_id");
  if (taxon_id) {
    params.append("taxon_ids", taxon_id);
    params.delete("taxon_id");
  }
}

export function formatInatExportParams(appStore: AppStoreType) {
  let params = formatAppUrl(
    appStore,
    "observations",
    "object",
    false,
  ) as URLSearchParams;

  cleaniNatSiteParams(params);
  deleteParams(["view", "subview"], params);

  if (!params.get("spam")) {
    params.append("spam", "false");
  }

  return params.toString();
}

export function formatInatExploreParams(appStore: AppStoreType) {
  let params = formatAppUrl(
    appStore,
    "observations",
    "object",
  ) as URLSearchParams;

  cleaniNatSiteParams(params);
  deleteParams(["spam"], params);

  if (params.get("verifiable") === "true") {
    params.delete("verifiable");
  }

  let view = appStore.currentView;
  let subview = appStore.viewMetadata.observations_observations.subview;
  if (view) {
    if (view === "observations_observations") {
      if (subview === "map") {
        params.set("subview", "map");
      } else if (subview === "grid") {
      } else if (subview === "table") {
        params.set("subview", "table");
      } else {
      }
      params.delete("view");
    } else {
      params.set("view", view.split("_")[1]);
    }
  }
  return params.toString();
}

export function formatInatIdentifyParams(appStore: AppStoreType) {
  let params = formatAppUrl(
    appStore,
    "observations",
    "object",
  ) as URLSearchParams;

  cleaniNatSiteParams(params);
  deleteParams(["view", "subview", "spam"], params);

  return params.toString();
}

export function formatInatApiParams(appStore: AppStoreType) {
  let params;
  if (isObservationsCheck(appStore)) {
    params = formatAppUrl(
      appStore,
      "observations",
      "object",
    ) as URLSearchParams;
  } else {
    params = formatAppUrl(
      appStore,
      "identifications",
      "object",
    ) as URLSearchParams;
  }

  deleteParams(ignoreWebsiteSpecificParams, params);
  deleteParams(["view", "subview", "spam"], params);

  return params.toString();
}

export function formatSpeciesToInatExploreParams(
  taxonId: number,
  appStore: AppStoreType,
) {
  let params = formatAppUrl(
    appStore,
    "observations",
    "object",
  ) as URLSearchParams;

  cleaniNatSiteParams(params);
  deleteParams(["spam", "view", "subview"], params);

  if (params.get("verifiable") === "true") {
    params.delete("verifiable");
  }

  if (params.get("taxon_ids")) {
    params.set("taxon_ids", taxonId.toString());
  }

  return params.toString();
}
