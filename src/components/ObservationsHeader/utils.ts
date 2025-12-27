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
import type { AppStoreType } from "../../types/app";
import { updateHeaderCount } from "./shared_utils";

export function updateCountsHeader(appStore: AppStoreType) {
  let params = cleanupObervationsParams(appStore);
  updateHeaderCount(
    "observations_observations",
    getObservations,
    params,
    appStore,
  );
  updateHeaderCount(
    "observations_species",
    getObservationsSpecies,
    params,
    appStore,
  );
  updateHeaderCount(
    "observations_identifiers",
    getObservationsIdentifiers,
    params,
    appStore,
  );

  let observersParams = cleanupObervationsObserversParams(appStore);
  updateHeaderCount(
    "observations_observers",
    getObservationsObservers,
    observersParams,
    appStore,
  );
}
