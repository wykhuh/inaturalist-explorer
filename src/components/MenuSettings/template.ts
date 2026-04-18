import { html } from "../../lib/component_utils";

export const template = html`
  <div id="settings-menu">
    <h2>Settings</h2>

    <h3>Common / Scientific Name Display Order</h3>
    <p>Set how taxon names are displayed.</p>

    <div class="form-group">
      <label for="name-order-select">Name Order</label>
      <select id="name-order-select">
        <option value="cs">Common Name (Scientific Name)</option>
        <option value="sc">Scientific Name (Common Name)</option>
        <option value="s">Scientific Name</option>
      </select>
    </div>

    <h3>Common Name Language</h3>
    <p>Set the language for common names.</p>
    <div class="form-group">
      <label for="language-select">Name Language</label>
      <select id="language-select">
        <option>Select language</option>
      </select>
    </div>

    <h3>Records per Page</h3>
    <p>Set the number of records shown on Observations >> Grid/Media/Table</p>
    <div class="form-group">
      <label for="per-page-observations">Per page</label>
      <select id="per-page-observations">
        <option value="24">24</option>
        <option value="48">48</option>
        <option value="96">96</option>
        <option value="192">192</option>
      </select>
    </div>

    <p>Set the number of records shown on Species</p>
    <div class="form-group">
      <label for="per-page-species">Per page</label>
      <select id="per-page-species">
        <option value="24">24</option>
        <option value="48">48</option>
        <option value="96">96</option>
        <option value="192">192</option>
      </select>
    </div>

    <p>Set the number of records shown on Identifications</p>
    <div class="form-group">
      <label for="per-page-identifications">Per page</label>
      <select id="per-page-identifications">
        <option value="24">24</option>
        <option value="48">48</option>
        <option value="96">96</option>
        <option value="192">192</option>
      </select>
    </div>

    <h3>Fields Displayed</h3>
    <p>Set the fields shown on Observations and Media cards</p>
    <div class="form-group">
      <input type="checkbox" id="display_media" checked />
      <label for="display_media">Photos and Sounds</label>
    </div>
    <div class="form-group">
      <input type="checkbox" id="display_species_name" checked />
      <label for="display_species_name">Species Name</label>
    </div>
    <div class="form-group">
      <input type="checkbox" id="display_observer" checked />
      <label for="display_observer">Observer</label>
    </div>
    <div class="form-group">
      <input type="checkbox" id="display_media_counts" checked />
      <label for="display_media_counts">Photos and Sounds Count</label>
    </div>
    <div class="form-group">
      <input type="checkbox" id="display_quality_grade" checked />
      <label for="display_quality_grade">Quality Grade</label>
    </div>
    <div class="form-group">
      <input type="checkbox" id="display_counts" checked />
      <label for="display_counts"
        >Idenitification, Favorites, Disagreements, and Comments Counts</label
      >
    </div>
    <div class="form-group">
      <input type="checkbox" id="display_time_observed_at" checked />
      <label for="display_time_observed_at">Observed Date</label>
    </div>
    <div class="form-group">
      <input type="checkbox" id="display_created_at" checked />
      <label for="display_created_at">Added Date</label>
    </div>
    <div class="form-group">
      <input type="checkbox" id="display_updated_at" checked />
      <label for="display_updated_at">Updated Date</label>
    </div>
    <div class="form-group">
      <input type="checkbox" id="display_place_guess" checked />
      <label for="display_place_guess">Place</label>
    </div>
    <div class="form-group">
      <input type="checkbox" id="display_annotations" checked />
      <label for="display_annotations">Annotations</label>
    </div>
    <div class="form-group">
      <input type="checkbox" id="display_ofvs" checked />
      <label for="display_ofvs">Observation Fields</label>
    </div>
  </div>
`;
