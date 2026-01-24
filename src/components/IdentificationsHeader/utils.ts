import { cleanupIdentificationParams } from "../../lib/cleanup_params_utils";
import {
  getIdentifications,
  getIdentificationsIdentifiers,
  getIdentificationsObservers,
  getIdentificationsSpecies,
} from "../../lib/inat_api";
import type { AppStoreType } from "../../types/app";
import { updateHeaderCount } from "../ObservationsHeader/shared_utils";

export function updateCountsHeader(appStore: AppStoreType) {
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
    null,
    1, // BUG: 0 per pages causes an error for /idenifications/observers API
  );
}
