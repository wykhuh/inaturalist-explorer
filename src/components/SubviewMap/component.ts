import { mapTemplate } from "./template";
import { loggerEvent, loggerRender } from "../../lib/logger";
import { setupComponent } from "../../lib/component_utils";
import type { AppStoreType } from "../../types/app";
import { createMap } from "./utils";
import { initRenderMap } from "../../lib/init_app";
import { fetchAndCacheData } from "../ViewObservations/utils";
import { removeMap } from "../../lib/map_utils";

class SubviewObservationsMap extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ SubviewObservationsMap connectedCallback");
    setupComponent(mapTemplate, this);

    this.render(window.app.store);

    window.addEventListener("observationsChange", this);
    window.addEventListener("localeChanged", this);
    window.addEventListener("perPageChanged", this);
  }

  disconnectedCallback() {
    loggerRender("++ SubviewObservationsMap disconnectedCallback");
    removeMap(window.app.store);

    window.removeEventListener("observationsChange", this);
    window.removeEventListener("localeChanged", this);
    window.removeEventListener("perPageChanged", this);
  }

  handleEvent(event: Event) {
    loggerEvent(`[SubviewObservationsMap event] ${event.type}`);

    let resourceChanges = [
      "observationsChange",
      "localeChanged",
      "perPageChanged",
    ];
    if (resourceChanges.includes(event.type)) {
      fetchAndCacheData(window.app.store, false);
    }
  }

  render(appStore: AppStoreType) {
    loggerRender("++ SubviewObservationsMap render");
    let dataContainer = this.querySelector("#subview-data-container");
    if (!dataContainer) return;

    dataContainer.innerHTML = "";

    dataContainer.appendChild(createMap());
    initRenderMap(appStore);
  }
}

customElements.define("subview-observations-map", SubviewObservationsMap);
