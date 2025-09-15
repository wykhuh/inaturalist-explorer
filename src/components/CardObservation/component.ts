import type { ObservationsResult } from "../../types/inat_api";
import type { DataComponent } from "../../types/app";
import { formatAvatar, formatTaxonName } from "../../lib/data_utils";
import { iNatObservationUrl, iNatUserUrl } from "../../lib/inat_data";
import { audio, check, speech, star } from "../../assets/icons";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  async render() {
    const parser = new DOMParser();
    let resp;
    try {
      resp = await fetch("/src/components/CardObservation/template.html");
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

    this.renderCard();
  }

  renderCard() {
    let mediaEl = this.querySelector(".media");
    if (!mediaEl) return;
    let detailsEl = this.querySelector(".details");
    if (!detailsEl) return;

    let data = (this as DataComponent).data as ObservationsResult;

    let mediaContent = "";

    if (data.photos.length > 0) {
      console.log(data.photos[0].url);
      let url = data.photos[0].url.replace("/square.", "/medium.");
      mediaContent += `<a href="${iNatObservationUrl}/${data.id}">`;
      mediaContent += `<img src="${url}">`;
      mediaContent += "</a>";
    }
    if (data.sounds.length > 0) {
      mediaContent += `<a href="${iNatObservationUrl}/${data.id}">`;
      mediaContent += `${audio}`;
      mediaContent += "</a>";
    }

    if (data.photos.length === 0 && data.sounds.length > 0) {
      mediaEl.classList.add("sound-only");
    }
    if (data.photos.length > 1) {
      mediaContent += `<span class="photos-count">${data.photos.length}</span>`;
    }

    mediaEl.innerHTML = mediaContent;

    let detailsContent = ``;

    if (data.taxon) {
      let { title, subtitle } = formatTaxonName(data.taxon, "", false);

      if (data.user) {
        detailsContent += `<span class="avatar-name">
          <a href="${iNatUserUrl}/${data.user.login}" title="${data.user.login}">
          ${formatAvatar(data.user.icon_url)}
          </a>
        </span>`;
      }

      detailsContent += `<span class="title">`;
      detailsContent += `<a href="${iNatObservationUrl}/${data.id}">${title}</a>`;
      detailsContent += "</span>";
      if (subtitle) {
        detailsContent += `<span class="subtitle">`;
        detailsContent += `<a href="${iNatObservationUrl}/${data.id}">${subtitle}</a>`;
        detailsContent += "</span>";
      }
      // some obsevations only have sound and no taxa info
    } else {
      detailsContent += `<span class="title">`;
      detailsContent += `<a href="${iNatObservationUrl}/${data.id}">Unknown</a>`;
      detailsContent += "</span>";
    }

    if (data.quality_grade === "research") {
      detailsContent += `<span class="research-grade">
        <span class="research-grade-badge">Research Grade</span>
       </span>`;
    } else {
      detailsContent += `<span class="research-grade">
         <span></span>
       </span>`;
    }

    detailsContent += `<span class="metadata-counts">`;
    if (data.identifications.length > 0) {
      let message = `${data.identifications.length} identifications`;
      detailsContent += `
      <span class="identifications" aria-label="${message}" title="${message}">
        ${check}<span class="identifications-count">${data.identifications.length}</span>
      </span>`;
    }

    if (data.comments_count > 0) {
      let message = `${data.comments_count} comments`;
      detailsContent += `
      <span class="speech" aria-label="${message}" title="${message}">
        ${speech}<span class="comments-count">${data.comments_count}</span>
      </span>`;
    }

    if (data.faves_count > 0) {
      let message = `${data.faves_count} favorites`;
      detailsContent += `
      <span class="favorites" aria-label="${message}" title="${message}">
        ${star}<span class="favorites-count">${data.faves_count}</span>
      </span>`;
    }

    if (data.observed_on) {
      let date = new Date(data.observed_on).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
      detailsContent += `<span class="observed">${date}</span>`;
    }
    detailsContent += `</span>`;

    detailsEl.innerHTML = detailsContent;
  }
}

customElements.define("x-card-observation", MyComponent);
