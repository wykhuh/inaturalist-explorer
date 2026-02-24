import { html } from "../../lib/component_utils";

export class Accordion extends HTMLElement {
  constructor() {
    super();
  }

  content = "";
  title = "";
  id = "";

  connectedCallback() {
    this.content =
      this.getAttribute("data-content") || "Accordion content not defined";
    this.title =
      this.getAttribute("data-title") || "Accordion title not defined";
    this.id = this.getAttribute("data-id") || "Accordion id not defined";

    this.render();
  }

  render() {
    let template = html`
      <details class="acc-item" id="${this.id}">
        <summary>${this.title}</summary>
        ${this.content}
      </details>
    `;

    this.innerHTML = template;
  }
}

customElements.define("app-accordion", Accordion);
