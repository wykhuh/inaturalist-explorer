import { setupComponent } from "../../lib/component_utils";
import { languageCodes } from "../../data/locale";
import { updateAppUrl } from "../../lib/utils";
import type { NameOrderType } from "../../types/app";
import { renderTaxaList } from "../../lib/search_taxa";
import { updateComonNamesByLanguage } from "./utils";
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
  }

  disconnectCallback() {
    loggerRender("++ SettingsMenu disconnectCallback");

    window.removeEventListener("change", this);
  }

  async handleEvent(event: Event) {
    let target = event.target as HTMLInputElement;
    if (!target) return;
    loggerEvent(`[SettingsMenu Event] ${target.id}`);

    if (target.id === "language-select") {
      window.app.store.observationsApiParams = {
        ...window.app.store.observationsApiParams,
        locale: target.value,
      };

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

      updateAppUrl(window.location, window.app.store);
      renderTaxaList(window.app.store);

      loggerEvent("[SettingsMenu dispatchEvent] nameOrderChanged");
      window.dispatchEvent(new Event("nameOrderChanged"));
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
