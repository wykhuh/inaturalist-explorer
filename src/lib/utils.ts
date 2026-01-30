import type {
  AppStoreType,
  ObservationsApiParamsType,
  ObservationsApiParamsKeysType,
  NormalizediNatTaxonType,
  ObservationViewsType,
  NameOrderType,
  IdentificationsApiParamsKeysType,
  IdentificationsApiParamsType,
  ObservationSubviewsType,
  IdentificationSubviewsType,
} from "../types/app";
import {
  bboxPlaceRecord,
  observationsOrderByValuesAll,
  orderValues,
} from "../data/inat_data";
import {
  identificationsApiFilterableNames,
  identificationsApiNames,
  observationsApiFilterableNames,
  observationsApiNames,
  recordTypeToPathObj,
  validIdentificationsSubviews,
} from "../data/app_data";
import { defaultColorScheme, getColor } from "./map_colors_utils";
import { convertiNatBBoxToLngLat } from "./map_utils";
import { validObservationsSubviews, validViews } from "../data/app_data";
import { getResourceApiParams } from "./data_utils";
import { loggerEvent } from "./logger";

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
  appStore: AppStoreType,
  recordType = appStore.record_type,
  format = "string",
  processRemovedDefaultParams = true,
) {
  let isIdentifications = recordType === "identifications";
  let isObservations = recordType === "observations";

  if (!isIdentifications && !isObservations) {
    return "";
  }

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

  let params: ObservationsApiParamsType & IdentificationsApiParamsType = {};

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
    if (isObservations) {
      params.project_id = projectsIds;
    }
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
      // NOTE: only allow one user id because iNat identifications api returns
      // zero records if there are multiple user ids
      let ids = usersIdentifiersIds.split(",");
      params.user_id = ids[ids.length - 1];
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

  if (isObservations) {
    Object.entries(appStore.observationsApiParams).forEach(([key, value]) => {
      if (processedKeys.includes(key)) {
      } else {
        if (params && observationsApiNames.includes(key)) {
          (params as any)[key] = value as any;
        }
      }
    });
  } else if (isIdentifications) {
    Object.entries(appStore.identificationsApiParams).forEach(
      ([key, value]) => {
        if (processedKeys.includes(key)) {
        } else {
          if (params && identificationsApiNames.includes(key)) {
            (params as any)[key] = value as any;
          }
        }
      },
    );
  }

  if (appStore.currentView === "observations_observations") {
    let subview = appStore.viewMetadata.observations_observations?.subview;
    if (subview && ["table", "media", "grid"].includes(subview)) {
      params.view = appStore.currentView;
      params.subview = subview;
    }
  } else if (appStore.currentView === "identifications_identifications") {
    let subview =
      appStore.viewMetadata.identifications_identifications?.subview;
    if (subview && ["grid", "history"].includes(subview)) {
      params.view = appStore.currentView;
      params.subview = subview;
    }
  } else if (appStore.currentView) {
    if (validViews.includes(appStore.currentView)) {
      params.view = appStore.currentView;
    }
  }

  if (processRemovedDefaultParams) {
    removeDefaultParams(params);
  }

  let searchParams = new URLSearchParams(params as any);

  if (format === "string") {
    return searchParams.toString().replaceAll("%2C", ",");
  } else {
    return searchParams;
  }
}

export function removeDefaultParams(
  params: ObservationsApiParamsType & IdentificationsApiParamsType,
) {
  let defaultiNatAPiParams =
    params.verifiable === true && params.spam === false;
  let defaultObservationsView =
    params.view === "observations_observations" && params.subview === "map";
  let defaultIdentificationsView =
    params.view === "identifications_identifications" &&
    params.subview === "map";
  // @ts-ignore
  let defaultNameOrder = params.name_order === "cs";
  let defaultLocale = params.locale === "en";

  if (defaultiNatAPiParams && defaultObservationsView) {
    delete params.verifiable;
    delete params.spam;
    delete params.locale;
    delete params.view;
    delete params.subview;
  }

  if (defaultObservationsView) {
    delete params.view;
    delete params.subview;
  }

  if (defaultIdentificationsView) {
    delete params.view;
    delete params.subview;
  }

  if (defaultNameOrder) {
    // @ts-ignore
    delete params.name_order;
  }

  if (defaultLocale) {
    delete params.locale;
  }

  if (defaultiNatAPiParams && Object.keys(params).length === 2) {
    delete params.verifiable;
    delete params.spam;
  }
}

