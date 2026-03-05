import {
  identificationsFieldName_InputType,
  observationsFieldName_InputType,
} from "../../data/app_data";
import { isObservationsCheck } from "../../lib/data_utils";
import {
  setInputChecked,
  setInputCheckboxDisabled,
  setInputValue,
  unsetSelectedOption,
  toggleSelectAndOptions,
} from "../../lib/form_utils";
import type {
  AppStoreType,
  IdentificationsApiParamsKeysType,
  ObservationsApiParamsKeysType,
} from "../../types/app";
import { updateAppWithFilters } from "../ObservationsFilters/shared_utils";

export async function deleteFilter(
  fieldTemp: ObservationsApiParamsKeysType | IdentificationsApiParamsKeysType,
  value: string,
  appStore: AppStoreType,
) {
  let resourceFieldName_InputType = undefined;
  if (isObservationsCheck(appStore)) {
    resourceFieldName_InputType = observationsFieldName_InputType;
  } else {
    resourceFieldName_InputType = identificationsFieldName_InputType;
  }
  let field = fieldTemp as keyof typeof resourceFieldName_InputType;
  let inputType = resourceFieldName_InputType[field];

  if (["term_id"].includes(field)) {
    unsetAnnotationTermId(value);
  } else if (["without_term_id"].includes(field)) {
    unsetAnnotationWithoutTermId(value);
  } else if (["term_id_or_unknown"].includes(field)) {
    unsetAnnotationTermIdUnknown(value);
  } else if (["term_value_id", "without_term_value_id"].includes(field)) {
    value.split(",").forEach((v) => {
      unsetSelectedOption(
        `#filters-form select[name='${field}'] option[value='${v}']`,
      );
    });
  } else if (inputType === "select") {
    unsetSelectedOption(
      `#filters-form select#${field} option[value='${value}']`,
    );
  } else if (inputType === "multiselect") {
    value.split(",").forEach((v) => {
      unsetSelectedOption(`#filters-form select#${field} option[value='${v}']`);
    });
  } else if (inputType === "checkbox") {
    value
      .toString()
      .split(",")
      .forEach((v) => {
        setInputChecked(
          `#filters-form input[name='${field}'][value='${v}']`,
          false,
        );
      });
  } else if (inputType === "textInput") {
    setInputValue(`#filters-form input#${field}`, "");
  } else if (inputType === "dateInput") {
    setInputValue(`#filters-form input#${field}`, "");
  } else if (inputType === "search") {
    setInputValue(`#filters-form [name='${field}']`, "");
  } else {
    throw new Error(
      `need to add another option for SelectedFiltersItem: ${field} ${inputType}`,
    );
  }

  await updateForm(appStore);
}

export async function deleteObservationFieldFilter(
  fieldTemp: ObservationsApiParamsKeysType | IdentificationsApiParamsKeysType,
  appStore: AppStoreType,
) {
  // HACK: can't use colon in css selectors, which means querySelector('#field:xxx')
  // is not valid. Use attribute selector [id="field:xxx"] instead.
  let el = document.querySelector(`[id="${fieldTemp}"]`) as HTMLOptionElement;
  if (el) {
    el.remove();
  }

  await updateForm(appStore);
}

async function updateForm(appStore: AppStoreType) {
  let form = document.querySelector("#filters-form") as HTMLFormElement;
  const data = new FormData(form);
  await updateAppWithFilters(data, appStore);
}

export function unsetAnnotationTermId(ids: string) {
  ids.split(",").forEach((id) => {
    toggleSelectAndOptions(
      `#filters-form select[data-related-term-id="${id}"]`,
      false,
    );
    toggleSelectAndOptions(
      `#filters-form select[data-related-without-term-id="${id}"]`,
      false,
    );

    setInputChecked(
      `#filters-form input[name='term_id'][value='${id}']`,
      false,
    );
    setInputCheckboxDisabled(
      `#filters-form input[name='without_term_id'][value='${id}']`,
      false,
    );
    setInputCheckboxDisabled(
      `#filters-form input[name='term_id_or_unknown'][value='${id}']`,
      false,
    );
  });
}

export function unsetAnnotationWithoutTermId(ids: string) {
  ids.split(",").forEach((id) => {
    setInputChecked(
      `#filters-form input[name='without_term_id'][value='${id}']`,
      false,
    );

    setInputCheckboxDisabled(
      `#filters-form input[name="term_id_or_unknown"][value="${id}"]`,
      false,
    );
    setInputCheckboxDisabled(
      `#filters-form input[name="term_id"][value="${id}"]`,
      false,
    );
  });
}

export function unsetAnnotationTermIdUnknown(ids: string) {
  ids.split(",").forEach((id) => {
    toggleSelectAndOptions(
      `#filters-form select[data-related-without-term-id="${id}"]`,
      false,
    );

    setInputChecked(
      `#filters-form input[name='term_id_or_unknown'][value='${id}']`,
      false,
    );

    setInputCheckboxDisabled(
      `#filters-form input[name="without_term_id"][value="${id}"]`,
      false,
    );
    setInputCheckboxDisabled(
      `#filters-form input[name="term_id"][value="${id}"]`,
      false,
    );
  });
}
