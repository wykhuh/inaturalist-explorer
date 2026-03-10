import "leaflet/dist/leaflet.css";
import "../../assets/leaflet.css";
import "../../assets/autocomplete.css";

import { template } from "./template";
import {
  fetchAndCacheData,
  initFilters,
  renderSubview,
  updateSubviewState,
} from "./utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import { setupComponent } from "../../lib/component_utils";
import type { AppStoreType, ObservationSubviewsType } from "../../types/app";
import { createSpinner } from "../../lib/spinner";

class ViewObservations extends HTMLElement {
  constructor() {
    super();
  }

  mapLinkEl: null | HTMLElement = null;
  tableLinkEl: null | HTMLElement = null;
  graphLinkEl: null | HTMLElement = null;
  gridLinkEl: null | HTMLElement = null;
  mediaLinkEl: null | HTMLElement = null;

  connectedCallback() {
    loggerRender("++ ViewObservations connectedCallback");
    setupComponent(template, this);

    this.mapLinkEl = document.querySelector<HTMLElement>(".subview-map");
    this.tableLinkEl = document.querySelector<HTMLElement>(".subview-table");
    this.graphLinkEl = document.querySelector<HTMLElement>(".subview-graph");
    this.gridLinkEl = document.querySelector<HTMLElement>(".subview-grid");
    this.mediaLinkEl = document.querySelector<HTMLElement>(".subview-media");

    if (!this.mapLinkEl) return;
    if (!this.tableLinkEl) return;
    if (!this.graphLinkEl) return;
    if (!this.gridLinkEl) return;
    if (!this.mediaLinkEl) return;

    this.render(window.app.store);

    this.mapLinkEl.addEventListener("click", this);
    this.tableLinkEl.addEventListener("click", this);
    this.graphLinkEl.addEventListener("click", this);
    this.gridLinkEl.addEventListener("click", this);
    this.mediaLinkEl.addEventListener("click", this);
  }

  disconnectedCallback() {
    loggerRender("++ ViewObservations disconnectedCallback");

    this.mapLinkEl?.removeEventListener("click", this);
    this.tableLinkEl?.removeEventListener("click", this);
    this.graphLinkEl?.removeEventListener("click", this);
    this.gridLinkEl?.removeEventListener("click", this);
    this.mediaLinkEl?.removeEventListener("click", this);
  }

  handleEvent(event: Event) {
    let target = event.target as HTMLElement;
    if (!target) return;

    loggerEvent(`[ViewObservations event] ${event.type}`);

    let subview = target.dataset?.subview as ObservationSubviewsType;
    if (event.type === "click") {
      if (
        subview &&
        this.tableLinkEl &&
        this.graphLinkEl &&
        this.gridLinkEl &&
        this.mediaLinkEl &&
        this.mapLinkEl
      ) {
        updateSubviewState(subview, this, window.app.store);
        // TODO: is this event dispatch needed?
        loggerEvent("[ViewObservations dispatchEvent] subviewChange");
        window.dispatchEvent(new Event("subviewChange"));
      }
    }
  }

  async render(appStore: AppStoreType) {
    loggerRender("++ ViewObservations render");
    let spinner = createSpinner();
    spinner.start();

    // use store to set values the form on page load
    initFilters(appStore, this);

    // load observation data for grid/table
    await fetchAndCacheData(appStore, true);
    spinner.stop();

    renderSubview(appStore);
  }
}

customElements.define("view-observations", ViewObservations);
