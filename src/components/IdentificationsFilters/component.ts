import { setupComponent } from "../../lib/component_utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import { initFilters, updateAppWithFilters, processFiltersForm } from "./utils";
import { template } from "./template";
import { renderSelectedFiltersList } from "../ObservationsFilters/shared_utils";

class IdentificationsFilters extends HTMLElement {
  constructor() {
    super();
  }

  formEl: null | HTMLFormElement = null;

  connectedCallback() {
    loggerRender("++ IdentificationsFilters connectedCallback");
    setupComponent(template, this);
    this.formEl = this.querySelector("#filters-form") as HTMLFormElement;

    this.formEl?.addEventListener("input", this);
    this.formEl?.addEventListener("reset", this);
    window.addEventListener("storePopulated", this);
    window.addEventListener("navResourceChange", this);
  }

  disconnectedCallback() {
    loggerRender("++ IdentificationsFilters disconnectedCallback");

    this.formEl?.removeEventListener("input", this);
    this.formEl?.removeEventListener("reset", this);
    window.removeEventListener("storePopulated", this);
    window.removeEventListener("navResourceChange", this);
  }

  handleEvent(event: Event) {
    let target = event.target as HTMLInputElement;
    if (target === null) return;

    let events = ["navResourceChange", "storePopulated"];
    if (events.includes(event.type)) {
      loggerEvent(`++ IdentificationsFilters ${event.type}`);

      this.render();
    }
    if (this.formEl) {
      if (event.type === "input") {
        this.formChangeHandler(event, this.formEl);
      }

      if (event.type === "reset") {
        this.resetFormHandler(this.formEl);
      }
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

  async render() {
    loggerRender("++ IdentificationsFilters render");

    this.renderModal();

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

  formEventHandler() {
    const form = document.querySelector("#filters-form") as HTMLFormElement;

    if (form) {
      form.addEventListener("input", async (event) => {
        let target = event.target as HTMLInputElement;
        if (target === null) return;

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

customElements.define("identifications-filters", IdentificationsFilters);
