import { iNatPlacesUrl } from "../../data/inat_data.ts";
import { setupComponent } from "../../lib/component_utils.ts";
import { loggerRender } from "../../lib/logger.ts";
import { removePlace } from "../../lib/search_places.ts";
import { removeWithoutPlace } from "../../lib/search_without_places.ts";
import { renderSelectedCounts } from "../../lib/selected_items_utils.ts";
import type {
  AppStoreType,
  DataComponentType,
  NormalizediNatPlaceType,
} from "../../types/app";
import { template } from "./template";

class SelectedPlacesItem extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ SelectedPlacesItem connectedCallback");

    setupComponent(template, this);

    this.render(window.app.store);
  }

  async render(appStore: AppStoreType) {
    let place = (this as DataComponentType).data as NormalizediNatPlaceType;
    let type = (this as DataComponentType).type;
    if (!place) return;
    if (!type) return;

    loggerRender("++ SelectedPlacesItem render");

    let titleEl = this.querySelector(".title");

    if (titleEl && place.name) {
      if (place.id === 0) {
        titleEl.textContent = place.name;
      } else {
        let linkEl = document.createElement("a");
        linkEl.href = `${iNatPlacesUrl}/${place.slug}`;
        linkEl.textContent = place.name;
        titleEl.append(linkEl);
      }
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
