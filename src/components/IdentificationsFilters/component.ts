import { setupComponent } from "../../lib/component_utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import {
  initFilters,
  updateAppWithFilters,
  renderRankSelect,
  renderSelectedFiltersList,
} from "./utils";
import { template } from "./template";

class IdentificationsFilters extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ IdentificationsFilters connectedCallback");

    window.addEventListener("storePopulated", this);
    window.addEventListener("navResourceChange", this);
  }

  disconnectedCallback() {
    loggerRender("++ IdentificationsFilters disconnectedCallback");

    window.removeEventListener("storePopulated", this);
    window.removeEventListener("navResourceChange", this);
  }

  handleEvent(event: Event) {
    let events = ["navResourceChange", "storePopulated"];
    if (events.includes(event.type)) {
      loggerEvent(`++ IdentificationsFilters ${event.type}`);

      this.render();
    }
  }

  async render() {
    loggerRender("++ IdentificationsFilters render");

    setupComponent(template, this);

    this.renderModal();
    this.renderForm();
    this.formEventHandler();

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
    renderRankSelect("#observation_hrank", "");
    renderRankSelect("#observation_lrank", "");
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
