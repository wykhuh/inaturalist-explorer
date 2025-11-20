import { setupComponent } from "../../lib/component_utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import {
  setupUnobservedByUserSearch,
  unobservedByUserSelectedHandler,
} from "../../lib/search_unobserved";
import {
  setupUserIdentifierSearch,
  userIdentifierSelectedHandler,
} from "../../lib/search_users_identifiers";
import { searchSetup } from "../../lib/search_utils";
import {
  initFilters,
  updateAppWithFilters,
  renderLicenseSelect,
  renderRankSelect,
  renderYearsSelect,
  renderSelectedFiltersList,
} from "./utils";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ IdentificationsFilters connectedCallback");

    this.render();
  }

  disconnectedCallback() {
    loggerRender("++ IdentificationsFilters disconnectedCallback");
  }

  async render() {
    loggerRender("++ IdentificationsFilters render");

    await setupComponent(
      "/src/components/IdentificationsFilters/template.html",
      this,
    );

    this.renderModal();
    this.renderForm();
    this.formEventHandler();
    renderYearsSelect();
    setupUnobservedByUserSearch("#unobserved-by-user-search", window.app.store);
    searchSetup("#unobserved-by-user-search", unobservedByUserSelectedHandler);
    setupUserIdentifierSearch("#identifier-search", window.app.store);
    searchSetup("#identifier-search", userIdentifierSelectedHandler);

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

    renderLicenseSelect("#license", "All");
    renderLicenseSelect("#photo_license", "All");
    renderLicenseSelect("#sound_license", "All");
  }

  formEventHandler() {
    const inputs = document.querySelectorAll(
      "#filters-form input",
    ) as NodeListOf<HTMLInputElement>;
    const form = document.querySelector("#filters-form") as HTMLFormElement;

    const onInput = document.querySelector(
      "#filters-form input[name='on']",
    ) as HTMLInputElement;
    const d1Input = document.querySelector(
      "#filters-form input[name='d1']",
    ) as HTMLInputElement;
    const d2Input = document.querySelector(
      "#filters-form input[name='d2']",
    ) as HTMLInputElement;
    const monthInput = document.querySelector(
      "#filters-form select[name='month']",
    ) as HTMLInputElement;
    const yearInput = document.querySelector(
      "#filters-form select[name='year']",
    ) as HTMLInputElement;

    inputs.forEach((input) => {
      input.addEventListener("change", (event) => {
        let target = event.target as HTMLInputElement;

        // disable/enable date inputs
        if (target.id === "any_date") {
          onInput.disabled = true;
          d1Input.disabled = true;
          d2Input.disabled = true;
          monthInput.disabled = true;
          yearInput.disabled = true;
        } else if (target.id === "exact_date") {
          onInput.disabled = false;
          d1Input.disabled = true;
          d2Input.disabled = true;
          monthInput.disabled = true;
          yearInput.disabled = true;
        } else if (target.id === "range_date") {
          onInput.disabled = true;
          d1Input.disabled = false;
          d2Input.disabled = false;
          monthInput.disabled = true;
          yearInput.disabled = true;
        } else if (target.id === "months_date") {
          onInput.disabled = true;
          d1Input.disabled = true;
          d2Input.disabled = true;
          monthInput.disabled = false;
          yearInput.disabled = true;
        } else if (target.id === "years_date") {
          onInput.disabled = true;
          d1Input.disabled = true;
          d2Input.disabled = true;
          monthInput.disabled = true;
          yearInput.disabled = false;
        }
      });
    });

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

customElements.define("x-identifications-filters", MyComponent);
