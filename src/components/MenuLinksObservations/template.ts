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
        <a
          href=""
          target="_blank"
          rel="noopener noreferrer"
          class="explore-link"
          >Explore page</a
        >
        - browse observations
      </li>
      <li>
        <a
          href=""
          target="_blank"
          rel="noopener noreferrer"
          class="identify-link"
          >Identify page</a
        >
        - identify observations
      </li>
      <li>
        <a href="" target="_blank" rel="noopener noreferrer" class="export-link"
          >Export page</a
        >
        - download observations
      </li>
    </ul>

    <p>
      Click the copy icon to copy a link with the queries made on this site.
    </p>

    <ul class="liststyle-none" id="external-api-links">
      <li>
        iNaturalist Observations API
        <copy-to-clipboard
          data-id="copy-observations-api-tp"
        ></copy-to-clipboard>
      </li>
    </ul>

    <h2>Notes</h2>
    <ol>
      <li>
        This site gets its data from the iNaturlist API. However, some queries
        that work on iNaturlist API do not work on the iNaturalist explore,
        identify, and export pages.
      </li>
      <li>
        You must be logged into the iNaturalist site to download and identify
        observations.
      </li>
      <li>
        Downloads have a maximum limit of 200,000 observations. You need to
        adjust your search queries to have less than 200,000 observations in
        order to download the observations.
      </li>
    </ol>
  </div>
`;
