import { playIcon } from "../../assets/icons";
import { html } from "../../lib/component_utils";

export const mapTemplate = html`
  <div id="map-controls">
    <form id="map-form">
      <div class="form-group">
        <label for="map-category"
          >Type<app-tooltip
            data-id="tp-animation"
            data-content="?"
            data-tooltip="You can view one map (Normal) or animated maps that show how observations change over time (Month, Year, Month and Year). If you select animated maps, you start the animation by selecting speed and clicking the Play button. Speed is the number of seconds to show each map."
          ></app-tooltip
        ></label>
        <select id="map-category" name="map-category">
          <option value="none">Normal</option>
          <option value="month_of_year">Month</option>
          <option value="year">Year</option>
          <option value="month">Month and Year</option>
        </select>
      </div>

      <div id="animate-map-controls">
        <div class="form-group">
          <label for="speed">Speed</label>
          <select id="speed" name="speed">
            <option value="2">2</option>
            <option selected value="5">5</option>
            <option value="8">8</option>
            <option value="11">11</option>
          </select>
        </div>
        <div class="form-group">
          <button id="play" name="play" title="Play">${playIcon}</button>
          <label class="sr-only" for="time-range">Date Picker</label>
          <input id="time-range" type="range" value="0" />
          <p id="current-timeperiod"></p>
        </div>
      </div>
    </form>
  </div>

  <div id="subview-data-container"></div>
`;
