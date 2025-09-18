import {
  audio,
  check,
  circleDot,
  circleX,
  speech,
  star,
} from "../../assets/icons";
import { iNatObservationUrl, iNatUserUrl } from "../../data/inat_data";
import {
  cleanupObervationsParams,
  formatAvatar,
  formatTaxonName,
} from "../../lib/data_utils";
import { getObservations } from "../../lib/inat_api";
import { loggerTime } from "../../lib/logger";
import { createPagination } from "../../lib/pagination";
import { createSpinner } from "../../lib/spinner";
import { formatDate, updateAppUrl } from "../../lib/utils";
import type { ObservationsResult } from "../../types/inat_api";
import type { DataComponent, MapStore } from "../../types/app";
import { observationsDemoLA } from "../../data/inat_api_cache";

export let perPage = 48;

export async function fetchAndRenderData(
  perPage: number,
  paginationcCallback: (currentPage: number) => void,
  appStore: MapStore,
) {
  let containerEl = document.querySelector(".observations-list-container");
  if (!containerEl) return;

  let spinner = createSpinner();
  spinner.start();

  const t1 = performance.now();
  // fetch data from api
  let data = await getAPIData(perPage, appStore);
  const t10 = performance.now();
  loggerTime(`api ${t10 - t1} milliseconds`);

  spinner.stop();

  if (data) {
    // store results in store for switching subview
    appStore.observationsSubviewData = data.results;

    containerEl.innerHTML = "";

    let pagination1 = createPagination(
      data.per_page,
      data.page,
      data.total_results,
      paginationcCallback,
    );
    containerEl.appendChild(pagination1);

    // switch between table and grid subview
    let subviewEl = document.createElement("div");
    subviewEl.className = "observations-subview";
    if (appStore.viewMetadata.observations.subview === "table") {
      subviewEl.appendChild(createTable(data.results));
    } else {
      subviewEl.appendChild(createGrid(data.results));
    }
    containerEl.append(subviewEl);

    let pagination2El = createPagination(
      data.per_page,
      data.page,
      data.total_results,
      paginationcCallback,
    );
    containerEl.appendChild(pagination2El);
  }
}

async function getAPIData(perPage: number, appStore: MapStore) {
  if (import.meta.env.VITE_CACHE === "true") {
    return observationsDemoLA;
  }

  let params = cleanupObervationsParams(appStore);

  try {
    let data = await getObservations(params, perPage);
    if (!data) return;

    return data;
  } catch (error) {
    console.error("ViewObservations getAPIData ERROR:", error);
  }
}

