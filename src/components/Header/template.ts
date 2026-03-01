import { hamburgerMenu } from "../../assets/icons";
import { html } from "../../lib/component_utils";

export const template = html`
  <header id="site-header">
    <div class="wrapper-fullwidth">
      <nav class="navbar navbar-expand" id="site-nav">
        <span class="navbar-brand"> iNat Explorer </span>
        <button
          class="navbar-toggler"
          type="button"
          data-toggle="collapse"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon">${hamburgerMenu}</span>
        </button>

        <div class="collapse navbar-collapse">
          <ul class="navbar-nav">
            <li>
              <a
                href="/"
                class="navlink"
                data-record-type="observations"
                role="menuitem"
                >Observations</a
              >
            </li>
            <li>
              <a
                href="/identifications/"
                class="navlink"
                data-record-type="identifications"
                role="menuitem"
                >Identifications</a
              >
            </li>
            <li>
              <a
                href="/about/"
                class="navlink"
                data-record-type="about"
                role="menuitem"
                >About</a
              >
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </header>
`;
