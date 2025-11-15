import { loggerStore } from "../lib/logger";

export class PageAbout extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerStore("++ PageAbout render");

    const template = document.getElementById(
      "page-about-template",
    ) as HTMLTemplateElement;
    if (template) {
      const content = template.content.cloneNode(true);
      this.appendChild(content);
    }
  }
}

customElements.define("x-page-about", PageAbout);
