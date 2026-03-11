import type { AppStoreType } from "../../types/app";
import { setupComponent } from "../../lib/component_utils";
import { template } from "./template";
import { loggerEvent, loggerRender } from "../../lib/logger";
import {
  cleanupIdentificationParams,
  cleanupObervationsParams,
  formatInatExploreParams,
  formatInatExportParams,
  formatInatIdentifyParams,
} from "../../lib/cleanup_params_utils";
import {
  isIdentificationsCheck,
  isObservationsCheck,
} from "../../lib/data_utils";
import {
  formatIdentificationsApiUrl,
  formatObservationsApiUrl,
} from "../../lib/inat_api";

class LinksMenu extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ LinksMenu connectedCallback");

    setupComponent(template, this);
    this.renderLinks(window.app.store);

    window.addEventListener("observationsChange", this);
    window.addEventListener("viewChange", this);
    window.addEventListener("subviewChange", this);
  }

  disconnectedCallback() {
    loggerRender("++ LinksMenu disconnectedCallback");

    window.removeEventListener("observationsChange", this);
    window.removeEventListener("viewChange", this);
    window.removeEventListener("subviewChange", this);
  }

  handleEvent(event: Event) {
    let target = event.target as HTMLElement;
    if (!target) return;
    loggerEvent(`[LinksMenu Event] ${target.id}`);

    if (
      ["viewChange", "observationsChange", "subviewChange"].includes(event.type)
    ) {
      this.renderLinks(window.app.store);
    }
  }

  async renderLinks(appStore: AppStoreType) {
    let listEl = this.querySelector("#external-links");
    if (!listEl) return;

    let liEl = document.createElement("li");
    let params = cleanupIdentificationParams(appStore, "identifications");
    liEl.innerHTML = `<a href="${formatIdentificationsApiUrl(params)}">Identifications API</a> - iNaturalist identifications API`;
    listEl.appendChild(liEl);
  }
}

customElements.define("links-identifications-menu", LinksMenu);
