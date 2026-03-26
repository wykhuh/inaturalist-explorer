import { html } from "../../lib/component_utils";

export const graphTemplate = html`
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
      <div class="form-group">
        <label for="graphs-value-type">Values</label>
        <select id="graphs-value-type" name="graphs-value-type">
          <option value="counts">Observation counts</option>
          <option value="percents">Percent (count per time/total count)</option>
        </select>
      </div>
    </form>
  </div>

  <div id="legend-container"></div>

  <div id="subview-data-container"></div>
`;
