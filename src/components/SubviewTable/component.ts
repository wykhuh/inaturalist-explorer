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

class SubviewObservationsTable extends HTMLElement {
  constructor() {
    super();
  }

  orderForm: null | HTMLFormElement = null;

  connectedCallback() {
    loggerRender("++ SubviewObservationsTable connectedCallback");
    setupComponent(observationsTemplate, this);

    this.orderForm = this.querySelector<HTMLFormElement>("#order-form");
    if (!this.orderForm) return;

    this.render(window.app.store);

    addEventListenersObservations(this);
  }

  disconnectedCallback() {
    loggerRender("++ SubviewObservationsTable disconnectedCallback");

    removeEventListenersObservations(this);
  }

  handleEvent(event: Event) {
    loggerEvent(`[SubviewObservationsTable event] ${event.type}`);

    eventHandlersObservations(event, this, window.app.store);
  }

  render(appStore: AppStoreType) {
    loggerRender("++ SubviewObservationsTable render");
    renderObservations(appStore);
    initFilters(appStore);
  }
}

customElements.define("subview-observations-table", SubviewObservationsTable);
