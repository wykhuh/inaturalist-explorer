import type {
  IdentificationsApiParams,
  IdentificationsApiParamsKeys,
  ObservationsApiParams,
  ObservationsApiParamsKeys,
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
  params: ObservationsApiParams | IdentificationsApiParams,
) {
  let listEl = document.querySelector(".filters-list");
  if (!listEl) return;

  listEl.innerHTML = "";
  for (let [key, value] of Object.entries(params)) {
    let itemEl = document.createElement("li");
    itemEl.textContent = `${key}=${value}`;
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
  field: ObservationsApiParamsKeys | IdentificationsApiParamsKeys,
  values: ObservationsApiParams | IdentificationsApiParams,
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
