import type { MapStore, MapStoreKeys } from "../types/app";
import type { PolygonJson } from "../types/inat_api";
import { leafletVisibleLayers } from "./data_utils";
import { displayJson } from "./utils";

export function createModal() {
  let displayJsonEl = document.getElementById("display-json");
  if (!displayJsonEl) return;

  displayJsonEl.innerHTML = "";

  let buttonEl = document.createElement("button");
  buttonEl.textContent = "show store data";
  displayJsonEl.appendChild(buttonEl);

  let dialogueEl = document.createElement("dialog");

  let closeButtonEl = document.createElement("button");
  closeButtonEl.textContent = "close";
  dialogueEl.appendChild(closeButtonEl);

  let contentEl = document.createElement("div");
  dialogueEl.appendChild(contentEl);

  displayJsonEl.appendChild(dialogueEl);

  buttonEl.addEventListener("click", () => {
    dialogueEl.showModal();
  });

  closeButtonEl.addEventListener("click", () => {
    dialogueEl.close();
  });

  return contentEl;
}

function formatTaxaMapLayers(appStore: MapStore) {
  let temp: any = {};
  Object.entries(appStore.taxaMapLayers).forEach(([key, val]) => {
    temp[key] = val
      .filter((v) => v)
      .map((v: any) => v.options?.layer_description);
  });
  return temp;
}
function formatSelectedPlaces(appStore: MapStore) {
  return appStore.selectedPlaces.map((place) => {
    let temp = {} as any;
    Object.entries(place).forEach(([key, val]) => {
      if (["bounding_box", "geometry"].includes(key)) {
        let value = val as PolygonJson;
        temp[key] = {
          type: value.type,
          coordinates:
            value.type === "Polygon"
              ? value.coordinates[0].length
              : value.coordinates[0][0].length,
        };
      } else {
        temp[key] = val;
      }
    });
    return temp;
  });
}
function formatPlacesMapLayers(appStore: MapStore) {
  let temp: any = {};
  Object.entries(appStore.placesMapLayers).forEach(([key, val]) => {
    temp[key] = val.map((v: any) => v.options.layer_description);
  });
  return temp;
}
function formatRefreshMap(appStore: MapStore) {
  return {
    showRefreshMapButton: appStore.refreshMap.showRefreshMapButton,
    layer: {
      layer_description: appStore.refreshMap.layer?.options.layer_description,
      bounds: appStore.refreshMap.layer?._bounds,
    },
  };
}
function formatYears(appStore: MapStore) {
  let yearString = "";
  if (appStore.iNatStats.years) {
    let allYears = appStore.iNatStats.years;
    yearString = `${allYears[0]}-${allYears[allYears.length - 1]}`;
  }
  return yearString;
}

function toggleOverlay() {
  const debug = import.meta.env.VITE_DEBUG;
  if (!debug || debug === "false") return;

  let displayJsonEl = document.getElementById("display-json");
  if (!displayJsonEl) return;
  let displayJsonWrapperEl = document.getElementById("display-json-wrapper");
  if (!displayJsonWrapperEl) return;
  let controlsEl = document.querySelector("#display-json .controls");
  if (!controlsEl) return;

  let buttonEl = document.createElement("button");
  buttonEl.textContent = "show app store";
  // let buttonEl = document.querySelector("#display-json button");
  if (!buttonEl) return;

  controlsEl.appendChild(buttonEl);
  buttonEl.addEventListener("click", () => {
    if (displayJsonWrapperEl.className === "hide") {
      displayJsonWrapperEl.className = "";
    } else {
      displayJsonWrapperEl.className = "hide";
    }
  });
}

toggleOverlay();

export function displayUserData(appStore: MapStore, _source: string) {
  const debug = import.meta.env.VITE_DEBUG;
  if (!debug || debug === "false") return;

  let displayJsonWrapperEl = document.getElementById("display-json-wrapper");
  if (!displayJsonWrapperEl) return;

  let data = {} as any;
  Object.keys(appStore).forEach((k) => {
    let key = k as MapStoreKeys;
    if (key === "taxaMapLayers") {
      data.taxaMapLayers = formatTaxaMapLayers(appStore);
    } else if (key === "placesMapLayers") {
      data.placesMapLayers = formatPlacesMapLayers(appStore);
    } else if (key === "map") {
      data.map = {
        map: !!appStore.map.map,
        layerControl: !!appStore.map.layerControl,
      };
      data.mapLayerDescriptions = leafletVisibleLayers(appStore);
    } else if (key === "iNatStats") {
      data.iNatStats = { years_summary: formatYears(appStore) };
    } else if (key === "selectedPlaces") {
      data.selectedPlaces = formatSelectedPlaces(appStore);
    } else if (key === "refreshMap") {
      data.refreshMap = formatRefreshMap(appStore);
    } else if (key === "observationsSubviewData") {
      data.observationsSubviewData = appStore.observationsSubviewData.length;
    } else {
      data[key] = appStore[key];
    }
  });

  if (displayJsonWrapperEl) {
    displayJson(data, displayJsonWrapperEl);
  }
}
