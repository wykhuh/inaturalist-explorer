import {
  updateCountForAll,
  updateSelectedResourcesId,
} from "../../lib/count_utils";
import {
  addDefaultTaxaRecordToStore,
  isIdentificationsCheck,
  isObservationsCheck,
} from "../../lib/data_utils";
import { loggerEvent } from "../../lib/logger";
import { renderSelectedResources } from "../../lib/search_utils";
import { updateAppUrl } from "../../lib/utils";
import type {
  MapStore,
  ObservationViews,
  RecordTypes,
  RouterType,
} from "../../types/app";
import { viewAndTemplateObject } from "../ObservationsHeader/shared_utils";

export async function resetDefaultTaxa(appStore: MapStore) {
  // remove all selected taxa when switching to identifications
  if (isIdentificationsCheck(appStore)) {
    if (
      appStore.selectedTaxa.length === 1 &&
      appStore.selectedTaxa[0].id === 0
    ) {
      appStore.selectedTaxa = [];
    }
    // add default taxa when switching to obdervations
  } else if (isObservationsCheck(appStore)) {
    if (appStore.selectedTaxa.length === 0) {
      await addDefaultTaxaRecordToStore(appStore);
      renderSelectedResources(appStore, false);
    }
  }
  appStore.selectedTaxa = appStore.selectedTaxa;
}

export async function pageChangeHandler(
  event: CustomEvent,
  appStore: MapStore,
  router: RouterType,
) {
  let target = event.target as HTMLInputElement;
  if (!target) return;

  // NOTE: record_type must be set first since record_type determines how to
  // process and render data
  let recordType = target.dataset.recordType as RecordTypes;
  appStore.record_type = recordType;
  // update selected items ids in observationsApiParams or identificationsApiParams
  updateSelectedResourcesId(appStore);

  // remove or add default taxa
  await resetDefaultTaxa(appStore);

  // load page component
  const path = target.getAttribute("href");
  if (path) {
    router.go(path, location.search);
    // HACK: trigger proxy store
    appStore.observationsApiParams = appStore.observationsApiParams;
  }

  // update app url
  updateAppUrl(window.location, appStore);

  // update currentView
  if (appStore.currentView) {
    let view = appStore.currentView.split("_")[1];
    if (view) {
      if (recordType === "observations" && view === "identifications") {
        appStore.currentView = "observations_observations";
      } else {
        appStore.currentView = (recordType + "_" + view) as ObservationViews;
      }
    }
  }

  // load view
  let viewContainerEl = document.querySelector("#view-container");
  if (!viewContainerEl) return;

  if (appStore.currentView) {
    viewContainerEl.innerHTML = "";
    let templateName = viewAndTemplateObject(appStore.currentView);
    let view = document.createElement(templateName);
    viewContainerEl.appendChild(view);
  }

  // updates counts for selected items that do not have counts
  await updateCountForAll("all", appStore, true).then(() => {
    renderSelectedResources(appStore, false);
  });

  // emit event
  if (recordType === "identifications" || recordType === "observations") {
    window.dispatchEvent(
      new CustomEvent("navResourceChange", {
        detail: {
          recordType,
          currentView: appStore.currentView,
        },
      }),
    );
    loggerEvent("dispatch navResourceChange");
  }
}
