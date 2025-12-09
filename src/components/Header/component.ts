import { setupComponent } from "../../lib/component_utils";
import { loggerRender } from "../../lib/logger";
import { template } from "./template";
import { pageChangeHandler } from "./utils";

// Header component is loaded before window.app.store is set
class Header extends HTMLElement {
  constructor() {
    super();
  }

  appStore = window.app.store;

  connectedCallback() {
    loggerRender("++ Header connectedCallback");

    setupComponent(template, this);

    this.querySelectorAll("a.navlink").forEach((a) => {
      a.addEventListener("click", this);
    });
  }

  disconnectedCallback() {
    loggerRender("++ Header disconnectedCallback");

    this.querySelectorAll("a.navlink").forEach((a) => {
      a.removeEventListener("click", this);
    });
  }

  handleEvent(event: CustomEvent) {
    loggerRender(`++ Header ${event.type}`);

    if (event.type === "click") {
      event.preventDefault();
      pageChangeHandler(event, this.appStore, window.app.router);
    }
  }
}

customElements.define("site-header", Header);
