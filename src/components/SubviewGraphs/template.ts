import { html } from "../../lib/component_utils";

export const graphTemplate = html`
  <div id="graph-controls">
    <form id="graph-form">
      <div class="form-group">
        <label for="graphs-category"
          >Category<app-tooltip
            data-id="tp-category"
            data-content="?"
            data-tooltip="Your can view graphs for time (Month, Year, Month and Year) or for popular annotations (Leaves, Flowers and Fruits, Sex, Life Stage, Alive or Dead, Evidence of Presence)."
          ></app-tooltip
        ></label>
        <select id="graphs-category" name="graphs-category">
          <option value="month_of_year">Month</option>
        </select>
      </div>
      <div class="form-group">
        <label for="graphs-group-by"
          >Group by<app-tooltip
            data-id="tp-group"
            data-content="?"
            data-tooltip="If you search for two or more species or places, then you have the option to group the graphs by species or places."
          ></app-tooltip
        ></label>
        <select id="graphs-group-by" name="graphs-group-by">
          <option>None</option>
          <option value="species">Observed Species</option>
          <option value="places">Places</option>
        </select>
      </div>
      <div class="form-group">
        <label for="graphs-value-type"
          >Values
          <app-tooltip
            data-id="tp-speed"
            data-content="?"
            data-tooltip="The graphs can show observation counts or percent. Percent is observation count per time period divided by total observation count."
          ></app-tooltip
        ></label>
        <select id="graphs-value-type" name="graphs-value-type">
          <option value="counts">Observation counts</option>
          <option value="percents">Percent</option>
        </select>
      </div>
    </form>
  </div>

  <div id="subview-data-container"></div>
`;
