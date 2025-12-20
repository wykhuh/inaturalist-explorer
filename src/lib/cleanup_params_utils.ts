import {
  iconicTaxaIdName,
  IdentificationsApiNames,
  ObservationsApiNames,
} from "../data/inat_data";
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

export function cleanupIdentificationsObservationsParams(appStore: MapStore) {
  let cleanParams = convertIdentificationParamsToObservationParams(
    appStore.identificationsApiParams,
  );
  let params = new URLSearchParams(cleanParams as any);
  cleanupParams(params);

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

function convertIdentificationParamsToObservationParams(
  params: IdentificationsMapTilesAPIParams,
) {
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
    "page",
    "per_page",
  ];
  let cleanedParms = {} as any;

  for (const [key, value] of Object.entries(params)) {
    if (!allowedParams.includes(key)) {
      continue;
    }
    if (key === "observation_iconic_taxon_id") {
      cleanedParms.iconic_taxa = value
        .toString()
        .split(",")
        .map((id: string) => (iconicTaxaIdName as any)[id])
        .join(",");
    } else if (key.startsWith("observed_")) {
      let k = key.replace("observed_", "");
      cleanedParms[k] = value;
    } else if (key.startsWith("observation_")) {
      cleanedParms[key.replace("observation_", "")] = value;
    } else {
      cleanedParms[key] = value;
    }
  }

  return cleanedParms;
}

function cleanupMapParams(rawParams: MapTilesAPIParams) {
  let validParams = ObservationsApiNames.concat(IdentificationsApiNames);
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
  if (rawParams.place_id == "0") {
    delete rawParams.place_id;
  }
  if (rawParams.colors) {
    (rawParams as any)["color"] = rawParams.colors?.split(",")[0];
    delete rawParams.colors;
  }
  if (rawParams.page) {
    delete rawParams.page;
  }
  if (rawParams.per_page) {
    delete rawParams.per_page;
  }
  if (rawParams.view) {
    delete rawParams.view;
  }
  if (rawParams.subview) {
    delete rawParams.subview;
  }
}

// convert fields for /identifications to work with map tiles
export function cleanupIdentificationsMapParams(
  rawParams: IdentificationsMapTilesAPIParams,
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
