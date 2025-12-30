import { circleX } from "../../assets/icons";
import { html } from "../../lib/component_utils";
import { observationsHeaderLinks } from "../ObservationsHeader/template";
import {
  renderLicenseOptions,
  renderRankOptions,
  renderYearsOptions,
} from "./shared_utils";

let datePane = html`<div
  class="tab-pane"
  id="date-pane"
  role="tabpanel"
  aria-labelledby="date-tab"
>
  <div>
    <fieldset class="date-observed">
      <legend>Date Observed</legend>
      <div class="form-group">
        <label for="on"
          >Exact Date
          <div class="tp-wrapper">
            <span class="tp-trigger" aria-describedby="tp-on">?</span>
            <p id="tp-on" role="tooltip">Observed on this date</p>
          </div>
        </label>
        <input type="date" name="on" id="on" />
      </div>

      <div class="form-group range-start">
        <label for="d1"
          >Start Date
          <div class="tp-wrapper">
            <span class="tp-trigger" aria-describedby="tp-on">?</span>
            <p id="tp-on" role="tooltip">Observed on or after this date</p>
          </div>
        </label>
        <input type="date" name="d1" id="d1" />
      </div>

      <div class="form-group range-end">
        <label for="d2"
          >End Date
          <div class="tp-wrapper">
            <span class="tp-trigger" aria-describedby="tp-d2">?</span>
            <p id="tp-d2" role="tooltip">Observed on or before this date</p>
          </div>
        </label>
        <input type="date" name="d2" id="d2" />
      </div>

      <div class="form-group multiselect">
        <label for="month"
          >Months
          <div class="tp-wrapper">
            <span class="tp-trigger" aria-describedby="tp-month">?</span>
            <p id="tp-month" role="tooltip">Observed within this month</p>
          </div>
        </label>
        <select name="month" id="month" multiple>
          <option value="">All</option>
          <option value="1">Janurary</option>
          <option value="2">February</option>
          <option value="3">March</option>
          <option value="4">April</option>
          <option value="5">May</option>
          <option value="6">June</option>
          <option value="7">July</option>
          <option value="8">August</option>
          <option value="9">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>
      </div>

      <div class="form-group multiselect">
        <label for="year"
          >Years
          <div class="tp-wrapper">
            <span class="tp-trigger" aria-describedby="tp-year">?</span>
            <p id="tp-year" role="tooltip">Observed within this year</p>
          </div>
        </label>
        <select name="year" id="year" multiple>
          ${renderYearsOptions("All")}
        </select>
      </div>
    </fieldset>
  </div>
  <div>
    <fieldset class="date-added">
      <legend>Date Added</legend>
      <div class="form-group">
        <label for="created_on"
          >Exact Date
          <div class="tp-wrapper">
            <span class="tp-trigger" aria-describedby="tp-created_on">?</span>
            <p id="tp-created_on" role="tooltip">Created on this date</p>
          </div>
        </label>
        <input type="date" name="created_on" id="created_on" />
      </div>
      <div class="form-group">
        <div class="form-group range-created-start">
          <label for="created_d1"
            >Start Date
            <div class="tp-wrapper">
              <span class="tp-trigger" aria-describedby="tp-created_d1">?</span>
              <p id="tp-created_d1" role="tooltip">
                Created at or after this time
              </p>
            </div>
          </label>
          <input type="date" name="created_d1" id="created_d1" />
        </div>
        <div class="form-group range-created-end">
          <label for="created_d2"
            >End Date
            <div class="tp-wrapper">
              <span class="tp-trigger" aria-describedby="tp-created_d2">?</span>
              <p id="tp-created_d2" role="tooltip">
                Created at or before this time
              </p>
            </div>
          </label>
          <input type="date" name="created_d2" id="created_d2" />
        </div>
      </div>
      <div class="form-group multiselect">
        <label for="created_month"
          >Months
          <div class="tp-wrapper">
            <span class="tp-trigger" aria-describedby="tp-created_month"
              >?</span
            >
            <p id="tp-created_month" role="tooltip">
              Created within this month
            </p>
          </div>
        </label>
        <select name="created_month" id="created_month" multiple>
          <option value="">All</option>
          <option value="1">Janurary</option>
          <option value="2">February</option>
          <option value="3">March</option>
          <option value="4">April</option>
          <option value="5">May</option>
          <option value="6">June</option>
          <option value="7">July</option>
          <option value="8">August</option>
          <option value="9">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>
      </div>

      <div class="form-group multiselect">
        <label for="created_year"
          >Years
          <div class="tp-wrapper">
            <span class="tp-trigger" aria-describedby="tp-created_year">?</span>
            <p id="tp-created_year" role="tooltip">Created within this year</p>
          </div>
        </label>
        <select name="created_year" id="created_year" multiple>
          ${renderYearsOptions("All")}
        </select>
      </div>
    </fieldset>
  </div>
</div>`;

