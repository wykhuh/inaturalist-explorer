import { setupComponent } from "../../lib/component_utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import {
  setupUnobservedByUserSearch,
  unobservedByUserSelectedHandler,
} from "../../lib/search_unobserved";
import { searchSetup } from "../../lib/search_utils";
import {
  createOrUpdateObservationFieldInput,
  initFilters,
  processFiltersForm,
} from "./utils";
import { template } from "./template";
import {
  renderSelectedFiltersList,
  tabClickHandler,
  updateAppWithFilters,
} from "./shared_utils";
import {
  reviewerSelectedHandler,
  setupReviewerSearch,
} from "../../lib/search_reviewer";
import { debounce } from "../../lib/utils";
import {
  observationFieldSelectedHandler,
  setupObservationFieldsSearch,
} from "../../lib/search_observation_fields";
import {
  observationFieldsTaxonSelectedHandler,
  setupObservationFieldsTaxonSearch,
} from "../../lib/search_observation_fields_taxon";

class ObservationFilters extends HTMLElement {
  constructor() {
    super();
  }

  formEl: null | HTMLFormElement = null;
  dialogEl: null | HTMLDialogElement = null;
  showModalButtonEl: null | HTMLButtonElement = null;
  closeModalButtonEl: null | HTMLButtonElement = null;
  observationFieldValueEl: null | HTMLInputElement = null;
  observationFieldSearchTaxonEl: null | HTMLInputElement = null;

  connectedCallback() {
    loggerRender("++ ObservationFilters connectedCallback");
    setupComponent(template, this);

    this.formEl = this.querySelector("#filters-form") as HTMLFormElement;
    this.dialogEl = this.querySelector<HTMLDialogElement>(".filters-modal");
    this.showModalButtonEl = this.querySelector("#filters-btn");
    this.closeModalButtonEl = this.querySelector("dialog .close-btn");
    this.observationFieldValueEl = this.querySelector(
      "#observation-fields-search-value",
    );
    this.observationFieldSearchTaxonEl = this.querySelector(
      "#observation-fields-search-taxon",
    );

    this.formEl?.addEventListener("input", this);
    this.formEl?.addEventListener("reset", this);
    this.dialogEl?.addEventListener("click", this);
    this.closeModalButtonEl?.addEventListener("click", this);
    this.showModalButtonEl?.addEventListener("click", this);

    this.querySelectorAll(".nav-link").forEach((el) => {
      el.addEventListener("click", this);
    });

    window.addEventListener("storePopulated", this);
    window.addEventListener("navResourceChange", this);
    window.addEventListener("popstateAfter", this);
    window.addEventListener("switchMenu", this);
    window.addEventListener("observationFieldSelected", this);
    window.addEventListener("observationFieldTaxonSelected", this);
  }

  disconnectedCallback() {
    loggerRender("++ ObservationFilters disconnectedCallback");

    this.formEl?.removeEventListener("input", this);
    this.formEl?.removeEventListener("reset", this);
    this.dialogEl?.removeEventListener("click", this);
    this.closeModalButtonEl?.removeEventListener("click", this);
    this.showModalButtonEl?.removeEventListener("click", this);

    this.querySelectorAll(".nav-link").forEach((el) => {
      el.removeEventListener("click", this);
    });

    window.removeEventListener("storePopulated", this);
    window.removeEventListener("navResourceChange", this);
    window.removeEventListener("popstateAfter", this);
    window.removeEventListener("switchMenu", this);
    window.removeEventListener("observationFieldSelected", this);
    window.removeEventListener("observationFieldTaxonSelected", this);
  }

