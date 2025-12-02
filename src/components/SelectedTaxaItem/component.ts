import { setupComponent } from "../../lib/component_utils.ts";
import { loggerRender } from "../../lib/logger.ts";
import { renderTaxonNames } from "../../lib/render_utils";
// BUG: if data_utils is imported before render_utils, there is import error
// with defaultColorScheme
import { isObservationsCheck } from "../../lib/data_utils.ts";
import { removeTaxon } from "../../lib/search_taxa.ts";
import { removeTaxonIdentified } from "../../lib/search_taxa_identified.ts";
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
    let taxonType = this.dataset.taxon_type;
    if (!taxonType) return;

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
      if (isObservationsCheck(appStore)) {
        content += `<span class="count">${pluralize(taxon.observations_count, "observation", true)}</span>`;
      } else {
        content += `<span class="count">${pluralize(taxon.identifications_count, "identification", true)}</span>`;
      }
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
        if (taxonType == "identified") {
          await removeTaxonIdentified(taxon.id, window.app.store);
        } else {
          await removeTaxon(taxon.id, window.app.store);
        }
      });
    }
  }
}

customElements.define("species-list-item", SelectedTaxaItem);
