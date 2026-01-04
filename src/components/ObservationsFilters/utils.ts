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
import { populateFields } from "../../lib/form_utils";

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

    if (!observationsApiFilterableNames.includes(key)) {
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

// use store to populate the filter form fields on page load
export function initFilters(appStore: AppStoreType) {
  let { observationsApiParams } = appStore;

  populateFields(observationsFieldName_InputType, appStore);

  // NOTE: update when adding selectedResource; filters form autocomplete search
  if (observationsApiParams.unobserved_by_user_id !== undefined) {
    let inputEl = document.querySelector(
      "#unobserved-by-user-search",
    ) as HTMLInputElement;
    if (inputEl) {
      inputEl.value = appStore.selectedUnobservedByUser.login;
    }
  }

  if (observationsApiParams.ident_user_id !== undefined) {
    let inputEl = document.querySelector(
      "#identifier-search",
    ) as HTMLInputElement;
    if (inputEl) {
      inputEl.value = appStore.selectedUsersIdentifiers[0].login;
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

  if (observationsApiParams.not_in_project !== undefined) {
    let inputEl = document.querySelector(
      "#not-in-project-search",
    ) as HTMLInputElement;
    if (inputEl) {
      inputEl.value = appStore.selectedNotInProject.name;
    }
  }
}
