import type { SpeciesCountResult } from "../../types/inat_api";
import type { DataComponent } from "../../types/app";
import { pluralize } from "../../lib/utils";
import { formatTaxonName } from "../../lib/data_utils";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  async render() {
    const parser = new DOMParser();
    let resp;
    try {
      resp = await fetch("/src/components/CardSpecies/template.html");
    } catch (error) {
      console.error("CardSpecies ERROR:", error);
    }

    if (!resp) return;

    const html = await resp.text();

    const template = parser
      .parseFromString(html, "text/html")
      .querySelector("template");

    if (!template) return;

    this.appendChild(template.content.cloneNode(true));

    // console.log(this.data);

    this.renderCard();
  }

  renderCard() {
    let data = (this as DataComponent).data as SpeciesCountResult;
    let { title, subtitle } = formatTaxonName(data.taxon, "", false);

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

    let countEl = this.querySelector(".count");
    if (countEl) {
      countEl.textContent = pluralize(data.count, "observation", true);
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

    let titleEl = this.querySelector(".title");
    let subtitleEl = this.querySelector(".subtitle");
    if (titleEl && subtitleEl) {
      if (title) {
        titleEl.textContent = title;
      }
      if (subtitle) {
        subtitleEl.textContent = subtitle;
      }
    }
  }

  connectedCallback() {
    this.render();
  }
}

customElements.define("x-card-species", MyComponent);
