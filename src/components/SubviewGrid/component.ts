import { observationsTemplate } from "./shared_template";
import { loggerEvent, loggerRender } from "../../lib/logger";
import { setupComponent } from "../../lib/component_utils";
import type { AppStoreType } from "../../types/app";
import {
  addEventListenersObservations,
  eventHandlersObservations,
  initFilters,
  removeEventListenersObservations,
  renderObservations,
} from "./shared_utils";

class SubviewObservationsGrid extends HTMLElement {
  constructor() {
    super();
  }

  orderForm: null | HTMLFormElement = null;

  connectedCallback() {
    loggerRender("++ SubviewObservationsGrid connectedCallback");
    setupComponent(observationsTemplate, this);

    this.orderForm = this.querySelector<HTMLFormElement>("#order-form");
    if (!this.orderForm) return;

    this.render(window.app.store);

    addEventListenersObservations(this);
  }

  disconnectedCallback() {
    loggerRender("++ SubviewObservationsGrid disconnectedCallback");

    removeEventListenersObservations(this);
  }

  handleEvent(event: Event) {
    loggerEvent(`[SubviewObservationsGrid event] ${event.type}`);

    eventHandlersObservations(event, this, window.app.store);
  }

  render(appStore: AppStoreType) {
    loggerRender("++ SubviewObservationsGrid render");
    renderObservations(appStore);
    initFilters(appStore);
  }
}

customElements.define("subview-observations-grid", SubviewObservationsGrid);
