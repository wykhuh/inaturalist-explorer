import "leaflet/dist/leaflet.css";
import "../../assets/leaflet.css";
import "../../assets/autocomplete.css";

import { template } from "./template";
import {
  fetchAndRenderData,
  initFilters,
  paginationCallback,
  updateSubviewState,
  updateOrderForStore,
  updateGraphs,
  renderGraphCategorySelect,
  disablePopularFieldsOptions,
  disableGroupByForSelectedResources,
} from "./utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import { setupComponent } from "../../lib/component_utils";
import type { AppStoreType, ObservationSubviewsType } from "../../types/app";
import { removeMap } from "../../lib/map_utils";

class ViewObservations extends HTMLElement {
  constructor() {
    super();
  }

  mapLinkEl: null | HTMLElement = null;
  tableLinkEl: null | HTMLElement = null;
  graphLinkEl: null | HTMLElement = null;
  gridLinkEl: null | HTMLElement = null;
  mediaLinkEl: null | HTMLElement = null;
  orderForm: null | HTMLFormElement = null;
  graphForm: null | HTMLFormElement = null;

  connectedCallback() {
    loggerRender("++ ViewObservations connectedCallback");
    setupComponent(template, this);

    this.mapLinkEl = document.querySelector<HTMLElement>(".subview-map");
    this.tableLinkEl = document.querySelector<HTMLElement>(".subview-table");
    this.graphLinkEl = document.querySelector<HTMLElement>(".subview-graph");
    this.gridLinkEl = document.querySelector<HTMLElement>(".subview-grid");
    this.mediaLinkEl = document.querySelector<HTMLElement>(".subview-media");
    this.orderForm = this.querySelector<HTMLFormElement>("#order-form");
    this.graphForm = this.querySelector<HTMLFormElement>("#graph-form");

    if (!this.mapLinkEl) return;
    if (!this.tableLinkEl) return;
    if (!this.graphLinkEl) return;
    if (!this.gridLinkEl) return;
    if (!this.mediaLinkEl) return;
    if (!this.orderForm) return;
    if (!this.graphForm) return;

    this.render(window.app.store);

    window.addEventListener("observationsChange", this);
    window.addEventListener("localeChanged", this);
    window.addEventListener("nameOrderChanged", this);
    window.addEventListener("identificationsChange", this);
    window.addEventListener("perPageChanged", this);
    window.addEventListener("popularFieldsOptionsChanged", this);

    this.mapLinkEl.addEventListener("click", this);
    this.tableLinkEl.addEventListener("click", this);
    this.graphLinkEl.addEventListener("click", this);
    this.gridLinkEl.addEventListener("click", this);
    this.mediaLinkEl.addEventListener("click", this);
    this.orderForm.addEventListener("change", this);
    this.graphForm.addEventListener("change", this);
  }

  disconnectedCallback() {
    loggerRender("++ ViewObservations disconnectedCallback");

    removeMap(window.app.store);

    window.removeEventListener("observationsChange", this);
    window.removeEventListener("localeChanged", this);
    window.removeEventListener("nameOrderChanged", this);
    window.removeEventListener("identificationsChange", this);
    window.removeEventListener("perPageChanged", this);
    window.removeEventListener("popularFieldsOptionsChanged", this);

    this.mapLinkEl?.removeEventListener("click", this);
    this.tableLinkEl?.removeEventListener("click", this);
    this.graphLinkEl?.removeEventListener("click", this);
    this.gridLinkEl?.removeEventListener("click", this);
    this.mediaLinkEl?.removeEventListener("click", this);
    this.orderForm?.removeEventListener("change", this);
    this.graphForm?.removeEventListener("change", this);
  }

  handleEvent(event: Event) {
    let target = event.target as HTMLElement;
    if (!target) return;
    if (!this.orderForm) return;
    if (!this.graphForm) return;

    loggerEvent(`[ViewObservations event] ${event.type}`);

    if (
      ["selectedTaxaChanged", "popularFieldsOptionsChanged"].includes(
        event.type,
      )
    ) {
      renderGraphCategorySelect(window.app.store, this);
    }

    let resourceChanges = [
      "observationsChange",
      "localeChanged",
      "perPageChanged",
    ];
    if (resourceChanges.includes(event.type)) {
      fetchAndRenderData(paginationCallback, window.app.store, false);
      disableGroupByForSelectedResources(window.app.store, this);
    }

    let resourceChangesUseCache = ["nameOrderChanged"];
    if (resourceChangesUseCache.includes(event.type)) {
      fetchAndRenderData(paginationCallback, window.app.store, true);
    }

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
        loggerEvent("[ViewObservations dispatchEvent] subviewChange");
        window.dispatchEvent(new Event("subviewChange"));
      }
    }

    if (target.id === "order_combo") {
      const data = new FormData(this.orderForm);
      updateOrderForStore(data, window.app.store);
    }

    if (target.id === "graphs-group-by") {
      let targetSelect = target as HTMLSelectElement;
      disablePopularFieldsOptions(targetSelect, window.app.store, this);

      const data = new FormData(this.graphForm);
      updateGraphs(data, window.app.store);
    }

    if (target.id === "graphs-category") {
      const data = new FormData(this.graphForm);
      updateGraphs(data, window.app.store);
    }

    // displayGraphStatus();
  }

  async render(appStore: AppStoreType) {
    loggerRender("++ ViewObservations render");

    // use store to set values the form on page load
    initFilters(appStore, this);
    disableGroupByForSelectedResources(appStore, this);

    // load observation data for grid/table
    await fetchAndRenderData(paginationCallback, appStore, true);
  }
}

customElements.define("view-observations", ViewObservations);
