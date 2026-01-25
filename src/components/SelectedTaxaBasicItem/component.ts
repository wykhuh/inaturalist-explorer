import { setupComponent } from "../../lib/component_utils.ts";
import { isObservationsCheck } from "../../lib/data_utils.ts";
import { loggerRender } from "../../lib/logger.ts";
import { renderTaxonNames } from "../../lib/render_utils";
import { removeTaxon } from "../../lib/search_taxa.ts";
// BUG: if data_utils is imported before render_utils, there is import error
// with defaultColorScheme
import { removeTaxonIdentified } from "../../lib/search_taxa_identified.ts";
import { removeWithoutTaxon } from "../../lib/search_without_taxa.ts";
import { removeWithoutTaxonIdentified } from "../../lib/search_without_taxa_identified.ts";
import { pluralize } from "../../lib/utils.ts";
import type { AppStoreType, NormalizediNatTaxonType } from "../../types/app";
import { template } from "./template";

class SelectedTaxaBasicItem extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render(window.app.store);
  }

  async render(appStore: AppStoreType) {
    if (!this.dataset.taxon) return;
    let taxonType = this.dataset.type;
    if (!taxonType) return;
    loggerRender(`++ SelectedTaxaItem ${taxonType} render`);

    setupComponent(template, this);

    let taxon = JSON.parse(this.dataset.taxon) as NormalizediNatTaxonType;

    let dataEl = this.querySelector(".data");
    if (dataEl) {
      let content = renderTaxonNames(taxon, appStore);
      if (["taxonIdentified", "taxon"].includes(taxonType)) {
        if (isObservationsCheck(appStore)) {
          content += `<span class="count">${pluralize(taxon.observations_count, "observation", true)}</span>`;
        } else {
          content += `<span class="count">${pluralize(taxon.identifications_count, "identification", true)}</span>`;
        }
      }
      dataEl.innerHTML = content;
    }

    let butttonEl = this.querySelector(".close-button") as HTMLButtonElement;
    // hide close button for allTaxaRecord
    if (taxon.id === 0) {
      butttonEl.hidden = true;
    }

    // don't add event listener for allTaxaRecord with id = 0
    if (butttonEl && taxon.id !== 0) {
      butttonEl.addEventListener("click", async function () {
        // NOTE: update when adding selectedResource; remove taxon
        if (taxonType === "taxonIdentified") {
          await removeTaxonIdentified(taxon.id, window.app.store);
        } else if (taxonType === "taxon") {
          await removeTaxon(taxon.id, window.app.store);
        } else if (taxonType === "withoutTaxon") {
          await removeWithoutTaxon(taxon.id, window.app.store);
        } else if (taxonType === "withoutTaxonIdentified") {
          await removeWithoutTaxonIdentified(taxon.id, window.app.store);
        }
      });
    }
  }
}

customElements.define("species-basic-list-item", SelectedTaxaBasicItem);
