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
import { updateHeaderCount } from "../ObservationsHeader/shared_utils";

function nullObservations(_searchParams = "", _perPage = 0) {
  return { total_results: "--" };
}

export function updateCountsHeader(appStore: MapStore) {
  // NOTE: use tempStore with record_type = "observations" since observations
  // has different search params than identifications
  let tempStore = { ...appStore };
  tempStore.record_type = "observations";
  let params = cleanupObervationsParams(tempStore);

  if (appStore.selectedTaxa.length === 0) {
    updateHeaderCount(
      "identifications-observations",
      nullObservations,
      params,
      appStore,
    );
  } else {
    updateHeaderCount(
      "identifications-observations",
      getObservations,
      params,
      appStore,
    );
  }

  let identificationParams = cleanupIdentificationParams(appStore);
  updateHeaderCount(
    "identifications-identifications",
    getIdentifications,
    identificationParams,
    appStore,
  );

  updateHeaderCount(
    "identifications-identifiers",
    getIdentificationsIdentifiers,
    identificationParams,
    appStore,
  );

  updateHeaderCount(
    "identifications-species",
    getIdentificationsSpecies,
    identificationParams,
    appStore,
  );

  updateHeaderCount(
    "identifications-observers",
    getIdentificationsObservers,
    identificationParams,
    appStore,
    1, // BUG: 0 per pages causes an error for /idenifications/observers API
  );
}
