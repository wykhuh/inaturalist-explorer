import {
  initFilters,
  resetForm,
  updateAppWithFilters,
  renderLicenseSelect,
  renderRankSelect,
  renderYearsSelect,
} from "./utils";

const setup = async () => {
  const parser = new DOMParser();
  const resp = await fetch("/src/components/ObservationsFilters/template.html");
  const html = await resp.text();

  const template = parser
    .parseFromString(html, "text/html")
    .querySelector("template");

  class MyComponent extends HTMLElement {
    constructor() {
      super();
    }

    renderForm() {
      renderRankSelect("#hrank", "");
      renderRankSelect("#lrank", "");

      renderLicenseSelect("#license", "All");
      renderLicenseSelect("#photo_license", "All");
      renderLicenseSelect("#sound_license", "All");
    }

    formEventHandler() {
      let appStore = window.app.store;

      const inputs = document.querySelectorAll(
        "#filters-form input",
      ) as NodeListOf<HTMLInputElement>;
      const form = document.querySelector("#filters-form") as HTMLFormElement;

      const onInput = document.querySelector(
        "#filters-form input[name='on']",
      ) as HTMLInputElement;
      const d1Input = document.querySelector(
        "#filters-form input[name='d1']",
      ) as HTMLInputElement;
      const d2Input = document.querySelector(
        "#filters-form input[name='d2']",
      ) as HTMLInputElement;
      const monthInput = document.querySelector(
        "#filters-form select[name='month']",
      ) as HTMLInputElement;
      const yearInput = document.querySelector(
        "#filters-form select[name='year']",
      ) as HTMLInputElement;

      let logEl = document.querySelector("#log") as HTMLElement;

      inputs.forEach((input) => {
        input.addEventListener("change", (event) => {
          let target = event.target as HTMLInputElement;

          // disable/enable date inputs
          if (target.id == "any_date") {
            onInput.disabled = true;
            d1Input.disabled = true;
            d2Input.disabled = true;
            monthInput.disabled = true;
            yearInput.disabled = true;
          } else if (target.id == "exact_date") {
            onInput.disabled = false;
            d1Input.disabled = true;
            d2Input.disabled = true;
            monthInput.disabled = true;
            yearInput.disabled = true;
          } else if (target.id == "range_date") {
            onInput.disabled = true;
            d1Input.disabled = false;
            d2Input.disabled = false;
            monthInput.disabled = true;
            yearInput.disabled = true;
          } else if (target.id == "months_date") {
            onInput.disabled = true;
            d1Input.disabled = true;
            d2Input.disabled = true;
            monthInput.disabled = false;
            yearInput.disabled = true;
          } else if (target.id == "years_date") {
            onInput.disabled = true;
            d1Input.disabled = true;
            d2Input.disabled = true;
            monthInput.disabled = true;
            yearInput.disabled = false;
          }
        });
      });

      if (form) {
        form.addEventListener("submit", (event) => {
          event.preventDefault();

          const data = new FormData(form);
          updateAppWithFilters(data, window.app.store, logEl);
        });

        form.addEventListener("change", async (event) => {
          if (event.target === null) return;

          event.preventDefault();

          const data = new FormData(form);
          updateAppWithFilters(data, window.app.store, logEl);
        });

        form.addEventListener("reset", () => {
          resetForm(appStore);
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

    connectedCallback() {
      if (!template) return;

      this.appendChild(template.content.cloneNode(true));

      this.renderModal();
      this.renderForm();
      this.formEventHandler();
      window.addEventListener("observationYearsLoaded", () => {
        renderYearsSelect();
      });
      window.addEventListener("appInitialized", () => {
        initFilters(window.app.store);
      });
    }
  }

  customElements.define("x-filters", MyComponent);
};

setup();
