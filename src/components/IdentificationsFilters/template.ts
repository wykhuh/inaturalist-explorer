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
                    id="observation_iconic_taxon_id_3"
                    value="3"
                    name="observation_iconic_taxon_id"
                  />
                  <label for="observation_iconic_taxon_id_3">Aves</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="observation_iconic_taxon_id_20978"
                    value="20978"
                    name="observation_iconic_taxon_id"
                  />
                  <label for="observation_iconic_taxon_id_20978"
                    >Amphibia</label
                  >
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="observation_iconic_taxon_id_26036"
                    value="26036"
                    name="observation_iconic_taxon_id"
                  />
                  <label for="observation_iconic_taxon_id_26036"
                    >Reptilia</label
                  >
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="observation_iconic_taxon_id_40151"
                    value="40151"
                    name="observation_iconic_taxon_id"
                  />
                  <label for="observation_iconic_taxon_id_40151"
                    >Mammalia</label
                  >
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="observation_iconic_taxon_id_47178"
                    value="47178"
                    name="observation_iconic_taxon_id"
                  />
                  <label for="observation_iconic_taxon_id_47178"
                    >Actinopterygii</label
                  >
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="observation_iconic_taxon_id_47115"
                    value="47115"
                    name="observation_iconic_taxon_id"
                  />
                  <label for="observation_iconic_taxon_id_47115"
                    >Mollusca</label
                  >
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="observation_iconic_taxon_id_47119"
                    value="47119"
                    name="observation_iconic_taxon_id"
                  />
                  <label for="observation_iconic_taxon_id_47119"
                    >Arachnida</label
                  >
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="observation_iconic_taxon_id_47158"
                    value="47158"
                    name="observation_iconic_taxon_id"
                  />
                  <label for="observation_iconic_taxon_id_47158">Insecta</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="observation_iconic_taxon_id_47126"
                    value="47126"
                    name="observation_iconic_taxon_id"
                  />
                  <label for="observation_iconic_taxon_id_47126">Plantae</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="observation_iconic_taxon_id_47170"
                    value="47170"
                    name="observation_iconic_taxon_id"
                  />
                  <label for="observation_iconic_taxon_id_47170">Fungi</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="observation_iconic_taxon_id_47686"
                    value="47686"
                    name="observation_iconic_taxon_id"
                  />
                  <label for="observation_iconic_taxon_id_47686"
                    >Protozoa</label
                  >
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
              <div class="form-group">
                <label for="observation_rank"
                  >Rank
                  <app-tooltip
                    data-id="tp-observation_rank"
                    data-content="?"
                    data-tooltip="Observations taxon must have this rank"
                  ></app-tooltip>
                </label>
                <select id="observation_rank" name="observation_rank" multiple>
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
                <select id="quality_grade" name="quality_grade" multiple>
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
                    id="iconic_taxon_id_3"
                    value="3"
                    name="iconic_taxon_id"
                  />
                  <label for="iconic_taxon_id_3">Aves</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="iconic_taxon_id_20978"
                    value="20978"
                    name="iconic_taxon_id"
                  />
                  <label for="iconic_taxon_id_20978">Amphibia</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="iconic_taxon_id_26036"
                    value="26036"
                    name="iconic_taxon_id"
                  />
                  <label for="iconic_taxon_id_26036">Reptilia</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="iconic_taxon_id_40151"
                    value="40151"
                    name="iconic_taxon_id"
                  />
                  <label for="iconic_taxon_id_40151">Mammalia</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="iconic_taxon_id_47178"
                    value="47178"
                    name="iconic_taxon_id"
                  />
                  <label for="iconic_taxon_id_47178">Actinopterygii</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="iconic_taxon_id_47115"
                    value="47115"
                    name="iconic_taxon_id"
                  />
                  <label for="iconic_taxon_id_47115">Mollusca</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="iconic_taxon_id_47119"
                    value="47119"
                    name="iconic_taxon_id"
                  />
                  <label for="iconic_taxon_id_47119">Arachnida</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="iconic_taxon_id_47158"
                    value="47158"
                    name="iconic_taxon_id"
                  />
                  <label for="iconic_taxon_id_47158">Insecta</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="iconic_taxon_id_47126"
                    value="47126"
                    name="iconic_taxon_id"
                  />
                  <label for="iconic_taxon_id_47126">Plantae</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="iconic_taxon_id_47170"
                    value="47170"
                    name="iconic_taxon_id"
                  />
                  <label for="iconic_taxon_id_47170">Fungi</label>
                </div>
                <div class="form-group">
                  <input
                    type="checkbox"
                    id="iconic_taxon_id_47686"
                    value="47686"
                    name="iconic_taxon_id"
                  />
                  <label for="iconic_taxon_id_47686">Protozoa</label>
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
              <div class="form-group">
                <label for="rank"
                  >Rank
                  <app-tooltip
                    data-id="tp-rank"
                    data-content="?"
                    data-tooltip="Identifications taxon must have this rank"
                  ></app-tooltip>
                </label>
                <select id="rank" name="rank" multiple>
                  ${renderRankOptions("All")}
                </select>
              </div>
            </fieldset>

            <fieldset class="identification-status">
              <legend>Identification Status</legend>

              <div class="form-group">
                <label for="category"
                  >Category
                  <app-tooltip
                    data-id="tp-category"
                    data-content="?"
                    data-tooltip="Type of identification"
                  ></app-tooltip>
                </label>
                <select id="category" name="category" multiple>
                  <option></option>
                  <option value="improving">Improving</option>
                  <option value="supporting">Supporting</option>
                  <option value="leading">Leading</option>
                  <option value="maverick">Maverick</option>
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
