import { externalLink, gear, hamburgerMenu, search } from "../../assets/icons";
import { html } from "../../lib/component_utils";

export const template = html`
  <site-header></site-header>
  <observations-header data-updatecounts="true"></observations-header>
  <main id="wrapper">
    <div id="site-controls" class="sidebar-open">
      <button id="sidebar-toggle" title="Toggle sidebar">
        ${hamburgerMenu}
      </button>
      <button id="search-menu-toggle" title="Search observations">
        ${search}
      </button>
      <button id="links-menu-toggle" title="iNaturalist links">
        ${externalLink}
      </button>
      <button id="settings-menu-toggle" title="Settings">${gear}</button>
    </div>

    <section class="two-columns sidebar-open" id="site-layout">
      <div id="sidebar-menu">
        <observations-menu></observations-menu>

        <appstore-viewer></appstore-viewer>
      </div>
      <div id="view-container"></div>
    </section>
  </main>
`;
