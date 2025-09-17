import type {
  MapStore,
  iNatApiParams,
  iNatApiParamsKeys,
  NormalizediNatTaxon,
  ObservationViews,
} from "../types/app";
import {
  bboxPlaceRecord,
  iNatApiFilterableNames,
  iNatApiNames,
  observationsOrderByValues,
  orderValues,
} from "../data/inat_data";
import { defaultColorScheme } from "./map_colors_utils";
import { convertParamsBBoxToLngLat } from "./map_utils";
import { validObservationsSubviews, validViews } from "../data/app_data";

export function displayJson(json: any, el: HTMLElement | null) {
  // fix cyclic object errors
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value#Examples
  const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (_key: string, value: any) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    };
  };

  if (el) {
    el.innerText = JSON.stringify(json, getCircularReplacer(), 2);
  }
}

export function hexToRgb(hex: string, alpha = 1) {
  if (hex.length < 7) return;

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return;

  let rgb = {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
  let str = `${rgb.r},${rgb.g},${rgb.b},${alpha}`;

  return str;
}

export function pluralize(number: number, text: string, useComma = false) {
  let displayNumber = useComma ? number.toLocaleString() : number;
  if (number === 1) {
    return `${displayNumber} ${text}`;
  } else {
    return `${displayNumber} ${text}s`;
  }
}

export function formatAppUrl(appStore: MapStore) {
  let taxaIds = appStore.selectedTaxa
    .filter((r) => r.id !== 0)
    .map((r) => r.id)
    .join(",");
  let placesIds = appStore.selectedPlaces
    .filter((r) => r.id !== 0)
    .map((r) => r.id)
    .join(",");
  let projectsIds = appStore.selectedProjects.map((r) => r.id).join(",");
  let usersIds = appStore.selectedUsers.map((r) => r.id).join(",");
  let colors = appStore.selectedTaxa
    .filter((r) => r.id !== 0)
    .map((r) => r.color)
    .join(",");

  let params: iNatApiParams = {};
  if (taxaIds.length > 0) {
    params.taxon_id = taxaIds;
  }
  if (placesIds) {
    params.place_id = placesIds;
  }
  if (projectsIds) {
    params.project_id = projectsIds;
  }
  if (usersIds) {
    params.user_id = usersIds;
  }
  if (colors.length > 0) {
    params.colors = colors;
  }

  let processedKeys = [
    "taxon_id",
    "place_id",
    "project_id",
    "user_id",
    "colors",
  ];
  Object.entries(appStore.inatApiParams).forEach(([key, value]) => {
    if (processedKeys.includes(key)) {
    } else {
      if (params && iNatApiNames.includes(key)) {
        params[key as iNatApiParamsKeys] = value as any;
      }
    }
  });

  if (appStore.currentView === "observations") {
    if (appStore.currentObservationsSubview === "table") {
      params.view = appStore.currentView;
      params.subview = appStore.currentObservationsSubview;
    }
  } else if (appStore.currentView) {
    if (validViews.includes(appStore.currentView)) {
      params.view = appStore.currentView;
    }
  }

  let searchParams = new URLSearchParams(params as any)
    .toString()
    .replaceAll("%2C", ",");

  searchParams = removeDefaultParams(searchParams);

  return searchParams;
}

export function removeDefaultParams(searchParams: string) {
  let parts = searchParams.split("&");

  let defaultiNatAPiParamas =
    parts.includes("verifiable=true") && parts.includes("spam=false");
  let defaultView =
    parts.includes("view=observations") && parts.includes("subview=grid");

  if (defaultiNatAPiParamas && defaultView) {
    parts = removeValueFromArray("verifiable=true", parts);
    parts = removeValueFromArray("spam=false", parts);
    parts = removeValueFromArray("view=observations", parts);
    parts = removeValueFromArray("subview=grid", parts);
  }
  if (defaultView) {
    parts = removeValueFromArray("view=observations", parts);
    parts = removeValueFromArray("subview=grid", parts);
  }
  if (defaultiNatAPiParamas && parts.length === 2) {
    parts = removeValueFromArray("verifiable=true", parts);
    parts = removeValueFromArray("spam=false", parts);
  }

  return parts.join("&");
}

function removeValueFromArray(value: any, array: any[]) {
  const index = array.indexOf(value);
  if (index > -1) {
    array.splice(index, 1);
  }
  return array;
}

export function updateAppUrl(url_location: Location, appStore: MapStore) {
  let paramsString = formatAppUrl(appStore);
  let url = paramsString
    ? `${url_location.origin}?${paramsString}`
    : url_location.origin;

  window.history.pushState({}, "", url);
  window.dispatchEvent(new Event("appUrlChange"));
}

export function decodeAppUrl(searchParams: string) {
  const urlParams = Object.fromEntries(new URLSearchParams(searchParams));
  let store = { inatApiParams: {} } as MapStore;

  // convert taxon_id into basic selectedTaxa with id and color
  let taxa: NormalizediNatTaxon[] = [];
  if ("taxon_id" in urlParams) {
    let ids = urlParams.taxon_id.split(",");
    let colors = urlParams.colors
      ? urlParams.colors.split(",")
      : defaultColorScheme;
    ids.forEach((id, i) => {
      taxa.push({
        id: Number(id),
        color: colors[i],
      });
      if (i === ids.length - 1) {
        store.color = colors[i];
      }
    });
  }
  store.selectedTaxa = taxa;

  // convert place_id into basic selectedPlaces with id or bbox
  if ("place_id" in urlParams && urlParams.place_id !== "any") {
    let ids = urlParams.place_id.split(",");

    let places = ids
      .map((id) => {
        if (id === "0") {
          let lngLatCoors = convertParamsBBoxToLngLat(urlParams);
          if (lngLatCoors) {
            return bboxPlaceRecord(lngLatCoors);
          }
        } else {
          return { id: Number(id) };
        }
      })
      .filter((p) => p);

    if (places) {
      store.selectedPlaces = places as any;
    }
  }
  if ("nelat" in urlParams) {
    store.inatApiParams = {
      nelat: Number(urlParams.nelat),
      nelng: Number(urlParams.nelng),
      swlat: Number(urlParams.swlat),
      swlng: Number(urlParams.swlng),
    };
  }
  // convert project_id into basic selectedProject with id
  if ("project_id" in urlParams && urlParams.project_id !== "any") {
    let ids = urlParams.project_id.split(",");

    let projects = ids
      .map((id) => {
        return { id: Number(id) };
      })
      .filter((p) => p);

    if (projects) {
      store.selectedProjects = projects as any;
    }
  }
  // convert user_id into basic selectedUser with id
  if ("user_id" in urlParams && urlParams.user_id !== "any") {
    let ids = urlParams.user_id.split(",");

    let users = ids
      .map((id) => {
        return { id: Number(id) };
      })
      .filter((p) => p);

    if (users) {
      store.selectedUsers = users as any;
    }
  }

  if (urlParams.view && validViews.includes(urlParams.view)) {
    store.currentView = urlParams.view as ObservationViews;
    if (urlParams.view === "observations") {
      if (
        urlParams.subview &&
        validObservationsSubviews.includes(urlParams.subview)
      ) {
        store.currentObservationsSubview = urlParams.subview;
      }
    }
  }

  for (let [key, value] of new URLSearchParams(searchParams)) {
    // convert to boolean
    if (iNatApiFilterableNames.includes(key)) {
      if (value === "true") {
        value = true as unknown as string;
      }
      if (value === "false") {
        value = false as unknown as string;
      }
      (store.inatApiParams[key as iNatApiParamsKeys] as string) = value;
    }
  }

  if (urlParams.page) {
    store.inatApiParams.page = Number(urlParams.page);
  }

  if (urlParams.order && orderValues.includes(urlParams.order)) {
    store.inatApiParams.order = urlParams.order;
  }

  if (
    urlParams.order_by &&
    observationsOrderByValues.includes(urlParams.order_by)
  ) {
    store.inatApiParams.order_by = urlParams.order_by;
  }

  return store;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
export function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

export function formatDate(date: string | null, timezone: string) {
  if (!date) return;

  return new Date(date).toLocaleString("en-US", {
    timeZone: timezone,
    timeZoneName: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
}
