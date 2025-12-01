import type { MapStore, ObservationsApiParams } from "../types/app";
import { formatAppUrl } from "./utils";

function cleanupParams(appStore: MapStore) {
  let string = formatAppUrl(appStore);
  let params = new URLSearchParams(string);

  // delete properties that should not go to api
  params.delete("colors");
  params.delete("view");
  params.delete("subview");

  if (params.get("taxon_id") === "0") {
    params.delete("taxon_id");
  }
  if (params.get("place_id") === "0") {
    params.delete("place_id");
  }

  return params;
}

export function cleanupObervationsParamsForRecord(
  inatParams: ObservationsApiParams,
) {
  let params = new URLSearchParams(inatParams as any);
  params.delete("colors");
  params.delete("view");
  params.delete("subview");

  if (inatParams.taxon_id === "0") {
    params.delete("taxon_id");
  }
  if (inatParams.place_id === "0") {
    params.delete("place_id");
  }

  return params.toString();
}

export function cleanupIdentificationsParamsForRecord(
  inatParams: ObservationsApiParams,
) {
  let params = new URLSearchParams(inatParams as any);
  params.delete("colors");
  params.delete("view");
  params.delete("subview");

  if (inatParams.taxon_id === "0") {
    params.delete("taxon_id");
  }
  if (inatParams.place_id === "0") {
    params.delete("place_id");
  }

  return params.toString();
}

export function cleanupObervationsParams(appStore: MapStore) {
  let params = cleanupParams(appStore);
  let observation_taxon_id = params.get("observation_taxon_id");
  if (observation_taxon_id) {
    params.set("taxon_id", observation_taxon_id);
    params.delete("observation_taxon_id");
  }

  return params.toString();
}

export function cleanupObervationsObserversParams(appStore: MapStore) {
  let params = cleanupParams(appStore);

  params.delete("order");
  params.delete("order_by");

  return params.toString();
}

export function cleanupIdentificationParams(appStore: MapStore) {
  let params = cleanupParams(appStore);

  let ident_user_id = params.get("ident_user_id");
  if (ident_user_id) {
    params.set("user_id", ident_user_id);
    params.delete("ident_user_id");
  }

  return params.toString();
}

export function cleanupIdentificationsObserversParams(appStore: MapStore) {
  let params = cleanupParams(appStore);

  params.delete("order");
  params.delete("order_by");

  return params.toString();
}
