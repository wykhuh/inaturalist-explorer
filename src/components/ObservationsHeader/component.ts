import { updateCounts, viewChangeHandler } from "./utils";

class MyComponent extends HTMLElement {
  constructor() {
    super();
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

    let store = window.app.store;
    viewChangeHandler("#observations-header #observations", "map", store);
    viewChangeHandler("#observations-header #species", "species", store);
    viewChangeHandler(
      "#observations-header #identifiers",
      "identifiers",
      store,
    );
    viewChangeHandler("#observations-header #observers", "observers", store);

    window.addEventListener("appUrlChange", () => {
      updateCounts();
    });
    window.addEventListener("appInitialized", () => {
      updateCounts();
    });
  }

  connectedCallback() {
    this.render();
  }
}

customElements.define("x-observations-header", MyComponent);
