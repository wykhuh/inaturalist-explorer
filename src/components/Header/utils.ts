import {
  updateCountForAll,
  updateSelectedResourcesId,
} from "../../lib/count_utils";
import { loggerEvent } from "../../lib/logger";
import { renderSelectedResources } from "../../lib/search_utils";
import { updateAppUrl } from "../../lib/utils";
import type {
  AppStoreType,
  ObservationViewsType,
  RecordTypes,
  RouterType,
} from "../../types/app";
import { viewAndTemplateObject } from "../../data/app_data";
import {
  addDefaultTaxaRecordToStore,
  isIdentificationsCheck,
  isObservationsCheck,
} from "../../lib/data_utils";
import { removeOneTaxonFromMap } from "../../lib/search_taxa";

export async function resetDefaultTaxa(appStore: AppStoreType) {
  if (isObservationsCheck(appStore)) {
    if (appStore.selectedTaxa.length === 0) {
      await addDefaultTaxaRecordToStore(appStore);
    }
  } else if (isIdentificationsCheck(appStore)) {
    if (
      appStore.observationsApiParams.taxon_id === "0" &&
      appStore.selectedTaxaIdentified.length > 0
    ) {
      appStore.selectedTaxa = [];
      removeOneTaxonFromMap(appStore, 0);
    } else if (
      appStore.selectedTaxa.length === 0 &&
      appStore.selectedTaxaIdentified.length === 0
    ) {
      await addDefaultTaxaRecordToStore(appStore);
    }
  }
  appStore.selectedTaxa = appStore.selectedTaxa;
}

export async function pageChangeHandler(
  event: CustomEvent,
  appStore: AppStoreType,
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
    router.go(recordType);
    // HACK: trigger proxy store
    appStore.observationsApiParams = appStore.observationsApiParams;
  }

  // update currentView
  // identifications page and observations page have currentView
  if (appStore.currentView) {
    let oldView = appStore.currentView.split("_")[1];
    if (oldView) {
      if (recordType === "observations" && oldView === "identifications") {
        appStore.currentView = "observations_observations";
      } else if (recordType === "about") {
        appStore.currentView = undefined;
      } else {
        appStore.currentView = (recordType +
          "_" +
          oldView) as ObservationViewsType;
      }
    }
    // about page does not have currentView
  } else {
    appStore.currentView = (recordType +
      "_" +
      "observations") as ObservationViewsType;
  }

  // update app url
  updateAppUrl(window.location, appStore);

  // highlight current page
  addCurrentPageClass(recordType);

  // load view
  let viewContainerEl = document.querySelector("#view-container");
  if (!viewContainerEl) return;

  if (appStore.currentView) {
    viewContainerEl.innerHTML = "";
    let templateName = viewAndTemplateObject(appStore.currentView);
    let newView = document.createElement(templateName);
    viewContainerEl.appendChild(newView);
  }

  // updates counts for selected items that do not have counts
  await updateCountForAll("all", appStore, true).then(() => {
    renderSelectedResources(appStore, false);
  });

  // emit event
  if (recordType === "identifications" || recordType === "observations") {
    loggerEvent("[Header dispatchEvent] navResourceChange");
    window.dispatchEvent(
      new CustomEvent("navResourceChange", {
        detail: {
          recordType,
          currentView: appStore.currentView,
        },
      }),
    );
  }
}

export function addCurrentPageClass(recordType: RecordTypes) {
  let link = document.querySelector(`[data-record-type='${recordType}']`);
  link?.classList.add("current-page");
}
