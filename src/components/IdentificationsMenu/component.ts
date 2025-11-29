import { setupComponent } from "../../lib/component_utils";
import { loggerRender } from "../../lib/logger";
import {
  multisearchSetup,
  renderSelectedResources,
  showHidePlacesHeader,
  showHideProjectsHeader,
  showHideTaxaHeader,
  showHideTaxaIdentifiedHeader,
  showHideUsersHeader,
  showHideUsersIdentifiersHeader,
} from "../../lib/search_utils";
import type { MapStore } from "../../types/app";
import { template } from "./template";

class IdentificationsMenu extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ IdentificationsMenu connectedCallback");

    setupComponent(template, this);

    this.render(window.app.store);

    window.addEventListener("selectedTaxaChange", showHideTaxaHeader);
    window.addEventListener(
      "selectedTaxaIdentifiedChange",
      showHideTaxaIdentifiedHeader,
    );
    window.addEventListener("selectedPlacesChange", showHidePlacesHeader);
    window.addEventListener("selectedProjectsChange", showHideProjectsHeader);
    window.addEventListener("selectedUsersChange", showHideUsersHeader);
    window.addEventListener(
      "selectedUsersIdentifiersChange",
      showHideUsersIdentifiersHeader,
    );
  }

  disconnectedCallback() {
    window.addEventListener("selectedTaxaChange", showHideTaxaHeader);
    window.addEventListener(
      "selectedTaxaIdentifiedChange",
      showHideTaxaIdentifiedHeader,
    );
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

  render(appStore: MapStore) {
    multisearchSetup(appStore);
    showHideTaxaIdentifiedHeader();
    showHidePlacesHeader();
    showHideProjectsHeader();
    showHideUsersHeader();
    showHideUsersIdentifiersHeader();
    renderSelectedResources(appStore, false);
  }
}

customElements.define("identifications-menu", IdentificationsMenu);
