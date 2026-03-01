import { setupComponent } from "../../lib/component_utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import { template } from "./template";
import { pageChangeHandler } from "./utils";

// Header component is loaded before window.app.store is set
class Header extends HTMLElement {
  constructor() {
    super();
  }

  appStore = window.app.store;
  navToggleEl: null | HTMLButtonElement = null;
  navMenuEl: null | HTMLDivElement = null;

  connectedCallback() {
    loggerRender("++ Header connectedCallback");

    setupComponent(template, this);

    this.querySelectorAll("a.navlink").forEach((a) => {
      a.addEventListener("click", this);
    });

    this.navToggleEl = this.querySelector('[data-toggle="collapse"]');
    if (this.navToggleEl) {
      this.navToggleEl.addEventListener("click", this);
    }
    this.navMenuEl = this.querySelector(".navbar-collapse");
  }

  disconnectedCallback() {
    loggerRender("++ Header disconnectedCallback");

    this.querySelectorAll("a.navlink").forEach((a) => {
      a.removeEventListener("click", this);
    });
    this.navToggleEl?.removeEventListener("click", this);
  }

  handleEvent(event: CustomEvent) {
    loggerEvent(`[Header event] ${event.type}`);
    let target = event.target as HTMLDivElement;
    if (!target) return;
    if (!this.navMenuEl) return;

    if (event.type === "click") {
      event.preventDefault();

      if (target.closest("button")?.className === "navbar-toggler") {
        this.navMenuEl.classList.toggle("show");
      } else if (target.className === "navlink") {
        pageChangeHandler(event, this.appStore, window.app.router);
      }
    }
  }
}

customElements.define("site-header", Header);
