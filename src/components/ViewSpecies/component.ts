import { setupComponent } from "../../lib/component_utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import { fetchAndRenderData, paginationcCallback, perPage } from "./utils";

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

    window.addEventListener("observationsChange", this);
    window.addEventListener("identificationsChange", this);
    window.addEventListener("localeChanged", this);
    window.addEventListener("nameOrderChanged", this);
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
    await setupComponent("/src/components/ViewSpecies/template.html", this);

    await fetchAndRenderData(perPage, paginationcCallback, window.app.store);
  }
}

customElements.define("x-view-species", MyComponent);
