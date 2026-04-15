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
  }

  disconnectedCallback() {
    loggerRender("++ SubviewObservationsMap disconnectedCallback");
    removeMap(window.app.store);
  }

  handleEvent(event: Event) {
    loggerEvent(`[SubviewObservationsMap event] ${event.type}`);
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
