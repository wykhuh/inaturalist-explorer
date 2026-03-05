import { iNatObservationUrl } from "../../data/inat_data";
import { cleanupObervationsParams } from "../../lib/cleanup_params_utils";
import {
  formatDateLong,
  renderMedia,
  renderObservationMetadataCounts,
  renderPlace,
  renderQualityGrade,
  renderTaxonNames,
  renderUser,
} from "../../lib/render_utils";
import { getObservations } from "../../lib/inat_api";
import { loggerTime } from "../../lib/logger";
import { createSpinner } from "../../lib/spinner";
import { updateAppUrl } from "../../lib/utils";
import type {
  iNatObservationsAPI,
  ObservationsResult,
} from "../../types/inat_api";
import type {
  DataComponentType,
  AppStoreType,
  ObservationSubviewsType,
} from "../../types/app";
import { observations_fields_annotations as observations } from "../../data/inat_api_cache";
import { setSelectedOption } from "../../lib/form_utils";
import { updateSelectedResourcesId } from "../../lib/count_utils";
import {
  isObservationsCheck,
  replaceWithCacheImages,
  resetPageNumber,
} from "../../lib/data_utils";
import { initRenderMap } from "../../lib/init_app";
import { removeMap } from "../../lib/map_utils";

export let defaultPerPage = 24;

// fetch new data from api when changing pages, order, filters and view
export async function fetchAndRenderData(
  paginationCallback: (
    currentPage: number,
    appStore: AppStoreType,
  ) => Promise<void>,
  appStore: AppStoreType,
) {
  let subcontainerEl = document.querySelector(".subview-container");
  if (!subcontainerEl) return;

  let spinner = createSpinner();
  spinner.start();

  const t1 = performance.now();
  // fetch data from api
  let data = await getAPIData(appStore);
  const t10 = performance.now();
  loggerTime(`api ${t10 - t1} milliseconds`);
  spinner.stop();

  if (!data) return;

  let view =
    appStore.viewMetadata[appStore.currentView || "observations_observations"];
  if (view.subview !== "map" && data.results.length == 0) {
    subcontainerEl.innerHTML = "No records found";
    appStore.observationsSubviewData = [];
    return;
  }

  // store results in store for switching subview
  appStore.observationsSubviewData = data;

  render(data, paginationCallback, appStore);
}

// re-render grids, tables, pagination everytime we fetch new data. only render
// map if it does not exist since we have another function to add/delete map
// layers when data changes.
function render(
  data: iNatObservationsAPI,
  paginationCallback: any,
  appStore: AppStoreType,
) {
  let containerEl = document.querySelector(".subview-container");
  let formEl = document.querySelector("#order-form");
  if (!containerEl) return;
  if (!formEl) return;

  let view = appStore.viewMetadata.observations_observations;
  if (view.subview === "map") {
    if (!appStore.map.map) {
      containerEl.innerHTML = "";
    }
    formEl.className = "hide";
  } else {
    containerEl.innerHTML = "";
    formEl.className = "";
  }

  if (view.subview !== "map") {
    let pagination1 = document.createElement(
      "app-pagination",
    ) as unknown as DataComponentType;
    pagination1.data = {
      perPage: data.per_page,
      currentPage: data.page,
      totalRecords: data.total_results,
      paginationCallback,
    };
    containerEl.appendChild(pagination1);
  }

  // switch between table and grid subview
  let subviewEl = document.createElement("div");
  subviewEl.className = "observations-subview";

  let filteredResults = data.results;

  if (appStore.observationsApiParams.obs_without_annotations) {
    filteredResults = filteredResults.filter((obs) => {
      if (obs.annotations && obs.annotations.length === 0) {
        return true;
      } else {
        return false;
      }
    });
  }
  if (appStore.observationsApiParams.obs_without_ofvs) {
    filteredResults = filteredResults.filter((obs) => {
      if (obs.ofvs && obs.ofvs.length === 0) {
        return true;
      } else {
        return false;
      }
    });
  }

  if (view.subview === "table") {
    subviewEl.appendChild(createTable(filteredResults, appStore));
  } else if (view.subview === "media") {
    subviewEl.appendChild(createMediaGrid(filteredResults));
  } else if (view.subview === "map") {
    if (!appStore.map.map) {
      subviewEl.appendChild(createMap());

      // HACK: use setTimeout to ensure initRenderMap is called after createMap
      // adds div#map
      setTimeout(() => {
        initRenderMap(appStore);
      }, 0);
    }
  } else {
    subviewEl.appendChild(createGrid(filteredResults));
  }
  containerEl.append(subviewEl);

  if (view.subview !== "map") {
    let pagination2 = document.createElement(
      "app-pagination",
    ) as unknown as DataComponentType;
    pagination2.data = {
      perPage: data.per_page,
      currentPage: data.page,
      totalRecords: data.total_results,
      paginationCallback,
      scrollToSelector: "#observations-list-controls",
    };
    containerEl.appendChild(pagination2);
  }
}

async function getAPIData(appStore: AppStoreType) {
  if (import.meta.env?.VITE_CACHE === "true") {
    let page = appStore.observationsApiParams.page;
    replaceWithCacheImages(observations.results);
    return { ...observations, page: page || 1 };
  }

  // NOTE: set record type to observations since parmas are for getObservations
  // TODO: check if this is needed
  updateSelectedResourcesId(appStore, "observations");
  let params = "";
  if (isObservationsCheck(appStore)) {
    params = cleanupObervationsParams(appStore, "observations");
  }

  try {
    let data = await getObservations(params);
    if (!data) return;

    return data;
  } catch (error) {
    console.error("ViewObservations getAPIData ERROR:", error);
  }
}