let observationPane = html`<div
  class="tab-pane active"
  id="observations-pane"
  role="tabpanel"
  aria-labelledby="observations-tab"
>
  <!--column 1-->
  <div>
    <fieldset class="observation-status">
      <legend>Observation Status</legend>
      <div class="form-group">
        <label for="verifiable">
          Verifiable
          <div class="tp-wrapper">
            <span class="tp-trigger" aria-describedby="tp-verifiable">?</span>
            <p id="tp-verifiable" role="tooltip">
              Observations with a quality_grade of either needs_id or research.
              Equivalent to quality_grade=needs_id,research.
            </p>
          </div>
        </label>
        <select id="verifiable" name="verifiable">
          <option></option>
          <option value="true" selected>True</option>
          <option value="false">False</option>
        </select>
      </div>
      <div class="form-group">
        <label for="captive"
          >Captive
          <div class="tp-wrapper">
            <span class="tp-trigger" aria-describedby="tp-captive">?</span>
            <p id="tp-captive" role="tooltip">
              Captive or cultivated observations
            </p>
          </div>
        </label>
        <select id="captive" name="captive">
          <option></option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      </div>

      <div class="form-group multiselect">
        <label for="quality_grade"
          >Quality Grade
          <div class="tp-wrapper">
            <span class="tp-trigger" aria-describedby="tp-quality_grade"
              >?</span
            >
            <p id="tp-quality_grade" role="tooltip">
              Observations have this quality grade
            </p>
          </div>
        </label>
        <select id="quality_grade" name="quality_grade" multiple>
          <option value="">All</option>
          <option value="research">Research Grade</option>
          <option value="needs_id">Needs Id</option>
          <option value="casual">Casual</option>
        </select>
      </div>

      <div class="form-group">
        <label for="popular"
          >Popular
          <div class="tp-wrapper">
            <span class="tp-trigger" aria-describedby="tp-popular">?</span>
            <p id="tp-popular" role="tooltip">
              Observations that have been favorited by at least one user
            </p>
          </div>
        </label>
        <select id="popular" name="popular">
          <option></option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      </div>
    </fieldset>

    <fieldset>
      <legend>Identification Status</legend>
      <div class="form-group">
        <label for="identified"
          >Identified
          <div class="tp-wrapper">
            <span class="tp-trigger" aria-describedby="tp-identified">?</span>
            <p id="tp-identified" role="tooltip">
              Observations that have community identifications
            </p>
          </div>
        </label>
        <select id="identified" name="identified">
          <option></option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      </div>
      <div class="form-group">
        <label for="reviewed"
          >Reviewed
          <div class="tp-wrapper">
            <span class="tp-trigger" aria-describedby="tp-reviewed">?</span>
            <p id="tp-reviewed" role="tooltip">
              Observations have been reviewed by the user selected next.
            </p>
          </div>
        </label>
        <select id="reviewed" name="reviewed">
          <option></option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      </div>
      <div class="form-group">
        <label for="reviewer-search"
          >Reviewer
          <div class="tp-wrapper">
            <span class="tp-trigger" aria-describedby="tp-viewer_id">?</span>
            <p id="tp-viewer_id" role="tooltip">
              Observations have been reviewed by this user.
            </p>
          </div>
        </label>
        <input
          name="viewer_id"
          id="reviewer-search"
          type="text"
          autocomplete="off"
        />
      </div>
    </fieldset>
  </div>
  <!--column 2-->
  <div>
    <fieldset class="users">
      <legend>Users</legend>

      <div class="form-group">
        <label for="user_after"
          >Recent accounts created
          <div class="tp-wrapper">
            <span class="tp-trigger" aria-describedby="tp-user_after">?</span>
            <p id="tp-user_after" role="tooltip">
              Account created within or after this time
            </p>
          </div>
        </label>
        <select id="user_after" name="user_after">
          <option value=""></option>
          <option value="1w">1 week ago</option>
          <option value="4w">4 weeks/1 month ago</option>
          <option value="52w">52 weeks/1 year ago</option>
        </select>
      </div>
      <div class="form-group">
        <label for="user_before"
          >Accounts older than
          <div class="tp-wrapper">
            <span class="tp-trigger" aria-describedby="tp-user_before">?</span>
            <p id="tp-user_before" role="tooltip">
              Account created before this time
            </p>
          </div>
        </label>
        <select id="user_before" name="user_before">
          <option value=""></option>
          <option value="1w">1 week</option>
          <option value="4w">4 weeks/1 month</option>
          <option value="52w">52 weeks/1 year</option>
        </select>
      </div>

      <div class="form-group">
        <label for="unobserved-by-user-search"
          >Unobserved by user
          <div class="tp-wrapper">
            <span class="tp-trigger" aria-describedby="tp-unobserved_by_user_id"
              >?</span
            >
            <p id="tp-unobserved_by_user_id" role="tooltip">
              Observations with taxon not previously observed by this user
            </p>
          </div>
        </label>
        <input
          name="unobserved_by_user_id"
          id="unobserved-by-user-search"
          type="text"
          autocomplete="off"
        />
      </div>
    </fieldset>

    <fieldset>
      <legend>Misc</legend>
      <div class="form-group">
        <label for="q"
          >Description/Tags
          <div class="tp-wrapper">
            <span class="tp-trigger" aria-describedby="tp-q">?</span>
            <p id="tp-q" role="tooltip">Search observation properties</p>
          </div>
        </label>
        <input id="q" name="q" placeholder="Enter search terms" />
      </div>

      <div class="form-group">
        <label for="list_id"
          >List ID
          <div class="tp-wrapper">
            <span class="tp-trigger" aria-describedby="tp-list_id">?</span>
            <p id="tp-list_id" role="tooltip">
              Taxon must be in the list with this ID
            </p>
          </div>
        </label>
        <input id="list_id" name="list_id" placeholder="Enter list ID" />
      </div>

      <div class="form-group">
        <label for="not-in-project-search"
          >Not in project
          <div class="tp-wrapper">
            <span class="tp-trigger" aria-describedby="tp-not_in_project"
              >?</span
            >
            <p id="tp-not_in_project" role="tooltip">
              Observations must not be in this project
            </p>
          </div>
        </label>
        <input
          name="not_in_project"
          id="not-in-project-search"
          type="text"
          autocomplete="off"
        />
      </div>
    </fieldset>
  </div>

  <!--column 3-->
  <div>
    <fieldset class="media">
      <legend>Media</legend>
      <div class="form-group">
        <label for="sounds"
          >Has Sounds
          <div class="tp-wrapper">
            <span class="tp-trigger" aria-describedby="tp-sounds">?</span>
            <p id="tp-sounds" role="tooltip">Observations with sounds</p>
          </div>
        </label>
        <select id="sounds" name="sounds">
          <option></option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      </div>
      <div class="form-group">
        <label for="photos"
          >Has Photos
          <div class="tp-wrapper">
            <span class="tp-trigger" aria-describedby="tp-photos">?</span>
            <p id="tp-photos" role="tooltip">Observations with photos</p>
          </div>
        </label>
        <select id="photos" name="photos">
          <option></option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      </div>
    </fieldset>
    <fieldset class="licensing">
      <legend>Licensing</legend>
      <div class="form-group multiselect">
        <label for="license"
          >License
          <div class="tp-wrapper">
            <span class="tp-trigger" aria-describedby="tp-license">?</span>
            <p id="tp-license" role="tooltip">Observation have this license</p>
          </div>
        </label>
        <select id="license" name="license" multiple>
          ${renderLicenseOptions("All")}
        </select>
      </div>
      <div class="form-group multiselect">
        <label for="photo_license"
          >Photo License
          <div class="tp-wrapper">
            <span class="tp-trigger" aria-describedby="tp-photo_license"
              >?</span
            >
            <p id="tp-photo_license" role="tooltip">
              Observations have at least one photo with this license
            </p>
          </div>
        </label>
        <select id="photo_license" name="photo_license" multiple>
          ${renderLicenseOptions("All")}
        </select>
      </div>
      <div class="form-group multiselect">
        <label for="sound_license"
          >Sound License
          <div class="tp-wrapper">
            <span class="tp-trigger" aria-describedby="tp-xxx">?</span>
            <p id="tp-xxx" role="tooltip">
              Observations have at least one sound with this license
            </p>
          </div>
        </label>
        <select id="sound_license" name="sound_license" multiple>
          ${renderLicenseOptions("All")}
        </select>
      </div>
    </fieldset>
  </div>
</div>`;

