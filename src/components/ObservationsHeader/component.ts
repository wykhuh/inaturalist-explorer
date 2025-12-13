import { setupComponent } from "../../lib/component_utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import { updateCountsHeader } from "./utils";
import { template } from "./template";
import { viewChangeHandler } from "./shared_utils";

class ObservationHeader extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ ObservationHeader connectedCallback");

    this.render();

    window.addEventListener("navResourceChange", this);
    window.addEventListener("storePopulated", this);
    window.addEventListener("observationsChange", this);
    this.querySelectorAll("nav li").forEach((el) => {
      el.addEventListener("click", this);
    });
  }

  disconnectedCallback() {
    loggerRender("++ ObservationHeader disconnectedCallback");

    window.removeEventListener("navResourceChange", this);
    window.removeEventListener("storePopulated", this);
    window.removeEventListener("observationsChange", this);
    this.querySelectorAll("nav li").forEach((el) => {
      el.addEventListener("click", this);
    });
  }

  handleEvent(event: Event) {
    let target = event.target as HTMLElement;
    if (!target) return;

    // update header counts
    let updateCountsEvents = [
      "observationsChange",
      "storePopulated",
      "navResourceChange",
    ];
    if (updateCountsEvents.includes(event.type)) {
      // app uses two <identifications-header>;
      // only execute for instance that has updatecounts="true"
      if (this.dataset.updatecounts === "true") {
        loggerEvent(`++ ObservationHeader ${event.type}`);
        updateCountsHeader(window.app.store);
      }
    }

    // highlight current view in header
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
    loggerRender("++ ObservationHeader render");

    setupComponent(template, this);
  }
}

customElements.define("observations-header", ObservationHeader);
