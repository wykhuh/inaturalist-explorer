import { setupComponent } from "../../lib/component_utils";
import { loggerRender } from "../../lib/logger";
import { template } from "./template";

export class Page404 extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ Page404 connectedCallback");

    setupComponent(template, this);
  }
}

customElements.define("page-404", Page404);
