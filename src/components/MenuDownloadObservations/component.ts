import { setupComponent } from "../../lib/component_utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import { template } from "./template";
import { downloadAnnotationsHandler } from "./utils";

class DownloadObservationsMenu extends HTMLElement {
  constructor() {
    super();
  }

  downloadAnnotationsFormEl: HTMLFormElement | null = null;

  connectedCallback() {
    loggerRender("++ DownloadObservationsMenu connectedCallback");
    setupComponent(template, this);

    this.downloadAnnotationsFormEl = this.querySelector(
      "#download-annotations",
    );

    this.render();

    this.downloadAnnotationsFormEl?.addEventListener("submit", this);
  }

  disconnectedCallback() {
    loggerRender("++ DownloadObservationsMenu disconnectCallback");

    this.downloadAnnotationsFormEl?.removeEventListener("submit", this);
  }

  handleEvent(event: Event) {
    let target = event.target as HTMLInputElement;
    if (target === null) return;
    if (!this.downloadAnnotationsFormEl) return;
    loggerEvent(`[DownloadObservationsMenu event] ${event.type}`);

    event.preventDefault();

    if (event.type === "submit") {
      if (target.id === "download-annotations") {
        let formData = new FormData(this.downloadAnnotationsFormEl);

        downloadAnnotationsHandler(formData, window.app.store, this);
      }
    }
  }

  async render() {
    loggerRender("++ DownloadObservationsMenu render");
  }
}

customElements.define("download-observations-menu", DownloadObservationsMenu);
