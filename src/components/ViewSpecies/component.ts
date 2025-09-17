import { setupComponent } from "../../lib/component_utils";
import { loggerStore } from "../../lib/logger";
import { fetchAndRenderData, paginationcCallback, perPage } from "./utils";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerStore("++ ViewSpecies render");

    this.render();
  }

  async render() {
    await setupComponent("/src/components/ViewSpecies/template.html", this);

    fetchAndRenderData(perPage, paginationcCallback, window.app.store);

    window.addEventListener("observationsChange", () => {
      fetchAndRenderData(perPage, paginationcCallback, window.app.store);
    });
  }
}

customElements.define("x-view-species", MyComponent);
