import { setupComponent } from "../../lib/component_utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import { updateObservationsCounts, viewChangeHandler } from "./utils";
import { template } from "./template";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ ObservationHeader connectedCallback");

    this.render();

    window.addEventListener("observationsChange", this);
  }

  disconnectedCallback() {
    loggerRender("++ ObservationHeader disconnectedCallback");

    window.removeEventListener("observationsChange", this);
  }

  handleEvent(event: Event) {
    if (event.type === "observationsChange") {
      // app uses two <x-identifications-header>;
      // only execute for instance that has updatecounts="true"
      if (this.dataset.updatecounts === "true") {
        loggerEvent("++ ObservationHeader observationsChange");
        updateObservationsCounts(window.app.store);
      }
    }
  }

  async render() {
    loggerRender("++ ObservationHeader render");

    setupComponent(template, this);

    // execute updateObservationsCounts() only after both headers are loaded
    let headerEls = document.querySelectorAll("#observations-header");

    if (headerEls.length === 2) {
      loggerRender(
        "++ ObservationsHeader update header counts",
        headerEls.length,
      );
      updateObservationsCounts(window.app.store);
    }

    let itemEl = this.querySelector(`#${window.app.store.currentView}`);
    itemEl?.classList.add("currentView");

    let store = window.app.store;
    viewChangeHandler(
      "#observations-header #observations",
      "observations",
      store,
      this,
    );
    viewChangeHandler("#observations-header #species", "species", store, this);
    viewChangeHandler(
      "#observations-header #identifiers",
      "identifiers",
      store,
      this,
    );
    viewChangeHandler(
      "#observations-header #observers",
      "observers",
      store,
      this,
    );
  }
}

customElements.define("x-observations-header", MyComponent);
