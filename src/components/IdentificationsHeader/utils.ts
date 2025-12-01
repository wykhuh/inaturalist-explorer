import {
  cleanupIdentificationParams,
  cleanupObervationsParams,
} from "../../lib/cleanup_params_utils";
import {
  getIdentifications,
  getObservations,
  getIdentificationsIdentifiers,
  getIdentificationsObservers,
  getIdentificationsSpecies,
} from "../../lib/inat_api";
import type { MapStore } from "../../types/app";
import { updateResourceCounts } from "../ObservationsHeader/shared_utils";

export function updateCountsHeader(appStore: MapStore) {
  // NOTE: use tempStore with record_type = "observations" since observations
  // has different search params than identifications
  let tempStore = { ...appStore };
  tempStore.record_type = "observations";
  let params = cleanupObervationsParams(tempStore);

  updateResourceCounts(
    getObservations,
    "#identifications-header .observations-count",
    params,
  );

  let identificationParams = cleanupIdentificationParams(appStore);
  updateResourceCounts(
    getIdentifications,
    "#identifications-header .identifications-count",
    identificationParams,
  );

  updateResourceCounts(
    getIdentificationsIdentifiers,
    "#identifications-header .identifiers-count",
    identificationParams,
  );

  updateResourceCounts(
    getIdentificationsSpecies,
    "#identifications-header .species-count",
    identificationParams,
  );

  updateResourceCounts(
    getIdentificationsObservers,
    "#identifications-header .observers-count",
    identificationParams,
    1, // 0 per pages causes an server error for /idenifications/observers
  );
}
