import { loggerRender } from "../lib/logger";

export class PageIdentifications extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ PageIdentifications render");

    const template = document.getElementById(
      "page-identifications-template",
    ) as HTMLTemplateElement;
    if (template) {
      const content = template.content.cloneNode(true);
      this.appendChild(content);
    }
  }
}

customElements.define("x-page-identifications", PageIdentifications);
