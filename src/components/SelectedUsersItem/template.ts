import { x } from "../../assets/icons";
import { html } from "../../lib/component_utils";

export const template = html`
  <li class="user-list-item" data-testid="user-list-item">
    <div class="data">
      <span class="name"></span>
      <span class="count"></span>
    </div>
    <button class="close-button" data-testid="user-list-item-close">
      ${x}
    </button>
  </li>
`;
