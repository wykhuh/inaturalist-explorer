import type {
  MapStore,
  AppUrlParams,
  AppUrlParamsKeys,
  NormalizediNatTaxon,
} from "../types/app";

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
  let placesIds = appStore.selectedPlaces?.id.toString();
  let colors = appStore.selectedTaxa.map((t) => t.color).join(",");

  let params: AppUrlParams = {};
  if (taxaIds.length > 0) {
    params.taxa_id = taxaIds;
  }
  if (placesIds) {
    params.places_id = placesIds;
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

  return new URLSearchParams(params as any).toString();
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
  if ("taxa_id" in urlParams) {
    let ids = urlParams.taxa_id.split(",");
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

  if ("places_id" in urlParams) {
    apiParams.selectedPlaces = { id: Number(urlParams.places_id) };
    if (urlParams.places_id === "0") {
      apiParams.selectedPlaces.display_name = "Custom Boundary";
      apiParams.selectedPlaces.name = "Custom Boundary";
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
