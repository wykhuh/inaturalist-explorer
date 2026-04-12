import { html } from "../../lib/component_utils";

export const template = html`
  <div id="identifications-menu">
    <h2>Search</h2>

    <div class="form-group">
      <label>
        Search for
        <select id="search-type" name="search-type">
          <option selected value="taxa">Observed Species</option>
          <option value="taxaIdentified">Identified Species</option>
          <option value="places">iNaturalist Places</option>
          <option value="usersIdentifiers">Identifiers</option>
          <option value="withoutTaxa">Exclude Observed Species</option>
          <option value="withoutTaxaIdentified">
            Exclude Identified Species
          </option>
          <option value="withoutPlaces">Exclude Places</option>
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

    <h3 class="taxa-heading" hidden>Observed Species</h3>
    <ul id="selected-species-list" class="selected-resource-list"></ul>

    <h3 class="taxa-identified-heading" hidden>Identified Species</h3>
    <ul
      id="selected-species-identified-list"
      class="selected-resource-list"
    ></ul>

    <h3 class="places-heading" hidden>Places</h3>
    <ul id="selected-places-list" class="selected-resource-list"></ul>

    <h3 class="users-identifiers-heading" hidden>Identifier</h3>
    <ul
      id="selected-users-identifiers-list"
      class="selected-resource-list"
    ></ul>

    <h3 class="without-taxa-heading" hidden>Exclude Observed Species</h3>
    <ul id="selected-without-taxa-list" class="selected-resource-list"></ul>

    <h3 class="without-taxa-identified-heading" hidden>
      Exclude Identified Species
    </h3>
    <ul
      id="selected-without-taxa-identified-list"
      class="selected-resource-list"
    ></ul>

    <h3 class="without-places-heading" hidden>Exclude Places</h3>
    <ul id="selected-without-places-list" class="selected-resource-list"></ul>
  </div>
`;
