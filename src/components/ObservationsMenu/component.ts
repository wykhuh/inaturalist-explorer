import { setupComponent } from "../../lib/component_utils";
import { loggerRender } from "../../lib/logger";
import {
  multisearchSetup,
  renderSelectedResources,
  showHidePlacesHeader,
  showHideProjectsHeader,
  showHideUsersHeader,
  showHideUsersIdentifiersHeader,
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

    window.addEventListener("selectedPlacesChange", showHidePlacesHeader);
    window.addEventListener("selectedProjectsChange", showHideProjectsHeader);
    window.addEventListener("selectedUsersChange", showHideUsersHeader);
    window.addEventListener(
      "selectedUsersIdentifiersChange",
      showHideUsersIdentifiersHeader,
    );
  }

  disconnectedCallback() {
    window.removeEventListener("selectedPlacesChange", showHidePlacesHeader);
    window.removeEventListener(
      "selectedProjectsChange",
      showHideProjectsHeader,
    );
    window.removeEventListener("selectedUsersChange", showHideUsersHeader);
    window.removeEventListener(
      "selectedUsersIdentifiersChange",
      showHideUsersIdentifiersHeader,
    );
  }

  render(appStore: AppStoreType) {
    multisearchSetup(appStore);
    showHidePlacesHeader();
    showHideProjectsHeader();
    showHideUsersHeader();
    showHideUsersIdentifiersHeader();
    renderSelectedResources(appStore, false);
  }
}

customElements.define("observations-menu", ObservationsMenu);
