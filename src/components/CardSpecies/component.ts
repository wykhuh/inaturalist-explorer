import type { ResourceSpeciesCountResult } from "../../types/inat_api";
import type { DataComponentType, AppStoreType } from "../../types/app";
import { pluralize } from "../../lib/utils";
import { iNatTaxaUrl } from "../../data/inat_data";
import { setupComponent } from "../../lib/component_utils";
import {
  renderTaxonDefaultPhoto,
  renderTaxonNames,
} from "../../lib/render_utils";
import { template } from "./template";

class CardSpecies extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  async render() {
    setupComponent(template, this);

    this.renderCard(window.app.store);
  }

  renderCard(appStore: AppStoreType) {
    let data = (this as unknown as DataComponentType)
      .data as ResourceSpeciesCountResult;
    let record_type = (this as unknown as DataComponentType).record_type;

    let photoEl = this.querySelector(".photo") as HTMLLinkElement;
    if (photoEl) {
      let img = renderTaxonDefaultPhoto(data.taxon, appStore, "medium");
      if (img) {
        photoEl.innerHTML = img;
      }
    }

    let mediaEl = this.querySelector(".media") as HTMLLinkElement;
    if (mediaEl) {
      let establishmentMeans =
        data.taxon.establishment_means?.establishment_means;

      if (establishmentMeans) {
        let options = {} as any;
        if (establishmentMeans === "native") {
          options = {
            content: "N",
            tooltip: establishmentMeans,
            id: "tp-native",
            class: "establishment-means native",
          };
        } else if (establishmentMeans === "introduced") {
          options = {
            content: "IN",
            tooltip: establishmentMeans,
            id: "tp-introduced",
            class: "establishment-means introduced",
          };
        }
        let tooltip = document.createElement("app-tooltip");
        tooltip.className = options.class;
        tooltip.dataset.id = options.id;
        tooltip.dataset.content = options.content;
        tooltip.dataset.tooltip = options.tooltip;

        mediaEl.appendChild(tooltip);
      }
    }

    let licenseEl = this.querySelector(".licensing");
    let license = data.taxon.default_photo?.license_code;
    if (licenseEl) {
      let text = "";
      if (license === null) {
        text = "&copy;";
      } else if (license === "pd") {
        text = "PD";
      } else {
        text = "cc";
      }
      licenseEl.innerHTML = text;
    }

    let attributionEl = this.querySelector(".attribution");
    let attribution = data.taxon.default_photo?.attribution;
    if (attributionEl && attribution) {
      attributionEl.textContent = attribution;
    }

    let detailsEl = this.querySelector(".details");
    if (detailsEl) {
      let content = renderTaxonNames(
        data.taxon,
        appStore,
        `${iNatTaxaUrl}/${data.taxon.id}`,
      );
      content += `<span class="observations-count">${pluralize(data.count, record_type, true)}</span>`;

      detailsEl.innerHTML = content;
    }
  }
}

customElements.define("card-species", CardSpecies);
