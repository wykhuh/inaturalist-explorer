import type { ResourceSpeciesCountResult } from "../../types/inat_api";
import type { DataComponent, MapStore } from "../../types/app";
import { pluralize } from "../../lib/utils";
import { formatTaxonName } from "../../lib/data_utils";
import { iNatTaxaUrl } from "../../data/inat_data";
import { setupComponent } from "../../lib/component_utils";
import { renderTaxonNames } from "../../lib/render_utils";
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

  renderCard(appStore: MapStore) {
    let data = (this as unknown as DataComponent)
      .data as ResourceSpeciesCountResult;
    let record_type = (this as unknown as DataComponent).record_type;

    let { title, subtitle } = formatTaxonName(data.taxon, appStore);

    let mediaEl = this.querySelector(".media") as HTMLLinkElement;
    if (mediaEl) {
      let establishmentMeans =
        data.taxon.establishment_means?.establishment_means;
      if (establishmentMeans) {
        let spanEl = document.createElement("span");
        if (establishmentMeans === "native") {
          spanEl.className = "establishment-means native";
          spanEl.textContent = "N";
          spanEl.title = establishmentMeans;
        } else if (establishmentMeans === "introduced") {
          spanEl.className = "establishment-means introduced";
          spanEl.textContent = "IN";
          spanEl.title = establishmentMeans;
        }
        mediaEl.appendChild(spanEl);
      }
    }

    let linkEl = this.querySelector(".media a") as HTMLLinkElement;
    if (linkEl) {
      linkEl.href = `${iNatTaxaUrl}/${data.taxon.id}`;
    }

    let imgEl = this.querySelector("img");
    if (imgEl && data.taxon.default_photo?.medium_url) {
      imgEl.src = data.taxon.default_photo?.medium_url;
      let altText = `photo of `;
      if (title) {
        altText += `${title} `;
      }
      if (subtitle) {
        altText += `${subtitle} taken by `;
      }
      if (data.taxon.default_photo.attribution) {
        altText += `${data.taxon.default_photo.attribution} ,`;
      }

      imgEl.alt = altText;
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
