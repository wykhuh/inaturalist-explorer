import { observationsTemplate } from "../SubviewGrid/shared_template";
import { loggerEvent, loggerRender } from "../../lib/logger";
import { setupComponent } from "../../lib/component_utils";
import type { AppStoreType, DataComponentType } from "../../types/app";
import {
  addEventListenersObservations,
  eventHandlersObservations,
  initFilters,
  removeEventListenersObservations,
  renderObservations,
} from "../SubviewGrid/shared_utils";
import type { iNatObservationsAPI } from "../../types/inat_api";

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

    let data = (this as DataComponentType).data as iNatObservationsAPI;
    this.render(data, window.app.store);

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

  render(data: iNatObservationsAPI, appStore: AppStoreType) {
    loggerRender("++ SubviewObservationsTable render");
    renderObservations(data, appStore);
    initFilters(appStore);
  }
}

customElements.define("subview-observations-table", SubviewObservationsTable);
