import { circleX } from "../../assets/icons";
import { html } from "../../lib/component_utils";
import { identificationsHeaderLinks } from "../IdentificationsHeader/template";
import { renderRankOptions } from "../ObservationsFilters/shared_utils";

export const template = html`
  <button id="filters-btn" class="btn-primary">Filters</button>
  <span class="filters-count"></span>

  <dialog class="filters-modal">
    <div class="modal-header">
      ${identificationsHeaderLinks}
      <div><button class="close-btn btn-primary">${circleX}</button></div>
    </div>

    <div class="modal-body">
      <ol class="filters-list"></ol>

      <form id="filters-form">
        <div class="fields">
          <!-- column 1 -->
          <div>
            <fieldset class="date-observed">
              <legend>Date Observed</legend>

              <div class="form-group">
                <label for="observed_d1"
                  >Start Date
                  <app-tooltip
                    data-id="tp-observed_d1"
                    data-content="?"
                    data-tooltip="Observation observed on or after this date"
                  ></app-tooltip>
                </label>
                <input type="date" name="observed_d1" id="observed_d1" />
              </div>
              <div class="form-group">
                <label for="observed_d2"
                  >End Date
                  <app-tooltip
                    data-id="tp-observed_d2"
                    data-content="?"
                    data-tooltip="Observation observed on or before this date"
                  ></app-tooltip>
                </label>
                <input type="date" name="observed_d2" id="observed_d2" />
              </div>
            </fieldset>
            <fieldset class="iconic_taxa">
              <legend>Observation Categories</legend>
              <div class="iconic_taxa_list">
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="Aves2"
                    value="3"
                    name="observation_iconic_taxon_id"
                  />
                  <label for="Aves2">Aves</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="Amphibia2"
                    value="20978"
                    name="observation_iconic_taxon_id"
                  />
                  <label for="Amphibia2">Amphibia</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="Reptilia2"
                    value="26036"
                    name="observation_iconic_taxon_id"
                  />
                  <label for="Reptilia2">Reptilia</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="Mammalia2"
                    value="40151"
                    name="observation_iconic_taxon_id"
                  />
                  <label for="Mammalia2">Mammalia</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="Actinopterygii2"
                    value="47178"
                    name="observation_iconic_taxon_id"
                  />
                  <label for="Actinopterygii2">Actinopterygii</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="Mollusca2"
                    value="47115"
                    name="observation_iconic_taxon_id"
                  />
                  <label for="Mollusca2">Mollusca</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="Arachnida2"
                    value="47119"
                    name="observation_iconic_taxon_id"
                  />
                  <label for="Arachnida2">Arachnida</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="Insecta2"
                    value="47158"
                    name="observation_iconic_taxon_id"
                  />
                  <label for="Insecta2">Insecta</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="Plantae2"
                    value="47126"
                    name="observation_iconic_taxon_id"
                  />
                  <label for="Plantae2">Plantae</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="Fungi2"
                    value="47170"
                    name="observation_iconic_taxon_id"
                  />
                  <label for="Fungi2">Fungi</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="Protozoa2"
                    value="47686"
                    name="observation_iconic_taxon_id"
                  />
                  <label for="Protozoa2">Protozoa</label>
                </div>
              </div>
            </fieldset>
            <fieldset class="rank">
              <legend>Observations Rank</legend>
              <div class="form-group">
                <label for="observation_hrank"
                  >High Rank
                  <app-tooltip
                    data-id="tp-observation_hrank"
                    data-content="?"
                    data-tooltip="Observation taxon must have this rank or lower"
                  ></app-tooltip>
                </label>
                <select id="observation_hrank" name="observation_hrank">
                  ${renderRankOptions("All")}
                </select>
              </div>
              <div class="form-group">
                <label for="observation_lrank"
                  >Low Rank
                  <app-tooltip
                    data-id="tp-observation_lrank"
                    data-content="?"
                    data-tooltip="Observation taxon must have this rank or higher"
                  ></app-tooltip>
                </label>
                <select id="observation_lrank" name="observation_lrank">
                  ${renderRankOptions("All")}
                </select>
              </div>
            </fieldset>
            <fieldset class="observation-status">
              <legend>Observation Status</legend>

              <div class="form-group">
                <label for="quality_grade"
                  >Quality Grade
                  <app-tooltip
                    data-id="tp-quality_grade"
                    data-content="?"
                    data-tooltip="Observation must have this quality grade"
                  ></app-tooltip>
                </label>
                <select id="quality_grade" name="quality_grade">
                  <option></option>
                  <option value="research">Research Grade</option>
                  <option value="needs_id">Needs Id</option>
                  <option value="casual">Casual</option>
                </select>
              </div>
            </fieldset>
          </div>
          <!-- column 1 -->
          <div>
            <fieldset class="date-observed">
              <legend>Date Identified</legend>
              <div class="form-group">
                <label for="d1"
                  >Start Date
                  <app-tooltip
                    data-id="tp-d1"
                    data-content="?"
                    data-tooltip="Identifications created on or after this time"
                  ></app-tooltip>
                </label>
                <input type="date" name="d1" id="d1" />
              </div>
              <div class="form-group">
                <label for="d2"
                  >End Date
                  <app-tooltip
                    data-id="tp-d2"
                    data-content="?"
                    data-tooltip="Identifications created on or before this time"
                  ></app-tooltip>
                </label>
                <input type="date" name="d2" id="d2" />
              </div>
            </fieldset>
            <fieldset class="iconic_taxa">
              <legend>Identification Categories</legend>
              <div class="iconic_taxa_list">
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="Aves"
                    value="3"
                    name="iconic_taxon_id"
                  />
                  <label for="Aves">Aves</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="Amphibia"
                    value="20978"
                    name="iconic_taxon_id"
                  />
                  <label for="Amphibia">Amphibia</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="Reptilia"
                    value="26036"
                    name="iconic_taxon_id"
                  />
                  <label for="Reptilia">Reptilia</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="Mammalia"
                    value="40151"
                    name="iconic_taxon_id"
                  />
                  <label for="Mammalia">Mammalia</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="Actinopterygii"
                    value="47178"
                    name="iconic_taxon_id"
                  />
                  <label for="Actinopterygii">Actinopterygii</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="Mollusca"
                    value="47115"
                    name="iconic_taxon_id"
                  />
                  <label for="Mollusca">Mollusca</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="Arachnida"
                    value="47119"
                    name="iconic_taxon_id"
                  />
                  <label for="Arachnida">Arachnida</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="Insecta"
                    value="47158"
                    name="iconic_taxon_id"
                  />
                  <label for="Insecta">Insecta</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="Plantae"
                    value="47126"
                    name="iconic_taxon_id"
                  />
                  <label for="Plantae">Plantae</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="Fungi"
                    value="47170"
                    name="iconic_taxon_id"
                  />
                  <label for="Fungi">Fungi</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="Protozoa"
                    value="47686"
                    name="iconic_taxon_id"
                  />
                  <label for="Protozoa">Protozoa</label>
                </div>
              </div>
            </fieldset>
            <fieldset class="rank">
              <legend>Identification Rank</legend>
              <div class="form-group">
                <label for="hrank"
                  >High Rank
                  <app-tooltip
                    data-id="tp-hrank"
                    data-content="?"
                    data-tooltip="Identifications taxon must have this rank or lower"
                  ></app-tooltip>
                </label>
                <select id="hrank" name="hrank">
                  ${renderRankOptions("All")}
                </select>
              </div>
              <div class="form-group">
                <label for="lrank"
                  >Low Rank
                  <app-tooltip
                    data-id="tp-lrank"
                    data-content="?"
                    data-tooltip="Identifications taxon must have this rank or higher"
                  ></app-tooltip>
                </label>
                <select id="lrank" name="lrank">
                  ${renderRankOptions("All")}
                </select>
              </div>
            </fieldset>
          </div>
        </div>
        <div class="controls">
          <button class="btn-danger" type="reset">Reset</button>
        </div>
      </form>
    </div>
  </dialog>
`;
