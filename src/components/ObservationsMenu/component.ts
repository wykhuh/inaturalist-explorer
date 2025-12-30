import { setupComponent } from "../../lib/component_utils";
import { loggerRender } from "../../lib/logger";
import {
  multisearchSetup,
  renderSelectedResources,
  showHidePlacesHeader,
  showHideProjectsHeader,
  showHideUsersAnnotatorsHeader,
  showHideUsersHeader,
  showHideUsersIdentifiersHeader,
  showHideWithoutTaxaHeader,
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

    // NOTE: update when adding selectedResource; showHide header
    window.addEventListener("selectedPlacesChange", showHidePlacesHeader);
    window.addEventListener("selectedProjectsChange", showHideProjectsHeader);
    window.addEventListener("selectedUsersChange", showHideUsersHeader);
    window.addEventListener(
      "selectedUsersIdentifiersChange",
      showHideUsersIdentifiersHeader,
    );
    window.addEventListener(
      "selectedUsersAnnotatorsChange",
      showHideUsersAnnotatorsHeader,
    );
    window.addEventListener(
      "selectedWithoutTaxaChange",
      showHideWithoutTaxaHeader,
    );
  }

  disconnectedCallback() {
    // NOTE: update when adding selectedResource; showHide header
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
    window.removeEventListener(
      "selectedUsersAnnotatorsChange",
      showHideUsersAnnotatorsHeader,
    );
    window.addEventListener(
      "selectedWithoutTaxaChange",
      showHideWithoutTaxaHeader,
    );
  }

  render(appStore: AppStoreType) {
    // NOTE: update when adding selectedResource; showHide header
    multisearchSetup(appStore);
    showHidePlacesHeader();
    showHideProjectsHeader();
    showHideUsersHeader();
    showHideUsersIdentifiersHeader();
    showHideUsersAnnotatorsHeader();
    showHideWithoutTaxaHeader();

    renderSelectedResources(appStore, false);
  }
}

customElements.define("observations-menu", ObservationsMenu);
