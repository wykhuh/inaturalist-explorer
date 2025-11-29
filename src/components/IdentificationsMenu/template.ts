import { html } from "../../lib/component_utils";

export const template = html`
  <div id="identifications-menu">
    <div class="form-group">
      <label>
        Search for
        <select id="search-type" name="search-type">
          <option selected value="taxa">Observed Species</option>
          <option value="taxaIdentified">Identified Species</option>
          <option value="places">iNaturalist Places</option>
          <option value="usersIdentifiers">Identifiers</option>
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

    <h2 class="taxa-heading">Observed Species</h2>
    <ul id="selected-species-list"></ul>

    <h2 class="taxa-identified-heading" hidden>Identified Species</h2>
    <ul id="selected-species-identified-list"></ul>

    <h2 class="places-heading" hidden>Places</h2>
    <ul id="selected-places-list"></ul>

    <h2 class="users-identifiers-heading" hidden>Identifier</h2>
    <ul id="selected-users-identifiers-list"></ul>
  </div>
`;
