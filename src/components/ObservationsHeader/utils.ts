import {
  getObservations,
  getObservationsIdentifiers,
  getObservationsObservers,
  getObservationsSpecies,
} from "../../lib/inat_api";
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
      updateView(view, viewContainerEl, appStore, componentContext);
    });
  }
}

function updateView(
  targetView: ObservationViews,
  parentEl: Element,
  appStore: MapStore,
  componentContext: HTMLElement,
) {
  if (!parentEl) return;

  // save map bounds before switching views so app can return to this map location
  let map = appStore.map.map;
  if (map) {
    appStore.map.bounds = map?.getBounds();
  }

  // load view component
  parentEl.innerHTML = "";

  let view;
  if (targetView === "species") {
    view = document.createElement("x-view-species");
  } else if (targetView === "identifiers") {
    view = document.createElement("x-view-identifiers");
  } else if (targetView === "observers") {
    view = document.createElement("x-view-observers");
  } else {
    view = document.createElement("x-view-map");
  }
  parentEl.appendChild(view);

  // update currentView class in nav
  let oldItemEl = componentContext.querySelector(`#${appStore.currentView}`);
  oldItemEl?.classList.remove("currentView");
  let itemEl = componentContext.querySelector(`#${targetView}`);
  itemEl?.classList.add("currentView");

  appStore.currentView = targetView;
}

async function updateResourceCounts(
  dataFn: any,
  selector: string,
  searchParams: string,
) {
  let perPage = 0;
  let page = 1;

  let data = await dataFn(searchParams, perPage, page);
  let count = data?.total_results;
  let countEl = document.querySelector(selector);
  if (countEl && count) {
    countEl.textContent = count.toLocaleString();
  }
}

export function updateCounts() {
  updateResourceCounts(
    getObservations,
    ".observations-count",
    window.location.search,
  );
  updateResourceCounts(
    getObservationsSpecies,
    ".species-count",
    window.location.search,
  );
  updateResourceCounts(
    getObservationsIdentifiers,
    ".identifiers-count",
    window.location.search,
  );
  updateResourceCounts(
    getObservationsObservers,
    ".observers-count",
    window.location.search,
  );
}
