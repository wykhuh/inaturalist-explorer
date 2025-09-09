// import { createPagination } from "../../lib/pagination";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  async render() {
    const parser = new DOMParser();
    const resp = await fetch("/src/components/ViewIdentifiers/template.html");
    const html = await resp.text();

    const template = parser
      .parseFromString(html, "text/html")
      .querySelector("template");

    if (!template) return;
    this.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    this.render();
  }
}

customElements.define("x-view-identifiers", MyComponent);
