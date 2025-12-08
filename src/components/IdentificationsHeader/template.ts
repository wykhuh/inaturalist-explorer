import { html } from "../../lib/component_utils";

export const template = html`
  <div id="identifications-header">
    <nav id="identifications-nav">
      <h1>Identifications</h1>
      <ul>
        <li id="observations" data-count-label="identifications-observations">
          <span class="header-count">&nbsp;</span><span>Observations</span>
        </li>
        <li
          id="identifications"
          data-count-label="identifications-identifications"
        >
          <span class="header-count">&nbsp;</span><span>Identifications</span>
        </li>
        <li id="species" data-count-label="identifications-species">
          <span class="header-count">&nbsp;</span><span>Species</span>
        </li>
        <li id="identifiers" data-count-label="identifications-identifiers">
          <span class="header-count">&nbsp;</span><span>Identifiers</span>
        </li>
        <li id="observers" data-count-label="identifications-observers">
          <span class="header-count">&nbsp;</span><span>Observers</span>
        </li>
      </ul>
    </nav>
  </div>
`;
