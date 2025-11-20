import { html } from "../../lib/component_utils";

export const template = html`
  <li class="place-list-item" data-testid="place-list-item">
    <div class="data">
      <span class="title"></span>
      <span class="count"></span>
    </div>
    <button class="close-button" data-testid="place-list-item-close">
      &#215;
    </button>
  </li>
  <style></style>
`;
