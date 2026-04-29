import { html } from "../../lib/component_utils";

export const template = html`
  <div id="links-menu">
    <h2>iNaturalist Links</h2>

    <p>
      Click on the links below to go the iNaturalist web pages with the queries
      made on this site.
    </p>

    <ul class="liststyle-none" id="external-links">
      <li>
        <a href="" class="identifications-link">Identifications page</a>
        - browse identifications
      </li>
    </ul>

    <p>
      Click the copy icon to copy a link with the queries made on this site.
    </p>

    <ul class="liststyle-none" id="external-api-links">
      <li>
        iNaturalist Identifications API
        <copy-to-clipboard id="copy-identifications-api-tp"></copy-to-clipboard>
      </li>
    </ul>
  </div>
`;
