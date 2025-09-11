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

    viewChangeHandler("#observations-header #observations", "map");
    viewChangeHandler("#observations-header #species", "species");
    viewChangeHandler("#observations-header #identifiers", "identifiers");
    viewChangeHandler("#observations-header #observers", "observers");

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
