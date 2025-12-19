import { setupComponent } from "../../lib/component_utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import { fetchAndRenderData, paginationCallback, perPage } from "./utils";
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
  }

  disconnectedCallback() {
    loggerRender("++ ViewIdentifications disconnectedCallback");

    window.removeEventListener("identificationsChange", this);
    window.removeEventListener("localeChanged", this);
    window.removeEventListener("nameOrderChanged", this);
  }

  handleEvent(event: CustomEvent) {
    let resourceChanges = [
      "identificationsChange",
      "localeChanged",
      "nameOrderChanged",
    ];
    if (resourceChanges.includes(event.type)) {
      loggerEvent(`++ ViewIdentifications ${event.type}`);
      fetchAndRenderData(perPage, paginationCallback, window.app.store);
    }
  }

  async render() {
    loggerRender("++ ViewIdentifications render");
    setupComponent(template, this);

    await fetchAndRenderData(perPage, paginationCallback, window.app.store);
  }
}

customElements.define("view-identifications", ViewIdentifications);
