import { setupComponent } from "../../lib/component_utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import { updateIdentificationsCounts, viewChangeHandler } from "./utils";
import { template } from "./template";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ IdentificationsHeader connectedCallback");

    this.render();

    window.addEventListener("navResourceChange", this);
    window.addEventListener("storePopulated", this);
    window.addEventListener("identificationsChange", this);
  }

  disconnectedCallback() {
    loggerRender("++ IdentificationsHeader disconnectedCallback");

    window.removeEventListener("navResourceChange", this);
    window.removeEventListener("storePopulated", this);
    window.removeEventListener("identificationsChange", this);
  }

  handleEvent(event: Event) {
    let countEvents = [
      "identificationsChange",
      "storePopulated",
      "navResourceChange",
    ];
    if (countEvents.includes(event.type)) {
      // app uses two <x-identifications-header>;
      // only execute for instance that has updatecounts="true"
      if (this.dataset.updatecounts === "true") {
        loggerEvent(`++ IdentificationHeader ${event.type}`);
        updateIdentificationsCounts(window.app.store);
      }
    }

    let viewEvents = ["storePopulated", "navResourceChange"];
    if (viewEvents.includes(event.type)) {
      let itemEl = this.querySelector(`#${window.app.store.currentView}`);
      if (itemEl) {
        itemEl?.classList.add("currentView");
      }
    }
  }

  async render() {
    loggerRender("++ IdentificationHeader render");

    setupComponent(template, this);

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
