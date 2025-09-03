import {
  CCLicenses,
  iNatApiFilterableNames,
  taxonRanks,
} from "../../lib/inat_data";
import { mapStore } from "../../lib/store";
import type {
  iNatApiFilterableParamsKeys,
  iNatApiParams,
  iNatApiParamsKeys,
  MapStore,
} from "../../types/app";
import {
  fetchiNatMapData,
  removeOneTaxonFromMap,
  updateStoreUsingFilters,
} from "../../lib/data_utils";
import { renderPlacesList, renderTaxaList } from "../../lib/autocomplete_utils";
import { updateUrl } from "../../lib/utils";

export function processFiltersForm(data: FormData): {
  params: iNatApiParams;
  string: string;
} {
  // convert form data into object that can be use with URLSearchParams
  let values: iNatApiParams = {};
  // console.log("----------- processFiltersForm");

  for (const [k, value] of data) {
    // HACK: get rid of typescript errors for values[key]
    let key = k as iNatApiParamsKeys;
    // console.log(key, value);

    // ignore fields
    if (["on", "d1", "d2", "month", "year", "iconic_taxa"].includes(key)) {
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

  // returns iconic_taxa=Aves,Amphibia
  if (data.getAll("iconic_taxa").length > 0) {
    values.iconic_taxa = data.getAll("iconic_taxa").join(",");
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

export function resetForm(appStore: MapStore) {
  appStore.formFilters = mapStore.formFilters;

  // delete filterable fields from appStore.inatApiParams
  Object.keys(appStore.inatApiParams).forEach((param) => {
    if (
      iNatApiFilterableNames.includes(param) &&
      !Object.keys(mapStore.inatApiParams).includes(param)
    ) {
      delete appStore.inatApiParams[param as iNatApiFilterableParamsKeys];
    }
  });

  appStore.inatApiParams.spam = false;
  appStore.inatApiParams.verifiable = true;

  // HACK: trigger change in proxy store
  appStore.inatApiParams = appStore.inatApiParams;
}

export async function updateAppWithFilters(
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

function setSelectedOption(selector: string) {
  let el = document.querySelector(selector) as HTMLOptionElement;
  if (el) {
    el.selected = true;
  }
}

function setSelectedOptionTrueFalse(
  appStore: MapStore,
  property: iNatApiParamsKeys,
  value: boolean,
) {
  let { inatApiParams } = appStore;
  if (inatApiParams[property] == value) {
    setSelectedOption(
      `#filters-form select#${property} option[value='${value}']`,
    );
  }
}

function setInputValue(selector: string, value: any) {
  let el = document.querySelector(selector) as HTMLOptionElement;
  if (el) {
    el.value = value;
  }
}

function setInputChecked(selector: string, value: any) {
  let el = document.querySelector(selector) as HTMLInputElement;
  if (el) {
    el.checked = value;
  }
}

function setInputDisabled(selector: string, value: any) {
  let el = document.querySelector(selector) as HTMLOptionElement;
  if (el) {
    el.disabled = value;
  }
}

export function initFilters(appStore: MapStore) {
  let { inatApiParams } = appStore;

  if (inatApiParams.captive !== undefined) {
    setSelectedOptionTrueFalse(appStore, "captive", inatApiParams.captive);
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
    setSelectedOptionTrueFalse(appStore, "endemic", inatApiParams.endemic);
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
      appStore,
      "identified",
      inatApiParams.identified,
    );
  }

  if (inatApiParams.introduced !== undefined) {
    setSelectedOptionTrueFalse(
      appStore,
      "introduced",
      inatApiParams.introduced,
    );
  }

  if (inatApiParams.license !== undefined) {
    setSelectedOption(
      `#filters-form select#license option[value='${inatApiParams.license}']`,
    );
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
    setSelectedOptionTrueFalse(appStore, "native", inatApiParams.native);
  }

  if (inatApiParams.on !== undefined) {
    setInputChecked("#filters-form input#exact_date", true);
    setInputDisabled("#filters-form input#on", false);
    setInputValue("#filters-form input#on", inatApiParams.on);
  }

  if (inatApiParams.photo_license !== undefined) {
    setSelectedOption(
      `#filters-form select#photo_license option[value='${inatApiParams.photo_license}']`,
    );
  }

  if (inatApiParams.photos !== undefined) {
    setSelectedOptionTrueFalse(appStore, "photos", inatApiParams.photos);
  }

  if (inatApiParams.popular !== undefined) {
    setSelectedOptionTrueFalse(appStore, "popular", inatApiParams.popular);
  }

  if (inatApiParams.quality_grade !== undefined) {
    setSelectedOption(
      `#filters-form select#quality_grade option[value='${inatApiParams.quality_grade}']`,
    );
  }

  if (inatApiParams.sound_license !== undefined) {
    setSelectedOption(
      `#filters-form select#sound_license option[value='${inatApiParams.sound_license}']`,
    );
  }

  if (inatApiParams.sounds !== undefined) {
    setSelectedOptionTrueFalse(appStore, "sounds", inatApiParams.sounds);
  }

  if (inatApiParams.threatened !== undefined) {
    setSelectedOptionTrueFalse(
      appStore,
      "threatened",
      inatApiParams.threatened,
    );
  }

  if (inatApiParams.verifiable !== undefined) {
    setSelectedOptionTrueFalse(
      appStore,
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
