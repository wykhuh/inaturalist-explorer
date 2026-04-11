import { playIcon } from "../../assets/icons";
import { html } from "../../lib/component_utils";

export const mapTemplate = html`
  <div id="map-controls">
    <form id="map-form">
      <div class="form-group">
        <label for="map-category">Category</label>
        <select id="map-category" name="map-category">
          <option value="none">None</option>
          <option value="month_of_year">Month/Year</option>
          <option value="year">Year</option>
          <option value="month">Month</option>
        </select>
      </div>

      <div id="animate-map-controls">
        <button id="play" name="play">${playIcon}</button>
        <input id="time-range" type="range" value="0" />
        <p id="current-timeperiod"></p>
      </div>
    </form>
  </div>

  <div id="subview-data-container"></div>
`;
