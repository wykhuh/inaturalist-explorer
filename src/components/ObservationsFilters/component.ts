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

class ObservationFilters extends HTMLElement {
  constructor() {
    super();
  }

  formEl: null | HTMLFormElement = null;

  connectedCallback() {
    loggerRender("++ ObservationFilters connectedCallback");
    setupComponent(template, this);
    this.formEl = this.querySelector("#filters-form") as HTMLFormElement;

    window.addEventListener("popstateAfter", this);
    this.formEl?.addEventListener("input", this);
    this.formEl?.addEventListener("reset", this);
    window.addEventListener("navResourceChange", this);
    window.addEventListener("storePopulated", this);
    this.querySelectorAll(".nav-link").forEach((el) => {
      el.addEventListener("click", this);
    });

    this.querySelectorAll('[name="term_id"]').forEach((el) => {
      el.addEventListener("click", this);
    });
    this.querySelectorAll('[name="without_term_id"]').forEach((el) => {
      el.addEventListener("click", this);
    });
  }

  disconnectedCallback() {
    loggerRender("++ ObservationFilters disconnectedCallback");

    window.removeEventListener("popstateAfter", this);
    this.formEl?.removeEventListener("input", this);
    this.formEl?.removeEventListener("reset", this);
    window.removeEventListener("navResourceChange", this);
    window.removeEventListener("storePopulated", this);
    this.querySelectorAll(".nav-link").forEach((el) => {
      el.removeEventListener("click", this);
    });

    this.querySelectorAll('[name="term_id"]').forEach((el) => {
      el.removeEventListener("click", this);
    });
    this.querySelectorAll('[name="without_term_id"]').forEach((el) => {
      el.removeEventListener("click", this);
    });
  }

  handleEvent(event: Event) {
    let target = event.target as HTMLInputElement;
    if (!target) return;
    if (!this.formEl) return;

    loggerEvent(`[ObservationFilters event] ${event.type}`);

    // wait for storePopulated event to render filters because there are some
    // fields that need info from iNat API
    let events = ["navResourceChange", "storePopulated", "popstateAfter"];
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
          this.formChangeHandler(event, this.formEl);
        }
        // use formChangeHandler to add and clear other fields
      } else {
        this.formChangeHandler(event, this.formEl);
      }
    }

    if (event.type === "reset") {
      this.resetFormHandler(this.formEl);
    }
  }

  async render() {
    loggerRender("++ ObservationFilters render");

    this.renderModal();

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

    // close dialog if click ouside of dialog
    // https://stackoverflow.com/a/73988585
    let dialogEl = this.querySelector(".filters-modal") as HTMLDialogElement;
    if (dialogEl) {
      dialogEl.addEventListener("click", (event) => {
        if (event.target === dialogEl) {
          dialogEl.close();
        }
      });
    }
  }

  async formChangeHandler(event: Event, form: HTMLFormElement) {
    event.preventDefault();

    const data = new FormData(form);
    await updateAppWithFilters(data, window.app.store);
  }

  resetFormHandler(form: HTMLFormElement) {
    // HACK: use setTimeout to add new event that has access to resetted form
    setTimeout(async () => {
      let data = new FormData(form);
      await updateAppWithFilters(data, window.app.store);
    }, 0);
  }

  renderModal() {
    const dialog = document.querySelector("dialog");
    const showButton = document.querySelector("#filters-btn");
    const closeButton = document.querySelector("dialog .close-btn");
    if (!dialog) return;
    if (!showButton) return;
    if (!closeButton) return;

    showButton.addEventListener("click", () => {
      dialog.showModal();
    });

    closeButton.addEventListener("click", () => {
      dialog.close();
    });
  }
}

customElements.define("observations-filters", ObservationFilters);
