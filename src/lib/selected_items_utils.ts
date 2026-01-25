import type {
  AppStoreType,
  NormalizediNatPlaceType,
  NormalizediNatProjectType,
  NormalizediNatTaxonType,
  NormalizediNatUserType,
} from "../types/app";
import { isObservationsCheck } from "./data_utils";
import { pluralize } from "./utils";

export function renderSelectedCounts(
  record:
    | NormalizediNatPlaceType
    | NormalizediNatProjectType
    | NormalizediNatUserType
    | NormalizediNatTaxonType,
  appStore: AppStoreType,
  context: any,
  countText?: string,
) {
  let countEl = context.querySelector(".count");
  if (!countEl) return;

  if (isObservationsCheck(appStore)) {
    let text = countText ? countText : "observation";
    countEl.textContent = pluralize(record.observations_count, text, true);
  } else {
    let text = countText ? countText : "identification";
    countEl.textContent = pluralize(record.identifications_count, text, true);
  }
}
