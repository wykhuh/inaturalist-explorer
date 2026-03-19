import { setupComponent } from "../../lib/component_utils";
import { sortArrayOfObjectsByDate } from "../../lib/utils";
import type { DataComponentType } from "../../types/app";
import type { IdentificationsResult } from "../../types/inat_api";
import { template } from "./template";

class CardIdentification extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    setupComponent(template, this);
    this.render();
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

  render() {
    let cardEl = this.querySelector(".card");
    if (!cardEl) return;
    let data = (this as DataComponentType).data as IdentificationsResult;
    let type = (this as DataComponentType).type;

    let observationEl = document.createElement(
      "card-identification-observation",
    ) as DataComponentType;
    observationEl.data = data.observation;
    cardEl.append(observationEl);

    if (type === "grid") {
      let identification = data.observation.identifications.find(
        (ident) => ident.id === data.id,
      );
      if (!identification) {
        return;
      }

      let identificationEl = document.createElement(
        "card-identification-identification",
      ) as DataComponentType;
      identificationEl.data = identification;
      cardEl.append(identificationEl);
    } else {
      let identifications = sortArrayOfObjectsByDate(
        data.observation.identifications,
        "created_at",
      );
      identifications.forEach((ident) => {
        let identificationEl = document.createElement(
          "card-identification-identification",
        ) as DataComponentType;
        identificationEl.data = ident;
        cardEl.append(identificationEl);
      });
    }
  }
}

customElements.define("card-identification", CardIdentification);
