import {
  cleanupIdentificationParams,
  cleanupIdentificationsObservationsParams,
  identificationOnlyParams,
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
  let tooltip: HTMLElement | null = null;
  let isEstimate = Object.keys(appStore.identificationsApiParams).some((p) =>
    identificationOnlyParams.includes(p),
  );
  if (isEstimate) {
    tooltip = document.createElement("app-tooltip");
    tooltip.dataset.id = "tp-count";
    tooltip.dataset.content = " *";
    tooltip.dataset.tooltip =
      "Observations are not accurate because identifications-related " +
      "searches and filters do not work with observations.";
  }

  // NOTE:observations has different search params than identifications
  let params = cleanupIdentificationsObservationsParams(appStore);
  updateHeaderCount(
    "identifications_observations",
    getObservations,
    params,
    appStore,
    tooltip,
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
    null,
    1, // BUG: 0 per pages causes an error for /idenifications/observers API
  );
}
