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

    window.addEventListener("popstateAfter", this);
    window.addEventListener("navResourceChange", this);
    window.addEventListener("storePopulated", this);
    window.addEventListener("observationsChange", this);
    this.querySelectorAll("nav li").forEach((el) => {
      el.addEventListener("click", this);
    });
  }

  disconnectedCallback() {
    loggerRender("++ ObservationHeader disconnectedCallback");

    window.removeEventListener("popstateAfter", this);
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
    loggerEvent(`[ObservationHeader event] ${event.type}`);

    // update header counts
    // wait for storePopulated event to fetch counts so api request will have
    // correct params
    let updateCountsEvents = [
      "observationsChange",
      "storePopulated",
      "navResourceChange",
      "popstateAfter",
    ];
    if (updateCountsEvents.includes(event.type)) {
      // only update couns for component instance that has updatecounts="true"
      if (this.dataset.updatecounts === "true") {
        updateCountsHeader(window.app.store);
      }
    }

    // highlight current view in header
    let viewEvents = ["storePopulated", "navResourceChange", "popstateAfter"];
    if (viewEvents.includes(event.type)) {
      let itemEl = this.querySelector(`#${window.app.store.currentView}`);
      if (itemEl) {
        itemEl?.classList.add("currentView");
      }
    }

    // change view
    if (event.type === "click") {
      viewChangeHandler(target, window.app.store, this);
      loggerEvent("[ObservationsHeader dispatchEvent] viewChange");
      window.dispatchEvent(new Event("viewChange"));
    }
  }

  async render() {
    loggerRender("++ ObservationHeader render");

    setupComponent(template, this);
  }
}

customElements.define("observations-header", ObservationHeader);
