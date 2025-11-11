import type { ObservationsResult } from "../../types/inat_api";
import type { DataComponent, MapStore } from "../../types/app";
import {
  formatAvatar,
  renderMedia,
  renderObservationMetadataCounts,
  renderTaxonNames,
} from "../../lib/render_utils";
import { iNatObservationUrl, iNatUserUrl } from "../../data/inat_data";
import { setupComponent } from "../../lib/component_utils";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  async render() {
    await setupComponent("/src/components/CardObservation/template.html", this);

    this.renderCard(window.app.store);
  }

  renderCard(appStore: MapStore) {
    let cardEl = this.querySelector(".card");
    if (!cardEl) return;

    let data = (this as DataComponent).data as ObservationsResult;

    let url = `${iNatObservationUrl}/${data.id}`;
    cardEl.innerHTML = renderMedia(url, data.photos, data.sounds);

    let detailsEl = document.createElement("div");
    detailsEl.className = "details";

    let detailsContent = ``;

    if (data.taxon) {
      if (data.user) {
        detailsContent += `<span class="avatar-name">
          <a href="${iNatUserUrl}/${data.user.login}" title="${data.user.login}">
          ${formatAvatar(data.user.icon_url)}
          </a>
        </span>`;
      }

      detailsContent += renderTaxonNames(
        data.taxon,
        appStore,
        `${iNatObservationUrl}/${data.id}`,
      );

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

    detailsContent += renderObservationMetadataCounts(data, true);

    detailsEl.innerHTML = detailsContent;
    cardEl.appendChild(detailsEl);
  }
}

customElements.define("x-card-observation", MyComponent);
