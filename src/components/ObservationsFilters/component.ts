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
  renderSelectedFiltersList,
} from "./utils";
import { template } from "./template";
import { tabClickHandler } from "./shared_utils";

class ObservationFilters extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ ObservationFilters connectedCallback");
    setupComponent(template, this);

    window.addEventListener("navResourceChange", this);
    window.addEventListener("storePopulated", this);

    this.querySelectorAll(".nav-link").forEach((el) => {
      el.addEventListener("click", this);
    });
  }

  disconnectedCallback() {
    loggerRender("++ ObservationFilters disconnectedCallback");

    window.removeEventListener("navResourceChange", this);
    window.removeEventListener("storePopulated", this);

    this.querySelectorAll(".nav-link").forEach((el) => {
      el.addEventListener("click", this);
    });
  }

  handleEvent(event: Event) {
    let target = event.target as HTMLHtmlElement;
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
  }

  async render() {
    loggerRender("++ ObservationFilters render");

    this.renderModal();
    this.renderForm();
    this.formEventHandler();

    setupUnobservedByUserSearch("#unobserved-by-user-search", window.app.store);
    searchSetup("#unobserved-by-user-search", unobservedByUserSelectedHandler);

    // use store to set values the form on page load
    initFilters(window.app.store);

    // show list of selected filters
    let formEl = this.querySelector("#filters-form") as HTMLFormElement;
    if (formEl) {
      const data = new FormData(formEl);
      renderSelectedFiltersList(data);
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

  formEventHandler() {
    const form = document.querySelector("#filters-form") as HTMLFormElement;

    if (form) {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const data = new FormData(form);
        await updateAppWithFilters(data, window.app.store);
      });

      form.addEventListener("input", async (event) => {
        let target = event.target as HTMLInputElement;
        if (target === null) return;
        // ignore changes to search autocomplete
        if (target.name === "ident_user_id") return;
        if (target.name === "unobserved_by_user_id") return;

        event.preventDefault();

        const data = new FormData(form);
        await updateAppWithFilters(data, window.app.store);
      });

      form.addEventListener("reset", () => {
        // HACK: use setTimeout to add new event that has access to resetted form
        setTimeout(async () => {
          let data = new FormData(form);
          await updateAppWithFilters(data, window.app.store);
        }, 0);
      });
    }
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
