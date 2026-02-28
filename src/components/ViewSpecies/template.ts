import { html } from "../../lib/component_utils";

export const template = html`
  <span class="loader"></span>
  <div class="species-list-container">
    <div id="view-controls" data-testid="species-controls">
      <form id="order-form">
        <div class="form-group">
          <label for="order_combo">Sort By</label>
          <select id="order_combo" name="order_combo">
            <option value="desc">Observations, High to Low</option>
            <option value="asc">Observations, Low to High</option>
          </select>
        </div>
      </form>
    </div>
    <div class="subview-container"></div>
  </div>
`;
