import { setupComponent } from "../../lib/component_utils";
import { sortArrayOfObjectsByDate } from "../../lib/utils";
import type { DataComponent } from "../../types/app";
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
    let data = (this as unknown as DataComponent).data as IdentificationsResult;

    let observationEl = document.createElement(
      "card-identification-observation",
    ) as unknown as DataComponent;
    observationEl.data = data.observation;
    cardEl.append(observationEl);

    let sorted = sortArrayOfObjectsByDate(
      data.observation.identifications,
      "created_at",
    );
    sorted.forEach((identification) => {
      let identificationEl = document.createElement(
        "card-identification-identification",
      ) as unknown as DataComponent;
      identificationEl.data = identification;
      cardEl.append(identificationEl);
    });
  }
}

customElements.define("card-identification", CardIdentification);
