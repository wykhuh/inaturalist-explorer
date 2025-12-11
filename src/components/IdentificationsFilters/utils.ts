import {
  CCLicenses,
  iconicTaxaIdName,
  iNatObservationsYears,
  taxonRanks,
} from "../../data/inat_data";
import type {
  MapStore,
  IdentificationsApiParams,
  IdentificationsApiParamsKeys,
} from "../../types/app";
import { updateStoreUsingFilters } from "../../lib/data_utils";
import { loggerFilters } from "../../lib/logger";
import {
  setInputChecked,
  setInputValue,
  setSelectedOption,
} from "../../lib/form_utils";
import {
  renderSelectedResources,
  updateTilesForSelectedTaxa,
} from "../../lib/search_utils";
import { updateCountForAll } from "../../lib/count_utils";

export function processFiltersForm(data: FormData): {
  params: IdentificationsApiParams;
  string: string;
} {
  // convert form data into object that can be use with URLSearchParams
  let values: IdentificationsApiParams = {};
  loggerFilters("----------- processFiltersForm");

  for (const [k, value] of data) {
    // HACK: get rid of typescript errors for values[key]
    let key = k as IdentificationsApiParamsKeys;
    loggerFilters(key, value);

    // ignore fields
    if (["iconic_taxon_id", "observation_iconic_taxon_id"].includes(key)) {
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

export async function updateAppWithFilters(data: FormData, appStore: MapStore) {
  // get values from form data
  let results = processFiltersForm(data);
  console.log(results.params);

  // update store observationsApiParams with form values
  updateStoreUsingFilters(appStore, results);
  console.log("observationsApiParams", appStore.observationsApiParams);
  console.log("identificationsApiParams", appStore.identificationsApiParams);

  await updateTilesForSelectedTaxa(appStore);
  await updateCountForAll("all", appStore);

  // update UI
  renderSelectedFiltersList(data);
  renderSelectedResources(appStore, true);
}

// use store to populate the filter form fields on page load
export function initFilters(appStore: MapStore) {
  let { identificationsApiParams } = appStore;

  let fields = [
    "d1",
    "d2",
    "observed_d1",
    "observed_d2",
  ] as IdentificationsApiParamsKeys[];
  fields.forEach((field) => {
    if (identificationsApiParams[field] !== undefined) {
      setInputValue(
        `#filters-form input#${field}`,
        identificationsApiParams[field],
      );
    }
  });

  let fields2 = [
    "hrank",
    "lrank",
    "observation_hrank",
    "observation_lrank",
    "quality_grade",
  ] as IdentificationsApiParamsKeys[];
  fields2.forEach((field) => {
    if (identificationsApiParams[field] !== undefined) {
      setSelectedOption(
        `#filters-form select#${field} option[value='${identificationsApiParams[field]}']`,
      );
    }
  });

  if (identificationsApiParams["iconic_taxon_id"] !== undefined) {
    identificationsApiParams["iconic_taxon_id"]
      .toString()
      .split(",")
      .forEach((value: string) => {
        setInputChecked(
          `#filters-form input#${(iconicTaxaIdName as any)[value]}`,
          true,
        );
      });
  }

  if (identificationsApiParams["observation_iconic_taxon_id"] !== undefined) {
    identificationsApiParams["observation_iconic_taxon_id"]
      .toString()
      .split(",")
      .forEach((value: string) => {
        setInputChecked(
          `#filters-form input#${(iconicTaxaIdName as any)[value]}2`,
          true,
        );
      });
  }
}

export function renderRankSelect(selectSelector: string, defaultValue: string) {
  let selectEl = document.querySelector(selectSelector);
  if (!selectEl) return;

  let optionEl = document.createElement("option");
  optionEl.textContent = defaultValue;
  optionEl.value = "";
  optionEl.selected = true;

  selectEl.appendChild(optionEl);

  taxonRanks.forEach((rank) => {
    let optionEl = document.createElement("option");
    optionEl.textContent = rank;
    optionEl.value = rank.toLowerCase();
    optionEl.id = rank.toLowerCase();

    selectEl.appendChild(optionEl);
  });
}

export function renderLicenseSelect(
  selectSelector: string,
  defaultValue: string,
) {
  let selectEl = document.querySelector(selectSelector);
  if (!selectEl) return;

  let optionEl = document.createElement("option");
  optionEl.textContent = defaultValue;
  optionEl.value = "";
  optionEl.selected = true;

  selectEl.appendChild(optionEl);

  CCLicenses.forEach((license) => {
    let optionEl = document.createElement("option");
    optionEl.textContent = license.toUpperCase();
    optionEl.value = license;
    optionEl.id = license;

    selectEl.appendChild(optionEl);
  });
}

export function renderYearsSelect() {
  let selectEl = document.querySelector("#year");
  if (selectEl) {
    let optionEl = document.createElement("option");
    optionEl.innerText = "Select years";
    selectEl.appendChild(optionEl);

    iNatObservationsYears.forEach((year) => {
      let optionEl = document.createElement("option");
      optionEl.innerText = year.toString();
      optionEl.value = year.toString();
      selectEl.appendChild(optionEl);
    });
  }
}

export function renderSelectedFiltersList(data: FormData) {
  let listEl = document.querySelector(".filters-list");
  if (!listEl) return;

  listEl.innerHTML = "";
  let results = processFiltersForm(data);

  for (let [key, value] of Object.entries(results.params)) {
    let itemEl = document.createElement("li");
    itemEl.textContent = `${key}=${value}`;
    listEl.appendChild(itemEl);
  }
  let countEl = document.querySelector(".filters-count") as HTMLElement;
  if (countEl) {
    let count = Object.keys(results.params).length;
    if (count > 0) {
      countEl.innerHTML = count.toString();
      countEl.style = "display:inline-block";
    } else {
      countEl.innerHTML = "";
      countEl.style = "display:none";
    }
  }
}
