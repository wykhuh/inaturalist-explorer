import { removePlace } from "../../lib/search_places.ts";
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

    const parser = new DOMParser();
    const resp = await fetch(
      "/src/components/SelectedPlacesItem/template.html",
    );
    const html = await resp.text();

    const template = parser
      .parseFromString(html, "text/html")
      .querySelector("template");

    if (!template) return;
    this.appendChild(template.content.cloneNode(true));

    let place = JSON.parse(this.dataset.place) as NormalizediNatPlace;

    let titleEl = this.querySelector(".title");
    if (titleEl && place.name) {
      titleEl.textContent = place.name;
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
