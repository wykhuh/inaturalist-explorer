import { setupComponent } from "../../lib/component_utils";
import { loggerStore } from "../../lib/logger";
import { fetchAndRenderData, paginationcCallback, perPage } from "./utils";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerStore("++ ViewIdentifiers render");

    this.render();
  }

  async render() {
    await setupComponent("/src/components/ViewIdentifiers/template.html", this);

    await fetchAndRenderData(perPage, paginationcCallback, window.app.store);

    window.addEventListener("observationsChange", async () => {
      await fetchAndRenderData(perPage, paginationcCallback, window.app.store);
    });
  }
}

customElements.define("x-view-identifiers", MyComponent);
