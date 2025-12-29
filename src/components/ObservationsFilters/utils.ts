import {
  inputCheckedFieldsObservations,
  inputFieldsObservations,
  multipleSelectFieldsObservations,
  ObservationsFilterableImplementedArrays,
  selectFieldsObservations,
  trueFalseFieldsObservations,
} from "../../data/app_data";
import type {
  ObservationsApiParamsType,
  ObservationsApiParamsKeysType,
  AppStoreType,
} from "../../types/app";
import {
  isObservationsCheck,
  resetPageNumber,
  updateStoreUsingFilters,
} from "../../lib/data_utils";
import { loggerFilters } from "../../lib/logger";
import {
  renderSelectedResources,
  updateTilesForSelectedTaxa,
} from "../../lib/search_utils";
import { updateCountForAll } from "../../lib/count_utils";
import {
  concatParamsWithMultivalues,
  renderSelectedFiltersList,
} from "./shared_utils";
import {
  processInputCheckedFields,
  processInputFields,
  processMultipleSelectFields,
  processSelectFields,
  processTrueFalseFields,
} from "../../lib/form_utils";

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

    // ignore fields
    if (ObservationsFilterableImplementedArrays.includes(key)) {
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
  ObservationsFilterableImplementedArrays.forEach((field) => {
    concatParamsWithMultivalues(data, field, values);
  });

  return {
    params: values,
    string: new URLSearchParams(values as any)
      .toString()
      .replaceAll("%2C", ","),
  };
}

export async function updateAppWithFilters(
  data: FormData,
  appStore: AppStoreType,
) {
  // get values from form data
  let results = processFiltersForm(data);

  // update store observationsApiParams with form values
  updateStoreUsingFilters(appStore, results);

  await updateTilesForSelectedTaxa(appStore);
  await updateCountForAll("all", appStore);

  // update UI
  renderSelectedFiltersList(results.params);
  resetPageNumber(appStore);
  renderSelectedResources(appStore, true);
}

export function isObservationsApiFields(
  _records: any[],
  appStore: AppStoreType,
): _records is ObservationsApiParamsKeysType[] {
  return isObservationsCheck(appStore);
}

export function isObservationsApiParams(
  _params: any,
  appStore: AppStoreType,
): _params is ObservationsApiParamsType {
  return isObservationsCheck(appStore);
}

// use store to populate the filter form fields on page load
export function initFilters(appStore: AppStoreType) {
  let { observationsApiParams } = appStore;

  processTrueFalseFields(trueFalseFieldsObservations, appStore);
  processSelectFields(selectFieldsObservations, appStore);
  processMultipleSelectFields(multipleSelectFieldsObservations, appStore);
  processInputCheckedFields(inputCheckedFieldsObservations, appStore);
  processInputFields(inputFieldsObservations, appStore);

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
}

export function setTermId(target: HTMLInputElement, ctx: any) {
  let termIdEl = ctx.querySelector("#term_id") as HTMLInputElement;
  if (!termIdEl) return;
  if (!target.dataset.termid) return;
  if (target.name !== "term_value_id") return;

  let termId = target.dataset.termid;

  let existingvalues = termIdEl.value.split(",");
  let newValue: string[] = [];

  // remove term_id when user de-selects annotation term
  if (target.value === "") {
    newValue = existingvalues.filter((v) => v !== termId);
    // add term_id
  } else {
    let values: string[] = existingvalues;

    if (existingvalues[0] == "") {
      newValue = [target.dataset.termid];
    } else if (!values.includes(target.dataset.termid)) {
      existingvalues.push(target.dataset.termid);
      newValue = existingvalues;
    }
  }

  termIdEl.value = newValue.join(",");
}
