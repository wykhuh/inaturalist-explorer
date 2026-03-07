import { html } from "../../lib/component_utils";

export const template = html`
  <span class="loader"></span>
  <div class="observations-list-container">
    <div id="view-controls" data-testid="observations-controls">
      <div>
        <div id="subview-menu">
          <button class="subview-map" data-subview="map">Map</button>
          <button class="subview-grid" data-subview="grid">Grid</button>
          <button class="subview-media" data-subview="media">Media</button>
          <button class="subview-table" data-subview="table">Table</button>
          <button class="subview-graph" data-subview="graph">Graphs</button>
        </div>
      </div>

      <form id="order-form">
        <div class="form-group">
          <label for="order_combo">Sort By</label>
          <select id="order_combo" name="order_combo">
            <option value="created_at:desc">Added Date, New to Old</option>
            <option value="created_at:asc">Added Date, Old to New</option>

            <option value="observed_on:desc">Observed Date, New to Old</option>
            <option value="observed_on:asc">Observed Date, Old to New</option>

            <option value="updated_at:desc">Updated Date, New to Old</option>
            <option value="updated_at:asc">Updated Date, Old to New</option>

            <option value="votes:desc">Favorites, High to Low</option>
            <option value="votes:asc">Favorites, Low to High</option>

            <option value="random">Random</option>

            <option value="species_guess:asc">Species guess, A to Z</option>
            <option value="species_guess:desc">Species guess, Z to A</option>
          </select>
        </div>
      </form>
    </div>
    <div id="graph-controls">
      <form id="graph-form">
        <div class="form-group">
          <label for="graphs-category">Category</label>
          <select id="graphs-category" name="graphs-category">
            <option value="month_of_year">Month/Year</option>
          </select>
        </div>
        <div class="form-group">
          <label for="graphs-group-by">Group by</label>
          <select id="graphs-group-by" name="graphs-group-by">
            <option>None</option>
            <option value="species">Observed Species</option>
            <option value="places">Places</option>
          </select>
        </div>
      </form>
    </div>

    <div class="subview-container"></div>
  </div>
`;
