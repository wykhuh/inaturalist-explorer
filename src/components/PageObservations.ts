import { loggerRender } from "../lib/logger";

export class PageObservations extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ PageObservations render");

    const template = document.getElementById(
      "page-observations-template",
    ) as HTMLTemplateElement;
    if (template) {
      const content = template.content.cloneNode(true);
      this.appendChild(content);
    }
  }
}

customElements.define("x-page-observations", PageObservations);
