import { setupComponent } from "../../lib/component_utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import { fetchAndRenderData, paginationcCallback, perPage } from "./utils";
import { template } from "./template";

class MyComponent extends HTMLElement {
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
  }

  disconnectedCallback() {
    loggerRender("++ ViewSpecies disconnectedCallback");

    window.removeEventListener("observationsChange", this);
    window.removeEventListener("identificationsChange", this);
    window.removeEventListener("localeChanged", this);
    window.removeEventListener("nameOrderChanged", this);
  }

  handleEvent(event: Event) {
    let resourceChanges = [
      "observationsChange",
      "identificationsChange",
      "localeChanged",
      "nameOrderChanged",
    ];
    if (resourceChanges.includes(event.type)) {
      loggerEvent(`++ ViewSpecies ${event.type}`);
      fetchAndRenderData(perPage, paginationcCallback, window.app.store);
    }
  }

  async render() {
    loggerRender("++ ViewSpecies render");
    setupComponent(template, this);

    await fetchAndRenderData(perPage, paginationcCallback, window.app.store);
  }
}

customElements.define("view-species", MyComponent);
