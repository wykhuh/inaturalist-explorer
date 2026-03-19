import {
  CCLicenses,
  geoprivacyValues,
  iNatObservationsYears,
  obscurationValues,
  taxonRanks,
} from "../../data/inat_data";
import { html } from "../../lib/component_utils";
import { updateCountForAll } from "../../lib/count_utils";
import {
  capitalizeFirstLetter,
  isObservationsCheck,
  resetPageNumber,
  updateStoreUsingFilters,
  type FiltersResults,
} from "../../lib/data_utils";
import {
  renderSelectedResources,
  updateTilesForSelectedTaxa,
} from "../../lib/search_utils";
import type {
  IdentificationsApiParamsType,
  IdentificationsApiParamsKeysType,
  ObservationsApiParamsType,
  ObservationsApiParamsKeysType,
  DataComponentType,
  AppStoreType,
} from "../../types/app";
import { processFiltersForm as processFiltersFormIdentifications } from "../IdentificationsFilters/utils";
import { processFiltersForm as processFiltersFormObservations } from "./utils";

export function tabClickHandler(
  target: HTMLElement,
  componentCtx: HTMLElement,
) {
  let activeTab = target.id;

  // add active class to .nav-link
  componentCtx.querySelectorAll(".nav-link").forEach((el) => {
    if (el.id == activeTab) {
      el.classList.add("active");
      el.setAttribute("aria-selected", "true");
    } else {
      el.classList.remove("active");
      el.setAttribute("aria-selected", "false");
    }
  });

  // add active class to .tab-pane
  componentCtx.querySelectorAll(".tab-pane").forEach((el) => {
    let labelAttr = el.attributes.getNamedItem("aria-labelledby");
    if (!labelAttr) return;

    if (activeTab == labelAttr.value) {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
  });
}

export function renderSelectedFiltersList(
  params: ObservationsApiParamsType | IdentificationsApiParamsType,
) {
  let listEl = document.querySelector(".filters-list");
  if (!listEl) return;

  listEl.innerHTML = "";
  for (let [key, value] of Object.entries(params)) {
    let itemEl = document.createElement(
      "selected-filters-item",
    ) as DataComponentType;
    itemEl.data = { field: key, value: value };

    listEl.appendChild(itemEl);
  }

  let countEl = document.querySelector(".filters-count") as HTMLElement;
  if (countEl) {
    let count = Object.keys(params).length;
    if (count > 0) {
      countEl.innerHTML = count.toString();
      countEl.style = "display:inline-block";
    } else {
      countEl.innerHTML = "";
      countEl.style = "display:none";
    }
  }
}

export function concatParamsWithMultivalues(
  data: FormData,
  field: ObservationsApiParamsKeysType | IdentificationsApiParamsKeysType,
  values: ObservationsApiParamsType | IdentificationsApiParamsType,
) {
  let items = data
    .getAll(field)
    .filter((i) => i !== "")
    .map((i) => i.toString().trim());
  if (items.length > 0) {
    // @ts-ignore
    values[field] = items.join(",");
  }
}

export function renderLicenseOptions(defaultValue: string) {
  let content = `<option value="">${defaultValue}</option>`;
  CCLicenses.forEach((license) => {
    content += `<option id="${license}" value="${license}">${license.toUpperCase()}</option>`;
  });
  return content;
}

export function renderYearsOptions(defaultValue: string) {
  let content = `<option value="">${defaultValue}</option>`;
  iNatObservationsYears.forEach((year) => {
    content += `<option value="${year}">${year}</option>`;
  });
  return content;
}

export function renderHoursOptions(defaultValue: string) {
  let content = `<option value="">${defaultValue}</option>`;
  [...Array(24).keys()].forEach((num) => {
    content += `<option value="${num}">${num}</option>`;
  });
  return content;
}

export function renderDaysOptions(defaultValue: string) {
  let content = `<option value="">${defaultValue}</option>`;
  [...Array(31).keys()].forEach((num) => {
    content += `<option value="${num + 1}">${num + 1}</option>`;
  });
  return content;
}

export function renderRankOptions(defaultValue: string) {
  let content = `<option value="">${defaultValue}</option>`;
  taxonRanks.forEach((rank) => {
    content += `<option value="${rank.toLowerCase()}" id="${rank.toLowerCase()}">${rank}</option>`;
  });
  return content;
}

export function renderGeoprivacyOptions(defaultValue: string) {
  let content = `<option value="">${defaultValue}</option>`;
  geoprivacyValues.forEach((value) => {
    let displayValue = capitalizeFirstLetter(value.replace("_", " "));
    content += `<option value="${value}" id="${value}">${displayValue}</option>`;
  });
  return content;
}

export function renderObscurationOptions(defaultValue: string) {
  let content = `<option value="">${defaultValue}</option>`;
  obscurationValues.forEach((value) => {
    let displayValue = capitalizeFirstLetter(value.replace("_", " "));
    content += `<option value="${value}" id="${value}">${displayValue}</option>`;
  });
  return content;
}

export function renderTrueFalseSelect(
  name: string,
  id: string,
  defaultText = "",
) {
  return html`<select id="${id}" name="${name}">
    <option value="">${defaultText}</option>
    <option value="true">True</option>
    <option value="false">False</option>
  </select>`;
}

export async function updateAppWithFilters(
  data: FormData,
  appStore: AppStoreType,
) {
  // get values from form data
  let results = {} as FiltersResults;

  if (isObservationsCheck(appStore)) {
    results = processFiltersFormObservations(data);
  } else {
    results = processFiltersFormIdentifications(data);
  }

  resetPageNumber(appStore);

  // update store observationsApiParams with form values
  updateStoreUsingFilters(appStore, results);

  await updateTilesForSelectedTaxa(appStore);
  await updateCountForAll("all", appStore);

  // update UI
  renderSelectedFiltersList(results.params);
  renderSelectedResources(appStore, true);
}

// set the form data value for autocomplete fields to use the number id from
// app store instead of the string name that is displayed on the form UI
export function setAutocompleteValuesToId(data: FormData) {
  let apiParams = window.app.store.observationsApiParams;
  if (data.get("unobserved_by_user_id") && apiParams.unobserved_by_user_id) {
    data.set(
      "unobserved_by_user_id",
      apiParams.unobserved_by_user_id.toString(),
    );
  }
  if (data.get("viewer_id") && apiParams.viewer_id) {
    data.set("viewer_id", apiParams.viewer_id.toString());
  }
}
