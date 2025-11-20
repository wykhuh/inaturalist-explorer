import { html } from "../../lib/component_utils";

export const template = html`
  <div class="card">
    <div class="media">
      <a><img /></a>
      <div class="media-meta popover__wrapper">
        <div class="licensing"></div>
        <div class="attribution popover__content"></div>
      </div>
    </div>
    <div class="details"></div>
  </div>
`;
