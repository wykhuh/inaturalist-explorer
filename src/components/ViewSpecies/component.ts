import { setupComponent } from "../../lib/component_utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import {
  fetchAndRenderData,
  initFilters,
  paginationCallback,
  updateOrderForStore,
} from "./utils";
import { template } from "./template";
import type { AppStoreType } from "../../types/app";

class ViewSpecies extends HTMLElement {
  constructor() {
    super();
  }

  orderForm: null | HTMLFormElement = null;

  connectedCallback() {
    loggerRender("++ ViewSpecies connectedCallback");
    setupComponent(template, this);

    this.orderForm = this.querySelector<HTMLFormElement>("#order-form");
    if (!this.orderForm) return;

    this.render(window.app.store);

    window.addEventListener("observationsChange", this);
    window.addEventListener("identificationsChange", this);
    window.addEventListener("localeChanged", this);
    window.addEventListener("nameOrderChanged", this);
    window.addEventListener("perPageChanged", this);
    this.orderForm.addEventListener("change", this);
  }

  disconnectedCallback() {
    loggerRender("++ ViewSpecies disconnectedCallback");

    window.removeEventListener("observationsChange", this);
    window.removeEventListener("identificationsChange", this);
    window.removeEventListener("localeChanged", this);
    window.removeEventListener("nameOrderChanged", this);
    window.removeEventListener("perPageChanged", this);
    this.orderForm?.removeEventListener("change", this);
  }

  handleEvent(event: Event) {
    let target = event.target as HTMLElement;
    if (!target) return;
    loggerEvent(`[ViewSpecies event] ${event.type}`);

    let resourceChanges = [
      "observationsChange",
      "identificationsChange",
      "localeChanged",
      "nameOrderChanged",
      "perPageChanged",
    ];
    if (resourceChanges.includes(event.type)) {
      fetchAndRenderData(paginationCallback, window.app.store, false);
    }

    if (this.orderForm && target.id === "order_combo") {
      const data = new FormData(this.orderForm);
      updateOrderForStore(data, window.app.store);
    }
  }

  async render(appStore: AppStoreType) {
    loggerRender("++ ViewSpecies render");

    // use store to set values the form on page load
    initFilters(appStore);

    await fetchAndRenderData(paginationCallback, window.app.store, true);
  }
}

customElements.define("view-species", ViewSpecies);
