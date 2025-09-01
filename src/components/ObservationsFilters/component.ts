import { taxonRanks } from "../../lib/inat_api";
import { mapStore } from "../../lib/store";
import { processFiltersForm } from "./utils";

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
      let selectHighEl = document.querySelector(
        "#taxon-rank-high",
      ) as HTMLSelectElement;
      if (selectHighEl) {
        this.renderRankSelect(selectHighEl, "High");
      }
      let selectLowEl = document.querySelector(
        "#taxon-rank-low",
      ) as HTMLSelectElement;
      if (selectLowEl) {
        this.renderRankSelect(selectLowEl, "Low");
      }
    }

    formEventHandler() {
      const inputs = document.querySelectorAll(
        "#filters-form input",
      ) as NodeListOf<HTMLInputElement>;
      const form = document.querySelector("#filters-form") as HTMLFormElement;
      const wildInput = document.querySelector(
        "#filters-form #wild",
      ) as HTMLInputElement;
      const captiveInput = document.querySelector(
        "#filters-form #captive",
      ) as HTMLInputElement;
      const researchInput = document.querySelector(
        "#filters-form #research",
      ) as HTMLInputElement;
      const needs_idInput = document.querySelector(
        "#filters-form #needs_id",
      ) as HTMLInputElement;

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

      let logEl = document.querySelector("#log") as HTMLElement;

      inputs.forEach((input) => {
        input.addEventListener("change", (event) => {
          let target = event.target as HTMLInputElement;
          // only allow wild or captive to be checked
          if (target.id === "wild" && target.checked) {
            captiveInput.checked = false;
          }
          if (target.id === "captive" && target.checked) {
            wildInput.checked = false;
          }

          // only allow research or needs_id to be checked
          if (target.id === "research" && target.checked) {
            needs_idInput.checked = false;
          }
          if (target.id === "needs_id" && target.checked) {
            researchInput.checked = false;
          }

          // disable/enable date inputs
          if (target.id == "any_date") {
            onInput.disabled = true;
            d1Input.disabled = true;
            d2Input.disabled = true;
            monthInput.disabled = true;
          } else if (target.id == "exact_date") {
            onInput.disabled = false;
            d1Input.disabled = true;
            d2Input.disabled = true;
            monthInput.disabled = true;
          } else if (target.id == "range_date") {
            onInput.disabled = true;
            d1Input.disabled = false;
            d2Input.disabled = false;
            monthInput.disabled = true;
          } else if (target.id == "months_date") {
            onInput.disabled = true;
            d1Input.disabled = true;
            d2Input.disabled = true;
            monthInput.disabled = false;
          }
        });
      });

      if (form) {
        form.addEventListener("submit", (event) => {
          event.preventDefault();

          const data = new FormData(form);
          window.app.store.formFilters = processFiltersForm(data);
        });
        form;

        form.addEventListener("change", (event) => {
          if (event.target === null) return;

          event.preventDefault();

          const data = new FormData(form);
          let results = processFiltersForm(data);
          window.app.store.formFilters = results;
          window.app.store.inatApiParams = {
            ...window.app.store.inatApiParams,
            ...results.params,
          };
          if (logEl) {
            logEl.innerText = results.string;
          }
        });

        form.addEventListener("reset", () => {
          window.app.store.formFilters = mapStore.formFilters;
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

    renderRankSelect(selectEl: HTMLSelectElement, defaultValue: string) {
      let optionEl = document.createElement("option");
      optionEl.textContent = defaultValue;
      optionEl.value = "";
      optionEl.selected = true;

      selectEl.appendChild(optionEl);

      taxonRanks.forEach((rank) => {
        let optionEl = document.createElement("option");
        optionEl.textContent = rank;
        optionEl.value = rank;

        selectEl.appendChild(optionEl);
      });
    }

    connectedCallback() {
      if (!template) return;

      this.appendChild(template.content.cloneNode(true));

      this.renderForm();
      this.renderModal();
      this.formEventHandler();
    }
  }

  customElements.define("x-filters", MyComponent);
};

setup();
