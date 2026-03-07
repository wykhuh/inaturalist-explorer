import { isObservationsCheck } from "../lib/data_utils";
import type {
  AppStoreType,
  NormalizediNatTaxonType,
  NormalizediNatUserType,
  ObservationsApiParamsKeysType,
  ObservationsApiParamsType,
  PopularFieldAnnotation,
} from "./app";
import type {
  IdentificationsObserversResult,
  IdentificationsResult,
  iNatObservationsAPI,
  iNatObservationsHistogramAPI,
  ObservationsObserversResult,
  ObservationsResult,
  ResourceIdentifiersResult,
  ResourceSpeciesCountResult,
  SpeciesCountTaxon,
  Taxon,
} from "./inat_api";

export function isNormalizediNatTaxonType(
  record: NormalizediNatTaxonType | SpeciesCountTaxon | Taxon,
): record is NormalizediNatTaxonType {
  return "matched_term" in record;
}

export function isResourceObject(input: any): input is NormalizediNatUserType {
  return !Array.isArray(input);
}

export function isIdentificationsObserversResult(
  records: IdentificationsObserversResult[] | ObservationsObserversResult[],
): records is IdentificationsObserversResult[] {
  return "count" in records[0];
}

export function isIdentificationsResult(
  records: any[],
): records is IdentificationsResult[] {
  return "observation" in records[0];
}

export function isObservationsResult(
  records: any[],
): records is ObservationsResult[] {
  return "observed_on_details" in records[0];
}

export function isResourceIdentifierResult(
  records: any[],
): records is ResourceIdentifiersResult[] {
  return "user" in records[0];
}

export function isResourceSpeciesResult(
  records: any[],
): records is ResourceSpeciesCountResult[] {
  return "taxon" in records[0];
}

export function isObservationsApiParams(
  _params: any,
  appStore: AppStoreType,
): _params is ObservationsApiParamsType {
  return isObservationsCheck(appStore);
}

export function isObservationsApiFields(
  _records: any[],
  appStore: AppStoreType,
): _records is ObservationsApiParamsKeysType[] {
  return isObservationsCheck(appStore);
}

export function isObservationsData(
  apiData: iNatObservationsHistogramAPI | iNatObservationsAPI,
): apiData is iNatObservationsAPI {
  return Array.isArray(apiData.results);
}

export function isPopularFieldGraph(
  records: any[],
): records is PopularFieldAnnotation[] {
  return "controlled_attribute" in records[0];
}
