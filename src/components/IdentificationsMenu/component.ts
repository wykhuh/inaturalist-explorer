import { event_headerHandlerIdentifications } from "../../data/app_data";
import { setupComponent } from "../../lib/component_utils";
import { loggerRender } from "../../lib/logger";
import {
  multisearchSetup,
  renderSelectedResources,
} from "../../lib/search_utils";
import type { AppStoreType } from "../../types/app";
import { template } from "./template";

class IdentificationsMenu extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ IdentificationsMenu connectedCallback");

    setupComponent(template, this);

    this.render(window.app.store);

    for (let [event, handler] of Object.entries(
      event_headerHandlerIdentifications,
    )) {
      window.addEventListener(event, handler);
    }
  }

  disconnectedCallback() {
    loggerRender("++ IdentificationsMenu disconnectedCallback");

    for (let [event, handler] of Object.entries(
      event_headerHandlerIdentifications,
    )) {
      window.removeEventListener(event, handler);
    }
  }

  render(appStore: AppStoreType) {
    multisearchSetup(appStore);

    Object.values(event_headerHandlerIdentifications).forEach((handler) =>
      handler(),
    );

    renderSelectedResources(appStore, false);
  }
}

customElements.define("identifications-menu", IdentificationsMenu);
