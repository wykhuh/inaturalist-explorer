import { iNatObservationUrl } from "../../data/inat_data";
import { setupComponent } from "../../lib/component_utils";
import {
  formatAvatar,
  formatDate,
  formatUserName,
  renderMedia,
  renderQualityGrade,
  renderTaxonNames,
} from "../../lib/render_utils";
import { pluralize } from "../../lib/utils";
import type { DataComponentType, AppStoreType } from "../../types/app";
import type { IdentificationObservation } from "../../types/inat_api";
import { template } from "./template";

class CardIdentificationObservation extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    setupComponent(template, this);
    this.render(window.app.store);
  }

  render(appStore: AppStoreType) {
    let cardEl = this.querySelector(".card");
    if (!cardEl) return;
    let observation = (this as unknown as DataComponentType)
      .data as IdentificationObservation;

    let content = "";
    content += `<div class="user-action">`;
    content += `${formatAvatar(observation.user)}`;
    content += "<span class='action'>";
    content += `${formatUserName(observation.user)} added an observation`;
    content += ` on ${formatDate(observation.created_at)}`;
    content += "</span>";
    content += `</div>`;

    content += '<div class="media">';
    content += renderMedia(
      `${iNatObservationUrl}/${observation.id}`,
      observation.taxon,
      observation.photos,
      observation.sounds,
      appStore,
    );
    content += "</div>";

    content += '<div class="details">';
    content += renderTaxonNames(
      observation.taxon,
      appStore,
      `${iNatObservationUrl}/${observation.id}`,
    );

    content += "<div class='status'>";
    content += renderQualityGrade(observation.quality_grade);
    content += pluralize(observation.identifications.length, "identification");
    if (observation.identification_disagreements_count) {
      content +=
        ", " +
        pluralize(
          observation.identification_disagreements_count,
          "disagreement",
        );
    }
    content += "</div>";

    content += observation.place_guess;
    content += "</div>";

    cardEl.innerHTML = content;
  }
}

customElements.define(
  "card-identification-observation",
  CardIdentificationObservation,
);
