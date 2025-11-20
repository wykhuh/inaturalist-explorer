import { html } from "../../lib/component_utils";

export const template = html`
  <header id="site-header">
    <div class="wrapper-fullwidth">
      <nav id="site-nav">
        <span>iNaturalist Explorer</span>
        <ul>
          <li>
            <a href="/" class="navlink" data-record-type="observations"
              >Observations</a
            >
          </li>
          <li>
            <a
              href="/identifications/"
              class="navlink"
              data-record-type="identifications"
              >Identifications</a
            >
          </li>
          <li>
            <a href="/about/" class="navlink" data-record-type="other">About</a>
          </li>
        </ul>
      </nav>
    </div>
  </header>
`;
