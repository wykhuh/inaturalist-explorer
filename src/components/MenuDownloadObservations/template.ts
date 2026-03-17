import { html } from "../../lib/component_utils";
import { addCommastoNumbers } from "../../lib/utils";
import { MAX_DOWNLOADS } from "./utils";

const instructions = html`<ol>
  <li>
    Use the searches and filters to create a search query with less than
    ${addCommastoNumbers(MAX_DOWNLOADS)} observations. Your search query must
    contain annotations (term_id, term_value_id). If an observation contains
    multiple annotations, only the annotations set in the filters will be
    included in the download.
  </li>
  <li>Enter a filename</li>
  <li>click "Download annotations" button</li>
  <li>NOTE: Do not go to another page while download is in progress.</li>
  <li>A CSV is saved to your browser's download folder.</li>
</ol> `.replaceAll('"', "'");

export const template = html`
  <div id="settings-menu">
    <h2>Download</h2>
    <h2>Download Annotations (Work in Progress)</h2>
    <p>
      This site offers the ability to download annotations for observations that
      matches your search query. There is a limit of downloading 200 observations
      while I'm testing out this feature.</p>
      <app-accordion
        data-title="Instructions"
        data-content="${instructions}"
        data-id="multiple-records"
      ></app-accordion>
    </p>

    <form id="download-annotations">
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
          Download annotations
        </button>
      </div>
    </form>
    <section id="status-container"></section>
  </div>
`;
