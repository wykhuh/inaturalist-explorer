import type { NormalizediNatTaxon, NormalizediNatUser } from "./app";
import type {
  IdentificationsObserversResult,
  ObservationsObserversResult,
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
