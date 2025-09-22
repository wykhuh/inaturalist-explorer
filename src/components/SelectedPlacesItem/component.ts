import { setupComponent } from "../../lib/component_utils.ts";
import { removePlace } from "../../lib/search_places.ts";
import { pluralize } from "../../lib/utils.ts";
import type { NormalizediNatPlace } from "../../types/app";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  async render() {
    if (!this.dataset.place) return;

    await setupComponent(
      "/src/components/SelectedPlacesItem/template.html",
      this,
    );

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

customElements.define("x-places-list-item", MyComponent);
