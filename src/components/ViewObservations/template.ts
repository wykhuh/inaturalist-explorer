import { html } from "../../lib/component_utils";

export const template = html`
  <div id="map"></div>
  <div id="observations-list-controls" data-testid="observations-controls">
    <div>
      <div id="observations-subview">
        <button class="subview-grid" data-subview="grid">Grid</button>
        <button class="subview-media" data-subview="media">Media</button>
        <button class="subview-table" data-subview="table">Table</button>
      </div>
    </div>

    <form id="order-form">
      <div class="form-group">
        <label for="order_by">Sort By</label>
        <select id="order_by" name="order_by">
          <option value="created_at">Added Date</option>
          <option value="observed_on">Observed Date</option>
          <option value="updated_at">Updated Date</option>
          <option value="votes">Favorites</option>
          <option value="random">Random</option>
        </select>
      </div>
      <div class="form-group">
        <label for="order">Direction</label>
        <select id="order" name="order">
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>
    </form>
  </div>

  <span class="loader"></span>
  <div class="observations-list-container"></div>
`;
