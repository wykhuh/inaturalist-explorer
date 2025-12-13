import { html } from "../../lib/component_utils";

export const template = html`
  <div id="observations-header">
    <nav id="observations-nav">
      <h1>Observations</h1>
      <ul>
        <li
          id="observations_observations"
          data-count-label="observations_observations"
        >
          <span class="header-count">&nbsp;</span><span>Observations</span>
        </li>
        <li id="observations_species" data-count-label="observations_species">
          <span class="header-count">&nbsp;</span><span>Species</span>
        </li>
        <li
          id="observations_identifiers"
          data-count-label="observations_identifiers"
        >
          <span class="header-count">&nbsp;</span><span>Identifiers</span>
        </li>
        <li
          id="observations_observers"
          data-count-label="observations_observers"
        >
          <span class="header-count">&nbsp;</span><span>Observers</span>
        </li>
      </ul>
    </nav>
  </div>
`;
