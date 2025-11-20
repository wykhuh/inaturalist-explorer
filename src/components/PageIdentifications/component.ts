import { setupComponent } from "../../lib/component_utils";
import { loggerRender } from "../../lib/logger";
import { template } from "./template";

export class PageIdentifications extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ PageIdentifications connectedCallback");

    setupComponent(template, this);
  }
}

customElements.define("x-page-identifications", PageIdentifications);
