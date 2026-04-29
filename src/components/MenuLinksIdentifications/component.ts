import type { AppStoreType } from "../../types/app";
import { setupComponent } from "../../lib/component_utils";
import { template } from "./template";
import { loggerEvent, loggerRender } from "../../lib/logger";
import {
  formatInatApiParams,
  formatInatIdentificationsParams,
} from "../../lib/cleanup_params_utils";
import { formatIdentificationsApiUrl } from "../../lib/inat_api";

class LinksMenu extends HTMLElement {
  constructor() {
    super();
  }

  copyToClipboardEl: null | HTMLElement = null;

  connectedCallback() {
    loggerRender("++ LinksMenu connectedCallback");

    setupComponent(template, this);

    this.copyToClipboardEl = this.querySelector("copy-to-clipboard");

    this.render(window.app.store);

    window.addEventListener("identificationsChange", this);
    window.addEventListener("viewChange", this);
    window.addEventListener("subviewChange", this);
  }

  disconnectedCallback() {
    loggerRender("++ LinksMenu disconnectedCallback");

    window.removeEventListener("identificationsChange", this);
    window.removeEventListener("viewChange", this);
    window.removeEventListener("subviewChange", this);
  }

  handleEvent(event: Event) {
    let target = event.target as HTMLElement;
    if (!target) return;
    loggerEvent(`[LinksMenu Event] ${target.id}`);

    if (
      ["viewChange", "identificationsChange", "subviewChange"].includes(
        event.type,
      )
    ) {
      this.render(window.app.store);
    }
  }

  async render(appStore: AppStoreType) {
    let identLink = this.querySelector<HTMLLinkElement>(
      ".identifications-link",
    );
    if (!identLink) return;

    let identParams = formatInatIdentificationsParams(appStore);
    identLink.href = `https://www.inaturalist.org/identifications/?${identParams}`;

    if (this.copyToClipboardEl) {
      let params = formatInatApiParams(appStore);
      this.copyToClipboardEl.setAttribute(
        "content",
        formatIdentificationsApiUrl(params),
      );
    }
  }
}

customElements.define("links-identifications-menu", LinksMenu);
