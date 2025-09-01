import type {
  MapStore,
  AppUrlParams,
  AppUrlParamsKeys,
  NormalizediNatTaxon,
} from "../types/app";
import { bboxPlace } from "./data_utils";
import { convertParamsBBoxToLngLat } from "./map_utils";

export function displayJson(json: any, el: HTMLElement | null) {
  const debug = import.meta.env.VITE_DEBUG;
  if (!debug || debug === "false") return;

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
  let taxaIds = appStore.selectedTaxa.map((t) => t.id).join(",");
  let placesIds = appStore.selectedPlaces.map((t) => t.id).join(",");
  let colors = appStore.selectedTaxa.map((t) => t.color).join(",");
  if (taxaIds.length === 0 && placesIds.length === 0) {
    return "";
  }

  let params: AppUrlParams = {};
  if (taxaIds.length > 0) {
    params.taxon_ids = taxaIds;
  }
  if (placesIds) {
    params.place_id = placesIds;
  }
  if (colors.length > 0) {
    params.colors = colors;
  }

  Object.entries(appStore.inatApiParams).forEach(([key, value]) => {
    if (!["taxon_id", "place_id", "color"].includes(key)) {
      if (params) {
        params[key as AppUrlParamsKeys] = value as any;
      }
    }
  });

  let searchParams = new URLSearchParams(params as any)
    .toString()
    .replaceAll("%2C", ",");

  if (appStore.formFilters.params !== "") {
    searchParams += "&" + appStore.formFilters.params;
  }
  return searchParams;
}

export function updateUrl(url_location: Location, appStore: MapStore) {
  let paramsString = formatAppUrl(appStore);
  let url = paramsString
    ? `${url_location.origin}?${paramsString}`
    : url_location.origin;
  window.history.pushState({}, "", url);
}

export function decodeAppUrl(searchParams: string) {
  const urlParams = Object.fromEntries(new URLSearchParams(searchParams));
  let apiParams = { inatApiParams: {} } as MapStore;

  let taxa: NormalizediNatTaxon[] = [];
  if ("taxon_ids" in urlParams) {
    let ids = urlParams.taxon_ids.split(",");
    let colors = urlParams.colors.split(",");
    ids.forEach((id, i) => {
      taxa.push({
        id: Number(id),
        color: colors[i],
      });
      if (i === ids.length - 1) {
        apiParams.color = colors[i];
      }
    });
  }
  apiParams.selectedTaxa = taxa;

  if ("place_id" in urlParams) {
    let ids = urlParams.place_id.split(",");

    let places = ids
      .map((id) => {
        if (id === "0") {
          let lngLatCoors = convertParamsBBoxToLngLat(urlParams);
          if (lngLatCoors) {
            return bboxPlace(lngLatCoors);
          }
        } else {
          return { id: Number(id) };
        }
      })
      .filter((p) => p);

    if (places) {
      apiParams.selectedPlaces = places as any;
    }
  }
  if ("nelat" in urlParams) {
    apiParams.inatApiParams = {
      nelat: Number(urlParams.nelat),
      nelng: Number(urlParams.nelng),
      swlat: Number(urlParams.swlat),
      swlng: Number(urlParams.swlng),
    };
  }
  if ("verifiable" in urlParams) {
    apiParams.inatApiParams.verifiable = urlParams.verifiable === "true";
  }
  if ("spam" in urlParams) {
    apiParams.inatApiParams.spam = urlParams.spam === "true";
  }

  return apiParams;
}
