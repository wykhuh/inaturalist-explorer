import { setupComponent } from "../../lib/component_utils";
import { languageCodes } from "../../data/locale";
import { updateAppUrl } from "../../lib/utils";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  async render() {
    await setupComponent("/src/components/SettingsMenu/template.html", this);

    this.renderSelect();
  }

  renderSelect() {
    let selectEl = this.querySelector("#language-select");
    if (!selectEl) return;

    languageCodes.forEach((lang) => {
      let optionEl = document.createElement("option");
      optionEl.value = lang.code;
      optionEl.textContent = lang.name;
      if (lang.code === window.app.store.inatApiParams.locale) {
        optionEl.selected = true;
      }

      selectEl.appendChild(optionEl);
    });

    selectEl.addEventListener("change", (event) => {
      if (event.target) {
        let target = event.target as HTMLInputElement;
        window.app.store.inatApiParams = {
          ...window.app.store.inatApiParams,
          locale: target.value,
        };

        updateAppUrl(window.location, window.app.store);

        window.dispatchEvent(new Event("localeChanged"));
      }
    });
  }
}

customElements.define("x-settings-menu", MyComponent);
