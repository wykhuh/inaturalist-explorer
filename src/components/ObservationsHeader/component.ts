import { logger } from "../../lib/logger";
import { updateCounts, viewChangeHandler } from "./utils";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    logger("++ ObservationHeader render");
    this.render();

    window.addEventListener("appUrlChange", () => {
      // updateCounts();
    });
    window.addEventListener("storeDataLoaded", () => {
      logger("++ ObservationHeader storeDataLoaded");
      updateCounts();
    });
  }

  async render() {
    const parser = new DOMParser();
    let resp;
    try {
      resp = await fetch("/src/components/ObservationsHeader/template.html");
    } catch (error) {
      console.error("ObservationsHeader ERROR:", error);
    }

    if (!resp) return;

    const html = await resp.text();

    const template = parser
      .parseFromString(html, "text/html")
      .querySelector("template");

    if (!template) return;

    this.appendChild(template.content.cloneNode(true));

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
