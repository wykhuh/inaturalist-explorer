import { html } from "../../lib/component_utils";

export const template = html`
  <span class="loader"></span>
  <div class="observations-list-container">
    <div id="view-controls" data-testid="observations-controls">
      <div id="subview-menu">
        <button class="subview-map" data-subview="map">Map</button>
        <button class="subview-graph" data-subview="graph">Graphs</button>
        <button class="subview-grid" data-subview="grid">Grid</button>
        <button class="subview-media" data-subview="media">Media</button>
        <button class="subview-table" data-subview="table">Table</button>
      </div>
    </div>
    <div class="subview-container"></div>
  </div>
`;
