import { html } from "../../lib/component_utils";

export const template = html`
  <li class="taxon-list-item resource-list-item" data-testid="taxon-list-item">
    <div class="data"></div>
    <button class="close-button" data-testid="taxon-list-item-close">
      &#215;
    </button>
  </li>
`;