const speciesPane = html`
  <div
    class="tab-pane"
    id="species-pane"
    role="tabpanel"
    aria-labelledby="species-tab"
  >
    <fieldset class="species-status">
      <legend>Species Status</legend>
      <div class="form-group">
        <label for="threatened"
          >Threatened
          <div class="tp-wrapper">
            <span class="tp-trigger" aria-describedby="tp-threatened">?</span>
            <p id="tp-threatened" role="tooltip">
              Observations whose taxa are threatened in their location
            </p>
          </div>
        </label>
        <select id="threatened" name="threatened">
          <option></option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      </div>
      <div class="form-group">
        <label for="introduced"
          >Introduced
          <div class="tp-wrapper">
            <span class="tp-trigger" aria-describedby="tp-introduced">?</span>
            <p id="tp-introduced" role="tooltip">
              Observations whose taxa are introduced in their location
            </p>
          </div>
        </label>
        <select id="introduced" name="introduced">
          <option></option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      </div>
      <div class="form-group">
        <label for="native"
          >Native
          <div class="tp-wrapper">
            <span class="tp-trigger" aria-describedby="tp-native">?</span>
            <p id="tp-native" role="tooltip">
              Observations whose taxa are native to their location
            </p>
          </div>
        </label>
        <select id="native" name="native">
          <option></option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      </div>
      <div class="form-group">
        <label for="endemic"
          >Endemic
          <div class="tp-wrapper">
            <span class="tp-trigger" aria-describedby="tp-endemic">?</span>
            <p id="tp-endemic" role="tooltip">
              Observations whose taxa are endemic to their location
            </p>
          </div>
        </label>
        <select id="endemic" name="endemic">
          <option></option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      </div>
    </fieldset>
    <fieldset class="iconic_taxa">
      <legend>Categories</legend>
      <div class="iconic_taxa_list">
        <div class="form-group">
          <input type="checkbox" id="Aves" value="Aves" name="iconic_taxa" />
          <label for="Aves">Aves </label>
        </div>
        <div class="form-group">
          <input
            type="checkbox"
            id="Amphibia"
            value="Amphibia"
            name="iconic_taxa"
          />
          <label for="Amphibia">Amphibia </label>
        </div>
        <div class="form-group">
          <input
            type="checkbox"
            id="Reptilia"
            value="Reptilia"
            name="iconic_taxa"
          />
          <label for="Reptilia">Reptilia </label>
        </div>
        <div class="form-group">
          <input
            type="checkbox"
            id="Mammalia"
            value="Mammalia"
            name="iconic_taxa"
          />
          <label for="Mammalia">Mammalia </label>
        </div>
        <div class="form-group">
          <input
            type="checkbox"
            id="Actinopterygii"
            value="Actinopterygii"
            name="iconic_taxa"
          />
          <label for="Actinopterygii">Actinopterygii </label>
        </div>
        <div class="form-group">
          <input
            type="checkbox"
            id="Mollusca"
            value="Mollusca"
            name="iconic_taxa"
          />
          <label for="Mollusca">Mollusca </label>
        </div>

        <div class="form-group">
          <input
            type="checkbox"
            id="Arachnida"
            value="Arachnida"
            name="iconic_taxa"
          />
          <label for="Arachnida">Arachnida </label>
        </div>
        <div class="form-group">
          <input
            type="checkbox"
            id="Insecta"
            value="Insecta"
            name="iconic_taxa"
          />
          <label for="Insecta">Insecta </label>
        </div>
        <div class="form-group">
          <input
            type="checkbox"
            id="Plantae"
            value="Plantae"
            name="iconic_taxa"
          />
          <label for="Plantae">Plantae </label>
        </div>
        <div class="form-group">
          <input type="checkbox" id="Fungi" value="Fungi" name="iconic_taxa" />
          <label for="Fungi">Fungi </label>
        </div>
        <div class="form-group">
          <input
            type="checkbox"
            id="Protozoa"
            value="Protozoa"
            name="iconic_taxa"
          />
          <label for="Protozoa">Protozoa </label>
        </div>
        <div class="form-group">
          <input
            type="checkbox"
            id="unknown"
            value="unknown"
            name="iconic_taxa"
          />
          <label for="unknown">Unknown </label>
        </div>
      </div>
    </fieldset>
    <fieldset class="rank">
      <legend>Rank</legend>
      <div class="form-group">
        <label for="hrank"
          >High Rank
          <div class="tp-wrapper">
            <span class="tp-trigger" aria-describedby="tp-hrank">?</span>
            <p id="tp-hrank" role="tooltip">
              Taxon must have this rank or lower
            </p>
          </div>
        </label>
        <select id="hrank" name="hrank">
          ${renderRankOptions("All")}
        </select>
      </div>
      <div class="form-group">
        <label for="lrank"
          >Low Rank
          <div class="tp-wrapper">
            <span class="tp-trigger" aria-describedby="tp-lrank">?</span>
            <p id="tp-lrank" role="tooltip">
              Taxon must have this rank or higher
            </p>
          </div>
        </label>
        <select id="lrank" name="lrank">
          ${renderRankOptions("All")}
        </select>
      </div>
    </fieldset>
  </div>
`;

