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
  renderPlace,
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

    window.addEventListener("observationsDisplayFieldsChanged", this);
  }

  disconnectedCallback() {
    window.removeEventListener("observationsDisplayFieldsChanged", this);
  }

  handleEvent() {
    this.renderCard(window.app.store);
  }

  async render() {
    setupComponent(template, this);

    this.renderCard(window.app.store);
  }

  renderCard(appStore: AppStoreType) {
    let cardEl = this.querySelector(".card");
    if (!cardEl) return;

    let data = (this as DataComponentType).data as ObservationsResult;
    let displayFields =
      appStore.viewMetadata.observations_observations.displayFields || {};

    cardEl.innerHTML = "";
    if (displayFields.media !== false) {
      let url = `${iNatObservationUrl}/${data.id}`;
      cardEl.innerHTML = renderMedia(
        url,
        data.taxon,
        data.photos,
        data.sounds,
        appStore,
      );
    }

    let detailsEl = document.createElement("div");
    detailsEl.className = "details";

    let detailsContent = ``;

    if (data.user && displayFields.observer !== false) {
      detailsContent += formatAvatar(data.user);
    }

    if (displayFields.species_name !== false) {
      if (data.taxon) {
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
    }

    if (displayFields.media_counts !== false) {
      detailsContent += renderMediaCounts(data.photos, data.sounds);
    }

    if (data.quality_grade && displayFields.quality_grade !== false) {
      detailsContent += renderQualityGrade(data.quality_grade);
    }

    if (displayFields.counts !== false) {
      detailsContent += renderObservationMetadataCounts(data);
    }

    detailsContent += renderDates(data, displayFields);

    if (data.place_guess && displayFields.place_guess !== false) {
      detailsContent +=
        "<div>Place: " +
        renderPlace(data.place_guess, data.obscured) +
        "</div>";
    }

    if (
      data.annotations &&
      data.annotations.length > 0 &&
      displayFields.annotations !== false
    ) {
      detailsContent += "<h3>Annotations</h3>";
      detailsContent += renderAnnotations(data.annotations);
    }

    if (data.ofvs && data.ofvs.length > 0 && displayFields.ofvs !== false) {
      detailsContent += "<h3>Observation Fields</h3>";
      detailsContent += renderObservationFields(data.ofvs, appStore);
    }

    if (detailsContent !== "") {
      detailsEl.innerHTML = detailsContent;
      cardEl.appendChild(detailsEl);
    }
  }
}

customElements.define("card-observation", CardObservation);
