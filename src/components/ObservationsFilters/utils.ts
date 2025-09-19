import {
  CCLicenses,
  iNatObservationsYears,
  taxonRanks,
} from "../../data/inat_data";
import type {
  iNatApiParams,
  iNatApiParamsKeys,
  MapStore,
} from "../../types/app";
import { updateStoreUsingFilters } from "../../lib/data_utils";
import { updateAppUrl } from "../../lib/utils";
import { loggerFilters } from "../../lib/logger";
import { renderTaxaList } from "../../lib/search_taxa";
import {
  setInputChecked,
  setInputDisabled,
  setInputValue,
  setSelectedOption,
  setSelectedOptionTrueFalse,
} from "../../lib/form_utils";
import { updateTilesAndCountForAllTaxa } from "../../lib/search_utils";

export function processFiltersForm(data: FormData): {
  params: iNatApiParams;
  string: string;
} {
  // convert form data into object that can be use with URLSearchParams
  let values: iNatApiParams = {};
  loggerFilters("----------- processFiltersForm");

  for (const [k, value] of data) {
    // HACK: get rid of typescript errors for values[key]
    let key = k as iNatApiParamsKeys;
    loggerFilters(key, value);

    // ignore fields
    if (
      [
        "on",
        "d1",
        "d2",
        "month",
        "year",
        "iconic_taxa",
        "license",
        "photo_license",
        "sound_license",
      ].includes(key)
    ) {
      // ignore value "on"
    } else if (value === "on") {
      // convert boolean strings to boolean
    } else if (value === "true") {
      values[key] = true;
      // convert boolean strings to boolean
    } else if (value === "false") {
      values[key] = false;
    } else if (value !== "") {
      values[key] = value as string;
    } else if (value === "") {
      delete values[key];
    }
  }

  // handle comma-separated params
  if (data.getAll("iconic_taxa").length > 0) {
    values.iconic_taxa = data.getAll("iconic_taxa").join(",");
  }
  let licenses = data.getAll("license");
  if (licenses.length > 0 && licenses[0] != "") {
    values.license = licenses.join(",");
  }
  let photo_licenses = data.getAll("photo_license");
  if (photo_licenses.length > 0 && photo_licenses[0] != "") {
    values.photo_license = photo_licenses.join(",");
  }
  let sound_licenses = data.getAll("sound_license");
  if (sound_licenses.length > 0 && sound_licenses[0] != "") {
    values.sound_license = sound_licenses.join(",");
  }

  // handle observed date
  if (data.get("on")) {
    values.on = data.get("on") as string;
  }
  if (data.get("d1")) {
    values.d1 = data.get("d1") as string;
  }
  if (data.get("d2") && data.get("d2")) {
    values.d2 = data.get("d2") as string;
  }
  if (data.getAll("month").filter((m) => m !== "").length > 0) {
    values.month = data.getAll("month").join(",");
  }
  if (data.getAll("year").filter((y) => y !== "").length > 0) {
    values.year = data.getAll("year").join(",");
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

  // update store inatApiParams with form values
  updateStoreUsingFilters(appStore, results);

  updateTilesAndCountForAllTaxa(appStore);

  // update UI
  renderFiltersList(data);
  renderTaxaList(appStore);
  // update browser url

  updateAppUrl(window.location, appStore);
  window.dispatchEvent(new Event("observationsChange"));
}

// use store to populate the filter form fields on page load
export function initFilters(appStore: MapStore) {
  let { inatApiParams } = appStore;

  if (inatApiParams.captive !== undefined) {
    setSelectedOptionTrueFalse(
      "#filters-form",
      "captive",
      inatApiParams.captive,
    );
  }

  if (inatApiParams.d1 !== undefined) {
    setInputChecked("#filters-form input#range_date", true);
    setInputDisabled("#filters-form input#d1", false);
    setInputValue("#filters-form input#d1", inatApiParams.d1);
  }
  if (inatApiParams.d2 !== undefined) {
    setInputChecked("#filters-form input#range_date", true);
    setInputDisabled("#filters-form input#d2", false);
    setInputValue("#filters-form input#d2", inatApiParams.d2);
  }

  if (inatApiParams.endemic !== undefined) {
    setSelectedOptionTrueFalse(
      "#filters-form",
      "endemic",
      inatApiParams.endemic,
    );
  }

  if (inatApiParams.hrank !== undefined) {
    setSelectedOption(
      `#filters-form select#hrank option[value='${inatApiParams.hrank}']`,
    );
  }

  if (inatApiParams.iconic_taxa !== undefined) {
    inatApiParams.iconic_taxa.split(",").forEach((value) => {
      setInputChecked(`#filters-form input#${value}`, true);
    });
  }

  if (inatApiParams.identified !== undefined) {
    setSelectedOptionTrueFalse(
      "#filters-form",
      "identified",
      inatApiParams.identified,
    );
  }

  if (inatApiParams.introduced !== undefined) {
    setSelectedOptionTrueFalse(
      "#filters-form",
      "introduced",
      inatApiParams.introduced,
    );
  }

  if (inatApiParams.license !== undefined) {
    inatApiParams.license.split(",").forEach((value) => {
      setSelectedOption(
        `#filters-form select#license option[value='${value}']`,
      );
    });
  }

  if (inatApiParams.lrank !== undefined) {
    setSelectedOption(
      `#filters-form select#lrank option[value='${inatApiParams.lrank}']`,
    );
  }

  if (inatApiParams.month !== undefined) {
    setInputChecked("#filters-form input#months_date", true);
    setInputDisabled("#filters-form select#month", false);
    inatApiParams.month.split(",").forEach((value) => {
      setSelectedOption(`#filters-form select#month option[value='${value}']`);
    });
  }

  if (inatApiParams.native !== undefined) {
    setSelectedOptionTrueFalse("#filters-form", "native", inatApiParams.native);
  }

  if (inatApiParams.on !== undefined) {
    setInputChecked("#filters-form input#exact_date", true);
    setInputDisabled("#filters-form input#on", false);
    setInputValue("#filters-form input#on", inatApiParams.on);
  }

  if (inatApiParams.photo_license !== undefined) {
    inatApiParams.photo_license.split(",").forEach((value) => {
      setSelectedOption(
        `#filters-form select#photo_license option[value='${value}']`,
      );
    });
  }

  if (inatApiParams.photos !== undefined) {
    setSelectedOptionTrueFalse("#filters-form", "photos", inatApiParams.photos);
  }

  if (inatApiParams.popular !== undefined) {
    setSelectedOptionTrueFalse(
      "#filters-form",
      "popular",
      inatApiParams.popular,
    );
  }

  if (inatApiParams.quality_grade !== undefined) {
    setSelectedOption(
      `#filters-form select#quality_grade option[value='${inatApiParams.quality_grade}']`,
    );
  }

  if (inatApiParams.sound_license !== undefined) {
    inatApiParams.sound_license.split(",").forEach((value) => {
      setSelectedOption(
        `#filters-form select#sound_license option[value='${value}']`,
      );
    });
  }

  if (inatApiParams.sounds !== undefined) {
    setSelectedOptionTrueFalse("#filters-form", "sounds", inatApiParams.sounds);
  }

  if (inatApiParams.threatened !== undefined) {
    setSelectedOptionTrueFalse(
      "#filters-form",
      "threatened",
      inatApiParams.threatened,
    );
  }

  if (inatApiParams.verifiable !== undefined) {
    setSelectedOptionTrueFalse(
      "#filters-form",
      "verifiable",
      inatApiParams.verifiable as boolean,
    );
  }

  if (inatApiParams.year !== undefined) {
    setInputChecked("#filters-form input#years_date", true);
    setInputDisabled("#filters-form select#year", false);
    inatApiParams.year.split(",").forEach((value) => {
      setSelectedOption(`#filters-form select#year option[value='${value}']`);
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

export function renderFiltersList(data: FormData) {
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
