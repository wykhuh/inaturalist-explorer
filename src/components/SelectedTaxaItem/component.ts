import { setupComponent } from "../../lib/component_utils.ts";
import { loggerRender } from "../../lib/logger.ts";
import { renderTaxonNames } from "../../lib/render_utils";
import { removeTaxon } from "../../lib/search_taxa.ts";
import { pluralize } from "../../lib/utils.ts";
import type { MapStore, NormalizediNatTaxon } from "../../types/app";
import { template } from "./template";

class SelectedTaxaItem extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render(window.app.store);
  }

  async render(appStore: MapStore) {
    if (!this.dataset.taxon) return;
    loggerRender("++ SelectedTaxaItem render");

    setupComponent(template, this);

    let taxon = JSON.parse(this.dataset.taxon) as NormalizediNatTaxon;

    let swatchEl = this.querySelector(".swatch") as HTMLElement;
    if (swatchEl) {
      swatchEl.style.backgroundColor = taxon.color || "";
    }

    let detailsEl = this.querySelector(".details");
    if (detailsEl) {
      let content = renderTaxonNames(taxon, appStore);
      content += `<span class="observations-count">${pluralize(taxon.observations_count, "observation", true)}</span>`;

      detailsEl.innerHTML = content;
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

customElements.define("species-list-item", SelectedTaxaItem);
