import { cleanupIdentificationParams } from "../../lib/cleanup_params_utils";
import {
  renderMedia,
  renderObservationMetadataCounts,
  renderPlace,
  renderQualityGrade,
  renderTaxonNames,
} from "../../lib/render_utils";
import { getIdentifications } from "../../lib/inat_api";
import {
  iNatObservationUrl,
  iNatTaxaUrl,
  iNatUserUrl,
} from "../../data/inat_data";
import { loggerTime } from "../../lib/logger";
import { createPagination } from "../../lib/pagination";
import { createSpinner } from "../../lib/spinner";
import type { IdentificationsResult } from "../../types/inat_api";
import { formatDate, updateAppUrl } from "../../lib/utils";
import type { MapStore } from "../../types/app";
import { identifications } from "../../data/inat_api_cache";
import { isObservationsCheck } from "../../lib/data_utils";

export let perPage = 24;

export async function fetchAndRenderData(
  perPage: number,
  paginationcCallback: (currentPage: number) => Promise<void>,
  appStore: MapStore,
) {
  let containerEl = document.querySelector(".identifications-table-container");
  if (!containerEl) return;

  let spinner = createSpinner();
  spinner.start();

  const t1 = performance.now();
  let data = await getAPIData(perPage, appStore);
  const t10 = performance.now();
  loggerTime(`api ${t10 - t1} milliseconds`);
  spinner.stop();

  if (!data) return;
  if (data.results.length == 0) {
    containerEl.innerHTML = "No records found";
    return;
  }

  containerEl.innerHTML = "";

  let pagination1 = createPagination(
    data.per_page,
    data.page,
    data.total_results,
    paginationcCallback,
  );
  containerEl.appendChild(pagination1);

  let tableEl = createTable(data.results, appStore);
  containerEl.appendChild(tableEl);

  let pagination2El = createPagination(
    data.per_page,
    data.page,
    data.total_results,
    paginationcCallback,
  );
  containerEl.appendChild(pagination2El);
}

async function getAPIData(perPage: number, appStore: MapStore) {
  if (import.meta.env.VITE_CACHE === "true") {
    return identifications;
  }

  let params = cleanupIdentificationParams(appStore);

  try {
    let data = await getIdentifications(params, perPage);
    if (!data) return;

    return data;
  } catch (error) {
    console.error("ViewIdentifications getAPIData ERROR:", error);
  }
}

function createTable(results: IdentificationsResult[], appStore: MapStore) {
  let tableEl = document.createElement("table") as HTMLElement;
  tableEl.className = "identifications-table table";

  let rowEl = document.createElement("tr");

  let tdEl = document.createElement("th");
  tdEl.textContent = "Observation";
  rowEl.appendChild(tdEl);

  tdEl = document.createElement("th");
  tdEl.textContent = "Identification";
  rowEl.appendChild(tdEl);

  tableEl.appendChild(rowEl);

  results.forEach((row) => {
    let rowEl = document.createElement("tr");

    // observations
    let obsTdEl = document.createElement("td");
    let obsDiv = document.createElement("div");
    let url = `${iNatObservationUrl}/${row.observation.id}`;
    let obsMediaDiv = renderMedia(
      url,
      row.observation.observation_photos,
      row.observation.sounds,
    );
    obsDiv.innerHTML = obsMediaDiv;

    let obsDetailsDiv = document.createElement("div");
    obsDetailsDiv.className = "details";
    obsDetailsDiv.innerHTML = formatObservation(row, appStore);

    obsDiv.appendChild(obsDetailsDiv);
    obsTdEl.appendChild(obsDiv);
    rowEl.appendChild(obsTdEl);

    // identifications
    let identTdEl = document.createElement("td");
    let idenfication = row.observation.identifications.find(
      (ident) => ident.id === row.id,
    );

    if (idenfication) {
      let identDiv = document.createElement("div");

      if (idenfication.taxon?.default_photo) {
        let url = `${iNatTaxaUrl}/${row.observation.taxon.id}`;
        let identMediaDiv = renderMedia(
          url,
          [idenfication.taxon?.default_photo],
          [],
        );
        identDiv.innerHTML = identMediaDiv;
      }

      let identDetailsDiv = document.createElement("div");
      identDetailsDiv.className = "details";
      identDetailsDiv.innerHTML = formatIdentification(row, appStore);

      identDiv.appendChild(identDetailsDiv);
      identTdEl.appendChild(identDiv);
    }

    rowEl.appendChild(identTdEl);

    tableEl.appendChild(rowEl);
  });

  return tableEl;
}

function formatObservation(row: IdentificationsResult, appStore: MapStore) {
  let observation = row.observation;

  let content = "";

  content += `<div class="header">`;
  content += `<div class="user">Observer: <a href="${iNatUserUrl}/${row.user.login}">${observation.user.login}</a></div>`;
  if (observation.time_observed_at) {
    content += `<div class="date">${formatDate(observation.time_observed_at, observation.observed_time_zone)}</div>`;
  }
  content += `</div>`;

  if (observation.taxon) {
    content += renderTaxonNames(
      observation.taxon,
      appStore,
      `${iNatObservationUrl}/${observation.id}`,
    );
  }

  content += `<div class="footer">`;
  content += `<div class="place">${renderPlace(observation.place_guess, observation.obscured)} </div>`;
  content += renderQualityGrade(observation.quality_grade);
  content += renderObservationMetadataCounts(observation);
  content += `</div>`;

  return content;
}

function formatIdentification(row: IdentificationsResult, appStore: MapStore) {
  let idenfication = row.observation.identifications.find(
    (identification) => identification.id === row.id,
  );
  if (!idenfication) return "";

  let content = "";
  content += `<div class="header">`;
  content += `<div class="user">Identifier: <a href="${iNatUserUrl}/${row.user.login}">${row.user.login}</a></div>`;
  if (idenfication.created_at) {
    content += `<div class="date">${formatDate(idenfication.created_at)}</div>`;
  }
  content += `</div>`;

  if (idenfication.taxon) {
    content += renderTaxonNames(
      idenfication.taxon,
      appStore,
      `${iNatTaxaUrl}/${row.observation.taxon.id}`,
    );
  }

  content += `<div class="footer">`;
  if (row.category) {
    content += `<div class="category">${row.category}</div>`;
  }
  if (row.vision === true) {
    content += `<div class="vision">Computer Vision Suggestion</div>`;
  }
  content += `</div>`;

  return content;
}

export async function paginationcCallback(num: number) {
  if (isObservationsCheck(window.app.store)) {
  } else {
    window.app.store.identificationsApiParams = {
      ...window.app.store.identificationsApiParams,
      page: num,
    };
    window.app.store.viewMetadata.identifications_identifications = {
      ...window.app.store.viewMetadata.identifications_identifications,
      page: num,
    };
  }
  // HACK: update store
  window.app.store.viewMetadata = window.app.store.viewMetadata;

  await fetchAndRenderData(perPage, paginationcCallback, window.app.store);
  updateAppUrl(window.location, window.app.store);
}
