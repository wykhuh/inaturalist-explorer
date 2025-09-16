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

    window.addEventListener("appUrlChange", () => {
      updateCounts();
    });
    // storePopulated
    window.addEventListener("storePopulated", () => {
      loggerStore("++ ObservationHeader storePopulated");
      updateCounts();
    });
  }

  async render() {
    await setupComponent(
      "/src/components/ObservationsHeader/template.html",
      this,
    );

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
