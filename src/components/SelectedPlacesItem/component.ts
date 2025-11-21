import { setupComponent } from "../../lib/component_utils.ts";
import { loggerRender } from "../../lib/logger.ts";
import { removePlace } from "../../lib/search_places.ts";
import { pluralize } from "../../lib/utils.ts";
import type { NormalizediNatPlace } from "../../types/app";
import { template } from "./template";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  async render() {
    if (!this.dataset.place) return;
    loggerRender("++ SelectedPlacesItem render");

    setupComponent(template, this);

    let place = JSON.parse(this.dataset.place) as NormalizediNatPlace;

    let titleEl = this.querySelector(".title");
    if (titleEl && place.name) {
      titleEl.textContent = place.name;
    }

    let countEl = this.querySelector(".count");
    if (countEl) {
      countEl.textContent = pluralize(
        place.observations_count,
        "observation",
        true,
      );
    }

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

customElements.define("places-list-item", MyComponent);
