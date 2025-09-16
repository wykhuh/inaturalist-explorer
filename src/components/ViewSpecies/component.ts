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

    let currentPage = 1;
    fetchAndRenderData(currentPage, perPage, paginationcCallback);

    window.addEventListener("appUrlChange", () => {
      fetchAndRenderData(currentPage, perPage, paginationcCallback);
    });
  }
}

customElements.define("x-view-species", MyComponent);
