import { setupComponent } from "../../lib/component_utils";
import { template } from "./template";
import { renderCard } from "./utils";

class CardMedia extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  async render() {
    setupComponent(template, this);

    renderCard(window.app.store, this);
  }
}

customElements.define("card-media", CardMedia);
