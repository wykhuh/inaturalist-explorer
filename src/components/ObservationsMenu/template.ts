import { html } from "../../lib/component_utils";

export const template = html`
  <div id="observations-menu">
    <div class="form-group">
      <label>
        Search for
        <select id="search-type" name="search-type">
          <!--  // NOTE: update when adding selectedResource -->
          <option selected value="taxa">Species</option>
          <option value="withoutTaxa">Without Species</option>
          <option value="places">iNaturalist Places</option>
          <option value="projects">Projects</option>
          <option value="users">Observers</option>
          <option value="usersIdentifiers">Identifier</option>
          <option value="usersAnnotators">Annotators</option>
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

    <!--  // NOTE: update when adding selectedResource -->
    <h2 class="taxa-heading">Species</h2>
    <ul id="selected-species-list"></ul>

    <h2 class="without-taxa-heading" hidden>Without Species</h2>
    <ul id="selected-without-taxa-list"></ul>

    <h2 class="places-heading" hidden>Places</h2>
    <ul id="selected-places-list"></ul>

    <h2 class="projects-heading" hidden>Projects</h2>
    <ul id="selected-projects-list"></ul>

    <h2 class="users-heading" hidden>Observers</h2>
    <ul id="selected-users-list"></ul>

    <h2 class="users-identifiers-heading" hidden>Identifier</h2>
    <ul id="selected-users-identifiers-list"></ul>

    <h2 class="users-annotators-heading" hidden>Annotators</h2>
    <ul id="selected-users-annotators-list"></ul>
  </div>
`;
