import { setupComponent } from "../../lib/component_utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import { fetchAndRenderData, paginationcCallback, perPage } from "./utils";
import { template } from "./template";

class ViewObservers extends HTMLElement {
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

    window.removeEventListener("observationsChange", this);
    window.removeEventListener("identificationsChange", this);
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
    setupComponent(template, this);

    await fetchAndRenderData(perPage, paginationcCallback, window.app.store);
  }
}

customElements.define("view-observers", ViewObservers);