const annotationPane = html` <div
  class="tab-pane"
  id="annotations-pane"
  role="tabpanel"
  aria-labelledby="annotations-tab"
>
  <fieldset>
    <legend>General</legend>

    <input type="text" name="term_id" id="term_id" hidden />

    <div class="form-group">
      <label for="sex">Sex </label>
      <select id="sex" name="term_value_id" data-termId="9" multiple>
        <option value="">Any</option>
        <option value="10">Female</option>
        <option value="11">Male</option>
      </select>
    </div>
    <div class="form-group">
      <label for="alive_dead">Alive or Dead </label>
      <select id="alive_dead" name="term_value_id" data-termId="17" multiple>
        <option value="">Any</option>
        <option value="18">Alive</option>
        <option value="19">Dead</option>
      </select>
    </div>
    <div class="form-group">
      <label for="established">Established </label>
      <select id="established" name="term_value_id" data-termId="33" multiple>
        <option value="">Any</option>
        <option value="34">Not Established</option>
      </select>
    </div>
  </fieldset>

  <fieldset>
    <legend>Plants</legend>
    <div class="form-group">
      <label for="flowers">Flowers and Fruits </label>
      <select id="flowers" name="term_value_id" data-termId="12" multiple>
        <option value="">Any</option>
        <option value="13">Flowers</option>
        <option value="14">Fruits or Seeds</option>
        <option value="15">Flower Buds</option>
        <option value="21">No Flowers or Fruits</option>
      </select>
    </div>
    <div class="form-group">
      <label for="leaves">Leaves </label>
      <select id="leaves" name="term_value_id" data-termId="36" multiple>
        <option value="">Any</option>
        <option value="37">Breaking Leaf Buds</option>
        <option value="38">Green Leaves</option>
        <option value="39">Colored Leaves</option>
        <option value="40">No Live Leaves</option>
      </select>
    </div>
  </fieldset>
  <fieldset>
    <legend>Animals</legend>
    <div class="form-group">
      <label for="life_stage">Life Stage </label>
      <select id="life_stage" name="term_value_id" data-termId="1" multiple>
        <option value="">Any</option>
        <option value="2">Adult</option>
        <option value="3">Teneral</option>
        <option value="4">Pupa</option>
        <option value="5">Nymph</option>
        <option value="6">Larva</option>
        <option value="7">Egg</option>
        <option value="8">Juvenile</option>
        <option value="16">Subimago</option>
      </select>
    </div>
    <div class="form-group">
      <label for="presence">Evidence of Presence </label>
      <select id="presence" name="term_value_id" data-termId="22" multiple>
        <option value="">Any</option>
        <option value="23">Feather</option>
        <option value="24">Organism</option>
        <option value="25">Scat</option>
        <option value="26">Track</option>
        <option value="27">Bone</option>
        <option value="28">Molt</option>
        <option value="29">Gall</option>
        <option value="30">Egg</option>
        <option value="31">Hair</option>
        <option value="32">Leafmine</option>
        <option value="35">Construction</option>
      </select>
    </div>
  </fieldset>
</div>`;

