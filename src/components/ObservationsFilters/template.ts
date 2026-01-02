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
          <app-tooltip
            data-id="tp-on"
            data-content="?"
            data-tooltip="Observed on this date"
          ></app-tooltip>
        </label>
        <input type="date" name="on" id="on" />
      </div>

      <div class="form-group range-start">
        <label for="d1"
          >Start Date
          <app-tooltip
            data-id="tp-d1"
            data-content="?"
            data-tooltip="Observed on or after this date"
          ></app-tooltip>
        </label>
        <input type="date" name="d1" id="d1" />
      </div>

      <div class="form-group range-end">
        <label for="d2"
          >End Date
          <app-tooltip
            data-id="tp-d2"
            data-content="?"
            data-tooltip="Observed on or before this date"
          ></app-tooltip>
        </label>
        <input type="date" name="d2" id="d2" />
      </div>

      <div class="form-group multiselect">
        <label for="month"
          >Months
          <app-tooltip
            data-id="tp-month"
            data-content="?"
            data-tooltip="Observed within this month"
          ></app-tooltip>
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
          <app-tooltip
            data-id="tp-year"
            data-content="?"
            data-tooltip="Observed within this year"
          ></app-tooltip>
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
          <app-tooltip
            data-id="tp-created_on"
            data-content="?"
            data-tooltip="Created on this date"
          ></app-tooltip>
        </label>
        <input type="date" name="created_on" id="created_on" />
      </div>
      <div class="form-group">
        <div class="form-group range-created-start">
          <label for="created_d1"
            >Start Date
            <app-tooltip
              data-id="tp-created_d1"
              data-content="?"
              data-tooltip="Created at or after this time"
            ></app-tooltip>
          </label>
          <input type="date" name="created_d1" id="created_d1" />
        </div>
        <div class="form-group range-created-end">
          <label for="created_d2"
            >End Date
            <app-tooltip
              data-id="tp-created_d2"
              data-content="?"
              data-tooltip="Created at or before this time"
            ></app-tooltip>
          </label>
          <input type="date" name="created_d2" id="created_d2" />
        </div>
      </div>
      <div class="form-group multiselect">
        <label for="created_month"
          >Months
          <app-tooltip
            data-id="tp-created_month"
            data-content="?"
            data-tooltip="Created within this month"
          ></app-tooltip>
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
          <app-tooltip
            data-id="tp-created_year"
            data-content="?"
            data-tooltip="Created within this year"
          ></app-tooltip>
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
          <app-tooltip
            data-id="tp-verifiable"
            data-content="?"
            data-tooltip="Observations with a quality_grade of either needs_id or research.
            Equivalent to quality_grade=needs_id,research."
          ></app-tooltip>
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
          <app-tooltip
            data-id="tp-captive"
            data-content="?"
            data-tooltip="Captive or cultivated observations"
          ></app-tooltip>
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
          <app-tooltip
            data-id="tp-quality_grade"
            data-content="?"
            data-tooltip="Observations have this quality grade"
          ></app-tooltip>
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
          <app-tooltip
            data-id="tp-popular"
            data-content="?"
            data-tooltip="Observations that have been favorited by at least one user"
          ></app-tooltip>
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
          <app-tooltip
            data-id="tp-identified"
            data-content="?"
            data-tooltip="Observations that have community identifications"
          ></app-tooltip>
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
          <app-tooltip
            data-id="tp-reviewed"
            data-content="?"
            data-tooltip="Observations have been reviewed by the user selected next"
          ></app-tooltip>
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
          <app-tooltip
            data-id="tp-viewer_id"
            data-content="?"
            data-tooltip="Observations have been reviewed by this user"
          ></app-tooltip>
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
          <app-tooltip
            data-id="tp-user_after"
            data-content="?"
            data-tooltip="Account created within or after this time"
          ></app-tooltip>
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
          <app-tooltip
            data-id="tp-user_before"
            data-content="?"
            data-tooltip="Account created before this time"
          ></app-tooltip>
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
          <app-tooltip
            data-id="tp-unobserved_by_user_id"
            data-content="?"
            data-tooltip="Observations with taxon not previously observed by this user"
          ></app-tooltip>
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
          <app-tooltip
            data-id="tp-q"
            data-content="?"
            data-tooltip="Search observation properties"
          ></app-tooltip>
        </label>
        <input id="q" name="q" placeholder="Enter search terms" />
      </div>

      <div class="form-group">
        <label for="list_id"
          >List ID
          <app-tooltip
            data-id="tp-list_id"
            data-content="?"
            data-tooltip="Taxon must be in the list with this ID"
          ></app-tooltip>
        </label>
        <input id="list_id" name="list_id" placeholder="Enter list ID" />
      </div>

      <div class="form-group">
        <label for="not-in-project-search"
          >Not in project
          <app-tooltip
            data-id="tp-not_in_project"
            data-content="?"
            data-tooltip="Observations must not be in this project"
          ></app-tooltip>
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
          <app-tooltip
            data-id="tp-sounds"
            data-content="?"
            data-tooltip="Observations with sounds"
          ></app-tooltip>
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
          <app-tooltip
            data-id="tp-photos"
            data-content="?"
            data-tooltip="Observations with photos"
          ></app-tooltip>
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
          <app-tooltip
            data-id="tp-license"
            data-content="?"
            data-tooltip="Observation have this license"
          ></app-tooltip>
        </label>
        <select id="license" name="license" multiple>
          ${renderLicenseOptions("All")}
        </select>
      </div>
      <div class="form-group multiselect">
        <label for="photo_license"
          >Photo License
          <app-tooltip
            data-id="tp-photo_license"
            data-content="?"
            data-tooltip="Observations have at least one photo with this license"
          ></app-tooltip>
        </label>
        <select id="photo_license" name="photo_license" multiple>
          ${renderLicenseOptions("All")}
        </select>
      </div>
      <div class="form-group multiselect">
        <label for="sound_license"
          >Sound License
          <app-tooltip
            data-id="tp-sound_license"
            data-content="?"
            data-tooltip="Observations have at least one sound with this license"
          ></app-tooltip>
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
          <app-tooltip
            data-id="tp-threatened"
            data-content="?"
            data-tooltip="Observations whose taxa are threatened in their location"
          ></app-tooltip>
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
          <app-tooltip
            data-id="tp-introduced"
            data-content="?"
            data-tooltip="Observations whose taxa are introduced in their location"
          ></app-tooltip>
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
          <app-tooltip
            data-id="tp-native"
            data-content="?"
            data-tooltip="Observations whose taxa are native to their location"
          ></app-tooltip>
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
          <app-tooltip
            data-id="tp-endemic"
            data-content="?"
            data-tooltip="Observations whose taxa are endemic to their location"
          ></app-tooltip>
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
          <app-tooltip
            data-id="tp-hrank"
            data-content="?"
            data-tooltip="Taxon must have this rank or lower"
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
            data-tooltip="Taxon must have this rank or higher"
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
            data-tooltip="Taxon must have this rank"
          ></app-tooltip>
        </label>
        <select id="rank" name="rank" multiple>
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
