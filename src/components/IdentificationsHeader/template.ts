import { html } from "../../lib/component_utils";

export const template = html`
  <div id="identifications-header">
    <nav id="identifications-nav">
      <h1>Identifications</h1>
      <ul>
        <li
          id="identifications_observations"
          data-count-label="identifications_observations"
        >
          <span class="header-count">&nbsp;</span><span>Observations</span>
        </li>
        <li
          id="identifications_identifications"
          data-count-label="identifications_identifications"
        >
          <span class="header-count">&nbsp;</span><span>Identifications</span>
        </li>
        <li
          id="identifications_species"
          data-count-label="identifications_species"
        >
          <span class="header-count">&nbsp;</span><span>Species</span>
        </li>
        <li
          id="identifications_identifiers"
          data-count-label="identifications_identifiers"
        >
          <span class="header-count">&nbsp;</span><span>Identifiers</span>
        </li>
        <li
          id="identifications_observers"
          data-count-label="identifications_observers"
        >
          <span class="header-count">&nbsp;</span><span>Observers</span>
        </li>
      </ul>
    </nav>
  </div>
`;
