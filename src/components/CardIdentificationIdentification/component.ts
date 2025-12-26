import { computer } from "../../assets/icons";
import { iNatTaxaUrl } from "../../data/inat_data";
import { setupComponent } from "../../lib/component_utils";
import { capitalizeFirstLetter } from "../../lib/data_utils";
import {
  formatAvatar,
  formatDate,
  formatUserName,
  renderTaxonDefaultPhoto,
  renderTaxonNames,
} from "../../lib/render_utils";
import type { DataComponent, MapStore } from "../../types/app";
import type { Identification } from "../../types/inat_api";
import { template } from "./template";

class CardIdentificationIdentification extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    setupComponent(template, this);
    this.render(window.app.store);
  }

  categoryClass(category?: string) {
    if (category === "maverick") {
      return "error";
    } else if (category === "improving") {
      return "success";
    } else if (category === "leading") {
    } else if (category === "support") {
    }
  }

  render(appStore: MapStore) {
    let cardEl = this.querySelector(".card") as HTMLDivElement;
    if (!cardEl) return;
    let data = (this as unknown as DataComponent).data as Identification;

    if (!data.current) {
      cardEl.classList.add("withdrawn");
    }
    cardEl.dataset.id = data.id.toString();

    let content = "";
    if (data.user) {
      content += '<div class="user-action">';
      content += `${formatAvatar(data.user)}`;
      content += "<span class='action'>";
      content += `${formatUserName(data.user)} added an identification `;
      if (data.created_at) {
        content += ` on ${formatDate(data.created_at)}`;
      }
      content += "</span>";
      content += `</div>`;
    }

    if (data.taxon) {
      content += '<div class="media">';
      content += `${renderTaxonDefaultPhoto(data.taxon, appStore, "square")}`;
      content += "</div>";

      content += '<div class="details">';

      content += renderTaxonNames(
        data.taxon,
        appStore,
        `${iNatTaxaUrl}/${data.taxon.id}`,
      );

      content += '<div class="status">';

      if (data.category) {
        if (data.current) {
          content += `<span class="category ${data.category}">${capitalizeFirstLetter(data.category)}</span>`;
        } else {
          content += `<span class="category">ID Withdrawn </span>`;
        }
      }
      if (data.vision) {
        content += `<button class="btn-borderless" popovertarget="mypopover">${computer}</button>`;
        content +=
          "<div id='mypopover' popover>Computer Vision Suggestion was used for this identification.</div>";
      }
      content += "</div>";

      if (
        data.disagreement &&
        data.previous_observation_taxon &&
        data.user?.login
      ) {
        let taxon = data.previous_observation_taxon;
        let taxonName = `${capitalizeFirstLetter(taxon.rank)} ${taxon.name}`;
        if (taxon.preferred_common_name) {
          taxonName = `${taxon.preferred_common_name} (${taxonName})`;
        }
        content += `<div class="disagreement">* ${data.user.login} disagrees this is ${taxonName} </div>`;
      }

      content += "</div>";
    }

    cardEl.innerHTML = content;
  }
}

customElements.define(
  "card-identification-identification",
  CardIdentificationIdentification,
);
