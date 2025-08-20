import { removeTaxon } from "../../lib/data_utils.ts";
import type { NormalizediNatTaxon } from "../../types/app.d.ts";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  async render() {
    if (!this.dataset.taxon) return;

    const parser = new DOMParser();
    const resp = await fetch("/src/components/TaxaListItem/template.html");
    const html = await resp.text();

    const template = parser
      .parseFromString(html, "text/html")
      .querySelector("template");

    if (!template) return;
    this.appendChild(template.content.cloneNode(true));

    let taxon = JSON.parse(this.dataset.taxon) as NormalizediNatTaxon;

    let swatchEl = this.querySelector(".swatch") as HTMLElement;
    if (swatchEl) {
      swatchEl.style.backgroundColor = taxon.color || "";
    }

    let nameEl = this.querySelector(".taxon-name");
    if (nameEl) {
      nameEl.textContent = taxon.preferred_common_name || taxon.name || "";
    }

    let butttonEl = this.querySelector(".close-button");
    if (butttonEl) {
      butttonEl.addEventListener("click", function () {
        if (taxon.id) {
          removeTaxon(taxon.id, window.app.store);
        }
      });
    }
  }

  connectedCallback() {
    this.render();
  }
}

customElements.define("x-taxa-list-item", MyComponent);
