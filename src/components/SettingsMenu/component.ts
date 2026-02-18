import { setupComponent } from "../../lib/component_utils";
import { languageCodes } from "../../data/locale";
import type { ObservationViewsType } from "../../types/app";
import {
  displayFieldsHandler,
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
    setupComponent(template, this);

    this.render();

    window.addEventListener("change", this);
  }

  disconnectedCallback() {
    loggerRender("++ SettingsMenu disconnectCallback");

    window.removeEventListener("change", this);
  }

  async handleEvent(event: Event) {
    let target = event.target as HTMLInputElement;
    if (!target) return;
    let currentView = window.app.store.currentView;
    if (!currentView) return;

    loggerEvent(`[SettingsMenu Event] ${target.id}`);

    if (event.type === "change") {
      this.changeHandler(target, currentView);
    }
  }

  async changeHandler(
    target: HTMLInputElement,
    currentView: ObservationViewsType,
  ) {
    if (target.id === "language-select") {
      languageHandler(target, window.app.store);
    } else if (target.id === "name-order-select") {
      nameOrderHandler(target, window.app.store);
    } else if (target.id === "per-page-observations") {
      perPageHandler(target, currentView, window.app.store, "observations");
    } else if (target.id === "per-page-species") {
      perPageHandler(target, currentView, window.app.store, "species");
    } else if (target.id === "per-page-identifications") {
      perPageHandler(target, currentView, window.app.store, "identifications");
    } else if (target.id.startsWith("display_")) {
      displayFieldsHandler(target, window.app.store);
    }
  }

  async render() {
    loggerRender("++ SettingsMenu render");

    this.renderLanguageSelect();
    initSettings(window.app.store);
  }

  renderLanguageSelect() {
    let selectEl = this.querySelector("#language-select");
    if (!selectEl) return;

    languageCodes.forEach((lang) => {
      let optionEl = document.createElement("option");
      optionEl.value = lang.code;
      optionEl.textContent = lang.name;

      selectEl.appendChild(optionEl);
    });
  }
}

customElements.define("settings-menu", SettingsMenu);
