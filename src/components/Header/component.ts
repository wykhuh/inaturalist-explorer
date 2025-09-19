import { loggerStore } from "../../lib/logger";
import { setupComponent } from "../../lib/component_utils";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    loggerStore("++ Header render");

    setupComponent("/src/components/Header/template.html", this);
  }
}

customElements.define("x-header", MyComponent);
