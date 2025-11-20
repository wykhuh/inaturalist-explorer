import { setupComponent } from "../../lib/component_utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import { fetchAndRenderData, paginationcCallback, perPage } from "./utils";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ ViewObservers connectedCallback");

    this.render();

    window.addEventListener("observationsChange", this);
    window.addEventListener("identificationsChange", this);
  }

  disconnectedCallback() {
    loggerRender("++ ViewObservers disconnectedCallback");

    window.addEventListener("observationsChange", this);
    window.addEventListener("identificationsChange", this);
  }

  handleEvent(event: Event) {
    let resourceChanges = ["observationsChange", "identificationsChange"];
    if (resourceChanges.includes(event.type)) {
      loggerEvent(`++ ViewObservers ${event.type}`);
      fetchAndRenderData(perPage, paginationcCallback, window.app.store);
    }
  }

  async render() {
    loggerRender("++ ViewObservers render");
    await setupComponent("/src/components/ViewObservers/template.html", this);

    await fetchAndRenderData(perPage, paginationcCallback, window.app.store);
  }
}

customElements.define("x-view-observers", MyComponent);
