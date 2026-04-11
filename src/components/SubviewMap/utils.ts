import { pauseIcon, playIcon } from "../../assets/icons";
import { FULL_MONTHS, MONTH_LAST_DAY } from "../../data/constants";
import { cleanupObervationsHistogramParams } from "../../lib/cleanup_params_utils";
import { setSelectedOption } from "../../lib/form_utils";
import { removeOneTaxonFromMap } from "../../lib/search_taxa";
import { updateTilesForSelectedTaxa } from "../../lib/search_utils";
import { createSpinner } from "../../lib/spinner";
import { updateAppUrl } from "../../lib/utils";
import type {
  AppStoreType,
  MapCategory,
  ObservationsMapData,
} from "../../types/app";
import { getAPIHistogramData, setLastTenYears } from "../SubviewGraphs/utils";
import type { SubviewObservationsMap } from "./component";

export function createMap() {
  let divEl = document.createElement("div");
  divEl.id = "map";
  return divEl;
}

export function setCategory(formData: FormData, appStore: AppStoreType) {
  let category = formData.get("map-category") as MapCategory;
  if (!category) return;
  let mapMetadata = appStore.viewMetadata.observations_observations.map;
  if (!mapMetadata) return;
  mapMetadata.category = category;
}

export async function fetchAndRenderTimePeriods(
  appStore: AppStoreType,
  componentContext: SubviewObservationsMap,
) {
  let mapMetadata = appStore.viewMetadata.observations_observations.map;
  if (!mapMetadata) return;
  if (!componentContext.timeRangeEl) return;
  if (!componentContext.currentTimeperiodEl) return;

  let spinner = createSpinner();
  spinner.start();

  let timeData = await fetchTimePeriods(appStore);
  spinner.stop();

  if (!timeData) return;

  appStore.viewMetadata.mapTimePeriods = timeData.timePeriods;
  componentContext.timeRangeEl.value = "0";
  componentContext.timeRangeEl.min = "0";
  componentContext.timeRangeEl.max = (
    timeData.timePeriods.length - 1
  ).toString();

  updateCurrentTimeText(0, componentContext, appStore);
  updateAppUrl(window.location, appStore);
}

export function updateCurrentTimeText(
  index: number,
  componentContext: SubviewObservationsMap,
  appStore: AppStoreType,
) {
  let mapMetadata = appStore.viewMetadata.observations_observations.map;
  if (!mapMetadata) return;
  if (!componentContext.currentTimeperiodEl) return;

  let timePeriods = appStore.viewMetadata.mapTimePeriods;
  let text = "";
  if (timePeriods.length > 0) {
    if (mapMetadata.category === "month_of_year") {
      text = FULL_MONTHS[index];
    } else {
      text = timePeriods[index].toString();
    }
  }
  componentContext.currentTimeperiodEl.innerText = text;
}

export async function fetchTimePeriods(appStore: AppStoreType) {
  let mapMetadata = appStore.viewMetadata.observations_observations.map;
  if (!mapMetadata) return;

  let timeData = {
    timePeriods: [],
    type: undefined,
  } as ObservationsMapData;

  let params = cleanupObervationsHistogramParams(appStore, "observations");
  if (mapMetadata.category === "year") {
    setLastTenYears(params);
    let data = await getAPIHistogramData(params.toString(), "year");
    if (data && data.results.year) {
      // 2017
      timeData.timePeriods = Object.keys(data.results.year).map(
        (date) => date.split("-")[0],
      );
      timeData.type = "year";
    }
  } else if (mapMetadata.category === "month") {
    setLastTenYears(params);
    let data = await getAPIHistogramData(params.toString(), "month");
    if (data && data.results.month) {
      // 2024-07-01
      timeData.timePeriods = Object.keys(data.results.month);
      timeData.type = "month";
    }
  } else if (mapMetadata.category === "month_of_year") {
    setLastTenYears(params);
    let data = await getAPIHistogramData(params.toString(), "month_of_year");
    if (data && data.results.month_of_year) {
      if (
        Object.values(data.results.month_of_year).reduce((a, b) => a + b, 0) > 0
      ) {
        timeData.timePeriods = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        timeData.type = "month_of_year";
      }
    }
  }

  return timeData;
}

