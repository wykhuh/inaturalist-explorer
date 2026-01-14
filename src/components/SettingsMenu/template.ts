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
  </div>
`;
