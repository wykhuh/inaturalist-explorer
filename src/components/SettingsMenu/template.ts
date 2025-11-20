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
  </div>
`;
