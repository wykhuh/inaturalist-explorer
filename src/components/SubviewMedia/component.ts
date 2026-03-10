import { observationsTemplate } from "../SubviewGrid/shared_template";
import { loggerEvent, loggerRender } from "../../lib/logger";
import { setupComponent } from "../../lib/component_utils";
import type { AppStoreType } from "../../types/app";
import {
  addEventListenersObservations,
  eventHandlersObservations,
  initFilters,
  removeEventListenersObservations,
  renderObservations,
} from "../SubviewGrid/shared_utils";

class SubviewObservationsMedia extends HTMLElement {
  constructor() {
    super();
  }

  orderForm: null | HTMLFormElement = null;

  connectedCallback() {
    loggerRender("++ SubviewObservationsMedia connectedCallback");
    setupComponent(observationsTemplate, this);

    this.orderForm = this.querySelector<HTMLFormElement>("#order-form");
    if (!this.orderForm) return;

    this.render(window.app.store);

    addEventListenersObservations(this);
  }

  disconnectedCallback() {
    loggerRender("++ SubviewObservationsMedia disconnectedCallback");

    removeEventListenersObservations(this);
  }

  handleEvent(event: Event) {
    loggerEvent(`[SubviewObservationsMedia event] ${event.type}`);

    eventHandlersObservations(event, this, window.app.store);
  }

  render(appStore: AppStoreType) {
    loggerEvent(`++ [SubviewObservationsMedia render]`);

    renderObservations(appStore, this);
    initFilters(appStore);
  }
}

customElements.define("subview-observations-media", SubviewObservationsMedia);
