import type {
  MapStore,
  iNatApiParams,
  iNatApiParamsKeys,
  NormalizediNatTaxon,
} from "../types/app";
import { bboxPlaceRecord, iNatApiNonFilterableNames } from "./inat_data";
import { defaultColorScheme } from "./map_colors_utils";
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

  Object.entries(appStore.inatApiParams).forEach(([key, value]) => {
    if (
      !["taxon_id", "place_id", "project_id", "user_id", "colors"].includes(key)
    ) {
      if (params) {
        params[key as iNatApiParamsKeys] = value as any;
      }
    }
  });

  let searchParams = new URLSearchParams(params as any)
    .toString()
    .replaceAll("%2C", ",");

  if (defaultParams(searchParams)) {
    return "";
  }

  return searchParams;
}

function defaultParams(searchParams: string) {
  let parts = searchParams.split("&");
  if (
    parts.includes("verifiable=true") &&
    parts.includes("spam=false") &&
    parts.length === 2
  ) {
    return true;
  }
  return false;
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
        apiParams.color = colors[i];
      }
    });
  }
  apiParams.selectedTaxa = taxa;

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
  // convert project_id into basic selectedProject with id
  if ("project_id" in urlParams && urlParams.project_id !== "any") {
    let ids = urlParams.project_id.split(",");

    let projects = ids
      .map((id) => {
        return { id: Number(id) };
      })
      .filter((p) => p);

    if (projects) {
      apiParams.selectedProjects = projects as any;
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
      apiParams.selectedUsers = users as any;
    }
  }

  for (let [key, value] of new URLSearchParams(searchParams)) {
    if (!iNatApiNonFilterableNames.includes(key)) {
      if (value === "true") {
        value = true as unknown as string;
      }
      if (value === "false") {
        value = false as unknown as string;
      }
      (apiParams.inatApiParams[key as iNatApiParamsKeys] as string) = value;
    }
  }
  return apiParams;
}
