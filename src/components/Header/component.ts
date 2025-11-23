import { setupComponent } from "../../lib/component_utils";
import { viewAndTemplateObject } from "../../lib/data_utils";
import { loggerRender } from "../../lib/logger";
import { updateAppUrl } from "../../lib/utils";
import type { RecordTypes } from "../../types/app";
import { template } from "./template";

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
      this.clickHandler(event);
    }
  }

  clickHandler(event: CustomEvent) {
    let target = event.target as HTMLInputElement;
    if (!target) return;

    let recordType = target.dataset.recordType as RecordTypes;
    const path = target.getAttribute("href");

    // NOTE: record_type must be set before rendering the UI
    this.appStore.record_type = recordType;

    // change url and load new page
    if (path) {
      window.app.router.go(path, location.search);
    }

    // load view
    let viewContainerEl = document.querySelector("#view-container");
    if (viewContainerEl && this.appStore.currentView) {
      let templateName = viewAndTemplateObject(this.appStore.currentView);
      let view = document.createElement(templateName);
      viewContainerEl.appendChild(view);
    }

    // if user goes from /identifications?view=identifications to
    // home page, we need to change currentView since identifications view
    // does not exist on home page
    if (path === "/" && this.appStore.currentView === "identifications") {
      this.appStore.currentView = "observations";
      updateAppUrl(window.location, this.appStore);

      let itemEl = document.querySelector(`#observations-nav #observations`);
      if (itemEl) {
        itemEl.classList.add("currentView");
      }
    }

    // emit event
    if (recordType === "identifications" || recordType === "observations") {
      window.dispatchEvent(
        new CustomEvent("navResourceChange", {
          detail: { recordType, currentView: this.appStore.currentView },
        }),
      );
    }
  }
}

customElements.define("site-header", Header);
