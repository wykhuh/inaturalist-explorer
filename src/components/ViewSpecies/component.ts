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
    await setupComponent("/src/components/ViewSpecies/template.html", this);

    fetchAndRenderData(perPage, paginationcCallback);

    window.addEventListener("appUrlChange", () => {
      fetchAndRenderData(perPage, paginationcCallback);
    });
  }
}

customElements.define("x-view-species", MyComponent);
