import { mapTemplate } from "./template";
import { loggerEvent, loggerRender } from "../../lib/logger";
import { setupComponent } from "../../lib/component_utils";
import type { AppStoreType } from "../../types/app";
import {
  fetchAndRenderMapTiles,
  createMap,
  stopMapAnimation,
  toggleAnimationControls,
  fetchAndRenderTimePeriods,
  initFilters,
  setCategory,
} from "./utils";
import { initRenderMap } from "../../lib/init_app";
import { removeMap } from "../../lib/map_utils";

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

    this.mapForm?.addEventListener("change", this);
    this.timeRangeEl?.addEventListener("change", this);
    this.playButtonEl?.addEventListener("click", this);
  }

  disconnectedCallback() {
    loggerRender("++ SubviewObservationsMap disconnectedCallback");
    removeMap(window.app.store);

    this.mapForm?.removeEventListener("change", this);
    this.timeRangeEl?.removeEventListener("change", this);
    this.playButtonEl?.removeEventListener("click", this);
  }

  handleEvent(event: Event) {
    loggerEvent(`[SubviewObservationsMap event] ${event.type}`);
    let target = event.target as HTMLInputElement;
    if (!target) return;
    if (!this.mapForm) return;
    if (!this.currentTimeperiodEl) return;

    if (target.id === "map-category") {
      const data = new FormData(this.mapForm);
      setCategory(data, window.app.store);
      stopMapAnimation(this, window.app.store);
      toggleAnimationControls(this, window.app.store);
      fetchAndRenderTimePeriods(window.app.store, this);
    }

    if (event.type === "click") {
      event.preventDefault();
      if (target.closest("button")?.id === "play" || target.id === "play") {
        fetchAndRenderMapTiles(this, window.app.store);
      }
    }
  }

  async render(appStore: AppStoreType) {
    loggerRender("++ SubviewObservationsMap render");
    let dataContainer = this.querySelector("#subview-data-container");
    if (!dataContainer) return;
    if (!this.mapForm) return;

    dataContainer.innerHTML = "";

    dataContainer.appendChild(createMap());
    initRenderMap(appStore);
    initFilters(appStore);
    toggleAnimationControls(this, appStore);

    await fetchAndRenderTimePeriods(window.app.store, this);
  }
}

customElements.define("subview-observations-map", SubviewObservationsMap);
