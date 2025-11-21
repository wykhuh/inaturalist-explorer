import { html } from "../../lib/component_utils";

export const template = html`
  <div id="identifications-menu">
    <div class="form-group">
      <label>
        Search for
        <select id="search-type" name="search-type">
          <option selected value="taxa">Species</option>
          <option value="places">iNaturalist Places</option>
          <option value="users">Users (identifiers)</option>
        </select>
      </label>
    </div>

    <div class="form-group">
      <label
        >Search
        <input id="inatAutocomplete" type="text" autocomplete="off" />
      </label>
    </div>
    <div class="dialog-container">
      <identifications-filters></identifications-filters>
    </div>

    <h2 class="taxa-heading">Species</h2>
    <ul id="selected-species-list"></ul>

    <h2 class="observation-taxa-heading" hidden>Observation Species</h2>
    <ul id="selected-observation-species-list"></ul>

    <h2 class="places-heading" hidden>Places</h2>
    <ul id="selected-places-list"></ul>

    <h2 class="users-heading" hidden>Users (identifiers)</h2>
    <ul id="selected-users-list"></ul>
  </div>
`;
