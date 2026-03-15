import { setupComponent } from "../../lib/component_utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import { template } from "./template";
import { downloadIdentificationsHandler } from "./utils";

class DownloadIdentificationsMenu extends HTMLElement {
  constructor() {
    super();
  }

  downloadIdentificationsFormEl: HTMLFormElement | null = null;

  connectedCallback() {
    loggerRender("++ DownloadIdentificationsMenu connectedCallback");
    setupComponent(template, this);

    this.downloadIdentificationsFormEl = this.querySelector(
      "#download-identifications",
    );

    this.render();

    this.downloadIdentificationsFormEl?.addEventListener("submit", this);
  }

  disconnectedCallback() {
    loggerRender("++ DownloadIdentificationsMenu disconnectCallback");

    this.downloadIdentificationsFormEl?.removeEventListener("submit", this);
  }

  handleEvent(event: Event) {
    let target = event.target as HTMLInputElement;
    if (target === null) return;
    if (!this.downloadIdentificationsFormEl) return;
    loggerEvent(`[DownloadIdentificationsMenu event] ${event.type}`);

    event.preventDefault();

    if (event.type === "submit") {
      if (target.id === "download-identifications") {
        let formData = new FormData(this.downloadIdentificationsFormEl);

        downloadIdentificationsHandler(formData, window.app.store, this);
      }
    }
  }

  async render() {
    loggerRender("++ DownloadIdentificationsMenu render");
  }
}

customElements.define(
  "download-identifications-menu",
  DownloadIdentificationsMenu,
);
