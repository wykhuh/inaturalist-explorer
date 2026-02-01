import type { AppStoreType } from "../../types/app";
import { setupComponent } from "../../lib/component_utils";
import { template } from "./template";
import { loggerEvent, loggerRender } from "../../lib/logger";
import {
  formatInatExploreParams,
  formatInatExportParams,
  formatInatIdentifyParams,
} from "../../lib/cleanup_params_utils";

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
    let exportLink = this.querySelector<HTMLLinkElement>(".export-link");
    let exploreLink = this.querySelector<HTMLLinkElement>(".explore-link");
    let identifyLink = this.querySelector<HTMLLinkElement>(".identify-link");
    if (!exportLink) return;
    if (!exploreLink) return;
    if (!identifyLink) return;

    let downloadParams = formatInatExportParams(appStore);
    exportLink.href = `https://www.inaturalist.org/observations/export?${downloadParams}`;

    let exploreParams = formatInatExploreParams(appStore);
    exploreLink.href = `https://www.inaturalist.org/observations?${exploreParams}`;

    let identifyParams = formatInatIdentifyParams(appStore);
    identifyLink.href = `https://www.inaturalist.org/observations/identify?${identifyParams}`;
  }
}

customElements.define("links-menu", LinksMenu);
