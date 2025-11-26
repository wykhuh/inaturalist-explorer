import { setupComponent } from "../../lib/component_utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import { updateObservationsCounts, viewChangeHandler } from "./utils";
import { template } from "./template";

class ObservationHeader extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ ObservationHeader connectedCallback");

    this.render();

    window.addEventListener("navResourceChange", this);
    window.addEventListener("storePopulated", this);
    window.addEventListener("observationsChange", this);
  }

  disconnectedCallback() {
    loggerRender("++ ObservationHeader disconnectedCallback");

    window.removeEventListener("navResourceChange", this);
    window.removeEventListener("storePopulated", this);
    window.removeEventListener("observationsChange", this);
  }

  handleEvent(event: Event) {
    let countEvents = [
      "observationsChange",
      "storePopulated",
      "navResourceChange",
    ];
    if (countEvents.includes(event.type)) {
      // app uses two <identifications-header>;
      // only execute for instance that has updatecounts="true"
      if (this.dataset.updatecounts === "true") {
        loggerEvent(`++ ObservationHeader ${event.type}`);
        updateObservationsCounts(window.app.store);
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
    loggerRender("++ ObservationHeader render");

    setupComponent(template, this);

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

customElements.define("observations-header", ObservationHeader);
