import type { iNatApiParamsKeys } from "../types/app";

export function setSelectedOption(selector: string) {
  let el = document.querySelector(selector) as HTMLOptionElement;
  if (el) {
    el.selected = true;
  }
}

export function setSelectedOptionTrueFalse(
  form: string,
  property: iNatApiParamsKeys,
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
