import {
  cleanupIdentificationParams,
  cleanupObervationsParams,
  viewAndTemplateObject,
} from "../../lib/data_utils";
import {
  getIdentifications,
  getObservations,
  getIdentificationsIdentifiers,
  getIdentificationsObservers,
  getIdentificationsSpecies,
} from "../../lib/inat_api";
import { updateAppUrl } from "../../lib/utils";
import type { MapStore, ObservationViews } from "../../types/app";

export function viewChangeHandler(
  selector: string,
  view: ObservationViews,
  appStore: MapStore,
  componentContext: HTMLElement,
) {
  let viewContainerEl = document.querySelector("#view-container");
  let viewEl = document.querySelector(selector);

  if (viewEl && viewContainerEl) {
    viewEl.addEventListener("click", () => {
      // only change view if new view is different than current view
      if (appStore.currentView !== view) {
        updateView(view, viewContainerEl, appStore, componentContext);
      }
    });
  }
}

export function updateView(
  targetView: ObservationViews,
  parentEl: Element,
  appStore: MapStore,
  componentContext: HTMLElement,
) {
  if (!parentEl) return;

  // load view component
  parentEl.innerHTML = "";

  let templateName = viewAndTemplateObject(targetView);
  let view = document.createElement(templateName);
  parentEl.appendChild(view);

  // update currentView class in nav
  let oldItemEl = componentContext.querySelector(`#${appStore.currentView}`);
  oldItemEl?.classList.remove("currentView");
  let itemEl = componentContext.querySelector(`#${targetView}`);
  itemEl?.classList.add("currentView");

  appStore.currentView = targetView;

  let page = appStore.viewMetadata[targetView]?.page;
  if (page) {
    appStore.observationsApiParams.page = page;
  } else {
    delete appStore.observationsApiParams.page;
  }

  let order = appStore.viewMetadata[targetView]?.order;
  if (order) {
    appStore.observationsApiParams.order = order;
  } else {
    delete appStore.observationsApiParams.order;
  }

  let order_by = appStore.viewMetadata[targetView]?.order_by;
  if (order_by) {
    appStore.observationsApiParams.order_by = order_by;
  } else {
    delete appStore.observationsApiParams.order_by;
  }
  updateAppUrl(window.location, appStore);
}

async function updateResourceCounts(
  dataFn: any,
  selector: string,
  searchParams: string,
  perPage = 0,
) {
  let countEls = document.querySelectorAll(selector);
  if (countEls.length === 0) return;

  let data = await dataFn(searchParams, perPage);
  let count = data?.total_results;
  if (count == undefined) return;

  Array.from(countEls).forEach((countEl) => {
    countEl.textContent = count.toLocaleString();
  });
}

export function updateIdentificationsCounts(appStore: MapStore) {
  let params = cleanupObervationsParams(appStore);
  updateResourceCounts(
    getObservations,
    "#identifications-header .observations-count",
    params,
  );

  let identificationParams = cleanupIdentificationParams(appStore);
  updateResourceCounts(
    getIdentifications,
    "#identifications-header .identifications-count",
    identificationParams,
  );

  updateResourceCounts(
    getIdentificationsIdentifiers,
    "#identifications-header .identifiers-count",
    identificationParams,
  );

  updateResourceCounts(
    getIdentificationsSpecies,
    "#identifications-header .species-count",
    identificationParams,
  );

  updateResourceCounts(
    getIdentificationsObservers,
    "#identifications-header .observers-count",
    identificationParams,
    1, // 0 per pages causes an server error for /idenifications/observers
  );
}
