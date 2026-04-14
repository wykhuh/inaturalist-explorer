import { mapTemplate } from "./template";
import { loggerEvent, loggerRender } from "../../lib/logger";
import { setupComponent } from "../../lib/component_utils";
import type { AppStoreType } from "../../types/app";
import {
  startMapAnimations,
  createMap,
  stopMapAnimation,
  toggleAnimationControls,
  fetchAndRenderTimePeriods,
  initFilters,
  setCategory,
  updateCurrentTimeText,
  clearMapLayers,
  switchToNormalMap,
  createOneAnimatedMapLayer,
} from "./utils";
import { initRenderMap } from "../../lib/init_app";
import { removeMap } from "../../lib/map_utils";
import { isAnimatedMapCategory } from "../../lib/data_utils";
import { debounce } from "../../lib/utils";
import { fetchAndCacheData } from "../ViewObservations/utils";

export class SubviewObservationsMap extends HTMLElement {
  constructor() {
    super();
  }

  mapForm: null | HTMLFormElement = null;
  timeRangeEl: null | HTMLInputElement = null;
  currentTimeperiodEl: null | HTMLInputElement = null;
  playButtonEl: null | HTMLButtonElement = null;
  animateControls: null | HTMLDivElement = null;

  connectedCallback() {
    loggerRender("++ SubviewObservationsMap connectedCallback");
    setupComponent(mapTemplate, this);

    this.mapForm = this.querySelector<HTMLFormElement>("#map-form");
    this.timeRangeEl = this.querySelector<HTMLInputElement>("#time-range");
    this.currentTimeperiodEl = this.querySelector<HTMLInputElement>(
      "#current-timeperiod",
    );
    this.playButtonEl = this.querySelector<HTMLButtonElement>("#play");
    this.animateControls = this.querySelector<HTMLDivElement>(
      "#animate-map-controls",
    );

    this.render(window.app.store);

    window.addEventListener("observationsChange", this);
    this.mapForm?.addEventListener("change", this);
    this.timeRangeEl?.addEventListener("change", this);
    this.playButtonEl?.addEventListener("click", this);
  }

  disconnectedCallback() {
    loggerRender("++ SubviewObservationsMap disconnectedCallback");
    removeMap(window.app.store);

    window.removeEventListener("observationsChange", this);
    this.mapForm?.removeEventListener("change", this);
    this.timeRangeEl?.removeEventListener("change", this);
    this.playButtonEl?.removeEventListener("click", this);

    stopMapAnimation(this, window.app.store);
    clearMapLayers(window.app.store);
  }

  handleEvent(event: Event) {
    loggerEvent(`[SubviewObservationsMap event] ${event.type}`);
    let appStore = window.app.store;
    let target = event.target as HTMLInputElement;
    if (!target) return;
    if (!this.mapForm) return;
    if (!this.currentTimeperiodEl) return;

    if (event.type === "observationsChange") {
      // animated map tiles
      if (isAnimatedMapCategory(appStore)) {
        stopMapAnimation(this, appStore);
        clearMapLayers(appStore);
        startMapAnimations(this, appStore);
        // selected taxa map tiles
      } else {
        fetchAndCacheData(window.app.store, false);
      }
    }

    if (event.type === "change" && target.id === "map-category") {
      const data = new FormData(this.mapForm);
      // reset map
      stopMapAnimation(this, appStore);
      clearMapLayers(appStore);
      updateCurrentTimeText(0, this, appStore);

      // load new map
      setCategory(data, appStore);
      toggleAnimationControls(this, appStore);
      if (isAnimatedMapCategory(appStore)) {
        fetchAndRenderTimePeriods(appStore, this).then(() => {
          createOneAnimatedMapLayer(appStore);
        });
      } else {
        switchToNormalMap(appStore, this);
      }
    }

    if (event.type === "click") {
      event.preventDefault();

      if (target.closest("button")?.id === "play" || target.id === "play") {
        if (isAnimatedMapCategory(appStore)) {
          if (
            appStore.viewMetadata.observations_observations.map.mapAnimation
          ) {
            stopMapAnimation(this, appStore);
          } else {
            clearMapLayers(appStore);
            startMapAnimations(this, appStore);
          }
        }
      }
    }

    if (event.type === "change" && target.id === "time-range") {
      if (isAnimatedMapCategory(appStore)) {
        this.timeRangeHandlerDebounced(target, this, appStore);
      }
    }
  }

  timeRangeHandler(
    target: HTMLInputElement,
    componentContext: any,
    appStore: AppStoreType,
  ) {
    // clear map
    stopMapAnimation(componentContext, appStore);
    clearMapLayers(appStore);

    // load one map layer for given time period
    updateCurrentTimeText(Number(target.value), componentContext, appStore);
    createOneAnimatedMapLayer(appStore);
  }

  timeRangeHandlerDebounced = debounce(this.timeRangeHandler);

  async render(appStore: AppStoreType) {
    loggerRender("++ SubviewObservationsMap render");
    let dataContainer = this.querySelector("#subview-data-container");
    if (!dataContainer) return;
    if (!this.mapForm) return;

    dataContainer.innerHTML = "";

    // render map; render taxa map layer if needed
    dataContainer.appendChild(createMap());
    initRenderMap(appStore);

    // render menus
    initFilters(appStore);
    toggleAnimationControls(this, appStore);
    await fetchAndRenderTimePeriods(window.app.store, this);

    // add animated map layer if needed
    if (isAnimatedMapCategory(appStore)) {
      createOneAnimatedMapLayer(appStore);
    }
  }
}

customElements.define("subview-observations-map", SubviewObservationsMap);
