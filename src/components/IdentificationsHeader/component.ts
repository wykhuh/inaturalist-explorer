import { setupComponent } from "../../lib/component_utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import { updateIdentificationsCounts, viewChangeHandler } from "./utils";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ IdentificationsHeader connectedCallback");

    this.render();

    window.addEventListener("identificationsChange", this);
  }

  disconnectedCallback() {
    loggerRender("++ IdentificationsHeader disconnectedCallback");

    window.removeEventListener("identificationsChange", this);
  }

  handleEvent(event: Event) {
    if (event.type === "identificationsChange") {
      // app uses two <x-identifications-header>;
      // only execute for instance that has updatecounts="true"
      if (this.dataset.updatecounts === "true") {
        loggerEvent("++ IdentificationHeader identificationsChange");
        updateIdentificationsCounts(window.app.store);
      }
    }
  }

  async render() {
    loggerRender("++ IdentificationHeader render");

    await setupComponent(
      "/src/components/IdentificationsHeader/template.html",
      this,
    );

    // execute updateIdentificationsCounts() only after both headers are loaded
    let headerEls = document.querySelectorAll("#identifications-header");

    if (headerEls.length === 2) {
      loggerRender(
        "++ IdentificationsHeader update header counts",
        headerEls.length,
      );
      updateIdentificationsCounts(window.app.store);
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
