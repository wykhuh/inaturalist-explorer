import { html } from "../../lib/component_utils";

export const template = html`
  <li class="taxon-list-item" data-testid="taxon-list-item">
    <span class="swatch"></span>
    <div class="details"></div>
    <button class="close-button" data-testid="taxon-list-item-close">
      &#215;
    </button>
  </li>
`;

export const templateIdentified = html`
  <li class="taxon-list-item" data-testid="taxon-list-item">
    <div class="data">
      <span class="title"></span>
      <span class="count"></span>
    </div>
    <button class="close-button" data-testid="taxon-list-item-close">
      &#215;
    </button>
  </li>
`;
