import { setupComponent } from "../../lib/component_utils";
import { languageCodes } from "../../data/locale";
import type { ObservationViewsType } from "../../types/app";
import {
  initSettings,
  languageHandler,
  nameOrderHandler,
  perPageHandler,
} from "./utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import { template } from "./template";

class SettingsMenu extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ SettingsMenu connectedCallback");

    this.render();

    window.addEventListener("change", this);
    window.addEventListener("storePopulated", this);
  }

  disconnectCallback() {
    loggerRender("++ SettingsMenu disconnectCallback");

    window.removeEventListener("change", this);
    window.removeEventListener("storePopulated", this);
  }

  async handleEvent(event: Event) {
    let target = event.target as HTMLInputElement;
    if (!target) return;
    let view = window.app.store.currentView;
    if (!view) return;

    loggerEvent(`[SettingsMenu Event] ${target.id}`);

    if (event.type === "change") {
      this.changeHandler(target, view);
    } else if (event.type === "storePopulated") {
      initSettings(window.app.store, this);
    }
  }

  async changeHandler(target: HTMLInputElement, view: ObservationViewsType) {
    if (target.id === "language-select") {
      languageHandler(target, window.app.store);
    } else if (target.id === "name-order-select") {
      nameOrderHandler(target, window.app.store);
    } else if (target.id === "per-page-observations") {
      perPageHandler(target, view, window.app.store, "observations");
    } else if (target.id === "per-page-species") {
      perPageHandler(target, view, window.app.store, "species");
    } else if (target.id === "per-page-identifications") {
      perPageHandler(target, view, window.app.store, "identifications");
    }
  }

  async render() {
    loggerRender("++ SettingsMenu render");

    setupComponent(template, this);

    this.renderLanguageSelect();
    this.renderNameOrderSelect();
  }

  renderLanguageSelect() {
    let selectEl = this.querySelector("#language-select");
    if (!selectEl) return;

    languageCodes.forEach((lang) => {
      let optionEl = document.createElement("option");
      optionEl.value = lang.code;
      optionEl.textContent = lang.name;
      if (lang.code === window.app.store.observationsApiParams.locale) {
        optionEl.selected = true;
      }

      selectEl.appendChild(optionEl);
    });
  }

  renderNameOrderSelect() {
    let selectEl = this.querySelector("#name-order-select");
    if (!selectEl) return;

    let optionsEl = selectEl.querySelectorAll("option");
    optionsEl.forEach((optionEl) => {
      if (optionEl.value === window.app.store.viewMetadata.name_order) {
        optionEl.selected = true;
      }
    });
  }
}

customElements.define("settings-menu", SettingsMenu);
