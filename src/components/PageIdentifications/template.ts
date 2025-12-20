import { search } from "../../assets/icons";
import { html } from "../../lib/component_utils";

export const template = html`
  <site-header></site-header>
  <identifications-header data-updatecounts="true"></identifications-header>
  <main id="wrapper">
    <div id="site-controls" class="sidebar-open">
      <button id="sidebar-toggle" title="Toggle sidebar">&#9776;</button>
      <button id="search-menu-toggle" title="Identifications">${search}</button>
      <button id="settings-menu-toggle" title="Settings">&#9881;</button>
    </div>

    <section class="two-columns sidebar-open" id="site-layout">
      <div id="sidebar-menu">
        <identifications-menu></identifications-menu>
        <settings-menu></settings-menu>
        <appstore-viewer></appstore-viewer>
      </div>
      <div id="view-container"></div>
    </section>
  </main>
`;
