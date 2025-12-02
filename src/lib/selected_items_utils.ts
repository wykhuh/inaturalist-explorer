import type {
  MapStore,
  NormalizediNatPlace,
  NormalizediNatProject,
  NormalizediNatTaxon,
  NormalizediNatUser,
} from "../types/app";
import { isObservationsCheck } from "./data_utils";
import { pluralize } from "./utils";

export function renderSelectedCounts(
  record:
    | NormalizediNatPlace
    | NormalizediNatProject
    | NormalizediNatUser
    | NormalizediNatTaxon,
  appStore: MapStore,
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
