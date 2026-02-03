import { setupComponent } from "../../lib/component_utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import { initFilters, processFiltersForm } from "./utils";
import { template } from "./template";
import {
  renderSelectedFiltersList,
  updateAppWithFilters,
} from "../ObservationsFilters/shared_utils";
import { debounce } from "../../lib/utils";

class IdentificationsFilters extends HTMLElement {
  constructor() {
    super();
  }

  formEl: null | HTMLFormElement = null;
  dialogEl: null | HTMLDialogElement = null;
  showModalButtonEl: null | HTMLButtonElement = null;
  closeModalButtonEl: null | HTMLButtonElement = null;

  connectedCallback() {
    loggerRender("++ IdentificationsFilters connectedCallback");
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

    window.addEventListener("storePopulated", this);
    window.addEventListener("navResourceChange", this);
    window.addEventListener("popstateAfter", this);
    window.addEventListener("switchMenu", this);
  }

  disconnectedCallback() {
    loggerRender("++ IdentificationsFilters disconnectedCallback");

    this.formEl?.removeEventListener("input", this);
    this.formEl?.removeEventListener("reset", this);
    this.dialogEl?.removeEventListener("click", this);
    this.closeModalButtonEl?.removeEventListener("click", this);
    this.showModalButtonEl?.removeEventListener("click", this);

    window.removeEventListener("storePopulated", this);
    window.removeEventListener("navResourceChange", this);
    window.removeEventListener("popstateAfter", this);
    window.removeEventListener("switchMenu", this);
  }

  handleEvent(event: Event) {
    let target = event.target as HTMLInputElement;
    if (target === null) return;
    if (!this.formEl) return;
    if (!this.dialogEl) return;

    loggerEvent(`[IdentificationsFilters event] ${event.type}`);

    // wait for storePopulated event to render filters because there are some
    // fields that need info from iNat API
    let events = [
      "navResourceChange",
      "storePopulated",
      "popstateAfter",
      "switchMenu",
    ];
    if (events.includes(event.type)) {
      this.render();
    }

    if (event.type === "input") {
      this.formChangeHandlerDebounced(event, this.formEl);
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
    let tempTarget = target as unknown as HTMLDialogElement;
    if (event.type === "click" && tempTarget === this.dialogEl) {
      this.dialogEl.close();
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

  async render() {
    loggerRender("++ IdentificationsFilters render");

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
}

customElements.define("identifications-filters", IdentificationsFilters);
