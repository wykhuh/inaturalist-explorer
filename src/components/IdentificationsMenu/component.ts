import { setupComponent } from "../../lib/component_utils";
import { loggerRender } from "../../lib/logger";
import { template } from "./template";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ IdentificationsMenu connectedCallback");

    setupComponent(template, this);
  }
}

customElements.define("x-identifications-menu", MyComponent);
