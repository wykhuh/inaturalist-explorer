import { html } from "../../lib/component_utils";

export const template = html`
  <div id="observations-header">
    <nav id="observations-nav">
      <h1>Observations</h1>
      <ul>
        <li id="observations" data-count-label="observations-observations">
          <span class="observations-count">&nbsp;</span
          ><span>Observations</span>
        </li>
        <li id="species" data-count-label="observations-species">
          <span class="species-count">&nbsp;</span><span>Species</span>
        </li>
        <li id="identifiers" data-count-label="observations-identifiers">
          <span class="identifiers-count">&nbsp;</span><span>Identifiers</span>
        </li>
        <li id="observers" data-count-label="observations-observers">
          <span class="observers-count">&nbsp;</span><span>Observers</span>
        </li>
      </ul>
    </nav>
  </div>
`;
