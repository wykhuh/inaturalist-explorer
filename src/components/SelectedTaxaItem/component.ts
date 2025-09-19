import { setupComponent } from "../../lib/component_utils.ts";
import { removeTaxon } from "../../lib/search_taxa.ts";
import { pluralize } from "../../lib/utils.ts";
import type { NormalizediNatTaxon } from "../../types/app";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  async render() {
    if (!this.dataset.taxon) return;

    await setupComponent(
      "/src/components/SelectedTaxaItem/template.html",
      this,
    );

    let taxon = JSON.parse(this.dataset.taxon) as NormalizediNatTaxon;

    let swatchEl = this.querySelector(".swatch") as HTMLElement;
    if (swatchEl) {
      swatchEl.style.backgroundColor = taxon.color || "";
    }

    let titleEl = this.querySelector(".title");
    if (titleEl && taxon.title) {
      titleEl.textContent = taxon.title;
    }

    let subtitleEl = this.querySelector(".subtitle");
    if (subtitleEl && taxon.subtitle) {
      subtitleEl.textContent = taxon.subtitle;
    }

    let countEl = this.querySelector(".count");
    if (countEl) {
      countEl.textContent = pluralize(
        taxon.observations_count,
        "observation",
        true,
      );
    }

    let butttonEl = this.querySelector(".close-button") as HTMLButtonElement;
    // hide close button for allTaxaRecord
    if (taxon.id === 0) {
      butttonEl.hidden = true;
    }

    // don't add event listener for allTaxaRecord with id = 0
    if (butttonEl && taxon.id !== 0) {
      butttonEl.addEventListener("click", async function () {
        if (taxon.id) {
          await removeTaxon(taxon.id, window.app.store);
        }
      });
    }
  }
}

customElements.define("x-species-list-item", MyComponent);
