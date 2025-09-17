import { setupComponent } from "../../lib/component_utils";
import { fetchAndRenderData, paginationcCallback, perPage } from "./utils";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  async render() {
    await setupComponent("/src/components/ViewIdentifiers/template.html", this);

    fetchAndRenderData(perPage, paginationcCallback, window.app.store);

    window.addEventListener("appUrlChange", () => {
      fetchAndRenderData(perPage, paginationcCallback, window.app.store);
    });
  }
}

customElements.define("x-view-identifiers", MyComponent);
