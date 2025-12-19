import { setupComponent } from "../../lib/component_utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import { fetchAndRenderData, paginationCallback, perPage } from "./utils";
import { template } from "./template";

class ViewIdentifiers extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ ViewIdentifiers connectedCallback");

    this.render();

    window.addEventListener("observationsChange", this);
    window.addEventListener("identificationsChange", this);
  }

  disconnectedCallback() {
    loggerRender("++ ViewIdentifiers disconnectedCallback");

    window.removeEventListener("observationsChange", this);
    window.removeEventListener("identificationsChange", this);
  }

  handleEvent(event: Event) {
    let resourceChanges = ["observationsChange", "identificationsChange"];
    if (resourceChanges.includes(event.type)) {
      loggerEvent(`++ ViewIdentifiers ${event.type}`);
      fetchAndRenderData(perPage, paginationCallback, window.app.store);
    }
  }

  async render() {
    loggerRender("++ ViewIdentifiers render");
    setupComponent(template, this);

    await fetchAndRenderData(perPage, paginationCallback, window.app.store);
  }
}

customElements.define("view-identifiers", ViewIdentifiers);
