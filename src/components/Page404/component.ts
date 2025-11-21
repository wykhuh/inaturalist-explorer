import { setupComponent } from "../../lib/component_utils";
import { loggerRender } from "../../lib/logger";
import { template } from "./template";

export class PageAbout extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ Page404 connectedCallback");

    setupComponent(template, this);
  }
}

customElements.define("x-page-404", PageAbout);
