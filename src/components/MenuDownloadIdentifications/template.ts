import { html } from "../../lib/component_utils";
import { addCommastoNumbers } from "../../lib/utils";
import { MAX_DOWNLOADS } from "./utils";

const instructions = html`<ol>
  <li>
    Use the searches and filters to create a search query with less than
    ${addCommastoNumbers(MAX_DOWNLOADS)} identifications.
  </li>
  <li>Enter a filename</li>
  <li>click "Download identifications" button</li>
  <li>NOTE: Do not go to another page while download is in progress.</li>
  <li>A CSV is saved to your browser's download folder.</li>
</ol> `.replaceAll('"', "'");

export const template = html`
  <div id="settings-menu">
    <h2>Download</h2>
    <h2>Download Identifications (Work in Progress)</h2>
    <p>
      This site offers the ability to download identifications that matches your
      search query. There is a limit of downloading ${MAX_DOWNLOADS}
      identification while I'm testing out this feature.
    </p>
    <app-accordion
      data-title="Instructions"
      data-content="${instructions}"
      data-id="multiple-records"
    ></app-accordion>

    <form id="download-identifications">
      <div class="form-group">
        <label for="filename">Filename</label>
        <input
          placeholder="Enter filename"
          size="30"
          required
          type="text"
          name="filename"
          id="filename"
        />
      </div>
      <div class="form-group">
        <button class="btn-primary btn" type="submit">
          Download identifications
        </button>
      </div>
    </form>
    <section id="status-container"></section>
  </div>
`;
