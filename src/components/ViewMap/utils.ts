import {
  audio,
  check,
  circleDot,
  circleX,
  speech,
  star,
} from "../../assets/icons";
import { formatAvatar, formatTaxonName } from "../../lib/data_utils";
import { getObservations } from "../../lib/inat_api";
import { iNatObservationUrl, iNatUserUrl } from "../../lib/inat_data";
import { loggerTime } from "../../lib/logger";
import { createPagination } from "../../lib/pagination";
import { createSpinner } from "../../lib/spinner";
import type { ObservationsResult } from "../../types/inat_api";
import { formatDate } from "../../lib/utils";

export let perPage = 50;

export async function fetchAndRenderData(
  currentPage: number,
  perPage: number,
  paginationcCallback: (currentPage: number) => void,
) {
  let containerEl = document.querySelector(".observations-list-container");
  if (!containerEl) return;

  let spinner = createSpinner();
  spinner.start();

  const t1 = performance.now();
  let data = await getAPIData(currentPage, perPage);
  console.log(data);
  const t10 = performance.now();
  loggerTime(`api ${t10 - t1} milliseconds`);

  spinner.stop();

  if (data) {
    containerEl.innerHTML = "";

    let pagination1 = createPagination(
      data.per_page,
      data.page,
      data.total_results,
      paginationcCallback,
    );
    containerEl.appendChild(pagination1);

    let tableEl = createTable(data.results);
    containerEl.appendChild(tableEl);

    let pagination2El = createPagination(
      data.per_page,
      data.page,
      data.total_results,
      paginationcCallback,
    );
    containerEl.appendChild(pagination2El);
  }
}

async function getAPIData(currentPage: number, perPage: number) {
  try {
    let data = await getObservations(
      window.location.search,
      perPage,
      currentPage,
      "created_at",
    );
    if (!data) return;

    return data;
  } catch (error) {
    console.error("ViewObservations getAPIData ERROR:", error);
  }
}

function createTable(results: ObservationsResult[]) {
  let tableEl = document.createElement("table") as HTMLElement;
  tableEl.className = "observations-table";

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
    let mediaContent = '<div class="media">';

    if (row.photos.length > 0) {
      mediaContent += `<a href="${iNatObservationUrl}/${row.id}">`;
      mediaContent += `<img src="${row.photos[0].url.replace("square.jpg", "medium.jpg")}">`;
      mediaContent += "</a>";
    }
    if (row.sounds.length > 0) {
      mediaContent += `<a href="${iNatObservationUrl}/${row.id}">`;
      mediaContent += `${audio}`;
      mediaContent += "</a>";
    }
    if (row.photos.length > 1) {
      mediaContent += `<span class="count">${row.photos.length}</span>`;
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

export function paginationcCallback(num: number) {
  console.log(num);
  fetchAndRenderData(num, perPage, paginationcCallback);
}
