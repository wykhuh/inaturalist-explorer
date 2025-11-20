import { setupComponent } from "../../lib/component_utils";
import { loggerRender } from "../../lib/logger";
import { template } from "./template";

export class PageObservations extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ PageObservations render");

    setupComponent(template, this);
  }
}

customElements.define("x-page-observations", PageObservations);
