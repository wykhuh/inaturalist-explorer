import type {
  MapStore,
  ObservationsApiParams,
  ObservationsApiParamsKeys,
  NormalizediNatTaxon,
  ObservationViews,
  NameOrder,
  IdentificationsApiParamsKeys,
} from "../types/app";
import {
  bboxPlaceRecord,
  IdentificationsApiFilterableNames,
  ObservationsApiFilterableNames,
  ObservationsApiNames,
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

export function pluralize(
  number: number | undefined,
  text: string,
  useComma = false,
) {
  if (number === undefined) number = 0;
  let displayNumber = useComma ? number.toLocaleString() : number;
  if (number === 1) {
    return `${displayNumber} ${text}`;
  } else {
    return `${displayNumber} ${text}s`;
  }
}

export function formatAppUrl(
  appStore: MapStore,
  recordType = appStore.record_type,
) {
  let isIdentifications = recordType === "identifications";
  let isObservations = recordType === "observations";

  let taxaIds = appStore.selectedTaxa
    .filter((r) => r.id !== 0)
    .map((r) => r.id)
    .join(",");
  let taxaIdentifiedIds = appStore.selectedTaxaIdentified
    .filter((r) => r.id !== 0)
    .map((r) => r.id)
    .join(",");
  let placesIds = appStore.selectedPlaces
    .filter((r) => r.id !== 0)
    .map((r) => r.id)
    .join(",");
  let projectsIds = appStore.selectedProjects.map((r) => r.id).join(",");
  let usersIds = appStore.selectedUsers.map((r) => r.id).join(",");
  let usersIdentifiersIds = appStore.selectedUsersIdentifiers
    .map((r) => r.id)
    .join(",");
  let colors = appStore.selectedTaxa
    .filter((r) => r.id !== 0)
    .map((r) => r.color)
    .join(",");

  let params: ObservationsApiParams = {};

  if (taxaIds.length > 0) {
    if (isIdentifications) {
      params.observation_taxon_id = taxaIds;
    } else {
      params.taxon_id = taxaIds;
    }
  }
  if (taxaIdentifiedIds.length > 0) {
    if (isIdentifications) {
      params.taxon_id = taxaIdentifiedIds;
    }
  }
  if (placesIds) {
    params.place_id = placesIds;
  }
  if (projectsIds) {
    params.project_id = projectsIds;
  }
  if (usersIds.length > 0) {
    if (isObservations) {
      params.user_id = usersIds;
    }
  }
  if (usersIdentifiersIds.length > 0) {
    if (isObservations) {
      params.ident_user_id = usersIdentifiersIds;
    } else {
      params.user_id = usersIdentifiersIds;
    }
  }
  if (colors.length > 0) {
    params.colors = colors;
  }

  let processedKeys = [
    "taxon_id",
    "observation_taxon_id",
    "place_id",
    "project_id",
    "user_id",
    "ident_user_id",
    "colors",
  ];
  Object.entries(appStore.observationsApiParams).forEach(([key, value]) => {
    if (processedKeys.includes(key)) {
    } else {
      if (params && ObservationsApiNames.includes(key)) {
        params[key as ObservationsApiParamsKeys] = value as any;
      }
    }
  });

  if (appStore.currentView === "observations") {
    if (appStore.viewMetadata.observations?.subview === "table") {
      params.view = appStore.currentView;
      params.subview = appStore.viewMetadata.observations.subview;
    }
  } else if (appStore.currentView) {
    if (validViews.includes(appStore.currentView)) {
      params.view = appStore.currentView;
    }
  }

  if (appStore.viewMetadata.name_order) {
    params.name_order = appStore.viewMetadata.name_order;
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
  let defaultNameOrder = parts.includes("name_order=cs");
  let defaultLocale = parts.includes("locale=en");

  if (defaultiNatAPiParamas && defaultView) {
    parts = removeValueFromArray("verifiable=true", parts);
    parts = removeValueFromArray("spam=false", parts);
    parts = removeValueFromArray("locale=en", parts);
    parts = removeValueFromArray("view=observations", parts);
    parts = removeValueFromArray("subview=grid", parts);
  }

  if (defaultView) {
    parts = removeValueFromArray("view=observations", parts);
    parts = removeValueFromArray("subview=grid", parts);
  }

  if (defaultNameOrder) {
    parts = removeValueFromArray("name_order=cs", parts);
  }

  if (defaultLocale) {
    parts = removeValueFromArray("locale=en", parts);
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
  let url = `${url_location.origin}${import.meta.env.VITE_BASE}${url_location.pathname}`;
  if (paramsString) {
    url += `?${paramsString}`;
  }

  window.history.pushState({}, "", url);
}

export function decodeAppUrl(searchParams: string, path = "/") {
  const urlParams = Object.fromEntries(new URLSearchParams(searchParams));
  let store = {
    observationsApiParams: {},
    identificationsApiParams: {},
    viewMetadata: {
      observations: {},
      identifiers: {},
      observers: {},
      species: {},
    },
  } as MapStore;
  let isObservations = true;

  if (path === "/identifications/") {
    store.record_type = "identifications";
    isObservations = false;
  } else {
    store.record_type = "observations";
  }

  // convert observation_taxon_id into selectedTaxa
  if ("observation_taxon_id" in urlParams) {
    if (!isObservations) {
      let taxa: NormalizediNatTaxon[] = [];
      let ids = urlParams.observation_taxon_id.split(",");
      let colors = urlParams.colors
        ? urlParams.colors.split(",")
        : defaultColorScheme;
      ids.forEach((id, i) => {
        taxa.push({
          id: Number(id),
          color: colors[i],
        });
      });
      store.color = colors[ids.length - 1];

      store.selectedTaxa = taxa;
    }
  }

  // convert taxon_id into basic selectedTaxa or selectedTaxaIdentified id
  if ("taxon_id" in urlParams) {
    let taxa: NormalizediNatTaxon[] = [];
    let ids = urlParams.taxon_id.split(",");

    if (isObservations) {
      let colors = urlParams.colors
        ? urlParams.colors.split(",")
        : defaultColorScheme;
      ids.forEach((id, i) => {
        taxa.push({
          id: Number(id),
          color: colors[i],
        });
      });
      store.color = colors[ids.length - 1];
      store.selectedTaxa = taxa;
    } else {
      ids.forEach((id) => {
        taxa.push({
          id: Number(id),
        });
      });
      store.selectedTaxaIdentified = taxa;
    }
  }

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
  if (isObservations && "nelat" in urlParams) {
    let coords = {
      nelat: Number(urlParams.nelat),
      nelng: Number(urlParams.nelng),
      swlat: Number(urlParams.swlat),
      swlng: Number(urlParams.swlng),
    };
    store.observationsApiParams = coords;
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

    if (isObservations) {
      store.selectedUsers = users as any;
    } else {
      store.selectedUsersIdentifiers = users as any;
    }
  }

  // convert ident_user_id into basic selectedUserIdentifier with id
  if ("ident_user_id" in urlParams) {
    if (isObservations) {
      let ids = urlParams.ident_user_id.split(",");

      store.selectedUsersIdentifiers = [{ id: Number(ids[0]) }] as any;
    }
  }

  if ("unobserved_by_user_id" in urlParams) {
    if (isObservations) {
      let id = Number(urlParams.unobserved_by_user_id);

      store.selectedUnobservedByUser = { id: Number(id) } as any;
    }
  }

  if (urlParams.view && validViews.includes(urlParams.view)) {
    store.currentView = urlParams.view as ObservationViews;
  } else {
    store.currentView = "observations";
  }

  if (urlParams.view === "observations") {
    if (validObservationsSubviews.includes(urlParams.subview)) {
      store.viewMetadata.observations.subview = urlParams.subview;
    }
  } else if (urlParams.view === "identifications") {
    store.viewMetadata.identifications = {};
  }

  if (urlParams.order) {
    if (isObservations && orderValues.includes(urlParams.order)) {
      store.observationsApiParams.order = urlParams.order;
    }
    if (urlParams.view && validViews.includes(urlParams.view)) {
      store.viewMetadata[urlParams.view as ObservationViews].order =
        urlParams.order;
    } else {
      store.viewMetadata.observations.order = urlParams.order;
    }
  }

  if (urlParams.order_by) {
    if (
      isObservations &&
      observationsOrderByValues.includes(urlParams.order_by)
    ) {
      store.observationsApiParams.order_by = urlParams.order_by;
    }
    if (urlParams.view && validViews.includes(urlParams.view)) {
      store.viewMetadata[urlParams.view as ObservationViews].order_by =
        urlParams.order_by;
    } else {
      store.viewMetadata.observations.order_by = urlParams.order_by;
    }
  }

  if (urlParams.page) {
    if (isObservations) {
      store.observationsApiParams.page = Number(urlParams.page);
    }
    if (urlParams.view && validViews.includes(urlParams.view)) {
      store.viewMetadata[urlParams.view as ObservationViews].page = Number(
        urlParams.page,
      );
    } else {
      store.viewMetadata.observations.page = Number(urlParams.page);
    }
  }

  if (isObservations && urlParams.locale) {
    store.observationsApiParams.locale = urlParams.locale;
  }
  if (urlParams.name_order) {
    store.viewMetadata.name_order = urlParams.name_order as NameOrder;
  }

  for (let [key, value] of new URLSearchParams(searchParams)) {
    if (isObservations) {
      setUrlStoreValuesObservations(key, value, store);
    } else {
      setUrlStoreValuesIdentifications(key, value, store);
    }
  }
  return store;
}

// convert string values to boolean and numbers
function setUrlStoreValuesObservations(
  key: string,
  value: string,
  appStore: MapStore,
) {
  let cleanedValue = value as string | number | boolean;

  if (ObservationsApiFilterableNames.includes(key)) {
    if (value === "true") {
      cleanedValue = true;
    }
    if (value === "false") {
      cleanedValue = false;
    }
    if (/^\d+$/.test(value)) {
      cleanedValue = Number(value);
    }
    appStore.observationsApiParams[key as ObservationsApiParamsKeys] =
      cleanedValue;
  }
}

function setUrlStoreValuesIdentifications(
  key: string,
  value: string,
  appStore: MapStore,
) {
  let cleanedValue = value as string | number | boolean;

  if (IdentificationsApiFilterableNames.includes(key)) {
    if (value === "true") {
      cleanedValue = true;
    }
    if (value === "false") {
      cleanedValue = false;
    }
    if (/^\d+$/.test(value)) {
      cleanedValue = Number(value);
    }
    appStore.identificationsApiParams[key as IdentificationsApiParamsKeys] =
      cleanedValue;
  }
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
export function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

export function formatDate(date: string | null, timezone?: string) {
  if (!date) return;

  let options = {
    timeZoneName: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  } as any;
  if (timezone) {
    options.timeZone = timezone;
  }

  // TODO: localize date
  return new Date(date).toLocaleString("en-US", options);
}

// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
export async function createHashString(message: string) {
  const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8); // hash the message
  // NOTE: JavaScript's toHex()  is not supported in Typescript or Node yet,
  // therefore I used  buf2hex instead of toHex(), so that tests will pass.
  // const hashHex = new Uint8Array(hashBuffer).toHex();
  const hashHex = buf2hex(new Uint8Array(hashBuffer)); // Convert ArrayBuffer to hex string.
  return hashHex;
}

// https://stackoverflow.com/questions/40031688/how-can-i-convert-an-arraybuffer-to-a-hexadecimal-string-hex
function buf2hex(buffer: ArrayBuffer) {
  // buffer is an ArrayBuffer
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}
