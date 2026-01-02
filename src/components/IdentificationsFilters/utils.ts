import {
  IdentificationsFilterableImplementedArrays,
  inputCheckedFieldsIdentifications,
  inputFieldsIdentifications,
  multipleSelectFieldsIdentifications,
  selectFieldsIdentifications,
} from "../../data/app_data";
import type {
  AppStoreType,
  IdentificationsApiParamsType,
  IdentificationsApiParamsKeysType,
} from "../../types/app";
import { resetPageNumber, updateStoreUsingFilters } from "../../lib/data_utils";
import { loggerFilters } from "../../lib/logger";
import {
  processInputCheckedFields,
  processInputFields,
  processMultipleSelectFields,
  processSelectFields,
} from "../../lib/form_utils";
import {
  renderSelectedResources,
  updateTilesForSelectedTaxa,
} from "../../lib/search_utils";
import { updateCountForAll } from "../../lib/count_utils";
import {
  concatParamsWithMultivalues,
  renderSelectedFiltersList,
} from "../ObservationsFilters/shared_utils";

export function processFiltersForm(data: FormData): {
  params: IdentificationsApiParamsType;
  string: string;
} {
  // convert form data into object that can be use with URLSearchParams
  let values: IdentificationsApiParamsType = {};
  loggerFilters("----------- processFiltersForm");

  for (const [k, value] of data) {
    // HACK: get rid of typescript errors for values[key]
    let key = k as IdentificationsApiParamsKeysType;
    loggerFilters(key, value);

    // ignore fields
    if (IdentificationsFilterableImplementedArrays.includes(key)) {
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

  IdentificationsFilterableImplementedArrays.forEach((field) => {
    concatParamsWithMultivalues(data, field, values);
  });

  // handle comma-separated params
  if (data.getAll("iconic_taxon_id").length > 0) {
    values.iconic_taxon_id = data.getAll("iconic_taxon_id").join(",");
  }
  if (data.getAll("observation_iconic_taxon_id").length > 0) {
    values.observation_iconic_taxon_id = data
      .getAll("observation_iconic_taxon_id")
      .join(",");
  }

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

// use store to populate the filter form fields on page load
export function initFilters(appStore: AppStoreType) {
  processInputFields(inputFieldsIdentifications, appStore);
  processSelectFields(selectFieldsIdentifications, appStore);
  processInputCheckedFields(inputCheckedFieldsIdentifications, appStore);
  processMultipleSelectFields(multipleSelectFieldsIdentifications, appStore);
}
