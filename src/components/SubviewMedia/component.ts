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

    let data = (this as DataComponentType).data as iNatObservationsAPI;
    this.render(data, window.app.store);

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

  render(data: iNatObservationsAPI, appStore: AppStoreType) {
    loggerEvent(`++ [SubviewObservationsMedia render]`);

    renderObservations(data, appStore);
    initFilters(appStore);
  }
}

customElements.define("subview-observations-media", SubviewObservationsMedia);
