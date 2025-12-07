import { updateAppUrl } from "../../lib/utils";
import type { MapStore, ObservationViews } from "../../types/app";

export function viewChangeHandler(
  eventTarget: HTMLElement,
  appStore: MapStore,
  componentContext: HTMLElement,
) {
  let viewContainerEl = document.querySelector("#view-container");
  if (!viewContainerEl) return;
  let liEl = eventTarget.closest("li");
  if (!liEl) return;
  let countLabel = liEl.dataset.countLabel;
  if (!countLabel) return;

  let view = countLabel.split("-")[1] as ObservationViews;

  if (appStore.currentView !== view) {
    updateView(view, viewContainerEl, window.app.store, componentContext);
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

export async function updateResourceCounts(
  dataFn: any,
  selector: string,
  searchParams: string,
  perPage = 0,
) {
  let countEls = document.querySelectorAll(selector);
  if (countEls.length === 0) return;

  if (import.meta.env.VITE_CACHE === "true") {
    Array.from(countEls).forEach((countEl) => {
      countEl.textContent = "-999";
    });
    return;
  }

  let data = await dataFn(searchParams, perPage);
  let count = data?.total_results;
  if (count == undefined) return;

  Array.from(countEls).forEach((countEl) => {
    countEl.textContent = count.toLocaleString();
  });
}

export function viewAndTemplateObject(targetView: string) {
  switch (targetView) {
    case "species":
      return "view-species";
    case "identifiers":
      return "view-identifiers";
    case "observers":
      return "view-observers";
    case "observations":
      return "view-observations";
    case "identifications":
      return "view-identifications";
    default:
      throw Error("Need to add view /template");
  }
}
