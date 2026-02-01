import type { AppStoreType } from "../../types/app";
import { setupComponent } from "../../lib/component_utils";
import { template } from "./template";
import { formatInatDownloadUrl } from "../../lib/utils";
import { loggerEvent, loggerRender } from "../../lib/logger";

class DownloadMenu extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ DownloadMenu connectedCallback");

    setupComponent(template, this);
    this.renderLink(window.app.store);

    window.addEventListener("observationsChange", this);
  }

  disconnectedCallback() {
    loggerRender("++ DownloadMenu disconnectedCallback");

    window.removeEventListener("observationsChange", this);
  }

  handleEvent(event: Event) {
    let target = event.target as HTMLElement;
    if (!target) return;
    loggerEvent(`[DownloadMenu Event] ${target.id}`);

    if (event.type === "observationsChange") {
      this.renderLink(window.app.store);
    }
  }

  async renderLink(appStore: AppStoreType) {
    let link = this.querySelector<HTMLLinkElement>(".export-link");
    if (!link) return;

    let params = formatInatDownloadUrl(appStore);
    link.href = `https://www.inaturalist.org/observations/export?${params}`;
  }
}

customElements.define("download-menu", DownloadMenu);
