import { setupComponent } from "../../lib/component_utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import {
  setupUnobservedByUserSearch,
  unobservedByUserSelectedHandler,
} from "../../lib/search_unobserved";
import { searchSetup } from "../../lib/search_utils";
import { initFilters, processFiltersForm } from "./utils";
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

class ObservationFilters extends HTMLElement {
  constructor() {
    super();
  }

  formEl: null | HTMLFormElement = null;
  dialogEl: null | HTMLDialogElement = null;
  showModalButtonEl: null | HTMLButtonElement = null;
  closeModalButtonEl: null | HTMLButtonElement = null;

  connectedCallback() {
    loggerRender("++ ObservationFilters connectedCallback");
    setupComponent(template, this);

    this.formEl = this.querySelector("#filters-form") as HTMLFormElement;
    this.dialogEl = this.querySelector<HTMLDialogElement>(".filters-modal");
    this.showModalButtonEl = this.querySelector("#filters-btn");
    this.closeModalButtonEl = this.querySelector("dialog .close-btn");

    this.formEl?.addEventListener("input", this);
    this.formEl?.addEventListener("reset", this);
    this.dialogEl?.addEventListener("click", this);
    this.closeModalButtonEl?.addEventListener("click", this);
    this.showModalButtonEl?.addEventListener("click", this);

    this.querySelectorAll(".nav-link").forEach((el) => {
      el.addEventListener("click", this);
    });
    this.querySelectorAll('[name="term_id"]').forEach((el) => {
      el.addEventListener("click", this);
    });
    this.querySelectorAll('[name="without_term_id"]').forEach((el) => {
      el.addEventListener("click", this);
    });

    window.addEventListener("storePopulated", this);
    window.addEventListener("navResourceChange", this);
    window.addEventListener("popstateAfter", this);
    window.addEventListener("switchMenu", this);
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
    this.querySelectorAll('[name="term_id"]').forEach((el) => {
      el.removeEventListener("click", this);
    });
    this.querySelectorAll('[name="without_term_id"]').forEach((el) => {
      el.removeEventListener("click", this);
    });

    window.removeEventListener("storePopulated", this);
    window.removeEventListener("navResourceChange", this);
    window.removeEventListener("popstateAfter", this);
    window.removeEventListener("switchMenu", this);
  }

  handleEvent(event: Event) {
    let target = event.target as HTMLInputElement;
    if (!target) return;
    if (!this.formEl) return;
    if (!this.dialogEl) return;

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

    // change tabs
    if (
      event.type === "click" &&
      target.className.split(" ").includes("nav-link")
    ) {
      tabClickHandler(target, this);
    }

    // disable/enable related term values select when term_id is checled
    if (event.type === "click" && target.name === "term_id") {
      let selectEl = this.querySelector<HTMLSelectElement>(
        `select[data-related-term-id="${target.value}"]`,
      );
      if (selectEl) {
        selectEl.disabled = !selectEl.disabled;
      }
    }

    // iNat API only allows one without_term_id
    if (event.type === "click" && target.name === "without_term_id") {
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
          // disable previously selected related term values
          let oldSelectEl = this.querySelector<HTMLSelectElement>(
            `select[data-related-without-term-id="${oldInputEl.value}"]`,
          );
          if (oldSelectEl) {
            oldSelectEl.disabled = true;
          }
        }
        // enable related term values select
        selectEl.disabled = false;
      } else {
        // disable related term values select
        selectEl.disabled = true;
      }
    }

    if (event.type === "input") {
      // use formChangeHandler to clear input; use autocomplete to select record
      let searches = ["unobserved-by-user-search", "reviewer-search"];
      if (searches.includes(target.id)) {
        if (target.value === "") {
          this.formChangeHandlerDebounced(event, this.formEl);
        }
        // use formChangeHandler to add and clear other fields
      } else {
        this.formChangeHandlerDebounced(event, this.formEl);
      }
    }

    if (event.type === "reset") {
      this.resetFormHandler(this.formEl);
    }

    if (event.type === "click" && target === this.showModalButtonEl) {
      this.dialogEl.showModal();
    }

    if (event.type === "click" && target === this.closeModalButtonEl) {
      this.dialogEl.close();
    }

    // close dialog if click ouside of dialog
    // https://stackoverflow.com/a/73988585
    if (
      event.type === "click" &&
      (target as unknown as HTMLDialogElement) === this.dialogEl
    ) {
      this.dialogEl.close();
    }
  }

  async render() {
    loggerRender("++ ObservationFilters render");

    setupUnobservedByUserSearch("#unobserved-by-user-search");
    searchSetup("#unobserved-by-user-search", unobservedByUserSelectedHandler);

    setupReviewerSearch("#reviewer-search");
    searchSetup("#reviewer-search", reviewerSelectedHandler);

    // use store to set values the form on page load
    initFilters(window.app.store);

    // show list of selected filters
    let formEl = this.querySelector("#filters-form") as HTMLFormElement;
    if (formEl) {
      const data = new FormData(formEl);
      let results = processFiltersForm(data);
      renderSelectedFiltersList(results.params);
    }
  }

  async formChangeHandler(event: Event, form: HTMLFormElement) {
    event.preventDefault();

    const data = new FormData(form);
    await updateAppWithFilters(data, window.app.store);
  }

  formChangeHandlerDebounced = debounce(this.formChangeHandler);

  resetFormHandler(form: HTMLFormElement) {
    // HACK: use setTimeout to add new event that has access to resetted form
    setTimeout(async () => {
      let data = new FormData(form);
      await updateAppWithFilters(data, window.app.store);
    }, 0);
  }
}

customElements.define("observations-filters", ObservationFilters);