export function formatInatDownloadUrl(appStore: AppStoreType) {
  let params = formatAppUrl(
    appStore,
    "observations",
    "object",
    false,
  ) as URLSearchParams;

  let ignoreParams = [
    "per_page",
    "page",
    "view",
    "subview",
    "colors",
    "name_order",
  ];
  ignoreParams.forEach((param) => {
    if (params.get(param)) {
      params.delete(param);
    }
  });

  if (!params.get("spam")) {
    params.append("spam", "false");
  }
  if (!params.get("verifiable")) {
    params.append("verifiable", "true");
  }
  let taxon_id = params.get("taxon_id");
  if (taxon_id) {
    params.append("taxon_ids", taxon_id);
    params.delete("taxon_id");
  }

  return params.toString();
}

export function updateAppUrl(url_location: Location, appStore: AppStoreType) {
  let paramsString = formatAppUrl(appStore);
  let url = `${url_location.origin}${url_location.pathname}`;
  if (paramsString) {
    url += `?${paramsString}`;
  }

  let path = `${recordTypeToPathObj[appStore.record_type]}`;
  if (paramsString) {
    path += `?${paramsString}`;
  }

  let state = {
    path,
    view: appStore.currentView,
    recordType: appStore.record_type,
  };
  loggerEvent("[updateAppUrl] history.pushState" + JSON.stringify(state));
  window.history.pushState(state, "", path);
}

function formatBasicRecords(stringIds: string) {
  return stringIds
    .split(",")
    .map((id) => {
      return { id: Number(id) };
    })
    .filter((p) => p);
}

function formatBasicTaxaRecords(
  urlIds: string,
  urlColors: string | undefined,
  appStore: AppStoreType,
) {
  let colors = urlColors ? urlColors.split(",") : defaultColorScheme;

  return urlIds.split(",").map((id, i) => {
    let color = colors[i] || getColor(appStore, defaultColorScheme);
    appStore.color = color;
    return { id: Number(id), color: color };
  });
}