export function createTable(
  results: ObservationsResult[],
  appStore: AppStoreType,
) {
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
    tdEl.innerHTML = renderMedia(
      url,
      row.taxon,
      row.photos,
      row.sounds,
      appStore,
      true,
      "square",
    );
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
    tdEl.innerHTML = renderUser(row.user);
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
      tdEl.innerText = ` ${formatDateLong(row.time_observed_at, row.observed_time_zone)}`;
    }
    rowEl.appendChild(tdEl);

    // created
    tdEl = document.createElement("td");
    tdEl.className = "created";
    tdEl.innerText = ` ${formatDateLong(row.created_at, row.created_time_zone)}`;

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
    ) as unknown as DataComponentType;
    cardEl.data = row;
    containerEl.appendChild(cardEl);
  });

  return containerEl;
}

function createMediaGrid(results: ObservationsResult[]) {
  let containerEl = document.createElement("div");
  containerEl.className = "observations-media-grid grid-auto-fill";
  results.forEach((record) => {
    let media = record.photos.concat(record.sounds);
    media.forEach((medium, j) => {
      let cardEl = document.createElement(
        "card-media",
      ) as unknown as DataComponentType;
      cardEl.data = {
        observation: record,
        media: medium,
        mediaIndex: j,
        type: medium.url ? "photo" : "sound",
      };
      containerEl.appendChild(cardEl);
    });
  });

  return containerEl;
}

function createMap() {
  let divEl = document.createElement("div");
  divEl.id = "map";
  return divEl;
}

export async function paginationCallback(num: number, appStore: AppStoreType) {
  if (isObservationsCheck(appStore)) {
    appStore.observationsApiParams = {
      ...appStore.observationsApiParams,
      page: num,
    };
    appStore.viewMetadata.observations_observations = {
      ...appStore.viewMetadata.observations_observations,
      page: num,
    };
  }

  // HACK: update store
  appStore.viewMetadata = appStore.viewMetadata;

  await fetchAndRenderData(paginationCallback, appStore);
  updateAppUrl(window.location, appStore);
}

export function updateSubviewState(
  subview: ObservationSubviewsType,
  componentContext: any,
  appStore: AppStoreType,
) {
  // early return if this is current subview
  let view = appStore.viewMetadata.observations_observations;
  if (subview === view.subview) return;

  // remove map when change from map to other subview
  if (view.subview === "map") {
    removeMap(appStore);
  }

  // update store
  view.subview = subview;

  // HACK: force triggering store proxy
  appStore.viewMetadata = appStore.viewMetadata;

  if (subview === "table") {
    componentContext.tableLinkEl.classList.add("current-subview");
    componentContext.gridLinkEl.classList.remove("current-subview");
    componentContext.mediaLinkEl.classList.remove("current-subview");
    componentContext.mapLinkEl.classList.remove("current-subview");
  } else if (subview === "grid") {
    componentContext.tableLinkEl.classList.remove("current-subview");
    componentContext.gridLinkEl.classList.add("current-subview");
    componentContext.mediaLinkEl.classList.remove("current-subview");
    componentContext.mapLinkEl.classList.remove("current-subview");
  } else if (subview === "media") {
    componentContext.tableLinkEl.classList.remove("current-subview");
    componentContext.gridLinkEl.classList.remove("current-subview");
    componentContext.mediaLinkEl.classList.add("current-subview");
    componentContext.mapLinkEl.classList.remove("current-subview");
  } else {
    componentContext.tableLinkEl.classList.remove("current-subview");
    componentContext.gridLinkEl.classList.remove("current-subview");
    componentContext.mediaLinkEl.classList.remove("current-subview");
    componentContext.mapLinkEl.classList.add("current-subview");
  }

  if (appStore.observationsSubviewData.length === 0) {
    return;
  }

  render(appStore.observationsSubviewData, paginationCallback, appStore);

  // add subview to url
  updateAppUrl(window.location, appStore);
}

// use store to populate the filter form fields on page load
export function initFilters(appStore: AppStoreType, componentContext: any) {
  let { observationsApiParams } = appStore;

  // set initial current-subview class
  let subview = appStore.viewMetadata.observations_observations?.subview;
  if (subview === "table") {
    componentContext.tableLinkEl?.classList.add("current-subview");
  } else if (subview === "media") {
    componentContext.mediaLinkEl?.classList.add("current-subview");
  } else if (subview === "map") {
    componentContext.mapLinkEl?.classList.add("current-subview");
  } else {
    componentContext.gridLinkEl?.classList.add("current-subview");
  }

  if (observationsApiParams.order_by && observationsApiParams.order) {
    setSelectedOption(
      `#order-form select#order_combo option[value='${observationsApiParams.order_by}:${observationsApiParams.order}']`,
    );
  } else if (observationsApiParams.order_by) {
    setSelectedOption(
      `#order-form select#order_combo option[value='${observationsApiParams.order_by}']`,
    );
  }
}

export async function updateOrderForStore(
  data: FormData,
  appStore: AppStoreType,
) {
  let orderBy;
  let order;
  data.forEach((v, k) => {
    if (k === "order_combo") {
      let values = v.toString().split(":");
      orderBy = values[0];
      order = values[1];
    }
  });

  if (orderBy) {
    appStore.observationsApiParams.order_by = orderBy;
    if (appStore.currentView) {
      appStore.viewMetadata[appStore.currentView].order_by = orderBy;
    }
  }
  if (order) {
    appStore.observationsApiParams.order = order;
    if (appStore.currentView) {
      appStore.viewMetadata[appStore.currentView].order = order;
    }
  } else {
    delete appStore.observationsApiParams.order;
  }

  resetPageNumber(appStore);
  await fetchAndRenderData(paginationCallback, appStore);
  updateAppUrl(window.location, appStore);
}
