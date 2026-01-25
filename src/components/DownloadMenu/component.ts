import type { AppStoreType } from "../../types/app";
import { setupComponent } from "../../lib/component_utils";
import { template } from "./template";
import { formatInatDownloadUrl } from "../../lib/utils";

class DownloadMenu extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    setupComponent(template, this);

    window.addEventListener("storePopulated", this);
    window.addEventListener("observationsChange", this);
  }

  disconnectedCallback() {
    window.removeEventListener("storePopulated", this);
    window.removeEventListener("observationsChange", this);
  }

  handleEvent(event: Event) {
    let target = event.target as HTMLElement;
    if (!target) return;

    if (
      event.type === "storePopulated" ||
      event.type === "observationsChange"
    ) {
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
