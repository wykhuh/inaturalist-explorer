import { iNatTaxaUrl } from "../../data/inat_data.ts";
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
import type {
  AppStoreType,
  DataComponentType,
  NormalizediNatTaxonType,
} from "../../types/app";
import { template } from "./template";

class SelectedTaxaBasicItem extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender(`++ SelectedTaxaItem connectedCallback`);

    setupComponent(template, this);

    this.render(window.app.store);
  }

  async render(appStore: AppStoreType) {
    let taxon = (this as DataComponentType).data as NormalizediNatTaxonType;
    let type = (this as DataComponentType).type;
    if (!taxon) return;
    if (!type) return;

    loggerRender(`++ SelectedTaxaItem ${type} render`);

    let dataEl = this.querySelector(".data");
    if (dataEl) {
      let url = taxon.id === 0 ? undefined : `${iNatTaxaUrl}/${taxon.id}`;
      let content = renderTaxonNames(taxon, appStore, url);
      if (["taxonIdentified", "taxon"].includes(type)) {
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
        if (type === "taxonIdentified") {
          await removeTaxonIdentified(taxon.id, window.app.store);
        } else if (type === "taxon") {
          await removeTaxon(taxon.id, window.app.store);
        } else if (type === "withoutTaxon") {
          await removeWithoutTaxon(taxon.id, window.app.store);
        } else if (type === "withoutTaxonIdentified") {
          await removeWithoutTaxonIdentified(taxon.id, window.app.store);
        }
      });
    }
  }
}

customElements.define("species-basic-list-item", SelectedTaxaBasicItem);
