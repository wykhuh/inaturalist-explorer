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
  mapMetadata.category = category;
}

export async function fetchAndRenderTimePeriods(
  appStore: AppStoreType,
  componentContext: SubviewObservationsMap,
) {
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
  mapMetadata.currentIndex = index;
}

export async function fetchTimePeriods(appStore: AppStoreType) {
  let mapMetadata = appStore.viewMetadata.observations_observations.map;

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
      // check if there are all counts are zero
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

export function formatTimePeriodsParams(appStore: AppStoreType) {
  let timePeriods = appStore.viewMetadata.mapTimePeriods;
  let mapMetadata = appStore.viewMetadata.observations_observations.map;
  let params: { [k: string]: string }[] = [];

  timePeriods.forEach((timePeriod) => {
    if (mapMetadata.category === "year") {
      params.push({ year: timePeriod.toString() });
    } else if (mapMetadata.category === "month_of_year") {
      params.push({ month: timePeriod.toString() });
    } else {
      let [year, month] = timePeriod.toString().split("-");

      params.push({
        d1: timePeriod.toString(),
        // @ts-ignore
        d2: `${year}-${month}-${MONTH_LAST_DAY[Number(month)]}`,
      });
    }
  });

  return params;
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

  // stop animation
  if (mapMetadata.mapAnimation === true) {
    stopMapAnimation(componentContext, appStore);

    // start animation
  } else {
    // delete existin map layers
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

    let timePeriodsParams = formatTimePeriodsParams(appStore);
    if (!timePeriodsParams) return;

    let count = 0;
    timePeriodsParams.forEach(async (timePeriod, i) => {
      // skip timePeriod that were shown or skipped
      if (mapMetadata.currentIndex && i < mapMetadata.currentIndex) return;

      let setTimeoutId = setTimeout(async () => {
        timeRangeEl.value = i.toString();
        updateCurrentTimeText(i, componentContext, appStore);

        let params = structuredClone(appStore.observationsApiParams);

        store.observationsApiParams = { ...params, ...timePeriod };
        await updateTilesForSelectedTaxa(store);

        if (mapMetadata) {
          // save map layers to store so app can remove them
          mapMetadata.mapLayers = store.taxaMapLayers;
          mapMetadata.currentIndex = i;
        }

        // stop animation at end of loop
        if (i === timePeriodsParams.length - 1) {
          stopMapAnimation(componentContext, appStore);
          mapMetadata.currentIndex = 0;
        }
      }, count * 3000);
      count += 1;

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
  if (mapMetadata.category === "none") {
    componentContext.animateControls.classList.add("hidden");
  } else {
    componentContext.animateControls.classList.remove("hidden");
  }
}

export function initFilters(appStore: AppStoreType) {
  let mapMetadata = appStore.viewMetadata.observations_observations.map;
  if (mapMetadata.category) {
    setSelectedOption(
      `#map-form select#map-category option[value='${mapMetadata.category}']`,
    );
  }
}
