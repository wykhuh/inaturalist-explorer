import {
  cleanupObervationsParams,
  viewAndTemplateObject,
} from "../../lib/data_utils";
import {
  getObservations,
  getObservationsIdentifiers,
  getObservationsObservers,
  getObservationsSpecies,
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
    appStore.inatApiParams.page = page;
  }

  updateAppUrl(window.location, appStore);
}

async function updateResourceCounts(
  dataFn: any,
  selector: string,
  searchParams: string,
) {
  let perPage = 0;

  let data = await dataFn(searchParams, perPage);
  let count = data?.total_results;

  let countEls = document.querySelectorAll(selector);
  if (countEls && count) {
    Array.from(countEls).forEach((countEl) => {
      countEl.textContent = count.toLocaleString();
    });
  }
}

export function updateCounts(appStore: MapStore, locationSearch: string) {
  let params = cleanupObervationsParams(locationSearch, appStore);
  updateResourceCounts(getObservations, ".observations-count", params);
  updateResourceCounts(getObservationsSpecies, ".species-count", params);
  updateResourceCounts(
    getObservationsIdentifiers,
    ".identifiers-count",
    params,
  );
  updateResourceCounts(getObservationsObservers, ".observers-count", params);
}