export function createTable(results: ObservationsResult[]) {
  let tableEl = document.createElement("table") as HTMLElement;
  tableEl.className = "observations-table table";

  let rowEl = document.createElement("tr");

  let tdEl = document.createElement("th");
  tdEl.textContent = "Media";
  rowEl.appendChild(tdEl);

  tdEl = document.createElement("th");
  tdEl.textContent = "Name";
  rowEl.appendChild(tdEl);

  tdEl = document.createElement("th");
  tdEl.textContent = "User";
  rowEl.appendChild(tdEl);

  tdEl = document.createElement("th");
  tdEl.textContent = "Place";
  rowEl.appendChild(tdEl);

  tdEl = document.createElement("th");
  tdEl.textContent = "Observed";
  rowEl.appendChild(tdEl);

  tdEl = document.createElement("th");
  tdEl.textContent = "Added";
  rowEl.appendChild(tdEl);

  tableEl.appendChild(rowEl);

  results.forEach((row) => {
    let rowEl = document.createElement("tr");

    // media
    let tdEl = document.createElement("td");
    tdEl.className = "media";

    let classes = ["media"];
    if (row.photos.length === 0 && row.sounds.length > 0) {
      classes.push("sound-only");
    }
    let mediaContent = `<div class="${classes.join(" ")}">`;

    if (row.photos.length > 0) {
      let url = row.photos[0].url.replace("/square.", "/medium.");
      mediaContent += `<a href="${iNatObservationUrl}/${row.id}">`;
      mediaContent += `<img src="${url}">`;
      mediaContent += "</a>";
    }
    if (row.sounds.length > 0) {
      mediaContent += `<a href="${iNatObservationUrl}/${row.id}">`;
      mediaContent += `${audio}`;
      mediaContent += "</a>";
    }
    if (row.photos.length > 1) {
      mediaContent += `<span class="photos-count">${row.photos.length}</span>`;
    }
    mediaContent += "</div>";
    tdEl.innerHTML = mediaContent;
    rowEl.appendChild(tdEl);

    // taxon name, observation metadata
    tdEl = document.createElement("td");
    tdEl.className = "name";
    let observationContent = ``;

    if (row.taxon) {
      let { title, subtitle } = formatTaxonName(row.taxon, "", false);
      observationContent += `<span class="title">`;
      observationContent += `<a href="${iNatObservationUrl}/${row.id}">${title}</a>`;
      observationContent += "</span>";
      if (subtitle) {
        observationContent += `<span class="subtitle">`;
        observationContent += `<a href="${iNatObservationUrl}/${row.id}">${subtitle}</a>`;
        observationContent += "</span>";
      }
      // some obsevations only have sound and no tax info
    } else {
      observationContent += `<span class="title">`;
      observationContent += `<a href="${iNatObservationUrl}/${row.id}">Unknown</a>`;
      observationContent += "</span>";
    }

    if (row.quality_grade === "research") {
      observationContent += `<span class="research-grade"><span class="research-grade-badge">Research Grade</span></span>`;
    }

    observationContent += `<span class="metadata-counts">`;

    if (row.identifications.length > 0) {
      let message = `${row.identifications.length} identifications`;
      observationContent += `
      <span class="identifications" aria-label="${message}" title="${message}">
        ${check}<span class="count">${row.identifications.length}</span>
      </span>`;
    }

    if (row.comments_count > 0) {
      let message = `${row.comments_count} comments`;
      observationContent += `
      <span class="speech" aria-label="${message}" title="${message}">
        ${speech}<span class="count">${row.comments_count}</span>
      </span>`;
    }

    if (row.faves_count > 0) {
      let message = `${row.faves_count} favorites`;
      observationContent += `
      <span class="favorites" aria-label="${message}" title="${message}">
        ${star}<span class="count">${row.faves_count}</span>
      </span>`;
    }
    observationContent += `</span>`;
    tdEl.innerHTML = observationContent;
    rowEl.appendChild(tdEl);

    // user
    tdEl = document.createElement("td");
    tdEl.className = "user";
    let userContent = `<span class="avatar-name">
      <a href="${iNatUserUrl}/${row.user.login}">${formatAvatar(row.user.icon_url)}</a>
      <a href="${iNatUserUrl}/${row.user.login}">${row.user.login}</a>
    </span>`;
    tdEl.innerHTML = userContent;
    rowEl.appendChild(tdEl);

    // place
    tdEl = document.createElement("td");
    tdEl.className = "place";
    let placeContent = row.obscured
      ? `<span class="obscured" aria-label="location is obscured" title="location is obscured">${circleX}</span>`
      : `<span class="obscured" aria-label="location is public" title="location is public">${circleDot}</span>`;
    placeContent += `<span class="place">${row.place_guess}</span>`;
    tdEl.innerHTML = placeContent;
    rowEl.appendChild(tdEl);

    // observed on
    tdEl = document.createElement("td");
    tdEl.className = "observed";
    tdEl.innerText = ` ${formatDate(row.time_observed_at, row.observed_time_zone)}`;
    rowEl.appendChild(tdEl);

    // created
    tdEl = document.createElement("td");
    tdEl.className = "created";
    tdEl.innerText = ` ${formatDate(row.created_at, row.created_time_zone)}`;

    rowEl.appendChild(tdEl);

    tableEl.appendChild(rowEl);
  });

  return tableEl;
}

export function createGrid(results: ObservationsResult[]) {
  let containerEl = document.createElement("div");
  containerEl.className = "observations-grid grid-auto-fill";

  results.forEach((row) => {
    let cardEl = document.createElement(
      "x-card-observation",
    ) as unknown as DataComponent;
    cardEl.data = row;
    containerEl.appendChild(cardEl);
  });

  return containerEl;
}

export function paginationcCallback(num: number) {
  window.app.store.inatApiParams = {
    ...window.app.store.inatApiParams,
    page: num,
  };
  window.app.store.viewMetadata.observations = {
    ...window.app.store.viewMetadata.observations,
    page: num,
  };
  // HACK: update store
  window.app.store.viewMetadata = window.app.store.viewMetadata;

  fetchAndRenderData(perPage, paginationcCallback, window.app.store);
  updateAppUrl(window.location, window.app.store);
}

export function toggleSubview(
  event: Event,
  tableLinkEl: HTMLElement,
  gridLinkEl: HTMLElement,
  appStore: MapStore,
) {
  event.preventDefault();
  if (!(event.target instanceof HTMLElement)) {
    return;
  }
  let containerEl = document.querySelector(".observations-subview");
  if (!containerEl) {
    return;
  }

  let subview = event.target.dataset.subview;
  if (!subview) return;
  // early return if this is current subview
  if (subview === appStore.viewMetadata.observations?.subview) return;

  // update store
  appStore.viewMetadata.observations.subview = subview;

  // HACK: force triggering store proxy
  appStore.viewMetadata = appStore.viewMetadata;

  containerEl.innerHTML = "";

  // load store.observationsSubviewData to populate table and grid to avoid API call
  if (subview === "table") {
    tableLinkEl.classList.add("current-subview");
    gridLinkEl.classList.remove("current-subview");

    containerEl.appendChild(createTable(appStore.observationsSubviewData));
  } else {
    tableLinkEl.classList.remove("current-subview");
    gridLinkEl.classList.add("current-subview");

    containerEl.appendChild(createGrid(appStore.observationsSubviewData));
  }

  // add subview to url
  updateAppUrl(window.location, appStore);
}
