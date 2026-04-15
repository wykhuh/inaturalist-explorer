import { setupComponent } from "../../lib/component_utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import {
  fetchAndRenderData,
  initFilters,
  paginationCallback,
  updateOrderForStore,
  updateSubviewState,
} from "./utils";
import { template } from "./template";
import type { AppStoreType, IdentificationSubviewsType } from "../../types/app";
import { removeMap } from "../../lib/map_utils";

class ViewIdentifications extends HTMLElement {
  constructor() {
    super();
  }

  mapLinkEl: null | HTMLElement = null;
  gridLinkEl: null | HTMLElement = null;
  historyLinkEl: null | HTMLElement = null;
  orderForm: null | HTMLFormElement = null;

  connectedCallback() {
    loggerRender("++ ViewIdentifications connectedCallback");
    setupComponent(template, this);

    this.mapLinkEl = document.querySelector<HTMLElement>(".subview-map");
    this.gridLinkEl = document.querySelector<HTMLElement>(".subview-grid");
    this.historyLinkEl =
      document.querySelector<HTMLElement>(".subview-history");
    this.orderForm = this.querySelector<HTMLFormElement>("#order-form");
    if (!this.mapLinkEl) return;
    if (!this.gridLinkEl) return;
    if (!this.historyLinkEl) return;
    if (!this.orderForm) return;

    this.render(window.app.store);

    window.addEventListener("localeChanged", this);
    window.addEventListener("nameOrderChanged", this);
    window.addEventListener("perPageChanged", this);

    this.mapLinkEl.addEventListener("click", this);
    this.gridLinkEl.addEventListener("click", this);
    this.historyLinkEl.addEventListener("click", this);
    this.orderForm.addEventListener("change", this);
  }

  disconnectedCallback() {
    loggerRender("++ ViewIdentifications disconnectedCallback");

    removeMap(window.app.store);

    window.removeEventListener("localeChanged", this);
    window.removeEventListener("nameOrderChanged", this);
    window.removeEventListener("perPageChanged", this);

    this.mapLinkEl?.removeEventListener("click", this);
    this.gridLinkEl?.removeEventListener("click", this);
    this.historyLinkEl?.removeEventListener("click", this);
    this.orderForm?.removeEventListener("change", this);
  }

  handleEvent(event: CustomEvent) {
    let target = event.target as HTMLElement;
    if (!target) return;
    loggerEvent(`[ViewIdentifications event] ${event.type}`);

    let resourceChanges = [
      "localeChanged",
      "nameOrderChanged",
      "perPageChanged",
    ];
    if (resourceChanges.includes(event.type)) {
      fetchAndRenderData(paginationCallback, window.app.store);
    }

    let subview = target.dataset?.subview as IdentificationSubviewsType;
    if (event.type === "click") {
      if (subview && this.gridLinkEl && this.mapLinkEl) {
        updateSubviewState(subview, this, window.app.store);
      }
    }

    if (this.orderForm && target.id === "order_combo") {
      const data = new FormData(this.orderForm);
      updateOrderForStore(data, window.app.store);
    }
  }

  async render(appStore: AppStoreType) {
    loggerRender("++ ViewIdentifications render");

    // use store to set values the form on page load
    initFilters(appStore, this);

    await fetchAndRenderData(paginationCallback, window.app.store);
  }
}

customElements.define("view-identifications", ViewIdentifications);
