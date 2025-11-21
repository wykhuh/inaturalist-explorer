import { html } from "../../lib/component_utils";

export const template = html`
  <div id="observations-menu">
    <div class="form-group">
      <label>
        Search for
        <select id="search-type" name="search-type">
          <option selected value="taxa">Species</option>
          <option value="places">iNaturalist Places</option>
          <option value="projects">Projects</option>
          <option value="users">Users (observer)</option>
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
      <observations-filters></observations-filters>
    </div>

    <h2 class="taxa-heading">Species</h2>
    <ul id="selected-species-list"></ul>

    <h2 class="places-heading" hidden>Places</h2>
    <ul id="selected-places-list"></ul>

    <h2 class="projects-heading" hidden>Projects</h2>
    <ul id="selected-projects-list"></ul>

    <h2 class="users-heading" hidden>Users (observer)</h2>
    <ul id="selected-users-list"></ul>
  </div>
`;
