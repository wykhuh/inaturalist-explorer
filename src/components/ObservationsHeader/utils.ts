import {
  cleanupObervationsObserversParams,
  cleanupObervationsParams,
  cleanupObervationsSpeciesParams,
} from "../../lib/cleanup_params_utils";
import { isObservationsCheck, isSubpeciesCheck } from "../../lib/data_utils";
import {
  getObservations,
  getObservationsIdentifiers,
  getObservationsObservers,
  getObservationsSpecies,
} from "../../lib/inat_api";
import type { AppStoreType } from "../../types/app";
import { updateHeaderCount, updateHeaderSubSpeciesCount } from "./shared_utils";

export function updateCountsHeader(appStore: AppStoreType) {
  let params = cleanupObervationsParams(appStore);
  updateHeaderCount(
    "observations_observations",
    getObservations,
    params,
    appStore,
  );

  if (isObservationsCheck(appStore) && isSubpeciesCheck(appStore)) {
    let speciesParams = cleanupObervationsSpeciesParams(appStore);
    updateHeaderSubSpeciesCount(
      "observations_species",
      getObservationsSpecies,
      speciesParams,
      appStore,
    );
  } else {
    updateHeaderCount(
      "observations_species",
      getObservationsSpecies,
      params,
      appStore,
    );
  }
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
