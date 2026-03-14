import { html } from "../../lib/component_utils";

export const template = html`
  <div id="links-menu">
    <h2>iNaturalist Links</h2>

    <p>
      Click the copy icon to copy a link with the queries made on this site.
    </p>

    <ul class="liststyle-none" id="external-api-links">
      <li>
        iNaturalist Identifications API
        <copy-to-clipboard id="copy-identifications-api-tp"></copy-to-clipboard>
      </li>
    </ul>

    <h2>Code Notebooks</h2>
    <p>
      To accompany this site, we have some code that offers additional
      functionality. The code is written in R using JupyterLite notebooks.
    </p>

    <ul class="liststyle-none" id="external-links">
      <li>
        <a href="">Download Identifications</a> - download identifications as a
        CSV
      </li>
    </ul>
  </div>
`;
