import type {
  IdentificationsApiParams,
  IdentificationsMapTilesAPIParams,
  MapStore,
  MapTilesAPIParams,
  ObservationsApiParams,
  ObservationsMapTilesAPIParams,
  RecordTypes,
} from "../types/app";
import { iNatOrange } from "./map_colors_utils";
import { formatAppUrl } from "./utils";

function cleanupParamsStore(
  appStore: MapStore,
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
  if (params.get("observation_taxon_id") === "0") {
    params.delete("observation_taxon_id");
  }
  if (params.get("place_id") === "0") {
    params.delete("place_id");
  }
}

// =============
// observations API
// =============

export function cleanupObervationsParamsForRecord(
  inatParams: ObservationsApiParams,
) {
  let params = new URLSearchParams(inatParams as any);
  cleanupParams(params);

  return params.toString();
}

export function cleanupObervationsParams(
  appStore: MapStore,
  recordType = appStore.record_type,
) {
  let params = cleanupParamsStore(appStore, recordType);

  // NOTE: iNat observations API only allows one ident_user_id value
  let identifierId = params.get("ident_user_id");
  if (identifierId) {
    params.set("ident_user_id", identifierId.split(",")[0]);
  }

  return params.toString();
}

export function cleanupObervationsObserversParams(
  appStore: MapStore,
  recordType = appStore.record_type,
) {
  let params = cleanupParamsStore(appStore, recordType);

  params.delete("order");
  params.delete("order_by");

  return params.toString();
}

// =============
// identifications API
// =============

export function cleanupIdentificationsParamsForRecord(
  inatParams: IdentificationsApiParams,
) {
  let params = new URLSearchParams(inatParams as any);
  cleanupParams(params);

  return params.toString();
}

export function cleanupIdentificationParams(
  appStore: MapStore,
  recordType = appStore.record_type,
) {
  let params = cleanupParamsStore(appStore, recordType);

  return params.toString();
}

export function cleanupIdentificationsObserversParams(
  appStore: MapStore,
  recordType = appStore.record_type,
) {
  let params = cleanupParamsStore(appStore, recordType);

  params.delete("order");
  params.delete("order_by");

  return params.toString();
}

// =============
// tiles API
// =============

function cleanupMapParams(rawParams: MapTilesAPIParams) {
  for (const [key, value] of Object.entries(rawParams)) {
    if (key === "taxon_id" && value == "0") {
      delete rawParams.taxon_id;
    } else if (key === "observation_taxon_id" && value == "0") {
      delete rawParams.observation_taxon_id;
    } else if (key === "place_id" && value == "0") {
      delete rawParams.place_id;
    } else if (key === "colors") {
      delete rawParams.colors;
      (rawParams as any)["color"] = value.split(",")[0];
    } else if (key === "page") {
      delete rawParams.page;
    } else if (key === "per_page") {
      delete rawParams.per_page;
    } else if (key === "view") {
      delete rawParams.view;
    } else if (key === "subview") {
      delete rawParams.subview;
    }
  }
}

export function cleanupIdentificationsMapParams(
  rawParams: IdentificationsMapTilesAPIParams,
) {
  let params = structuredClone(rawParams);
  cleanupMapParams(params);
  let allowedParams = [
    "place_id",
    "observation_taxon_id",
    "user_id",
    "quality_grade",
    "observed_d1",
    "observed_d2",
    "observation_iconic_taxon_id",
    "observation_hrank",
    "observation_lrank",
    "color",
    "colors",
  ];
  let cleanedParms = {} as any;

  for (const [key, value] of Object.entries(params)) {
    if (!allowedParams.includes(key)) {
      continue;
    }
    if (key.startsWith("observed_")) {
      let k = key.replace("observed_", "");
      cleanedParms[k] = value;
    } else if (key.startsWith("observation_")) {
      cleanedParms[key.replace("observation_", "")] = value;
    } else {
      cleanedParms[key] = value;
    }
  }

  if (!cleanedParms.color) {
    cleanedParms.color = iNatOrange;
  }

  return cleanedParms;
}

export function cleanupObservationsMapParams(
  rawParams: ObservationsMapTilesAPIParams,
) {
  let params = structuredClone(rawParams);
  cleanupMapParams(params);

  if (!params.color) {
    params.color = iNatOrange;
  }

  let identifierId = params.ident_user_id;
  if (identifierId) {
    identifierId = identifierId.split(",")[0];
    params.ident_user_id = identifierId;
  }

  return params;
}
