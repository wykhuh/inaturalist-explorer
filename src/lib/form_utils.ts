import type {
  IdentificationsApiParamsKeysType,
  AppStoreType,
  ObservationsApiParamsKeysType,
} from "../types/app";
import { getResourceApiParams, isObservationsCheck } from "./data_utils";

export function setSelectedOption(selector: string) {
  let el = document.querySelector(selector) as HTMLOptionElement;
  if (el) {
    el.selected = true;
  }
}

export function unsetSelectedOption(selector: string) {
  let el = document.querySelector(selector) as HTMLOptionElement;
  if (el) {
    el.selected = false;
  }
}

export function setSelectedOptionTrueFalse(
  form: string,
  property: ObservationsApiParamsKeysType | IdentificationsApiParamsKeysType,
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
  try {
    let el = document.querySelector(selector) as HTMLInputElement;
    if (el) {
      el.checked = value;
      return true;
    }
  } catch {
    return false;
  }
}

export function setInputDisabled(selector: string, value: any) {
  let el = document.querySelector(selector) as HTMLOptionElement;
  if (el) {
    el.disabled = value;
  }
}

export function unsetAnnotationTermId(field: string, value: string) {
  value.split(",").forEach((v) => {
    // uncheck term_id input
    setInputChecked(
      `#filters-form input[name='${field}'][value='${v}']`,
      false,
    );

    // get related select for term_id
    let selector =
      field === "term_id"
        ? `select[data-related-term-id="${v}"]`
        : `select[data-related-without-term-id="${v}"]`;
    let selectEl = document.querySelector<HTMLSelectElement>(selector);
    if (selectEl) {
      // unselect term_value_id option
      selectEl
        .querySelectorAll<HTMLOptionElement>("option:checked")
        .forEach((el) => {
          el.selected = false;
        });
      // disable select
      selectEl.disabled = !selectEl.disabled;
    }
  });
}

export function processTrueFalseFields(
  fields: ObservationsApiParamsKeysType[] | IdentificationsApiParamsKeysType[],
  appStore: AppStoreType,
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

export function populateFormFields(
  field_type: { [k: string]: string },
  appStore: AppStoreType,
) {
  let resourceApiParams = getResourceApiParams(isObservationsCheck(appStore));

  for (let [field, value] of Object.entries(appStore[resourceApiParams])) {
    if (field_type[field] === undefined) {
      continue;
    }

    let fieldType = field_type[field];
    if (fieldType === "skip") {
    } else if (fieldType === "search") {
    } else if (fieldType === "select") {
      setSelectedOption(
        `#filters-form select#${field} option[value='${value}']`,
      );
    } else if (fieldType === "multiselect") {
      value
        .toString()
        .split(",")
        .forEach((v: any) => {
          setSelectedOption(
            `#filters-form select[name='${field}'] option[value='${v}']`,
          );
        });
    } else if (fieldType === "textInput") {
      setInputValue(`#filters-form input#${field}`, value);
    } else if (fieldType === "dateInput") {
      setInputValue(`#filters-form input#${field}`, value);
    } else if (fieldType === "checkbox") {
      value
        .toString()
        .split(",")
        .forEach((v: any) => {
          setInputChecked(
            `#filters-form input[name='${field}'][value='${v}']`,
            true,
          );
        });
    } else {
      throw new Error("processFields not implemnt for " + fieldType);
    }
  }
}

export function processSelectFields(
  fields: ObservationsApiParamsKeysType[] | IdentificationsApiParamsKeysType[],
  appStore: AppStoreType,
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
  fields: ObservationsApiParamsKeysType[] | IdentificationsApiParamsKeysType[],
  appStore: AppStoreType,
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
            `#filters-form select[name='${field}'] option[value='${value}']`,
          );
        });
    }
  });
}

export function processInputCheckedFields(
  fields: ObservationsApiParamsKeysType[] | IdentificationsApiParamsKeysType[],
  appStore: AppStoreType,
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
          setInputChecked(
            `#filters-form input[name='${field}'][value='${value}']`,
            true,
          );
        });
    }
  });
}

export function processInputFields(
  fields: ObservationsApiParamsKeysType[] | IdentificationsApiParamsKeysType[],
  appStore: AppStoreType,
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
