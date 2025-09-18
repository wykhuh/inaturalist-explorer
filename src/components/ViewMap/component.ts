import "leaflet/dist/leaflet.css";
import "../../assets/leaflet.css";
import "../../assets/autocomplete.css";

import {
  fetchAndRenderData,
  initFilters,
  paginationcCallback,
  perPage,
  updateSubviewState,
  updateOrderState,
} from "./utils";
import { loggerStore } from "../../lib/logger";
import { initRenderMap } from "../../lib/init_app";
import { renderTaxaList } from "../../lib/search_taxa";
import { setupComponent } from "../../lib/component_utils";
import type { MapStore } from "../../types/app";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerStore("++ ViewMap render");
    this.render();
  }

  disconnectedCallback() {
    if (window.app.store.map.map) {
      // save map bounds before switching views so app can return to this map location
      window.app.store.map.bounds = window.app.store.map.map.getBounds();

      // remove map and event listeners
      window.app.store.map.map.remove();
      window.app.store.map.map = null;
    }

    if (window.app.store.map.layerControl) {
      window.app.store.map.layerControl.remove();
      window.app.store.map.layerControl = null;
    }

    window.app.store.map;
  }

  async render() {
    await setupComponent("/src/components/ViewMap/template.html", this);

    // create new map
    await initRenderMap(window.app.store);
    renderTaxaList(window.app.store);

    // use store to set values the form on page load
    initFilters(window.app.store);

    // load observation data for grid/table
    fetchAndRenderData(perPage, paginationcCallback, window.app.store);

    window.addEventListener("observationsChange", () => {
      fetchAndRenderData(perPage, paginationcCallback, window.app.store);
    });

    this.subviewHandler(window.app.store);
    this.orderFormHandler();
  }

  subviewHandler(appStore: MapStore) {
    let tableLinkEl = document.querySelector(".subview-table") as HTMLElement;
    let gridLinkEl = document.querySelector(".subview-grid") as HTMLElement;

    // set initial current-subview class in html
    let subview = appStore.viewMetadata.observations?.subview;
    if (subview === "table") {
      tableLinkEl.classList.add("current-subview");
    } else {
      gridLinkEl.classList.add("current-subview");
    }

    // change subview when clicked
    if (tableLinkEl && gridLinkEl) {
      tableLinkEl.addEventListener("click", (event) => {
        updateSubviewState(event, tableLinkEl, gridLinkEl, appStore);
      });
      gridLinkEl.addEventListener("click", (event) => {
        updateSubviewState(event, tableLinkEl, gridLinkEl, appStore);
      });
    }
  }

  orderFormHandler() {
    const form = this.querySelector("#order-form") as HTMLFormElement;

    if (form) {
      form.addEventListener("change", async (event) => {
        if (event.target === null) return;

        const data = new FormData(form);
        updateOrderState(data, window.app.store);
      });
    }
  }
}

customElements.define("x-view-map", MyComponent);
