import {
  cleanupObervationsObserversParams,
  cleanupObervationsParams,
} from "../../lib/cleanup_params_utils";
import {
  getObservations,
  getObservationsIdentifiers,
  getObservationsObservers,
  getObservationsSpecies,
} from "../../lib/inat_api";
import type { MapStore } from "../../types/app";
import { updateResourceCounts } from "./shared_utils";

export function updateCountsHeader(appStore: MapStore) {
  let params = cleanupObervationsParams(appStore);
  updateResourceCounts(
    getObservations,
    "#observations-header .observations-count",
    params,
  );
  updateResourceCounts(
    getObservationsSpecies,
    "#observations-header .species-count",
    params,
  );
  updateResourceCounts(
    getObservationsIdentifiers,
    "#observations-header .identifiers-count",
    params,
  );

  let observersParams = cleanupObervationsObserversParams(appStore);
  updateResourceCounts(
    getObservationsObservers,
    "#observations-header .observers-count",
    observersParams,
  );
}
