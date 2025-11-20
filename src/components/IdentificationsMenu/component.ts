import { setupComponent } from "../../lib/component_utils";
import { loggerRender } from "../../lib/logger";
import {
  multisearchSetup,
  renderSelectedResources,
  showHidePlacesHeader,
  showHideProjectsHeader,
  showHideUsersHeader,
} from "../../lib/search_utils";
import type { MapStore } from "../../types/app";
import { template } from "./template";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ IdentificationsMenu connectedCallback");

    setupComponent(template, this);

    this.render(window.app.store);

    window.addEventListener("selectedPlacesChange", showHidePlacesHeader);
    window.addEventListener("selectedProjectsChange", showHideProjectsHeader);
    window.addEventListener("selectedUsersChange", showHideUsersHeader);
  }

  disconnectedCallback() {
    window.removeEventListener("selectedPlacesChange", showHidePlacesHeader);
    window.removeEventListener(
      "selectedProjectsChange",
      showHideProjectsHeader,
    );
    window.removeEventListener("selectedUsersChange", showHideUsersHeader);
  }

  render(appStore: MapStore) {
    multisearchSetup(appStore);
    showHidePlacesHeader();
    showHideProjectsHeader();
    showHideUsersHeader();
    renderSelectedResources(appStore, false);
  }
}

customElements.define("x-identifications-menu", MyComponent);
