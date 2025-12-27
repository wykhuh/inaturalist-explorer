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
) {
  let countEl = context.querySelector(".count");
  if (!countEl) return;

  if (isObservationsCheck(appStore)) {
    countEl.textContent = pluralize(
      record.observations_count,
      "observation",
      true,
    );
  } else {
    countEl.textContent = pluralize(
      record.identifications_count,
      "identification",
      true,
    );
  }
}
