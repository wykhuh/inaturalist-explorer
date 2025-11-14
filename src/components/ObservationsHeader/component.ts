import { setupComponent } from "../../lib/component_utils";
import { loggerStore } from "../../lib/logger";
import { updateObservationsCounts, viewChangeHandler } from "./utils";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerStore("++ ObservationHeader render");
    this.render();

    // app uses two <x-observations-header>;
    // only execute updateObservationsCounts() for instance that has updatecounts="true"
    window.addEventListener("observationsChange", () => {
      loggerStore("++ ObservationHeader observationsChange");
      if (this.dataset.updatecounts === "true") {
        updateObservationsCounts(window.app.store);
      }
    });
  }

  async render() {
    await setupComponent(
      "/src/components/ObservationsHeader/template.html",
      this,
    );

    // execute updateObservationsCounts() only after both headers are loaded
    let headerEls = document.querySelectorAll("#observations-header");
    console.log("ObservationsHeader render", headerEls.length);

    if (headerEls.length === 2) {
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
