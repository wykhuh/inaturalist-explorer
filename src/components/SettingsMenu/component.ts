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

    selectEl.addEventListener("change", async (event) => {
      if (event.target) {
        let target = event.target as HTMLInputElement;
        window.app.store.observationsApiParams = {
          ...window.app.store.observationsApiParams,
          locale: target.value,
        };

        updateAppUrl(window.location, window.app.store);
        // make api call to get common name
        await updateComonNamesByLanguage(window.app.store);
        renderTaxaList(window.app.store);

        window.dispatchEvent(new Event("localeChanged"));
        loggerEvent("dispatch localeChanged");
      }
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

    selectEl.addEventListener("change", (event) => {
      if (event.target) {
        let target = event.target as HTMLInputElement;
        window.app.store.viewMetadata = {
          ...window.app.store.viewMetadata,
          name_order: target.value as NameOrderType,
        };

        updateAppUrl(window.location, window.app.store);
        renderTaxaList(window.app.store);

        window.dispatchEvent(new Event("nameOrderChanged"));
        loggerEvent("dispatch nameOrderChanged");
      }
    });
  }
}

customElements.define("settings-menu", SettingsMenu);
