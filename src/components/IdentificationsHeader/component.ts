import { setupComponent } from "../../lib/component_utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import { updateCountsHeader } from "./utils";
import { template } from "./template";
import { viewChangeHandler } from "../ObservationsHeader/shared_utils";

class IdentificationsHeader extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ IdentificationsHeader connectedCallback");

    this.render();

    window.addEventListener("navResourceChange", this);
    window.addEventListener("storePopulated", this);
    window.addEventListener("identificationsChange", this);
    this.querySelectorAll("nav li").forEach((el) => {
      el.addEventListener("click", this);
    });
  }

  disconnectedCallback() {
    loggerRender("++ IdentificationsHeader disconnectedCallback");

    window.removeEventListener("navResourceChange", this);
    window.removeEventListener("storePopulated", this);
    window.removeEventListener("identificationsChange", this);
    this.querySelectorAll("nav li").forEach((el) => {
      el.addEventListener("click", this);
    });
  }

  handleEvent(event: Event) {
    let target = event.target as HTMLElement;
    if (!target) return;
    loggerEvent(`[IdentificationHeader event] ${event.type}`);

    // update header counts
    let updateCountsEvents = [
      "identificationsChange",
      "storePopulated",
      "navResourceChange",
    ];
    if (updateCountsEvents.includes(event.type)) {
      // only update counts for component instance that has updatecounts="true"
      if (this.dataset.updatecounts === "true") {
        updateCountsHeader(window.app.store);
      }
    }

    let viewEvents = ["storePopulated", "navResourceChange"];
    if (viewEvents.includes(event.type)) {
      let itemEl = this.querySelector(`#${window.app.store.currentView}`);
      if (itemEl) {
        itemEl?.classList.add("currentView");
      }
    }

    // change view
    if (event.type === "click") {
      viewChangeHandler(target, window.app.store, this);
    }
  }

  async render() {
    loggerRender("++ IdentificationHeader render");

    setupComponent(template, this);
  }
}

customElements.define("identifications-header", IdentificationsHeader);
