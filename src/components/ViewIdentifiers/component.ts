import { fetchAndRenderData, paginationcCallback, perPage } from "./utils";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
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

    let currentPage = 1;
    fetchAndRenderData(currentPage, perPage, paginationcCallback);

    window.addEventListener("appUrlChange", () => {
      fetchAndRenderData(currentPage, perPage, paginationcCallback);
    });
  }
}

customElements.define("x-view-identifiers", MyComponent);
