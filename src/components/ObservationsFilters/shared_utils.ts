import {
  CCLicenses,
  iNatObservationsYears,
  taxonRanks,
} from "../../data/inat_data";
import type {
  IdentificationsApiParamsType,
  IdentificationsApiParamsKeysType,
  ObservationsApiParamsType,
  ObservationsApiParamsKeysType,
  DataComponentType,
} from "../../types/app";

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
    ) as unknown as DataComponentType;
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
