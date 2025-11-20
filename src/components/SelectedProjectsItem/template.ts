import { html } from "../../lib/component_utils";

export const template = html`
  <li class="project-list-item" data-testid="project-list-item">
    <div class="data">
      <span class="name"></span>
      <span class="count"></span>
    </div>
    <button class="close-button" data-testid="project-list-item-close">
      &#215;
    </button>
  </li>
`;
