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
  showHideWithoutTaxaHeader,
  showHideWithoutTaxaIdentifiedHeader,
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

    // NOTE: update when adding selectedResource; showHide header
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
    window.addEventListener(
      "selectedWithoutTaxaChange",
      showHideWithoutTaxaHeader,
    );
    window.addEventListener(
      "selectedWithoutTaxaIdentifiedChange",
      showHideWithoutTaxaIdentifiedHeader,
    );
  }

  disconnectedCallback() {
    // NOTE: update when adding selectedResource; showHide header
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
    window.removeEventListener(
      "selectedWithoutTaxaChange",
      showHideWithoutTaxaHeader,
    );
    window.removeEventListener(
      "selectedWithoutTaxaIdentifiedChange",
      showHideWithoutTaxaIdentifiedHeader,
    );
  }

  render(appStore: AppStoreType) {
    multisearchSetup(appStore);
    // NOTE: update when adding selectedResource; showHide header
    showHideTaxaIdentifiedHeader();
    showHidePlacesHeader();
    showHideProjectsHeader();
    showHideUsersHeader();
    showHideUsersIdentifiersHeader();
    showHideWithoutTaxaHeader();
    showHideWithoutTaxaIdentifiedHeader();
    renderSelectedResources(appStore, false);
  }
}

customElements.define("identifications-menu", IdentificationsMenu);
