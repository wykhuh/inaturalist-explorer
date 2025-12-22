import { viewAndTemplateObject } from "../../data/app_data";
import { createHashString, updateAppUrl } from "../../lib/utils";
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

  let view = countLabel as ObservationViews;

  if (appStore.currentView !== countLabel) {
    updateView(view, viewContainerEl, appStore, componentContext);
  }
}

export function updateView(
  targetView: ObservationViews,
  parentEl: Element,
  appStore: MapStore,
  componentContext: HTMLElement,
) {
  if (!parentEl) return;

  // update currentView class in nav
  let oldItemEl = componentContext.querySelector(`#${appStore.currentView}`);
  oldItemEl?.classList.remove("currentView");
  let itemEl = componentContext.querySelector(`#${targetView}`);
  itemEl?.classList.add("currentView");

  // update store
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

  // load view component and fetch data
  parentEl.innerHTML = "";
  let templateName = viewAndTemplateObject(targetView);
  let view = document.createElement(templateName);
  parentEl.appendChild(view);

  updateAppUrl(window.location, appStore);
}

export async function updateHeaderCount(
  countLabel: string,
  dataFn: any,
  searchParams: string,
  appStore: MapStore,
  perPage = 0,
  maxCacheSize = 1000,
) {
  let count = 0;

  // get count from cache or API
  let hash = await createHeaderCountHash(countLabel, searchParams);
  let cacheCount = appStore.iNatStats.headerCounts.get(hash);
  if (cacheCount) {
    count = cacheCount;
  } else {
    count = await fetchHeaderCounts(dataFn, searchParams, perPage);
  }

  renderHeaderCounts(countLabel, count);

  if (!cacheCount) {
    await saveHeaderCount(count, hash, appStore, maxCacheSize);
  }
}

async function fetchHeaderCounts(
  dataFn: any,
  searchParams: string,
  perPage: number,
) {
  if (import.meta.env?.VITE_CACHE === "true") {
    return -999;
  }

  let data = await dataFn(searchParams, perPage);
  let count = data?.total_results;
  return count;
}

function renderHeaderCounts(countLabel: string, count: number) {
  let countEls = document.querySelectorAll(
    `[data-count-label="${countLabel}"] .header-count`,
  );
  if (countEls.length === 0) return;

  Array.from(countEls).forEach((countEl) => {
    countEl.textContent = count.toLocaleString();
  });
}

export async function saveHeaderCount(
  value: number,
  hash: string,
  appStore: MapStore,
  maxCacheSize = 1000,
) {
  // remove first item in headerCounts if cache is max size
  if (appStore.iNatStats.headerCounts.size === maxCacheSize) {
    let firstKey = appStore.iNatStats.headerCountsIndex[0];
    appStore.iNatStats.headerCounts.delete(firstKey);
    appStore.iNatStats.headerCountsIndex.shift();
  }

  appStore.iNatStats.headerCountsIndex.push(hash);
  appStore.iNatStats.headerCounts.set(hash, value);
  appStore.iNatStats = appStore.iNatStats;
}

export async function createHeaderCountHash(
  countLabel: string,
  searchParams: string,
) {
  let params = searchParams
    .replace(/&view=[a-z]+/, "")
    .replace(/&colors=[%0-9a-z]+/, "")
    .replace(/&subview=[a-z]+/, "");
  let key = params + ":" + countLabel;
  return await createHashString(key);
}
