import {
  observationsApiFilterableNames,
  observationsFieldName_InputType,
  observationsFilterableImplementedArrays,
} from "../../data/app_data";
import type {
  ObservationsApiParamsType,
  ObservationsApiParamsKeysType,
  AppStoreType,
} from "../../types/app";
import { loggerFilters } from "../../lib/logger";
import { concatParamsWithMultivalues } from "./shared_utils";
import { populateFormFields } from "../../lib/form_utils";

export function processFiltersForm(data: FormData): {
  params: ObservationsApiParamsType;
  string: string;
} {
  // convert form data into object that can be use with URLSearchParams
  let values: ObservationsApiParamsType = {};
  loggerFilters("----------- processFiltersForm");

  for (let [k, value] of data) {
    let key = k as ObservationsApiParamsKeysType;
    loggerFilters(key, value);

    if (
      !key.startsWith("field:") &&
      !observationsApiFilterableNames.includes(key)
    ) {
      continue;
    }

    // ignore fields
    if (observationsFilterableImplementedArrays.includes(key)) {
      // ignore value "on"
    } else if (value === "on") {
      // convert boolean strings to boolean
    } else if (value === "true") {
      values[key] = true;
      // convert boolean strings to boolean
    } else if (value === "false") {
      values[key] = false;
    } else if (key.startsWith("field:")) {
      values[key] = value.toString().trim();
    } else if (value !== "") {
      values[key] = value.toString().trim();
    } else if (value === "") {
      delete values[key];
    }
  }

  // handle comma-separated params
  observationsFilterableImplementedArrays.forEach((field) => {
    concatParamsWithMultivalues(data, field, values);
  });

  return {
    params: values,
    string: new URLSearchParams(values as any)
      .toString()
      .replaceAll("%2C", ","),
  };
}

// create fiiden input to store observation fields values
export function createOrUpdateObservationFieldInput(
  field: string,
  value: string,
  formEl: HTMLFormElement,
) {
  let inputEl = document.querySelector<HTMLInputElement>(
    `#filters-form [name="${field}"]`,
  );
  if (!inputEl) {
    inputEl = document.createElement("input");
    inputEl.hidden = true;
    inputEl.name = field;
    inputEl.id = field;
    inputEl.placeholder = field;
    formEl.appendChild(inputEl);
  }

  inputEl.value = value;
}

// use store to populate the filter form fields on page load
export function initFilters(appStore: AppStoreType, formEl: HTMLFormElement) {
  let { observationsApiParams } = appStore;

  populateFormFields(observationsFieldName_InputType, appStore);

  let observationFields = Object.keys(appStore.observationsApiParams).filter(
    (k) => k.startsWith("field:"),
  ) as ObservationsApiParamsKeysType[];
  observationFields.forEach((field) => {
    createOrUpdateObservationFieldInput(
      field,
      window.app.store.observationsApiParams[field],
      formEl,
    );
  });

  // enable annotations multiselect if term_id is set
  if (observationsApiParams.term_id !== undefined) {
    let id = observationsApiParams.term_id;
    let select = document.querySelector<HTMLSelectElement>(
      `select[data-related-term-id="${id}"]`,
    );
    if (select) {
      select.disabled = false;
    }
  }

  // fill input value for autocomplete search
  // NOTE: update when adding selectedResource; filters form autocomplete search
  if (observationsApiParams.unobserved_by_user_id !== undefined) {
    let inputEl = document.querySelector(
      "#unobserved-by-user-search",
    ) as HTMLInputElement;
    if (inputEl) {
      inputEl.value = appStore.selectedUnobservedByUser.login;
    }
  }

  if (observationsApiParams.viewer_id !== undefined) {
    let inputEl = document.querySelector(
      "#reviewer-search",
    ) as HTMLInputElement;
    if (inputEl) {
      inputEl.value = appStore.selectedReviewer.login;
    }
  }
}
