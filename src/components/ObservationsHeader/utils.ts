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
import { updateHeaderCount } from "./shared_utils";

export function updateCountsHeader(appStore: MapStore) {
  let params = cleanupObervationsParams(appStore);
  updateHeaderCount(
    "observations-observations",
    getObservations,
    params,
    appStore,
  );
  updateHeaderCount(
    "observations-species",
    getObservationsSpecies,
    params,
    appStore,
  );
  updateHeaderCount(
    "observations-identifiers",
    getObservationsIdentifiers,
    params,
    appStore,
  );

  let observersParams = cleanupObervationsObserversParams(appStore);
  updateHeaderCount(
    "observations-observers",
    getObservationsObservers,
    observersParams,
    appStore,
  );
}
