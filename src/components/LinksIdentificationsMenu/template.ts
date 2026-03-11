import { html } from "../../lib/component_utils";

export const template = html`
  <div id="links-menu">
    <h2>iNaturalist Links</h2>

    <p>
      Click on the links below to go the iNaturalist API with the queries made
      on this site.
    </p>

    <ul class="liststyle-none" id="external-links"></ul>
  </div>
`;
