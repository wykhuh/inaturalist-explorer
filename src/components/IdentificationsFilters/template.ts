import { html } from "../../lib/component_utils";

export const template = html`
  <button id="filters-btn" class="btn-primary">Filters</button>
  <span class="filters-count"></span>
  <dialog class="filters-modal">
    <div>
      <div class="modal-header">
        <identifications-header></identifications-header>
        <div><button class="close-btn btn-primary">Close</button></div>
      </div>
      <ol class="filters-list"></ol>

      <form id="filters-form">
        <div class="fields">
          <!-- column 1 -->
          <div>
            <fieldset class="date-observed">
              <legend>Date Identified</legend>
              <div class="form-group">
                <label for="d1">Start Date</label>
                <input type="date" name="d1" id="d1" />
              </div>
              <div class="form-group">
                <label for="d2">End Date</label>
                <input type="date" name="d2" id="d2" />
              </div>
            </fieldset>
            <fieldset class="iconic_taxa">
              <legend>Identification Categories</legend>
              <div class="form-group">
                <input
                  type="checkbox"
                  id="Aves"
                  value="Aves"
                  name="iconic_taxon_id"
                />
                <label for="Aves">Aves</label>
              </div>
              <div class="form-group">
                <input
                  type="checkbox"
                  id="Amphibia"
                  value="Amphibia"
                  name="iconic_taxon_id"
                />
                <label for="Amphibia">Amphibia</label>
              </div>
              <div class="form-group">
                <input
                  type="checkbox"
                  id="Reptilia"
                  value="Reptilia"
                  name="iconic_taxon_id"
                />
                <label for="Reptilia">Reptilia</label>
              </div>
              <div class="form-group">
                <input
                  type="checkbox"
                  id="Mammalia"
                  value="Mammalia"
                  name="iconic_taxon_id"
                />
                <label for="Mammalia">Mammalia</label>
              </div>
              <div class="form-group">
                <input
                  type="checkbox"
                  id="Actinopterygii"
                  value="Actinopterygii"
                  name="iconic_taxon_id"
                />
                <label for="Actinopterygii">Actinopterygii</label>
              </div>
              <div class="form-group">
                <input
                  type="checkbox"
                  id="Mollusca"
                  value="Mollusca"
                  name="iconic_taxon_id"
                />
                <label for="Mollusca">Mollusca</label>
              </div>
              <div class="form-group">
                <input
                  type="checkbox"
                  id="Arachnida"
                  value="Arachnida"
                  name="iconic_taxon_id"
                />
                <label for="Arachnida">Arachnida</label>
              </div>
              <div class="form-group">
                <input
                  type="checkbox"
                  id="Insecta"
                  value="Insecta"
                  name="iconic_taxon_id"
                />
                <label for="Insecta">Insecta</label>
              </div>
              <div class="form-group">
                <input
                  type="checkbox"
                  id="Plantae"
                  value="Plantae"
                  name="iconic_taxon_id"
                />
                <label for="Plantae">Plantae</label>
              </div>
              <div class="form-group">
                <input
                  type="checkbox"
                  id="Fungi"
                  value="Fungi"
                  name="iconic_taxon_id"
                />
                <label for="Fungi">Fungi</label>
              </div>
              <div class="form-group">
                <input
                  type="checkbox"
                  id="Protozoa"
                  value="Protozoa"
                  name="iconic_taxon_id"
                />
                <label for="Protozoa">Protozoa</label>
              </div>
              <div class="form-group">
                <input
                  type="checkbox"
                  id="unknown"
                  value="unknown"
                  name="iconic_taxon_id"
                />
                <label for="unknown">unknown</label>
              </div>
            </fieldset>
            <fieldset class="rank">
              <legend>Identification Rank</legend>
              <div class="form-group">
                <label for="hrank">High Rank</label>
                <select id="hrank" name="hrank"></select>
              </div>
              <div class="form-group">
                <label for="lrank">Low Rank</label>
                <select id="lrank" name="lrank"></select>
              </div>
            </fieldset>
          </div>
          <!-- column 2 -->
          <div>
            <fieldset class="date-observed">
              <legend>Date Observed</legend>

              <div class="form-group">
                <label for="observed_d1">Start Date</label>
                <input type="date" name="observed_d1" id="observed_d1" />
              </div>
              <div class="form-group">
                <label for="observed_d2">End Date</label>
                <input type="date" name="observed_d2" id="observed_d2" />
              </div>
            </fieldset>
            <fieldset class="iconic_taxa">
              <legend>Observation Categories</legend>
              <div class="form-group">
                <input
                  type="checkbox"
                  id="Aves2"
                  value="Aves"
                  name="observation_iconic_taxon_id"
                />
                <label for="Aves2">Aves</label>
              </div>
              <div class="form-group">
                <input
                  type="checkbox"
                  id="Amphibia2"
                  value="Amphibia"
                  name="observation_iconic_taxon_id"
                />
                <label for="Amphibia2">Amphibia</label>
              </div>
              <div class="form-group">
                <input
                  type="checkbox"
                  id="Reptilia2"
                  value="Reptilia"
                  name="observation_iconic_taxon_id"
                />
                <label for="Reptilia2">Reptilia</label>
              </div>
              <div class="form-group">
                <input
                  type="checkbox"
                  id="Mammalia2"
                  value="Mammalia"
                  name="observation_iconic_taxon_id"
                />
                <label for="Mammalia2">Mammalia</label>
              </div>
              <div class="form-group">
                <input
                  type="checkbox"
                  id="Actinopterygii2"
                  value="Actinopterygii"
                  name="observation_iconic_taxon_id"
                />
                <label for="Actinopterygii2">Actinopterygii</label>
              </div>
              <div class="form-group">
                <input
                  type="checkbox"
                  id="Mollusca2"
                  value="Mollusca"
                  name="observation_iconic_taxon_id"
                />
                <label for="Mollusca2">Mollusca</label>
              </div>
              <div class="form-group">
                <input
                  type="checkbox"
                  id="Arachnida2"
                  value="Arachnida"
                  name="observation_iconic_taxon_id"
                />
                <label for="Arachnida2">Arachnida</label>
              </div>
              <div class="form-group">
                <input
                  type="checkbox"
                  id="Insecta2"
                  value="Insecta"
                  name="observation_iconic_taxon_id"
                />
                <label for="Insecta2">Insecta</label>
              </div>
              <div class="form-group">
                <input
                  type="checkbox"
                  id="Plantae2"
                  value="Plantae"
                  name="observation_iconic_taxon_id"
                />
                <label for="Plantae2">Plantae</label>
              </div>
              <div class="form-group">
                <input
                  type="checkbox"
                  id="Fungi2"
                  value="Fungi"
                  name="observation_iconic_taxon_id"
                />
                <label for="Fungi2">Fungi</label>
              </div>
              <div class="form-group">
                <input
                  type="checkbox"
                  id="Protozoa2"
                  value="Protozoa"
                  name="observation_iconic_taxon_id"
                />
                <label for="Protozoa2">Protozoa</label>
              </div>
              <div class="form-group">
                <input
                  type="checkbox"
                  id="unknown2"
                  value="unknown"
                  name="observation_iconic_taxon_id"
                />
                <label for="unknown2">unknown</label>
              </div>
            </fieldset>
            <fieldset class="rank">
              <legend>Observations Rank</legend>
              <div class="form-group">
                <label for="observation_hrank">High Rank</label>
                <select
                  id="observation_hrank"
                  name="observation_hrank"
                ></select>
              </div>
              <div class="form-group">
                <label for="observation_lrank">Low Rank</label>
                <select
                  id="observation_lrank"
                  name="observation_lrank"
                ></select>
              </div>
            </fieldset>
            <fieldset class="observation-status">
              <legend>Observation Status</legend>

              <div class="form-group">
                <label for="quality_grade">Quality Grade</label>
                <select id="quality_grade" name="quality_grade">
                  <option></option>
                  <option value="research">Research Grade</option>
                  <option value="needs_id">Needs Id</option>
                  <option value="casual">Casual</option>
                </select>
              </div>
            </fieldset>
          </div>
        </div>
        <div class="controls">
          <button class="btn-primary" type="submit">Update Search</button>
          <button class="btn-danger" type="reset">Reset</button>
        </div>
      </form>
    </div>
  </dialog>
`;
