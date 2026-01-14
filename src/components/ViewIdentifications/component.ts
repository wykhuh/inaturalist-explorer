import { setupComponent } from "../../lib/component_utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import { fetchAndRenderData, paginationCallback } from "./utils";
import { template } from "./template";

class ViewIdentifications extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ ViewIdentifications connectedCallback");

    this.render();

    window.addEventListener("identificationsChange", this);
    window.addEventListener("localeChanged", this);
    window.addEventListener("nameOrderChanged", this);
    window.addEventListener("perPageChanged", this);
  }

  disconnectedCallback() {
    loggerRender("++ ViewIdentifications disconnectedCallback");

    window.removeEventListener("identificationsChange", this);
    window.removeEventListener("localeChanged", this);
    window.removeEventListener("nameOrderChanged", this);
    window.removeEventListener("perPageChanged", this);
  }

  handleEvent(event: CustomEvent) {
    loggerEvent(`[ViewIdentifications event] ${event.type}`);

    let resourceChanges = [
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
    loggerRender("++ ViewIdentifications render");
    setupComponent(template, this);

    await fetchAndRenderData(paginationCallback, window.app.store);
  }
}

customElements.define("view-identifications", ViewIdentifications);