  handleEvent(event: Event) {
    let target = event.target as HTMLInputElement;
    if (!target) return;
    if (!this.formEl) return;
    if (!this.dialogEl) return;
    if (!this.observationFieldValueEl) return;

    loggerEvent(`[ObservationFilters event] ${event.type}`);
    // this component is loaded before the store is populated when app is
    // initialized. The app waits for storePopulated before calling render
    // because the form needs data from the store to set the fields values.
    let events = [
      "navResourceChange",
      "storePopulated",
      "popstateAfter",
      "switchMenu",
    ];
    if (events.includes(event.type)) {
      this.render();
    }

    if (event.type === "click") {
      if (target === this.showModalButtonEl) {
        // show dialog
        this.dialogEl.showModal();
      } else if (target === this.closeModalButtonEl) {
        // hide dialog
        this.dialogEl.close();
      } else if ((target as unknown as HTMLDialogElement) === this.dialogEl) {
        // hide dialog if click ouside of dialog
        // https://stackoverflow.com/a/73988585
        this.dialogEl.close();
      } else if (target.className.split(" ").includes("nav-link")) {
        // change tab
        tabClickHandler(target, this);
      } else if (target.name === "term_id") {
        // disable/enable related term values select when term_id is checled
        let selectEl = this.querySelector<HTMLSelectElement>(
          `select[data-related-term-id="${target.value}"]`,
        );
        if (selectEl) {
          selectEl.disabled = !selectEl.disabled;
        }
      } else if (target.name === "without_term_id") {
        // iNat API only allows one without_term_id
        let selectEl = this.querySelector<HTMLSelectElement>(
          `select[data-related-without-term-id="${target.value}"]`,
        );
        if (!selectEl) return;

        if (target.checked) {
          // uncheck previously checked without_term_id
          // document.querySelector("[name='without_term_id']:not(#without_sex):checked")
          let oldInputEl = this.querySelector<HTMLInputElement>(
            `[name='without_term_id']:not(#${target.id}):checked`,
          );
          if (oldInputEl) {
            oldInputEl.checked = false;
          }
        }
      }
    }

    if (event.type === "input") {
      // use formChangeHandler to clear search input; use autocomplete to select record
      let searches = [
        "unobserved-by-user-search",
        "reviewer-search",
        "observation-fields-search",
      ];
      if (searches.includes(target.id)) {
        if (target.value === "") {
          this.formChangeHandlerDebounced(event, this.formEl);
        }
        // use formChangeHandler to add and clear non-search fields
      } else {
        this.formChangeHandlerDebounced(event, this.formEl);
      }

      // disable and clear observation field value when observation field is empty
      if (target.id === "observation-fields-search" && target.value === "") {
        this.observationFieldValueEl.disabled = true;
        this.observationFieldValueEl.value = "";
      }
    }

    if (event.type === "reset") {
      this.resetFormHandler(this.formEl);
    }

    if (event.type === "observationFieldSelected") {
      this.updateObservationFieldValueInput(event as CustomEvent);
    }

    if (event.type === "observationFieldTaxonSelected") {
      createOrUpdateObservationFieldInput(
        (event as CustomEvent).detail.currentObsField,
        (event as CustomEvent).detail.selection.id,
        this.formEl,
      );
    }
  }

  async render() {
    if (!this.formEl) return;

    loggerRender("++ ObservationFilters render");

    // autocompltet searches
    setupUnobservedByUserSearch("#unobserved-by-user-search");
    searchSetup("#unobserved-by-user-search", unobservedByUserSelectedHandler);

    setupReviewerSearch("#reviewer-search");
    searchSetup("#reviewer-search", reviewerSelectedHandler);

    setupObservationFieldsSearch("#observation-fields-search");
    searchSetup("#observation-fields-search", observationFieldSelectedHandler);

    setupObservationFieldsTaxonSearch(
      "#observation-fields-search-taxon",
      window.app.store,
    );
    searchSetup(
      "#observation-fields-search-taxon",
      observationFieldsTaxonSelectedHandler,
    );

    // use store to set values the form on page load
    initFilters(window.app.store, this.formEl);

    // show list of selected filters
    const data = new FormData(this.formEl);
    let results = processFiltersForm(data);
    renderSelectedFiltersList(results.params);
  }

  updateObservationFieldValueInput(event: CustomEvent) {
    if (!this.formEl) return;
    if (!this.observationFieldSearchTaxonEl) return;
    if (!this.observationFieldValueEl) return;

    if (event.detail.selection.datatype === "taxon") {
      this.observationFieldValueEl.hidden = true;
      this.observationFieldValueEl.disabled = true;

      this.observationFieldSearchTaxonEl.hidden = false;
      this.observationFieldSearchTaxonEl.disabled = false;
    } else {
      this.observationFieldValueEl.hidden = false;
      this.observationFieldValueEl.disabled = false;

      this.observationFieldSearchTaxonEl.hidden = true;
      this.observationFieldSearchTaxonEl.disabled = true;
    }

    this.observationFieldValueEl.value = "";
    this.observationFieldSearchTaxonEl.value = "";

    this.observationFieldValueEl.dataset.current_obs_field = `field:${event.detail.selection.name}`;
    this.observationFieldSearchTaxonEl.dataset.current_obs_field = `field:${event.detail.selection.name}`;

    createOrUpdateObservationFieldInput(
      `field:${event.detail.selection.name}`,
      "",
      this.formEl,
    );
  }

  async formChangeHandler(event: Event, form: HTMLFormElement) {
    event.preventDefault();

    const data = new FormData(form);
    let target = event.target as HTMLInputElement;
    if (target.id === "observation-fields-search-value") {
      let field = target.dataset.current_obs_field;
      if (!field) return;
      let value = target.value;
      // create input
      createOrUpdateObservationFieldInput(field, value, form);
      // manually set form data since input might not be created when
      // updateAppWithFilters is executed
      data.set(field, value);
    }
    await updateAppWithFilters(data, window.app.store);
  }

  formChangeHandlerDebounced = debounce(this.formChangeHandler);

  resetFormHandler(form: HTMLFormElement) {
    // remove hidden observation field inputs
    form.querySelectorAll('[name^="field:"]').forEach((el) => el.remove());

    // HACK: use setTimeout to add new event that has access to resetted form
    setTimeout(async () => {
      let data = new FormData(form);
      await updateAppWithFilters(data, window.app.store);
    }, 0);
  }
}

customElements.define("observations-filters", ObservationFilters);
