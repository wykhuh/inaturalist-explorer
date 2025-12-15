import { html } from "../../lib/component_utils";

export const template = html`
  <site-header></site-header>
  <observations-header data-updatecounts="true"></observations-header>
  <main id="wrapper">
    <div id="site-controls" class="sidebar-open">
      <button id="sidebar-toggle" title="Toggle sidebar">&#9776;</button>
      <button id="observations-menu-toggle" title="Observations">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="16px"
          viewBox="0 0 512 512"
        >
          <path
            d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"
          />
        </svg>
      </button>
      <button id="settings-menu-toggle" title="Settings">&#9881;</button>
    </div>

    <section class="two-columns sidebar-open" id="site-layout">
      <div id="sidebar-menu">
        <observations-menu></observations-menu>
        <settings-menu></settings-menu>
        <appstore-viewer></appstore-viewer>
      </div>
      <div id="view-container"></div>
    </section>
  </main>
`;