export function decodeAppUrl(searchParams: string, path = "/") {
  const urlParams = Object.fromEntries(new URLSearchParams(searchParams));
  let store = {
    observationsApiParams: {},
    identificationsApiParams: {},
    viewMetadata: {
      observations_observations: {},
      observations_identifiers: {},
      observations_observers: {},
      observations_species: {},
      identifications_identifiers: {},
      identifications_observers: {},
      identifications_species: {},
      identifications_identifications: {},
    },
  } as AppStoreType;
  let isObservations = true;
  let isIdentifications = false;

  if (path === "/identifications/") {
    store.record_type = "identifications";
    isObservations = false;
    isIdentifications = true;
  } else if (path === "/") {
    store.record_type = "observations";
  } else if (path === "/about/") {
    store.record_type = "about";
    isObservations = false;
  } else {
    throw Error("invalid record_type");
  }
  let resourceApiParams = getResourceApiParams(isObservations);

  // NOTE: update when adding selectedResource; decodeAppUrl

  // convert observation_taxon_id into selectedTaxa
  if (
    "observation_taxon_id" in urlParams &&
    urlParams.observation_taxon_id !== "any"
  ) {
    if (!isObservations) {
      let taxa: NormalizediNatTaxonType[] = [];
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
  if ("taxon_id" in urlParams && urlParams.taxon_id !== "any") {
    if (isObservations) {
      let taxa = formatBasicTaxaRecords(
        urlParams.taxon_id,
        urlParams.colors,
        store,
      );
      store.selectedTaxa = taxa;
    } else {
      let taxa = formatBasicTaxaRecords(
        urlParams.taxon_id,
        urlParams.colors,
        store,
      );
      store.selectedTaxaIdentified = taxa;
    }
  }

  if ("ident_taxon_id" in urlParams && urlParams.ident_taxon_id !== "any") {
    if (isObservations) {
      let taxa = formatBasicTaxaRecords(
        urlParams.ident_taxon_id,
        urlParams.colors,
        store,
      );
      store.selectedTaxaIdentified = taxa;
    }
  }

  // convert place_id into basic selectedPlaces with id or bbox
  if ("place_id" in urlParams && urlParams.place_id !== "any") {
    let ids = urlParams.place_id.split(",");

    let places = ids
      .map((id) => {
        if (id === "0") {
          let lngLatCoors = convertiNatBBoxToLngLat(urlParams);
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
  if (
    "nelat" in urlParams &&
    "nelng" in urlParams &&
    "swlat" in urlParams &&
    "swlng" in urlParams
  ) {
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
    let users = formatBasicRecords(urlParams.user_id);

    if (isObservations) {
      store.selectedUsers = users as any;
    } else {
      // NOTE: iNat API allows multiple identifiers. However, sending multiple
      // identfiers will result in zero results.
      store.selectedUsersIdentifiers = users as any;
    }
  }

  // convert ident_user_id into basic selectedUserIdentifier with id
  if ("ident_user_id" in urlParams && urlParams.ident_user_id !== "any") {
    if (isObservations) {
      let users = formatBasicRecords(urlParams.ident_user_id);
      store.selectedUsersIdentifiers = users as any;
    }
  }

  if (
    "unobserved_by_user_id" in urlParams &&
    urlParams.unobserved_by_user_id !== "any"
  ) {
    if (isObservations) {
      store.selectedUnobservedByUser = {
        id: Number(urlParams.unobserved_by_user_id.split(",")[0]),
      } as any;
    }
  }

  if (
    "annotation_user_id" in urlParams &&
    urlParams.annotation_user_id !== "any"
  ) {
    if (isObservations) {
      let users = formatBasicRecords(urlParams.annotation_user_id);
      store.selectedUsersAnnotators = users as any;
    }
  }

  if ("viewer_id" in urlParams && urlParams.viewer_id !== "any") {
    if (isObservations) {
      store.selectedReviewer = {
        id: Number(urlParams.viewer_id.split(",")[0]),
      } as any;
    }
  }

  if ("not_in_place" in urlParams && urlParams.not_in_place !== "any") {
    let places = formatBasicRecords(urlParams.not_in_place);
    store.selectedWithoutPlaces = places;
  }

  if ("not_in_project" in urlParams && urlParams.not_in_project !== "any") {
    if (isObservations) {
      let projects = formatBasicRecords(urlParams.not_in_project);
      store.selectedWithoutProjects = projects as any;
    }
  }

  if ("without_taxon_id" in urlParams && urlParams.without_taxon_id !== "any") {
    let taxa = formatBasicRecords(urlParams.without_taxon_id);
    if (isObservations) {
      store.selectedWithoutTaxa = taxa as any;
    } else if (isIdentifications) {
      store.selectedWithoutTaxaIdentified = taxa as any;
    }
  }

  if (
    "without_observation_taxon_id" in urlParams &&
    urlParams.without_observation_taxon_id !== "any"
  ) {
    if (isIdentifications) {
      let taxa = formatBasicRecords(urlParams.without_observation_taxon_id);
      store.selectedWithoutTaxa = taxa as any;
    }
  }

  if ("not_user_id" in urlParams && urlParams.not_user_id !== "any") {
    if (isObservations) {
      let users = formatBasicRecords(urlParams.not_user_id);
      store.selectedWithoutUsers = users as any;
    }
  }

  if (
    "without_ident_user_id" in urlParams &&
    urlParams.without_ident_user_id !== "any"
  ) {
    if (isObservations) {
      let users = formatBasicRecords(urlParams.without_ident_user_id);
      store.selectedWithoutUsersIdentifiers = users as any;
    }
  }

  let urlView = urlParams.view as ObservationViewsType;
  let urlSubview = urlParams.subview as
    | ObservationSubviewsType
    | IdentificationSubviewsType;
  if (urlView && validViews.includes(urlView)) {
    store.currentView = urlView;
  } else if (isObservations) {
    store.currentView = "observations_observations";
  } else if (isIdentifications) {
    store.currentView = "identifications_identifications";
  }

  if (urlView === "observations_observations") {
    if (
      validObservationsSubviews.includes(urlSubview as ObservationSubviewsType)
    ) {
      store.viewMetadata.observations_observations.subview = urlSubview;
    }
  } else if (urlView === "identifications_identifications") {
    if (
      validIdentificationsSubviews.includes(
        urlSubview as IdentificationSubviewsType,
      )
    ) {
      store.viewMetadata.identifications_identifications.subview = urlSubview;
    }
  }

  if (urlParams.order && urlParams.order !== "any") {
    if (orderValues.includes(urlParams.order)) {
      store[resourceApiParams].order = urlParams.order;
    }

    if (urlView && validViews.includes(urlView)) {
      store.viewMetadata[urlView].order = urlParams.order;
    } else {
      if (isObservations) {
        store.viewMetadata.observations_observations.order = urlParams.order;
      } else if (isIdentifications) {
        store.viewMetadata.identifications_identifications.order =
          urlParams.order;
      }
    }
  }

  if (urlParams.order_by && urlParams.order_by !== "any") {
    if (observationsOrderByValuesAll.includes(urlParams.order_by)) {
      store[resourceApiParams].order_by = urlParams.order_by;
    }
    if (urlView && validViews.includes(urlView)) {
      store.viewMetadata[urlView].order_by = urlParams.order_by;
    } else {
      if (isObservations) {
        store.viewMetadata.observations_observations.order_by =
          urlParams.order_by;
      } else if (isIdentifications) {
        store.viewMetadata.identifications_identifications.order_by =
          urlParams.order_by;
      }
    }
  }

  if (urlParams.page && urlParams.page !== "any") {
    store[resourceApiParams].page = Number(urlParams.page);

    if (urlView && validViews.includes(urlView)) {
      store.viewMetadata[urlView].page = Number(urlParams.page);
    } else {
      if (isObservations) {
        store.viewMetadata.observations_observations.page = Number(
          urlParams.page,
        );
      } else if (isIdentifications) {
        store.viewMetadata.identifications_identifications.page = Number(
          urlParams.page,
        );
      }
    }
  }

  if (urlParams.locale && urlParams.locale !== "any") {
    store.observationsApiParams.locale = urlParams.locale;
  }
  if (urlParams.name_order && urlParams.name_order !== "any") {
    store.viewMetadata.name_order = urlParams.name_order as NameOrderType;
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
  appStore: AppStoreType,
) {
  let cleanedValue = value as string | number | boolean;

  if (
    observationsApiFilterableNames.includes(
      key as ObservationsApiParamsKeysType,
    )
  ) {
    if (value === "true") {
      cleanedValue = true;
    }
    if (value === "false") {
      cleanedValue = false;
    }
    if (/^\d+$/.test(value)) {
      cleanedValue = Number(value);
    }
    appStore.observationsApiParams[key as ObservationsApiParamsKeysType] =
      cleanedValue;
  }
}

function setUrlStoreValuesIdentifications(
  key: string,
  value: string,
  appStore: AppStoreType,
) {
  let cleanedValue = value as string | number | boolean;

  if (
    identificationsApiFilterableNames.includes(
      key as IdentificationsApiParamsKeysType,
    )
  ) {
    if (value === "true") {
      cleanedValue = true;
    } else if (value === "false") {
      cleanedValue = false;
    } else if (/^\d+$/.test(value)) {
      cleanedValue = Number(value);
    }
    appStore.identificationsApiParams[key as IdentificationsApiParamsKeysType] =
      cleanedValue;
  }
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
export function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
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

export function sortArrayOfObjectsByDate(
  records: { [k: string]: any }[],
  field: string,
) {
  return records.sort((a, b) => {
    let dateA = a[field];
    let dateB = b[field];
    return (new Date(dateA) as any) - (new Date(dateB) as any);
  });
}

export function objectFlip(obj: { [key: string]: any }) {
  const newObj = {} as any;
  Object.keys(obj).forEach((key) => {
    newObj[obj[key as keyof typeof obj]] = key;
  });
  return newObj;
}

// https://stackoverflow.com/a/1069840
export function sortObjectByValue(obj: { [k: string]: any }, ascending = true) {
  if (ascending) {
    return Object.fromEntries(
      Object.entries(obj).sort(([, a], [, b]) => a - b),
    );
  } else {
    return Object.fromEntries(
      Object.entries(obj).sort(([, a], [, b]) => b - a),
    );
  }
}

export function range(start = 0, stop: number) {
  return [...Array(stop - start + 1).keys()].map((i) => i + start);
}
