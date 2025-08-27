import { removePlace } from "../../lib/data_utils.ts";
import type { NormalizediNatPlace } from "../../types/app";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  async render() {
    if (!this.dataset.place) return;

    const parser = new DOMParser();
    const resp = await fetch("/src/components/PlacesListItem/template.html");
    const html = await resp.text();

    const template = parser
      .parseFromString(html, "text/html")
      .querySelector("template");

    if (!template) return;
    this.appendChild(template.content.cloneNode(true));

    let place = JSON.parse(this.dataset.place) as NormalizediNatPlace;

    let titleEl = this.querySelector(".title");
    if (titleEl) {
      titleEl.textContent = place.name;
    }

    let butttonEl = this.querySelector(".close-button");
    if (butttonEl) {
      butttonEl.addEventListener("click", function () {
        console.log("click", place);
        console.log("click2", window.app.store.selectedPlaces);

        if (place.id !== undefined) {
          removePlace(window.app.store);
        }
      });
    }
  }

  connectedCallback() {
    this.render();
  }
}

customElements.define("x-places-list-item", MyComponent);
