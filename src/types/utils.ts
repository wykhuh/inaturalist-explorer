import type { NormalizediNatTaxon, NormalizediNatUser } from "./app";
import type {
  IdentificationsObserversResult,
  IdentificationsResult,
  ObservationsObserversResult,
  ObservationsResult,
  ResourceIdentifiersResult,
  ResourceSpeciesCountResult,
  SpeciesCountTaxon,
  Taxon,
} from "./inat_api";

export function isNormalizediNatTaxon(
  record: NormalizediNatTaxon | SpeciesCountTaxon | Taxon,
): record is NormalizediNatTaxon {
  return "matched_term" in record;
}

export function isResourceObject(input: any): input is NormalizediNatUser {
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
