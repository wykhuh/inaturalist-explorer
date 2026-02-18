import { setupComponent } from "../../lib/component_utils";
import { template } from "./template";
import { renderCard } from "./utils";

class CardMedia extends HTMLElement {
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
    renderCard(window.app.store, this);
  }

  async render() {
    setupComponent(template, this);

    renderCard(window.app.store, this);
  }
}

customElements.define("card-media", CardMedia);
