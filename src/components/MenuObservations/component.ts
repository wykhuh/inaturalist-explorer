import { event_headerHandlerObservations } from "../../data/app_data";
import { setupComponent } from "../../lib/component_utils";
import { loggerRender } from "../../lib/logger";
import {
  multisearchSetup,
  renderSelectedResources,
} from "../../lib/search_utils";
import type { AppStoreType } from "../../types/app";
import { template } from "./template";

class ObservationsMenu extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ ObservationsMenu connectedCallback");

    setupComponent(template, this);

    this.render(window.app.store);

    for (let [event, handler] of Object.entries(
      event_headerHandlerObservations,
    )) {
      window.addEventListener(event, handler);
    }
  }

  disconnectedCallback() {
    loggerRender("++ ObservationsMenu disconnectedCallback");

    for (let [event, handler] of Object.entries(
      event_headerHandlerObservations,
    )) {
      window.removeEventListener(event, handler);
    }
  }

  render(appStore: AppStoreType) {
    multisearchSetup(appStore);

    Object.values(event_headerHandlerObservations).forEach((handler) =>
      handler(),
    );

    renderSelectedResources(appStore, false);
  }
}

customElements.define("observations-menu", ObservationsMenu);
