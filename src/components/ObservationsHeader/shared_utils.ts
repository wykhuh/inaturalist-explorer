import { viewAndTemplateObject } from "../../data/app_data";
import { cleanupObervationsTaxonomyParams } from "../../lib/cleanup_params_utils";
import {
  getResourceApiParams,
  isObservationsCheck,
  isSpeciesOrHigerCheck,
} from "../../lib/data_utils";
import { getObservationsTaxonomy } from "../../lib/inat_api";
import { createHashString, updateAppUrl } from "../../lib/utils";
import type {
  AppStoreType,
  ObservationViewsType,
  TooltipSettings,
} from "../../types/app";
import {
  getSubspeciesIds,
  validSubspeciesForStore,
} from "../ViewSpecies/utils";

export function viewChangeHandler(
  eventTarget: HTMLElement,
  appStore: AppStoreType,
  componentContext: HTMLElement,
) {
  let viewContainerEl = document.querySelector("#view-container");
  if (!viewContainerEl) return;
  let liEl = eventTarget.closest("li");
  if (!liEl) return;
  let countLabel = liEl.dataset.countLabel;
  if (!countLabel) return;

  let view = countLabel as ObservationViewsType;

  if (appStore.currentView !== countLabel) {
    updateView(view, viewContainerEl, appStore, componentContext);
  }
}

export function viewChangeHandlerPopstate(
  view: ObservationViewsType,
  appStore: AppStoreType,
  componentContext: Document,
) {
  let viewContainerEl = document.querySelector("#view-container");
  if (!viewContainerEl) return;

  updateView(view, viewContainerEl, appStore, componentContext, false);
}

export function updateView(
  targetView: ObservationViewsType,
  parentEl: Element,
  appStore: AppStoreType,
  componentContext: HTMLElement | Document,
  updatePushState = true,
) {
  if (!parentEl) return;

  // update currentView class in nav
  let oldItemEl = componentContext.querySelector(`#${appStore.currentView}`);
  oldItemEl?.classList.remove("currentView");
  let itemEl = componentContext.querySelector(`#${targetView}`);
  itemEl?.classList.add("currentView");

  let resourceParams = getResourceApiParams(isObservationsCheck(appStore));

  // update store
  appStore.currentView = targetView;
  let page = appStore.viewMetadata[targetView]?.page;
  if (page) {
    appStore[resourceParams].page = page;
  } else {
    delete appStore[resourceParams].page;
  }

  let perPage = appStore.viewMetadata[targetView]?.perPage;
  if (perPage) {
    appStore[resourceParams].per_page = perPage;
  }

  let order = appStore.viewMetadata[targetView]?.order;
  if (order) {
    appStore[resourceParams].order = order;
  } else {
    delete appStore[resourceParams].order;
  }

  let order_by = appStore.viewMetadata[targetView]?.order_by;
  if (order_by) {
    appStore[resourceParams].order_by = order_by;
  } else {
    delete appStore[resourceParams].order_by;
  }

  // load view component and fetch data
  parentEl.innerHTML = "";
  let templateName = viewAndTemplateObject(targetView);
  let view = document.createElement(templateName);
  parentEl.appendChild(view);

  if (updatePushState) {
    updateAppUrl(window.location, appStore);
  }
}

export async function updateHeaderCount(
  countLabel: ObservationViewsType,
  dataFn: any,
  searchParams: string,
  appStore: AppStoreType,
  tooltipSettings: TooltipSettings | null = null,
  perPage = 0,
  maxCacheSize = 1000,
) {
  let count = 0;
  searchParams = searchParams.replace(/per_page=[0-9]+/, `per_page=${perPage}`);

  // get count from cache or API
  let hash = await createHeaderCountHash(countLabel, searchParams);
  let cacheCount = appStore.iNatStats.headerCounts.get(hash);
  if (cacheCount) {
    count = cacheCount;
  } else {
    count = await fetchHeaderCounts(dataFn, searchParams);
  }

  renderHeaderCounts(countLabel, count, tooltipSettings);

  if (!cacheCount) {
    await saveHeaderCount(count, hash, appStore, maxCacheSize);
  }
  return count;
}

export async function updateHeaderSubSpeciesCount(
  countLabel: ObservationViewsType,
  dataFn: any,
  searchParams: string,
  appStore: AppStoreType,
  tooltipSettings: TooltipSettings | null = null,
  maxCacheSize = 1000,
) {
  let count = 0;

  // get count from cache or API
  let hash = await createHeaderCountHash(countLabel, searchParams);
  let cacheCount = appStore.iNatStats.headerCounts.get(hash);
  if (cacheCount) {
    count = cacheCount;
  } else {
    let taxonomyParams = cleanupObervationsTaxonomyParams(
      appStore.observationsApiParams,
    );
    let subspeciesCount = await getSubspeciesCount(taxonomyParams, appStore);
    let higherCount = 0;
    if (isSpeciesOrHigerCheck(appStore)) {
      higherCount = (await fetchHeaderCounts(dataFn, searchParams)) || 0;
    }
    count = subspeciesCount + higherCount;
  }

  renderHeaderCounts(countLabel, count, tooltipSettings);

  if (!cacheCount) {
    await saveHeaderCount(count, hash, appStore, maxCacheSize);
  }
  return count;
}

async function getSubspeciesCount(
  searchParams: string,
  appStore: AppStoreType,
) {
  let taxonomyData = await getObservationsTaxonomy(searchParams);
  if (taxonomyData) {
    let validRanks = validSubspeciesForStore(appStore);
    if (validRanks) {
      let { subspeciesIds } = getSubspeciesIds(
        taxonomyData.results,
        validRanks,
      );
      return subspeciesIds.length;
    }
  }

  return 0;
}

async function fetchHeaderCounts(dataFn: any, searchParams: string) {
  if (import.meta.env?.VITE_CACHE === "true") {
    return -999;
  }

  let data = await dataFn(searchParams);
  let count = data?.total_results;
  return count;
}

function renderHeaderCounts(
  countLabel: ObservationViewsType,
  count: number,
  tooltipSettings: TooltipSettings | null = null,
) {
  // use querySelectorAll because there are header and filter counts
  let countEls = document.querySelectorAll(
    `[data-count-label="${countLabel}"] .header-count`,
  );
  if (countEls.length === 0) return;

  Array.from(countEls).forEach((countEl) => {
    countEl.textContent = count.toLocaleString();
    if (tooltipSettings) {
      let tooltip = document.createElement("app-tooltip");
      tooltip.dataset.id = tooltipSettings.id;
      tooltip.dataset.content = tooltipSettings.content;
      tooltip.dataset.tooltip = tooltipSettings.tooltip;

      countEl.append(tooltip);
    }
  });
}

export async function saveHeaderCount(
  value: number,
  hash: string,
  appStore: AppStoreType,
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
  countLabel: ObservationViewsType,
  searchParams: string,
) {
  let params = searchParams
    .replace(/&view=[a-z]+/, "")
    .replace(/&colors=[%0-9a-z]+/, "")
    .replace(/&subview=[a-z]+/, "");
  let key = params + ":" + countLabel;
  return await createHashString(key);
}
