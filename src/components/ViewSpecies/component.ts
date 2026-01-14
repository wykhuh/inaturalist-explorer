import { setupComponent } from "../../lib/component_utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import { fetchAndRenderData, paginationCallback } from "./utils";
import { template } from "./template";

class ViewSpecies extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ ViewSpecies connectedCallback");

    this.render();

    window.addEventListener("observationsChange", this);
    window.addEventListener("identificationsChange", this);
    window.addEventListener("localeChanged", this);
    window.addEventListener("nameOrderChanged", this);
    window.addEventListener("perPageChanged", this);
  }

  disconnectedCallback() {
    loggerRender("++ ViewSpecies disconnectedCallback");

    window.removeEventListener("observationsChange", this);
    window.removeEventListener("identificationsChange", this);
    window.removeEventListener("localeChanged", this);
    window.removeEventListener("nameOrderChanged", this);
    window.removeEventListener("perPageChanged", this);
  }

  handleEvent(event: Event) {
    loggerEvent(`[ViewSpecies event] ${event.type}`);

    let resourceChanges = [
      "observationsChange",
      "identificationsChange",
      "localeChanged",
      "nameOrderChanged",
      "perPageChanged",
    ];
    if (resourceChanges.includes(event.type)) {
      fetchAndRenderData(paginationCallback, window.app.store);
    }
  }

  async render() {
    loggerRender("++ ViewSpecies render");
    setupComponent(template, this);

    await fetchAndRenderData(paginationCallback, window.app.store);
  }
}

customElements.define("view-species", ViewSpecies);
