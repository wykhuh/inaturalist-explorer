import type { ObservationsResult } from "../../types/inat_api";
import type { DataComponentType, AppStoreType } from "../../types/app";
import {
  formatAvatar,
  renderAnnotations,
  renderDates,
  renderMedia,
  renderMediaCounts,
  renderObservationFields,
  renderObservationMetadataCounts,
  renderQualityGrade,
  renderTaxonNames,
} from "../../lib/render_utils";
import { iNatObservationUrl } from "../../data/inat_data";
import { setupComponent } from "../../lib/component_utils";
import { template } from "./template";

class CardObservation extends HTMLElement {
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
    let cardEl = this.querySelector(".card");
    if (!cardEl) return;

    let data = (this as unknown as DataComponentType)
      .data as ObservationsResult;

    let url = `${iNatObservationUrl}/${data.id}`;
    cardEl.innerHTML = renderMedia(
      url,
      data.taxon,
      data.photos,
      data.sounds,
      appStore,
    );

    let detailsEl = document.createElement("div");
    detailsEl.className = "details";

    let detailsContent = ``;

    if (data.taxon) {
      if (data.user) {
        detailsContent += formatAvatar(data.user);
      }

      detailsContent += renderTaxonNames(
        data.taxon,
        appStore,
        `${iNatObservationUrl}/${data.id}`,
      );

      // some obsevations do not have taxa info
    } else {
      detailsContent += `<span class="title">`;
      detailsContent += `<a href="${iNatObservationUrl}/${data.id}">Unknown</a>`;
      detailsContent += "</span>";
    }
    detailsContent += renderMediaCounts(data.photos, data.sounds);
    detailsContent += renderQualityGrade(data.quality_grade);
    detailsContent += renderObservationMetadataCounts(data);
    detailsContent += renderDates(data);

    if (data.annotations && data.annotations.length > 0) {
      detailsContent += "<h3>Annotations</h3>";
      detailsContent += renderAnnotations(data.annotations);
    }
    if (data.ofvs && data.ofvs.length > 0) {
      detailsContent += "<h3>Observation Fields</h3>";
      detailsContent += renderObservationFields(data.ofvs, appStore);
    }

    detailsEl.innerHTML = detailsContent;
    cardEl.appendChild(detailsEl);
  }
}

customElements.define("card-observation", CardObservation);
