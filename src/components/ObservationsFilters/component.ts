import { setupComponent } from "../../lib/component_utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import {
  setupUnobservedByUserSearch,
  unobservedByUserSelectedHandler,
} from "../../lib/search_unobserved";
import { searchSetup } from "../../lib/search_utils";
import {
  initFilters,
  updateAppWithFilters,
  renderLicenseSelect,
  renderRankSelect,
  renderYearsSelect,
  processFiltersForm,
  setTermId,
} from "./utils";
import { template } from "./template";
import { renderSelectedFiltersList, tabClickHandler } from "./shared_utils";
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

    this.formEl?.addEventListener("input", this);
    this.formEl?.addEventListener("reset", this);
    window.addEventListener("navResourceChange", this);
    window.addEventListener("storePopulated", this);
    this.querySelectorAll(".nav-link").forEach((el) => {
      el.addEventListener("click", this);
    });
  }

  disconnectedCallback() {
    loggerRender("++ ObservationFilters disconnectedCallback");

    this.formEl?.removeEventListener("input", this);
    this.formEl?.removeEventListener("reset", this);
    window.removeEventListener("navResourceChange", this);
    window.removeEventListener("storePopulated", this);
    this.querySelectorAll(".nav-link").forEach((el) => {
      el.removeEventListener("click", this);
    });
  }

  handleEvent(event: Event) {
    let target = event.target as HTMLInputElement;
    if (!target) return;

    let events = ["navResourceChange", "storePopulated"];
    if (events.includes(event.type)) {
      loggerEvent(`++ ObservationFilters ${event.type}`);

      this.render();
    }

    if (
      event.type === "click" &&
      target.className.split(" ").includes("nav-link")
    ) {
      tabClickHandler(target, this);
    }

    if (this.formEl) {
      if (event.type === "input") {
        // use formChangeHandler to clear user; use autocomplete to add user
        if (target.id === "unobserved-by-user-search") {
          if (target.value === "") {
            this.formChangeHandler(event, this.formEl);
          }
          // use formChangeHandler to clear user; use autocomplete to add user
        } else if (target.id === "reviewer-search") {
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
  }

  async render() {
    loggerRender("++ ObservationFilters render");

    this.renderModal();
    this.renderForm();

    setupUnobservedByUserSearch("#unobserved-by-user-search", window.app.store);
    searchSetup("#unobserved-by-user-search", unobservedByUserSelectedHandler);

    setupReviewerSearch("#reviewer-search", window.app.store);
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

  renderForm() {
    renderRankSelect("#hrank", "");
    renderRankSelect("#lrank", "");
    renderYearsSelect("#year");
    renderYearsSelect("#created_year");
    renderLicenseSelect("#license", "All");
    renderLicenseSelect("#photo_license", "All");
    renderLicenseSelect("#sound_license", "All");
  }

  async formChangeHandler(event: Event, form: HTMLFormElement) {
    event.preventDefault();

    let target = event.target as HTMLInputElement;
    setTermId(target, this);

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
