import { html } from "../../lib/component_utils";

export const observationsTemplate = html`
  <div id="observations-controls" data-testid="observations-controls">
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
  <div id="subview-data-container"></div>
`;
