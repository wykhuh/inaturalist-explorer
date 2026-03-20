import { setupComponent } from "../../lib/component_utils.ts";
import { loggerRender } from "../../lib/logger.ts";
import { renderTaxonNames } from "../../lib/render_utils";
// BUG: if data_utils is imported before render_utils, there is import error
// with defaultColorScheme
import { isObservationsCheck } from "../../lib/data_utils.ts";
import { removeTaxon } from "../../lib/search_taxa.ts";
import { pluralize } from "../../lib/utils.ts";
import type {
  AppStoreType,
  DataComponentType,
  NormalizediNatTaxonType,
} from "../../types/app";
import { template } from "./template";
import { removeTaxonIdentified } from "../../lib/search_taxa_identified.ts";
import { iNatTaxaUrl } from "../../data/inat_data.ts";

class SelectedTaxaItem extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ SelectedTaxaItem connectedCallback");

    setupComponent(template, this);

    this.render(window.app.store);
  }

  async render(appStore: AppStoreType) {
    let taxon = (this as DataComponentType).data as NormalizediNatTaxonType;
    let type = (this as DataComponentType).type;
    if (!taxon) return;
    if (!type) return;

    loggerRender("++ SelectedTaxaItem render");

    let swatchEl = this.querySelector(".swatch") as HTMLElement;
    if (swatchEl) {
      swatchEl.style.backgroundColor = taxon.color || "";
    }

    let detailsEl = this.querySelector(".details");
    if (detailsEl) {
      let url = taxon.id === 0 ? undefined : `${iNatTaxaUrl}/${taxon.id}`;
      let content = renderTaxonNames(taxon, appStore, url);
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
        if (type === "taxonIdentified") {
          await removeTaxonIdentified(taxon.id, window.app.store);
        } else if (type === "taxon") {
          await removeTaxon(taxon.id, window.app.store);
        }
      });
    }
  }
}

customElements.define("species-list-item", SelectedTaxaItem);
