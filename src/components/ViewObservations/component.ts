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
} from "./utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import { initRenderMap } from "../../lib/init_app";
import { setupComponent } from "../../lib/component_utils";
import type { AppStoreType, ObservationSubviewsType } from "../../types/app";
import { isObservationsCheck } from "../../lib/data_utils";

class ViewObservations extends HTMLElement {
  constructor() {
    super();
  }

  tableLinkEl: null | HTMLElement = null;
  gridLinkEl: null | HTMLElement = null;
  mediaLinkEl: null | HTMLElement = null;
  orderForm: null | HTMLFormElement = null;

  connectedCallback() {
    loggerRender("++ ViewObservations connectedCallback");
    setupComponent(template, this);

    this.tableLinkEl = document.querySelector<HTMLElement>(".subview-table");
    this.gridLinkEl = document.querySelector<HTMLElement>(".subview-grid");
    this.mediaLinkEl = document.querySelector<HTMLElement>(".subview-media");
    this.orderForm = this.querySelector<HTMLFormElement>("#order-form");
    if (!this.tableLinkEl) return;
    if (!this.gridLinkEl) return;
    if (!this.mediaLinkEl) return;
    if (!this.orderForm) return;

    this.render(window.app.store);

    window.addEventListener("observationsChange", this);
    window.addEventListener("localeChanged", this);
    window.addEventListener("nameOrderChanged", this);
    window.addEventListener("identificationsChange", this);
    window.addEventListener("perPageChanged", this);

    this.tableLinkEl.addEventListener("click", this);
    this.gridLinkEl.addEventListener("click", this);
    this.mediaLinkEl.addEventListener("click", this);
    this.orderForm.addEventListener("change", this);
  }

  disconnectedCallback() {
    loggerRender("++ ViewObservations disconnectedCallback");

    if (window.app.store.map.map) {
      // save map bounds before switching views so app can return to this map location
      window.app.store.map.bounds = window.app.store.map.map.getBounds();

      // remove map and event listeners
      window.app.store.map.map.remove();
      window.app.store.map.map = null;
    }

    if (window.app.store.map.layerControl) {
      window.app.store.map.layerControl.remove();
      window.app.store.map.layerControl = null;
    }

    window.removeEventListener("observationsChange", this);
    window.removeEventListener("localeChanged", this);
    window.removeEventListener("nameOrderChanged", this);
    window.removeEventListener("identificationsChange", this);
    window.removeEventListener("perPageChanged", this);
    this.tableLinkEl?.removeEventListener("click", this);
    this.gridLinkEl?.removeEventListener("click", this);
    this.mediaLinkEl?.removeEventListener("click", this);
    this.orderForm?.removeEventListener("change", this);
  }

  handleEvent(event: Event) {
    let target = event.target as HTMLElement;
    if (!target) return;
    loggerEvent(`[ViewObservations event] ${event.type}`);
    let resourceChanges = [
      "observationsChange",
      "identificationsChange",
      "localeChanged",
      "nameOrderChanged",
      "perPageChanged",
    ];
    if (resourceChanges.includes(event.type)) {
      fetchAndRenderData(paginationCallback, window.app.store);
    }

    let subview = target.dataset?.subview as ObservationSubviewsType;
    if (event.type === "click") {
      if (subview && this.tableLinkEl && this.gridLinkEl && this.mediaLinkEl) {
        updateSubviewState(subview, this, window.app.store);
      }
    }

    if (this.orderForm && target.id === "order_combo") {
      const data = new FormData(this.orderForm);
      updateOrderForStore(data, window.app.store);
    }
  }

  async render(appStore: AppStoreType) {
    loggerRender("++ ViewObservations render");

    // set initial current-subview class
    let isObservations = isObservationsCheck(appStore);
    let subview = isObservations
      ? appStore.viewMetadata.observations_observations?.subview
      : appStore.viewMetadata.identifications_observations?.subview;
    if (subview === "table") {
      this.tableLinkEl?.classList.add("current-subview");
    } else if (subview === "media") {
      this.mediaLinkEl?.classList.add("current-subview");
    } else {
      this.gridLinkEl?.classList.add("current-subview");
    }

    // create new map
    await initRenderMap(appStore);

    // use store to set values the form on page load
    initFilters(appStore);

    // load observation data for grid/table
    await fetchAndRenderData(paginationCallback, appStore);

    this.orderFormHandler();
  }

  orderFormHandler() {}
}

customElements.define("view-observations", ViewObservations);
