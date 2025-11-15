import { setupComponent } from "../../lib/component_utils";
import { languageCodes } from "../../data/locale";
import { updateAppUrl } from "../../lib/utils";
import type { NameOrder } from "../../types/app";
import { renderTaxaList } from "../../lib/search_taxa";
import { updateComonNamesByLanguage } from "./utils";
import { loggerStore } from "../../lib/logger";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerStore("++ SettingsMenu render");

    this.render();
  }

  async render() {
    await setupComponent("/src/components/SettingsMenu/template.html", this);

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
          name_order: target.value as NameOrder,
        };

        updateAppUrl(window.location, window.app.store);
        renderTaxaList(window.app.store);

        window.dispatchEvent(new Event("nameOrderChanged"));
      }
    });
  }
}

customElements.define("x-settings-menu", MyComponent);
