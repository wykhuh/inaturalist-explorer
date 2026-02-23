import { circleX } from "../../assets/icons";
import { html } from "../../lib/component_utils";
import { observationsHeaderLinks } from "../ObservationsHeader/template";
import {
  renderDaysOptions,
  renderGeoprivacyOptions,
  renderHoursOptions,
  renderLicenseOptions,
  renderObscurationOptions,
  renderRankOptions,
  renderYearsOptions,
  renderTrueFalseSelect,
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
            data-tooltip="on: Observed on this date"
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
            data-tooltip="d1: Observed on or after this date"
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
            data-tooltip="d2: Observed on or before this date"
          ></app-tooltip>
        </label>
        <input type="date" name="d2" id="d2" />
      </div>

      <div class="form-group">
        <label for="hour"
          >Hours
          <app-tooltip
            data-id="tp-hour"
            data-content="?"
            data-tooltip="hour: Observed within this hour of the day"
          ></app-tooltip>
        </label>
        <select name="hour" id="hour" multiple>
          ${renderHoursOptions("All")}
        </select>
      </div>

      <div class="form-group">
        <label for="day"
          >Days
          <app-tooltip
            data-id="tp-day"
            data-content="?"
            data-tooltip="day: Observed within this day of the month"
          ></app-tooltip>
        </label>
        <select name="day" id="day" multiple>
          ${renderDaysOptions("All")}
        </select>
      </div>

      <div class="form-group">
        <label for="month"
          >Months
          <app-tooltip
            data-id="tp-month"
            data-content="?"
            data-tooltip="month: Observed within this month"
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
            data-tooltip="year: Observed within this year"
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
            data-tooltip="created_on: Created on this date"
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
              data-tooltip="created_d1: Created at or after this time"
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
              data-tooltip="created_d2: Created at or before this time"
            ></app-tooltip>
          </label>
          <input type="date" name="created_d2" id="created_d2" />
        </div>
      </div>
      <div class="form-group">
        <label for="created_day"
          >Days
          <app-tooltip
            data-id="tp-created_day"
            data-content="?"
            data-tooltip="created_day: Created within this day of the month"
          ></app-tooltip>
        </label>
        <select name="created_day" id="created_day" multiple>
          ${renderDaysOptions("All")}
        </select>
      </div>
      <div class="form-group multiselect">
        <label for="created_month"
          >Months
          <app-tooltip
            data-id="tp-created_month"
            data-content="?"
            data-tooltip="created_month: Created within this month"
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
            data-tooltip="created_year: Created within this year"
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
            data-tooltip="verifiable: Observations with a quality_grade of either needs_id or research.
            Equivalent to quality_grade=needs_id,research."
          ></app-tooltip>
        </label>
        <!--do not use renderTrueFalseSelect since we want to set true as selected -->
        <select id="verifiable" name="verifiable">
          <option value="any"></option>
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
            data-tooltip="captive: Captive or cultivated observations"
          ></app-tooltip>
        </label>
        ${renderTrueFalseSelect("captive", "captive")}
      </div>

      <div class="form-group multiselect">
        <label for="quality_grade"
          >Quality Grade
          <app-tooltip
            data-id="tp-quality_grade"
            data-content="?"
            data-tooltip="quality_grade: Observations have this quality grade"
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
            data-tooltip="popular: Observations that have been favorited by at least one user"
          ></app-tooltip>
        </label>
        ${renderTrueFalseSelect("popular", "popular")}
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
            data-tooltip="identified: Observations that have community identifications"
          ></app-tooltip>
        </label>
        ${renderTrueFalseSelect("identified", "identified")}
      </div>
      <div class="form-group">
        <label for="reviewed"
          >Reviewed
          <app-tooltip
            data-id="tp-reviewed"
            data-content="?"
            data-tooltip="reviewed: Observations have been reviewed by the user selected next"
          ></app-tooltip>
        </label>
        ${renderTrueFalseSelect("reviewed", "reviewed")}
      </div>
      <div class="form-group">
        <label for="reviewer-search"
          >Reviewer
          <app-tooltip
            data-id="tp-viewer_id"
            data-content="?"
            data-tooltip="viewer_id: Observations have been reviewed by this user"
          ></app-tooltip>
        </label>
        <input
          name="viewer_id"
          id="reviewer-search"
          type="text"
          autocomplete="off"
        />
      </div>
      <div class="form-group">
        <label for="disagreements"
          >Disagreements
          <app-tooltip
            data-id="tp-disagreements"
            data-content="?"
            data-tooltip="disagreements: Observations that have community identifications disagreements"
          ></app-tooltip>
        </label>
        ${renderTrueFalseSelect("disagreements", "disagreements")}
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
            data-tooltip="user_after: Account created within or after this time"
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
            data-tooltip="user_before: Account created before this time"
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
            data-tooltip="unobserved_by_user_id: Observations with taxon not previously observed by this user"
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
      <legend>Geospatial</legend>
      <div class="form-group">
        <label for="geoprivacy"
          >Geoprivacy
          <app-tooltip
            data-id="tp-geoprivacy"
            data-content="?"
            data-tooltip="geoprivacy: Observations with this geoprivacy setting"
          ></app-tooltip
        ></label>
        <select name="geoprivacy" id="geoprivacy" multiple>
          ${renderGeoprivacyOptions("All")}
        </select>
      </div>

      <div class="form-group">
        <label for="taxon_geoprivacy"
          >Taxon Geoprivacy<app-tooltip
            data-id="tp-taxon_geoprivacy"
            data-content="?"
            data-tooltip="taxon_geoprivacy: Filter observations by the most conservative geoprivacy applied by a conservation status associated with one of the taxa proposed in the current identifications."
          ></app-tooltip
        ></label>
        <select name="taxon_geoprivacy" id="taxon_geoprivacy" multiple>
          ${renderGeoprivacyOptions("All")}
        </select>
      </div>

      <div class="form-group">
        <label for="obscuration"
          >Obscuration<app-tooltip
            data-id="tp-obscuration"
            data-content="?"
            data-tooltip="obscuration: Observations have geoprivacy or taxon_geoprivacy fields matching these values"
          ></app-tooltip
        ></label>
        <select name="obscuration" id="obscuration" multiple>
          ${renderObscurationOptions("All")}
        </select>
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
            data-tooltip="q: Search observation properties"
          ></app-tooltip>
        </label>
        <input id="q" name="q" type="text" placeholder="Enter search terms" />
      </div>

      <div class="form-group">
        <label for="list_id"
          >List ID
          <app-tooltip
            data-id="tp-list_id"
            data-content="?"
            data-tooltip="list_id: Taxon must be in the list with this ID"
          ></app-tooltip>
        </label>
        <input
          id="list_id"
          type="text"
          name="list_id"
          placeholder="Enter list ID"
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
            data-tooltip="sounds: Observations with sounds"
          ></app-tooltip>
        </label>
        ${renderTrueFalseSelect("sounds", "sounds")}
      </div>
      <div class="form-group">
        <label for="photos"
          >Has Photos
          <app-tooltip
            data-id="tp-photos"
            data-content="?"
            data-tooltip="photos: Observations with photos"
          ></app-tooltip>
        </label>
        ${renderTrueFalseSelect("photos", "photos")}
        <option value="cc0,cc-by,cc-by-nc">Accepted by GBIF</option>
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
            data-tooltip="license: Observation have this license"
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
            data-tooltip="photo_license: Observations have at least one photo with this license"
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
            data-tooltip="sound_license: Observations have at least one sound with this license"
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
            data-tooltip="threatened: Observations whose taxa are threatened in their location"
          ></app-tooltip>
        </label>
        ${renderTrueFalseSelect("threatened", "threatened")}
      </div>
      <div class="form-group">
        <label for="introduced"
          >Introduced
          <app-tooltip
            data-id="tp-introduced"
            data-content="?"
            data-tooltip="introduced: Observations whose taxa are introduced in their location"
          ></app-tooltip>
        </label>
        ${renderTrueFalseSelect("introduced", "introduced")}
      </div>
      <div class="form-group">
        <label for="native"
          >Native
          <app-tooltip
            data-id="tp-native"
            data-content="?"
            data-tooltip="native: Observations whose taxa are native to their location"
          ></app-tooltip>
        </label>
        ${renderTrueFalseSelect("native", "native")}
      </div>
      <div class="form-group">
        <label for="endemic"
          >Endemic
          <app-tooltip
            data-id="tp-endemic"
            data-content="?"
            data-tooltip="endemic: Observations whose taxa are endemic to their location"
          ></app-tooltip>
        </label>
        ${renderTrueFalseSelect("endemic", "endemic")}
      </div>
    </fieldset>
    <fieldset class="iconic_taxa">
      <legend>Iconic Taxa</legend>
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
            data-tooltip="hrank: Taxon must have this rank or lower"
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
            data-tooltip="lrank: Taxon must have this rank or higher"
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
            data-tooltip="rank: Taxon must have this rank"
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

    <div class="form-check mb-0">
      <input id="sex" value="9" name="term_id" type="checkbox" />
      <label for="sex">Sex</label>
    </div>
    <div class="form-group mt-0">
      <label for="sex_values" class="sr-only">Sex values</label>
      <select
        id="sex_values"
        data-related-term-id="9"
        name="term_value_id"
        multiple
        disabled
      >
        <option value="">Any</option>
        <option value="10">Female</option>
        <option value="11">Male</option>
        <option value="20">Cannot Be Determined</option>
      </select>
    </div>
    <div class="form-check mb-0">
      <input id="alive_dead" value="17" name="term_id" type="checkbox" />
      <label for="alive_dead">Alive or Dead</label>
    </div>
    <div class="form-group mt-0">
      <label for="alive_dead_values" class="sr-only"
        >Alive or Dead values</label
      >
      <select
        id="alive_dead_values"
        data-related-term-id="17"
        name="term_value_id"
        multiple
        disabled
      >
        <option value="">Any</option>
        <option value="18">Alive</option>
        <option value="19">Dead</option>
        <option value="20">Cannot Be Determined</option>
      </select>
    </div>
    <div class="form-check mb-0">
      <input id="established" value="33" name="term_id" type="checkbox" />
      <label for="established">Established</label>
    </div>
    <div class="form-group mt-0">
      <label for="established_values" class="sr-only">Established Values</label>
      <select
        id="established_values"
        data-related-term-id="33"
        name="term_value_id"
        multiple
        disabled
      >
        <option value="">Any</option>
        <option value="34">Not Established</option>
      </select>
    </div>
  </fieldset>
  <fieldset>
    <legend>Plants</legend>

    <div class="form-check mb-0">
      <input id="flowers" value="12" name="term_id" type="checkbox" />
      <label for="flowers">Flowers and Fruits</label>
    </div>
    <div class="form-group mt-0">
      <label for="flowers_values" class="sr-only"
        >Flowers and Fruits values</label
      >
      <select
        id="flowers_values"
        data-related-term-id="12"
        name="term_value_id"
        multiple
        disabled
      >
        <option value="">Any</option>
        <option value="13">Flowers</option>
        <option value="14">Fruits or Seeds</option>
        <option value="15">Flower Buds</option>
        <option value="21">No Flowers or Fruits</option>
      </select>
    </div>
    <div class="form-check mb-0">
      <input id="leaves" value="36" name="term_id" type="checkbox" />
      <label for="leaves">Leaves</label>
    </div>
    <div class="form-group mt-0">
      <label for="leaves_values" class="sr-only">Leaves values</label>
      <select
        id="leaves_values"
        data-related-term-id="36"
        name="term_value_id"
        multiple
        disabled
      >
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
    <div class="form-check mb-0">
      <input id="life_stage" value="1" name="term_id" type="checkbox" />
      <label for="life_stage">Life Stage</label>
    </div>
    <div class="form-group mt-0">
      <label for="life_stage_values" class="sr-only">Life Stage values</label>
      <select
        id="life_stage_values"
        data-related-term-id="1"
        name="term_value_id"
        multiple
        disabled
      >
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
    <div class="form-check mb-0">
      <input id="presence" value="22" name="term_id" type="checkbox" />
      <label for="presence">Evidence of Presence</label>
    </div>
    <div class="form-group mt-0">
      <label for="presence_values" class="sr-only"
        >Evidence of Presence values</label
      >
      <select
        id="presence_values"
        data-related-term-id="22"
        name="term_value_id"
        multiple
        disabled
      >
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

const withoutAnnotationPane = html` <div
  class="tab-pane"
  id="without-annotations-pane"
  role="tabpanel"
  aria-labelledby="without-annotations-tab"
>
  <fieldset>
    <legend>General</legend>

    <div class="form-check mb-0">
      <input
        id="without_sex"
        value="9"
        name="without_term_id"
        type="checkbox"
      />
      <label for="without_sex">without Sex</label>
    </div>
    <div class="form-group mt-0">
      <label for="without_sex_values" class="sr-only">without Sex values</label>
      <select
        id="without_sex_values"
        name="without_term_value_id"
        data-related-without-term-id="9"
        multiple
      >
        <option value="">Any</option>
        <option value="10">Female</option>
        <option value="11">Male</option>
      </select>
    </div>
    <div class="form-check mb-0">
      <input
        id="without_alive_dead"
        value="17"
        name="without_term_id"
        type="checkbox"
      />
      <label for="without_alive_dead">without Alive or Dead</label>
    </div>
    <div class="form-group mt-0">
      <label for="without_alive_dead_values" class="sr-only"
        >without Alive or Dead values</label
      >
      <select
        id="without_alive_dead_values"
        data-related-without-term-id="17"
        name="without_term_value_id"
        multiple
      >
        <option value="">Any</option>
        <option value="18">Alive</option>
        <option value="19">Dead</option>
      </select>
    </div>
    <div class="form-check mb-0">
      <input
        id="without_established"
        value="33"
        name="without_term_id"
        type="checkbox"
      />
      <label for="without_established">without Established</label>
    </div>
    <div class="form-group mt-0">
      <label for="without_established_values" class="sr-only"
        >without Established Values</label
      >
      <select
        id="without_established_values"
        data-related-without-term-id="33"
        name="without_term_value_id"
        multiple
      >
        <option value="">Any</option>
        <option value="34">Not Established</option>
      </select>
    </div>
  </fieldset>
  <fieldset>
    <legend>Plants</legend>

    <div class="form-check mb-0">
      <input
        id="without_flowers"
        value="12"
        name="without_term_id"
        type="checkbox"
      />
      <label for="without_flowers">without Flowers and Fruits</label>
    </div>
    <div class="form-group mt-0">
      <label for="without_flowers_values" class="sr-only"
        >without Flowers and Fruits values</label
      >
      <select
        id="without_flowers_values"
        data-related-without-term-id="12"
        name="without_term_value_id"
        multiple
      >
        <option value="">Any</option>
        <option value="13">Flowers</option>
        <option value="14">Fruits or Seeds</option>
        <option value="15">Flower Buds</option>
        <option value="21">No Flowers or Fruits</option>
      </select>
    </div>
    <div class="form-check mb-0">
      <input
        id="without_leaves"
        value="36"
        name="without_term_id"
        type="checkbox"
      />
      <label for="without_leaves">without Leaves</label>
    </div>
    <div class="form-group mt-0">
      <label for="without_leaves_values" class="sr-only"
        >without Leaves values</label
      >
      <select
        id="without_leaves_values"
        data-related-without-term-id="36"
        name="without_term_value_id"
        multiple
      >
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
    <div class="form-check mb-0">
      <input
        id="without_life_stage"
        value="1"
        name="without_term_id"
        type="checkbox"
      />
      <label for="without_life_stage">without Life Stage</label>
    </div>
    <div class="form-group mt-0">
      <label for="without_life_stage_values" class="sr-only"
        >without Life Stage value</label
      >
      <select
        id="without_life_stage_values"
        data-related-without-term-id="1"
        name="without_term_value_id"
        multiple
      >
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
    <div class="form-check mb-0">
      <input
        id="without_presence"
        value="22"
        name="without_term_id"
        type="checkbox"
      />
      <label for="without_presence">without Evidence of Presence</label>
    </div>
    <div class="form-group mt-0">
      <label for="without_presence_values" class="sr-only"
        >without Evidence of Presence values</label
      >
      <select
        id="without_presence_values"
        data-related-without-term-id="22"
        name="without_term_value_id"
        multiple
      >
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

let observationFieldsPane = html`<div
  class="tab-pane"
  id="observation-fields-pane"
  role="tabpanel"
  aria-labelledby="observation-fields-tab"
>
  <div>
    <fieldset class="date-observed">
      <legend>Observation Fields</legend>

      <div class="form-group">
        <label for="observation-fields-search"
          >Observation Field
          <app-tooltip
            data-id="tp-obfi_id"
            data-content="?"
            data-tooltip="field: Observation field"
          ></app-tooltip>
        </label>
        <input
          name="obfi_id"
          id="observation-fields-search"
          type="text"
          autocomplete="off"
        />
      </div>

      <div class="form-group">
        <label for="observation-fields-search-value"
          >Observation Field Value
          <app-tooltip
            data-id="tp-obfi_value_id"
            data-content="?"
            data-tooltip="field=: Value for observation field selected above"
          ></app-tooltip>
        </label>
        <input
          id="observation-fields-search-value"
          name="observation-fields-search-value"
          type="text"
          autocomplete="off"
          placeholder="Enter field value"
          disabled
        />
        <label for="observation-fields-search-taxon" class="sr-only"
          >Observation Field Taxon
        </label>
        <input
          name="obfita_id"
          id="observation-fields-search-taxon"
          type="text"
          autocomplete="off"
          disabled
          hidden
        />
      </div>
    </fieldset>
  </div>
  <div></div>
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
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            id="without-annotations-tab"
            role="tab"
            aria-controls="without-annotations-pane"
            aria-selected="false"
          >
            Without Annotations
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            id="observation-fields-tab"
            role="tab"
            aria-controls="observation-fields-pane"
            aria-selected="false"
          >
            Observation Fields
          </button>
        </li>
      </ul>

      <form id="filters-form">
        <div class="fields">
          <div class="tab-content" id="observations-filters-tab-content">
            ${observationPane} ${speciesPane}${datePane}
            ${annotationPane}${withoutAnnotationPane}${observationFieldsPane}
          </div>
        </div>
        <div class="controls">
          <button class="btn-danger" type="reset">Reset</button>
        </div>
      </form>
    </div>
  </dialog>
`;
