import {
  CCLicenses,
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
  setInputDisabled,
  setInputValue,
  setSelectedOption,
  setSelectedOptionTrueFalse,
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
  let { observationsApiParams } = appStore;

  if (observationsApiParams.captive !== undefined) {
    setSelectedOptionTrueFalse(
      "#filters-form",
      "captive",
      observationsApiParams.captive,
    );
  }

  if (observationsApiParams.d1 !== undefined) {
    setInputChecked("#filters-form input#range_date", true);
    setInputDisabled("#filters-form input#d1", false);
    setInputValue("#filters-form input#d1", observationsApiParams.d1);
  }
  if (observationsApiParams.d2 !== undefined) {
    setInputChecked("#filters-form input#range_date", true);
    setInputDisabled("#filters-form input#d2", false);
    setInputValue("#filters-form input#d2", observationsApiParams.d2);
  }

  if (observationsApiParams.endemic !== undefined) {
    setSelectedOptionTrueFalse(
      "#filters-form",
      "endemic",
      observationsApiParams.endemic,
    );
  }

  if (observationsApiParams.hrank !== undefined) {
    setSelectedOption(
      `#filters-form select#hrank option[value='${observationsApiParams.hrank}']`,
    );
  }

  if (observationsApiParams.iconic_taxa !== undefined) {
    observationsApiParams.iconic_taxa.split(",").forEach((value) => {
      setInputChecked(`#filters-form input#${value}`, true);
    });
  }

  if (observationsApiParams.identified !== undefined) {
    setSelectedOptionTrueFalse(
      "#filters-form",
      "identified",
      observationsApiParams.identified,
    );
  }

  if (observationsApiParams.introduced !== undefined) {
    setSelectedOptionTrueFalse(
      "#filters-form",
      "introduced",
      observationsApiParams.introduced,
    );
  }

  if (observationsApiParams.license !== undefined) {
    observationsApiParams.license.split(",").forEach((value) => {
      setSelectedOption(
        `#filters-form select#license option[value='${value}']`,
      );
    });
  }

  if (observationsApiParams.lrank !== undefined) {
    setSelectedOption(
      `#filters-form select#lrank option[value='${observationsApiParams.lrank}']`,
    );
  }

  if (observationsApiParams.month !== undefined) {
    setInputChecked("#filters-form input#months_date", true);
    setInputDisabled("#filters-form select#month", false);
    observationsApiParams.month.split(",").forEach((value) => {
      setSelectedOption(`#filters-form select#month option[value='${value}']`);
    });
  }

  if (observationsApiParams.native !== undefined) {
    setSelectedOptionTrueFalse(
      "#filters-form",
      "native",
      observationsApiParams.native,
    );
  }

  if (observationsApiParams.on !== undefined) {
    setInputChecked("#filters-form input#exact_date", true);
    setInputDisabled("#filters-form input#on", false);
    setInputValue("#filters-form input#on", observationsApiParams.on);
  }

  if (observationsApiParams.photo_license !== undefined) {
    observationsApiParams.photo_license.split(",").forEach((value) => {
      setSelectedOption(
        `#filters-form select#photo_license option[value='${value}']`,
      );
    });
  }

  if (observationsApiParams.photos !== undefined) {
    setSelectedOptionTrueFalse(
      "#filters-form",
      "photos",
      observationsApiParams.photos,
    );
  }

  if (observationsApiParams.popular !== undefined) {
    setSelectedOptionTrueFalse(
      "#filters-form",
      "popular",
      observationsApiParams.popular,
    );
  }

  if (observationsApiParams.quality_grade !== undefined) {
    setSelectedOption(
      `#filters-form select#quality_grade option[value='${observationsApiParams.quality_grade}']`,
    );
  }

  if (observationsApiParams.sound_license !== undefined) {
    observationsApiParams.sound_license.split(",").forEach((value) => {
      setSelectedOption(
        `#filters-form select#sound_license option[value='${value}']`,
      );
    });
  }

  if (observationsApiParams.sounds !== undefined) {
    setSelectedOptionTrueFalse(
      "#filters-form",
      "sounds",
      observationsApiParams.sounds,
    );
  }

  if (observationsApiParams.threatened !== undefined) {
    setSelectedOptionTrueFalse(
      "#filters-form",
      "threatened",
      observationsApiParams.threatened,
    );
  }

  if (observationsApiParams.verifiable !== undefined) {
    setSelectedOptionTrueFalse(
      "#filters-form",
      "verifiable",
      observationsApiParams.verifiable as boolean,
    );
  }

  if (observationsApiParams.year !== undefined) {
    setInputChecked("#filters-form input#years_date", true);
    setInputDisabled("#filters-form select#year", false);
    observationsApiParams.year.split(",").forEach((value) => {
      setSelectedOption(`#filters-form select#year option[value='${value}']`);
    });
  }

  if (observationsApiParams.unobserved_by_user_id !== undefined) {
    let inputEl = document.querySelector(
      "#unobserved-by-user-search",
    ) as HTMLInputElement;
    if (inputEl) {
      inputEl.value = appStore.selectedUnobservedByUser.login;
    }
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