export const template = html`
  <button id="filters-btn" class="btn-primary">Filters</button>
  <span class="filters-count"></span>

  <dialog class="filters-modal">
    <div class="modal-header">
      ${observationsHeaderLinks}
      <div><button class="close-btn btn-primary">${circleX}</button></div>
    </div>

    <div class="modal-body">
      <ol class="filters-list"></ol>

      <ul class="nav-tabs" id="observations-filters-tab" role="tablist">
        <li class="nav-item" role="presentation">
          <button
            class="nav-link active"
            id="observations-tab"
            role="tab"
            aria-controls="observations-pane"
            aria-selected="true"
          >
            Observations
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            id="species-tab"
            role="tab"
            aria-controls="species-pane"
            aria-selected="false"
          >
            Species
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            id="date-tab"
            role="tab"
            aria-controls="date-pane"
            aria-selected="false"
          >
            Dates
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            id="annotations-tab"
            role="tab"
            aria-controls="annotations-pane"
            aria-selected="false"
          >
            Annotations
          </button>
        </li>
      </ul>

      <form id="filters-form">
        <div class="fields">
          <div class="tab-content" id="observations-filters-tab-content">
            ${observationPane} ${speciesPane}${datePane} ${annotationPane}
          </div>
        </div>
        <div class="controls">
          <button class="btn-danger" type="reset">Reset</button>
        </div>
      </form>
    </div>
  </dialog>
`;
