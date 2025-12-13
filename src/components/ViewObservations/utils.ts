import { iNatObservationUrl, iNatUserUrl } from "../../data/inat_data";
import {
  cleanupIdentificationsObservationsParams,
  cleanupObervationsParams,
} from "../../lib/cleanup_params_utils";
import {
  formatAvatar,
  renderMedia,
  renderObservationMetadataCounts,
  renderPlace,
  renderQualityGrade,
  renderTaxonNames,
} from "../../lib/render_utils";
import { getObservations } from "../../lib/inat_api";
import { loggerTime } from "../../lib/logger";
import { createPagination } from "../../lib/pagination";
import { createSpinner } from "../../lib/spinner";
import { formatDate, updateAppUrl } from "../../lib/utils";
import type { ObservationsResult } from "../../types/inat_api";
import type { DataComponent, MapStore } from "../../types/app";
import { observationsDemoLA } from "../../data/inat_api_cache";
import { setSelectedOption } from "../../lib/form_utils";
import { updateSelectedResourcesId } from "../../lib/count_utils";
import { isObservationsCheck } from "../../lib/data_utils";

export let perPage = 24;

// fetch new data from api when changing pages, order, filters and view
export async function fetchAndRenderData(
  perPage: number,
  paginationcCallback: (currentPage: number) => Promise<void>,
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

  if (!data) return;
  if (data.results.length == 0) {
    containerEl.innerHTML = "No records found";
    return;
  }

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
  let view = isObservationsCheck(appStore)
    ? appStore.viewMetadata.observations_observations
    : appStore.viewMetadata.identifications_observations;
  if (view.subview === "table") {
    subviewEl.appendChild(createTable(data.results, appStore));
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

async function getAPIData(perPage: number, appStore: MapStore) {
  if (import.meta.env.VITE_CACHE === "true") {
    return observationsDemoLA;
  }

  // NOTE: set record type to observations since parmas are for getObservations
  updateSelectedResourcesId(appStore, "observations");
  let params = "";
  if (isObservationsCheck(appStore)) {
    params = cleanupObervationsParams(appStore, "observations");
  } else {
    params = cleanupIdentificationsObservationsParams(appStore);
  }

  try {
    let data = await getObservations(params, perPage);
    if (!data) return;

    return data;
  } catch (error) {
    console.error("ViewObservations getAPIData ERROR:", error);
  }
}

export function createTable(results: ObservationsResult[], appStore: MapStore) {
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
    tdEl.className = "media-cell";
    let url = `${iNatObservationUrl}/${row.id}`;
    tdEl.innerHTML = renderMedia(url, row.photos, row.sounds);
    rowEl.appendChild(tdEl);

    // taxon name, observation metadata
    tdEl = document.createElement("td");
    tdEl.className = "name";
    let observationContent = ``;

    if (row.taxon) {
      observationContent += renderTaxonNames(
        row.taxon,
        appStore,
        `${iNatObservationUrl}/${row.id}`,
      );

      // some obsevations only have sound and no tax info
    } else {
      observationContent += `<span class="title">`;
      observationContent += `<a href="${iNatObservationUrl}/${row.id}">Unknown</a>`;
      observationContent += "</span>";
    }

    observationContent += renderQualityGrade(row.quality_grade);
    observationContent += renderObservationMetadataCounts(row);

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
    let placeContent = renderPlace(row.place_guess, row.obscured);
    tdEl.innerHTML = placeContent;
    rowEl.appendChild(tdEl);

    // observed on
    tdEl = document.createElement("td");
    tdEl.className = "observed";
    if (row.time_observed_at) {
      tdEl.innerText = ` ${formatDate(row.time_observed_at, row.observed_time_zone)}`;
    }
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
      "card-observation",
    ) as unknown as DataComponent;
    cardEl.data = row;
    containerEl.appendChild(cardEl);
  });

  return containerEl;
}

export async function paginationcCallback(num: number) {
  if (isObservationsCheck(window.app.store)) {
    window.app.store.observationsApiParams = {
      ...window.app.store.observationsApiParams,
      page: num,
    };
    window.app.store.viewMetadata.observations_observations = {
      ...window.app.store.viewMetadata.observations_observations,
      page: num,
    };
  } else {
    window.app.store.identificationsApiParams = {
      ...window.app.store.identificationsApiParams,
      page: num,
    };
    window.app.store.viewMetadata.identifications_observations = {
      ...window.app.store.viewMetadata.identifications_observations,
      page: num,
    };
  }

  // HACK: update store
  window.app.store.viewMetadata = window.app.store.viewMetadata;

  await fetchAndRenderData(perPage, paginationcCallback, window.app.store);
  updateAppUrl(window.location, window.app.store);
}

export function updateSubviewState(
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
  let view = isObservationsCheck(appStore)
    ? appStore.viewMetadata.observations_observations
    : appStore.viewMetadata.identifications_observations;
  if (subview === view.subview) return;

  // update store
  view.subview = subview;

  // HACK: force triggering store proxy
  appStore.viewMetadata = appStore.viewMetadata;

  containerEl.innerHTML = "";

  // load store.observationsSubviewData to populate table and grid to avoid API call
  if (subview === "table") {
    tableLinkEl.classList.add("current-subview");
    gridLinkEl.classList.remove("current-subview");

    containerEl.appendChild(
      createTable(appStore.observationsSubviewData, appStore),
    );
  } else {
    tableLinkEl.classList.remove("current-subview");
    gridLinkEl.classList.add("current-subview");

    containerEl.appendChild(createGrid(appStore.observationsSubviewData));
  }

  // add subview to url
  updateAppUrl(window.location, appStore);
}

// use store to populate the filter form fields on page load
export function initFilters(appStore: MapStore) {
  let { observationsApiParams } = appStore;

  if (observationsApiParams.order !== undefined) {
    setSelectedOption(
      `#order-form select#order option[value='${observationsApiParams.order}']`,
    );
  }
  if (observationsApiParams.order_by !== undefined) {
    setSelectedOption(
      `#order-form select#order_by option[value='${observationsApiParams.order_by}']`,
    );
  }
}

export async function updateOrderState(data: FormData, appStore: MapStore) {
  // get values from form data
  let orderBy;
  let order;
  data.forEach((v, k) => {
    if (k === "order_by") {
      orderBy = v;
    } else {
      order = v;
    }
  });

  if (orderBy === "created_at" && order === "desc") {
    delete appStore.observationsApiParams.order_by;
    delete appStore.observationsApiParams.order;
  } else {
    appStore.observationsApiParams.order_by = orderBy;
    appStore.observationsApiParams.order = order;
  }
  if (appStore.currentView) {
    appStore.viewMetadata[appStore.currentView].order = order;
    appStore.viewMetadata[appStore.currentView].order_by = orderBy;
  }

  await fetchAndRenderData(perPage, paginationcCallback, appStore);
  // update browser url
  updateAppUrl(window.location, appStore);
}