export async function fetchAndRenderMapTiles(
  componentContext: SubviewObservationsMap,
  appStore: AppStoreType,
) {
  let timeRangeEl = componentContext.timeRangeEl;
  if (!timeRangeEl) return;
  let playButtonEl = componentContext.playButtonEl;
  if (!playButtonEl) return;
  let mapMetadata = appStore.viewMetadata.observations_observations.map;
  if (!mapMetadata) return;

  // stop animation
  if (mapMetadata.mapAnimation === true) {
    stopMapAnimation(componentContext, appStore);

    // start animation
  } else {
    let timePeriods = appStore.viewMetadata.mapTimePeriods;

    clearMapLayers(appStore);

    // create separate store so that appStore.observationsApiParams aren't altered
    let store = {
      map: appStore.map,
      selectedTaxa: appStore.selectedTaxa,
      currentView: appStore.currentView,
      taxaMapLayers: {},
      record_type: appStore.record_type,
      observationsApiParams: {},
    } as AppStoreType;

    timePeriods.forEach(async (timePeriod, i) => {
      let setTimeoutId = setTimeout(async () => {
        timeRangeEl.value = i.toString();
        updateCurrentTimeText(i, componentContext, appStore);

        let params = structuredClone(appStore.observationsApiParams);
        if (mapMetadata.category === "year") {
          params.year = timePeriod.toString();
        } else if (mapMetadata.category === "month_of_year") {
          params.month = timePeriod.toString();
        } else {
          params.d1 = timePeriod.toLocaleString();
          let [year, month] = timePeriod.toString().split("-");
          // @ts-ignore
          params.d2 = `${year}-${month}-${MONTH_LAST_DAY[Number(month)]}`;
        }
        store.observationsApiParams = params;

        await updateTilesForSelectedTaxa(store);
        if (mapMetadata) {
          mapMetadata.mapLayers = store.taxaMapLayers;
        }

        // stop animation at end of loop
        if (i === timePeriods.length - 1) {
          stopMapAnimation(componentContext, appStore);
        }
      }, i * 3000);

      // save setTimeoutId to store so the app can stop the setTimeout
      if (mapMetadata.setTimeoutIds) {
        mapMetadata.setTimeoutIds.push(setTimeoutId);
      }
    });

    mapMetadata.mapAnimation = true;
    playButtonEl.innerHTML = pauseIcon;
  }
}

function clearMapLayers(appStore: AppStoreType) {
  let mapMetadata = appStore.viewMetadata.observations_observations.map;
  if (!mapMetadata) return;
  let layerControl = appStore.map.layerControl;
  if (!layerControl) return;

  appStore.selectedTaxa.forEach((taxon) => {
    removeOneTaxonFromMap(appStore, taxon.id);
    if (mapMetadata.mapLayers && mapMetadata.mapLayers[taxon.id]) {
      mapMetadata.mapLayers[taxon.id].forEach((layer) => {
        layerControl.removeLayer(layer);
        layer.remove();
      });
    }
  });
}

export function stopMapAnimation(
  componentContext: SubviewObservationsMap,
  appStore: AppStoreType,
) {
  let mapMetadata = appStore.viewMetadata.observations_observations.map;
  if (!mapMetadata) return;
  let playButtonEl = componentContext.playButtonEl;
  if (!playButtonEl) return;

  mapMetadata.mapAnimation = false;
  playButtonEl.innerHTML = playIcon;

  mapMetadata.setTimeoutIds?.forEach((id) => {
    clearTimeout(id);
  });
}

export function toggleAnimationControls(
  componentContext: SubviewObservationsMap,
  appStore: AppStoreType,
) {
  if (!componentContext.animateControls) return;

  let mapMetadata = appStore.viewMetadata.observations_observations.map;
  if (!mapMetadata) return;

  if (mapMetadata.category === "none") {
    componentContext.animateControls.classList.add("hidden");
  } else {
    componentContext.animateControls.classList.remove("hidden");
  }
}

export function initFilters(appStore: AppStoreType) {
  let mapMetadata = appStore.viewMetadata.observations_observations.map;
  if (mapMetadata) {
    if (mapMetadata.category) {
      setSelectedOption(
        `#map-form select#map-category option[value='${mapMetadata.category}']`,
      );
    }
  }
}
