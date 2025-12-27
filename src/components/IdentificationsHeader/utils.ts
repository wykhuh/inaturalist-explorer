import {
  cleanupIdentificationParams,
  cleanupIdentificationsObservationsParams,
} from "../../lib/cleanup_params_utils";
import {
  getIdentifications,
  getObservations,
  getIdentificationsIdentifiers,
  getIdentificationsObservers,
  getIdentificationsSpecies,
} from "../../lib/inat_api";
import type { AppStoreType } from "../../types/app";
import { updateHeaderCount } from "../ObservationsHeader/shared_utils";

export function updateCountsHeader(appStore: AppStoreType) {
  // NOTE:observations has different search params than identifications
  let params = cleanupIdentificationsObservationsParams(appStore);
  updateHeaderCount(
    "identifications_observations",
    getObservations,
    params,
    appStore,
  );

  let identificationParams = cleanupIdentificationParams(appStore);
  updateHeaderCount(
    "identifications_identifications",
    getIdentifications,
    identificationParams,
    appStore,
  );

  updateHeaderCount(
    "identifications_identifiers",
    getIdentificationsIdentifiers,
    identificationParams,
    appStore,
  );

  updateHeaderCount(
    "identifications_species",
    getIdentificationsSpecies,
    identificationParams,
    appStore,
  );

  updateHeaderCount(
    "identifications_observers",
    getIdentificationsObservers,
    identificationParams,
    appStore,
    1, // BUG: 0 per pages causes an error for /idenifications/observers API
  );
}
