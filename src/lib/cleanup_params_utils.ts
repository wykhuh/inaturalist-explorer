import type { MapStore, ObservationsApiParams } from "../types/app";
import { formatAppUrl } from "./utils";

function cleanupParamsStore(appStore: MapStore) {
  let string = formatAppUrl(appStore);
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
  if (params.get("place_id") === "0") {
    params.delete("place_id");
  }
}

export function cleanupObervationsParamsForRecord(
  inatParams: ObservationsApiParams,
) {
  let params = new URLSearchParams(inatParams as any);
  cleanupParams(params);

  return params.toString();
}

export function cleanupIdentificationsParamsForRecord(
  inatParams: ObservationsApiParams,
) {
  let params = new URLSearchParams(inatParams as any);
  cleanupParams(params);

  return params.toString();
}

export function cleanupObervationsParams(appStore: MapStore) {
  let params = cleanupParamsStore(appStore);

  return params.toString();
}

export function cleanupIdentificationParams(appStore: MapStore) {
  let params = cleanupParamsStore(appStore);

  return params.toString();
}

export function cleanupObervationsObserversParams(appStore: MapStore) {
  let params = cleanupParamsStore(appStore);

  params.delete("order");
  params.delete("order_by");

  return params.toString();
}

export function cleanupIdentificationsObserversParams(appStore: MapStore) {
  let params = cleanupParamsStore(appStore);

  params.delete("order");
  params.delete("order_by");

  return params.toString();
}
