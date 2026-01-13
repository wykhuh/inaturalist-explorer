import { setupComponent } from "../../lib/component_utils";
import { languageCodes } from "../../data/locale";
import { updateAppUrl } from "../../lib/utils";
import type { NameOrderType, ObservationViewsType } from "../../types/app";
import { renderTaxaList } from "../../lib/search_taxa";
import { initSettings, updateComonNamesByLanguage } from "./utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import { template } from "./template";
import { dbKeys, saveItem } from "../../lib/localStorage";

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
      window.app.store.observationsApiParams = {
        ...window.app.store.observationsApiParams,
        locale: target.value,
      };

      saveItem(dbKeys.locale, target.value);
      updateAppUrl(window.location, window.app.store);

      // make api call to get common names
      await updateComonNamesByLanguage(window.app.store);
      renderTaxaList(window.app.store);

      loggerEvent("[SettingsMenu dispatchEvent] localeChanged");
      window.dispatchEvent(new Event("localeChanged"));
    } else if (target.id === "name-order-select") {
      window.app.store.viewMetadata = {
        ...window.app.store.viewMetadata,
        name_order: target.value as NameOrderType,
      };

      saveItem(dbKeys.name_order, target.value);
      updateAppUrl(window.location, window.app.store);
      renderTaxaList(window.app.store);
      loggerEvent("[SettingsMenu dispatchEvent] nameOrderChanged");
      window.dispatchEvent(new Event("nameOrderChanged"));
    } else if (target.id === "per-page-observations") {
      window.app.store.viewMetadata.observations_observations = {
        ...window.app.store.viewMetadata.observations_observations,
        perPage: Number(target.value),
      };
      window.app.store.viewMetadata.identifications_observations = {
        ...window.app.store.viewMetadata.identifications_observations,
        perPage: Number(target.value),
      };

      if (view === "observations_observations") {
        window.app.store.observationsApiParams = {
          ...window.app.store.observationsApiParams,
          per_page: Number(target.value),
        };
      }
      if (view === "identifications_observations") {
        window.app.store.identificationsApiParams = {
          ...window.app.store.identificationsApiParams,
          per_page: Number(target.value),
        };
      }

      // HACK: force proxy store to update
      window.app.store.viewMetadata = window.app.store.viewMetadata;

      saveItem(dbKeys.per_page_observations, target.value);
      updateAppUrl(window.location, window.app.store);

      if (
        view === "observations_observations" ||
        view === "identifications_observations"
      ) {
        loggerEvent("[SettingsMenu dispatchEvent] perPageChanged");
        window.dispatchEvent(new Event("perPageChanged"));
      }
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
