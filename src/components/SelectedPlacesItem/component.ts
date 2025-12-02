import { setupComponent } from "../../lib/component_utils.ts";
import { loggerRender } from "../../lib/logger.ts";
import { removePlace } from "../../lib/search_places.ts";
import { renderSelectedCounts } from "../../lib/selected_items_utils.ts";
import type { MapStore, NormalizediNatPlace } from "../../types/app";
import { template } from "./template";

class SelectedPlacesItem extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render(window.app.store);
  }

  async render(appStore: MapStore) {
    if (!this.dataset.place) return;
    loggerRender("++ SelectedPlacesItem render");

    setupComponent(template, this);

    let place = JSON.parse(this.dataset.place) as NormalizediNatPlace;

    let titleEl = this.querySelector(".title");
    if (titleEl && place.name) {
      titleEl.textContent = place.name;
    }

    renderSelectedCounts(place, appStore, this);

    let butttonEl = this.querySelector(".close-button");
    if (butttonEl) {
      butttonEl.addEventListener("click", async function () {
        if (place.id !== undefined) {
          await removePlace(place.id, window.app.store);
        }
      });
    }
  }
}

customElements.define("places-list-item", SelectedPlacesItem);
