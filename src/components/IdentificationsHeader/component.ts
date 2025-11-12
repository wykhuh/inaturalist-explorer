import { setupComponent } from "../../lib/component_utils";
import { loggerStore } from "../../lib/logger";
import { updateCounts, viewChangeHandler } from "./utils";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerStore("++ ObservationHeader render");
    this.render();

    // app uses two <x-identifications-header>;
    // only execute updateCounts() for instance that has updatecounts="true"
    window.addEventListener("identificationsChange", () => {
      loggerStore("++ ObservationHeader identificationsChange");
      if (this.dataset.updatecounts === "true") {
        updateCounts(window.app.store);
      }
    });
  }

  async render() {
    await setupComponent(
      "/src/components/IdentificationsHeader/template.html",
      this,
    );

    // execute updateCounts() only after both headers are loaded
    let headerEls = document.querySelectorAll("#identifications-header");
    if (headerEls.length === 2) {
      updateCounts(window.app.store);
    }

    let itemEl = this.querySelector(`#${window.app.store.currentView}`);
    itemEl?.classList.add("currentView");

    let store = window.app.store;
    viewChangeHandler(
      "#identifications-header #observations",
      "observations",
      store,
      this,
    );
    viewChangeHandler(
      "#identifications-header #species",
      "species",
      store,
      this,
    );
    viewChangeHandler(
      "#identifications-header #identifiers",
      "identifiers",
      store,
      this,
    );
    viewChangeHandler(
      "#identifications-header #observers",
      "observers",
      store,
      this,
    );
    viewChangeHandler(
      "#identifications-header #identifications",
      "identifications",
      store,
      this,
    );
  }
}

customElements.define("x-identifications-header", MyComponent);
