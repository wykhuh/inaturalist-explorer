import { loggerStore } from "../../lib/logger";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerStore("++ ObservationsMenu render");

    // use inline template instead of fetch template since we need to initialize
    // autocomplete search on page load
    const template = document.getElementById(
      "observations-menu-template",
    ) as HTMLTemplateElement;
    if (template) {
      const content = template.content.cloneNode(true);
      this.appendChild(content);
    }
  }
}

customElements.define("x-observations-menu", MyComponent);
