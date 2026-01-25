import { html } from "../../lib/component_utils";

export const template = html`
  <div id="download-menu">
    <h2>Download Observations</h2>
    <a href="" target="_blank" rel="noopener noreferrer" class="export-link"
      >iNaturalist export page</a
    >
    <p>
      iNaturalist allows users search for observations, and download the
      observations as a CSV. Clicking on the "iNaturalist export page" link will
      take you to the iNaturalist "Export Observations" page with the search
      queries that you made on this site.
    </p>

    <h3>Notes</h3>
    <ol>
      <li>Downloads have a maximum limit of 200,000 observations.</li>
      <li>
        You must be logged into the iNaturalist site to download observations.
      </li>
      <li>
        This site gets its data from the iNaturlist API. However, some queries
        that work on iNaturlist API do not work on the export page. For
        instance, the API allows not_in_project but the export page does not.
      </li>
    </ol>
  </div>
`;
