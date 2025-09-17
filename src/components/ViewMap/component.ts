import "leaflet/dist/leaflet.css";
import "../../assets/leaflet.css";
import "../../assets/autocomplete.css";

import {
  fetchAndRenderData,
  paginationcCallback,
  perPage,
  toggleSubview,
} from "./utils";
import { loggerStore } from "../../lib/logger";
import { initRenderMap } from "../../lib/init_app";
import { renderTaxaList } from "../../lib/search_taxa";
import { setupComponent } from "../../lib/component_utils";

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

    // load observation data for grid/table
    fetchAndRenderData(perPage, paginationcCallback, window.app.store);

    window.addEventListener("appUrlChangexxx", () => {
      fetchAndRenderData(perPage, paginationcCallback, window.app.store);
    });

    this.subviewHandler();
  }

  subviewHandler() {
    let tableLinkEl = this.querySelector(".subview-table") as HTMLElement;
    let gridLinkEl = this.querySelector(".subview-grid") as HTMLElement;

    // set current-subview
    let subview = window.app.store.currentObservationsSubview;
    if (subview === "table") {
      tableLinkEl.classList.add("current-subview");
    } else {
      gridLinkEl.classList.add("current-subview");
    }

    // change subview when clicked
    if (tableLinkEl && gridLinkEl) {
      tableLinkEl.addEventListener("click", (event) => {
        toggleSubview(event, tableLinkEl, gridLinkEl, window.app.store);
      });
      gridLinkEl.addEventListener("click", (event) => {
        toggleSubview(event, tableLinkEl, gridLinkEl, window.app.store);
      });
    }
  }
}

customElements.define("x-view-map", MyComponent);
