import { renderPlacesList, renderTaxaList } from "../../lib/autocomplete_utils";
import { fetchiNatMapData, removeOneTaxonFromMap } from "../../lib/data_utils";
import { updateStoreUsingFilters } from "../../lib/data_utils";
import { iNatApiFilterableNames, taxonRanks } from "../../lib/inat_api";
import { mapStore } from "../../lib/store";
import { updateUrl } from "../../lib/utils";
import type { iNatApiFilterableParamsKeys, MapStore } from "../../types/app";
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
      let selectHighEl = document.querySelector("#hrank") as HTMLSelectElement;
      if (selectHighEl) {
        this.renderRankSelect(selectHighEl, "");
      }
      let selectLowEl = document.querySelector("#lrank") as HTMLSelectElement;
      if (selectLowEl) {
        this.renderRankSelect(selectLowEl, "");
      }
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
          this.updateAppWithFilters(data, window.app.store, logEl);
        });

        form.addEventListener("change", async (event) => {
          if (event.target === null) return;

          event.preventDefault();

          const data = new FormData(form);
          this.updateAppWithFilters(data, window.app.store, logEl);
        });

        form.addEventListener("reset", () => {
          appStore.formFilters = mapStore.formFilters;

          // delete filterable fields from appStore.inatApiParams
          Object.keys(appStore.inatApiParams).forEach((param) => {
            if (
              iNatApiFilterableNames.includes(param) &&
              !Object.keys(mapStore.inatApiParams).includes(param)
            ) {
              delete appStore.inatApiParams[
                param as iNatApiFilterableParamsKeys
              ];
            }
          });
          // HACK: trigger change in proxy store
          appStore.inatApiParams = appStore.inatApiParams;
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

    async updateAppWithFilters(
      data: FormData,
      appStore: MapStore,
      logEl: HTMLElement,
    ) {
      let results = processFiltersForm(data);
      updateStoreUsingFilters(appStore, results);

      for await (const taxon of appStore.selectedTaxa) {
        removeOneTaxonFromMap(appStore, taxon.id);

        appStore.inatApiParams = {
          ...appStore.inatApiParams,
          taxon_id: taxon.id.toString(),
          colors: taxon.color,
        };
        await fetchiNatMapData(taxon, appStore);
      }
      renderTaxaList(appStore);
      renderPlacesList(appStore);
      updateUrl(window.location, appStore);

      if (logEl) {
        logEl.innerText = results.string;
      }
    }

    renderYearsSelect() {
      if (!window.app.store.iNatStats.years) return;

      let selectEl = document.querySelector("#year");
      if (selectEl) {
        let optionEl = document.createElement("option");
        optionEl.innerText = "Select years";
        selectEl.appendChild(optionEl);

        window.app.store.iNatStats.years.forEach((year) => {
          let optionEl = document.createElement("option");
          optionEl.innerText = year.toString();
          optionEl.value = year.toString();
          selectEl.appendChild(optionEl);
        });
      }
    }

    connectedCallback() {
      if (!template) return;

      this.appendChild(template.content.cloneNode(true));

      this.renderForm();
      this.renderModal();
      this.formEventHandler();
      window.addEventListener("observationYearsLoaded", () => {
        this.renderYearsSelect();
      });
    }
  }

  customElements.define("x-filters", MyComponent);
};

setup();
