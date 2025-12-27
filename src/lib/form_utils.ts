import type {
  IdentificationsApiParamsKeys,
  MapStore,
  ObservationsApiParamsKeys,
} from "../types/app";
import { getResourceApiParams, isObservationsCheck } from "./data_utils";

export function setSelectedOption(selector: string) {
  let el = document.querySelector(selector) as HTMLOptionElement;
  if (el) {
    el.selected = true;
  }
}

export function setSelectedOptionTrueFalse(
  form: string,
  property: ObservationsApiParamsKeys | IdentificationsApiParamsKeys,
  value: boolean,
) {
  setSelectedOption(`${form} select#${property} option[value='${value}']`);
}

export function setInputValue(selector: string, value: any) {
  let el = document.querySelector(selector) as HTMLOptionElement;
  if (el) {
    el.value = value;
  }
}

export function setInputChecked(selector: string, value: any) {
  let el = document.querySelector(selector) as HTMLInputElement;
  if (el) {
    el.checked = value;
  }
}

export function setInputDisabled(selector: string, value: any) {
  let el = document.querySelector(selector) as HTMLOptionElement;
  if (el) {
    el.disabled = value;
  }
}

export function processTrueFalseFields(
  fields: ObservationsApiParamsKeys[] | IdentificationsApiParamsKeys[],
  appStore: MapStore,
) {
  let resourceApiParams = getResourceApiParams(isObservationsCheck(appStore));

  fields.forEach((field) => {
    // @ts-ignore
    if (appStore[resourceApiParams][field] !== undefined) {
      setSelectedOptionTrueFalse(
        "#filters-form",
        field,
        // @ts-ignore
        appStore[resourceApiParams][field],
      );
    }
  });
}

export function processSelectFields(
  fields: ObservationsApiParamsKeys[] | IdentificationsApiParamsKeys[],
  appStore: MapStore,
) {
  let resourceApiParams = getResourceApiParams(isObservationsCheck(appStore));

  fields.forEach((field) => {
    // @ts-ignore
    if (appStore[resourceApiParams][field] !== undefined) {
      setSelectedOption(
        // @ts-ignore
        `#filters-form select#${field} option[value='${appStore[resourceApiParams][field]}']`,
      );
    }
  });
}

export function processMultipleSelectFields(
  fields: ObservationsApiParamsKeys[] | IdentificationsApiParamsKeys[],
  appStore: MapStore,
) {
  let resourceApiParams = getResourceApiParams(isObservationsCheck(appStore));

  fields.forEach((field) => {
    // @ts-ignore
    if (appStore[resourceApiParams][field] !== undefined) {
      // @ts-ignore
      appStore[resourceApiParams][field]
        .toString()
        .split(",")
        .forEach((value: any) => {
          setSelectedOption(
            `#filters-form select#${field} option[value='${value}']`,
          );
        });
    }
  });
}

export function processInputCheckedFields(
  fields: ObservationsApiParamsKeys[] | IdentificationsApiParamsKeys[],
  appStore: MapStore,
) {
  let resourceApiParams = getResourceApiParams(isObservationsCheck(appStore));

  fields.forEach((field) => {
    // @ts-ignore
    if (appStore[resourceApiParams][field] !== undefined) {
      // @ts-ignore
      appStore[resourceApiParams][field]
        .toString()
        .split(",")
        .forEach((value: any) => {
          setInputChecked(`#filters-form input#${value}`, true);
        });
    }
  });
}

export function processInputFields(
  fields: ObservationsApiParamsKeys[] | IdentificationsApiParamsKeys[],
  appStore: MapStore,
) {
  let resourceApiParams = getResourceApiParams(isObservationsCheck(appStore));

  fields.forEach((field) => {
    // @ts-ignore
    if (appStore[resourceApiParams][field] !== undefined) {
      setInputValue(
        `#filters-form input#${field}`,
        // @ts-ignore
        appStore[resourceApiParams][field],
      );
    }
  });
}
