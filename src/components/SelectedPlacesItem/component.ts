import { setupComponent } from "../../lib/component_utils.ts";
import { loggerRender } from "../../lib/logger.ts";
import { removePlace } from "../../lib/search_places.ts";
import { removeWithoutPlace } from "../../lib/search_without_places.ts";
import { renderSelectedCounts } from "../../lib/selected_items_utils.ts";
import type { AppStoreType, NormalizediNatPlaceType } from "../../types/app";
import { template } from "./template";

class SelectedPlacesItem extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render(window.app.store);
  }

  async render(appStore: AppStoreType) {
    if (!this.dataset.place) return;
    if (!this.dataset.type) return;
    let type = this.dataset.type;

    loggerRender("++ SelectedPlacesItem render");

    setupComponent(template, this);

    let place = JSON.parse(this.dataset.place) as NormalizediNatPlaceType;

    let titleEl = this.querySelector(".title");
    if (titleEl && place.name) {
      titleEl.textContent = place.name;
    }

    if (type === "place") {
      renderSelectedCounts(place, appStore, this);
    }

    let butttonEl = this.querySelector(".close-button");
    if (butttonEl) {
      butttonEl.addEventListener("click", async function () {
        if (type === "place") {
          await removePlace(place.id, window.app.store);
        } else if (type === "withoutPlace") {
          await removeWithoutPlace(place.id, window.app.store);
        }
      });
    }
  }
}

customElements.define("places-list-item", SelectedPlacesItem);
