import { x } from "../../assets/icons";
import {
  identificationsFieldName_InputType,
  observationsFieldName_InputType,
} from "../../data/app_data";
import { isObservationsCheck } from "../../lib/data_utils";
import {
  setInputChecked,
  setInputValue,
  unsetSelectedOption,
} from "../../lib/form_utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import type {
  AppStoreType,
  DataComponentType,
  IdentificationsApiFilterableParamsKeys,
  ObservationsApiFilterableParamsKeys,
} from "../../types/app";
import { updateAppWithFilters } from "../ObservationsFilters/shared_utils";

type PropType = {
  field:
    | ObservationsApiFilterableParamsKeys
    | IdentificationsApiFilterableParamsKeys;
  value: string;
};
class SelectedFiltersItem extends HTMLElement {
  constructor() {
    super();
  }

  field:
    | null
    | ObservationsApiFilterableParamsKeys
    | IdentificationsApiFilterableParamsKeys = null;
  value: null | string = null;

  connectedCallback() {
    loggerRender("++ SelectedFiltersItem connectedCallback");
    let data = (this as unknown as DataComponentType).data as PropType;
    this.field = data.field;
    this.value = data.value;
    this.render();

    let button = this.querySelector(".close-button");
    if (button) {
      button.addEventListener("click", this);
    }
  }

  disconnectedCallback() {
    loggerRender("++ SelectedFiltersItem disconnectedCallback");
  }

  handleEvent(event: Event) {
    loggerEvent("[SelectedFiltersItem event]" + event.type);

    if (event.type === "click" && this.field && this.value) {
      this.clickHandler(this.field as any, this.value, window.app.store);
    }
  }

  render() {
    let itemEl = document.createElement("li");
    itemEl.textContent = `${this.field}=${this.value}`;
    let button = document.createElement("button");
    button.innerHTML = x;
    button.className = "close-button";
    button.dataset.testid = "filter-list-item-close";

    itemEl.appendChild(button);
    this.appendChild(itemEl);
  }

  clickHandler(
    fieldTemp:
      | ObservationsApiFilterableParamsKeys
      | IdentificationsApiFilterableParamsKeys,
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

    if (resourceFieldName_InputType[field] === "select") {
      unsetSelectedOption(
        `#filters-form select#${field} option[value='${value}']`,
      );
    } else if (resourceFieldName_InputType[field] === "multiselect") {
      value.split(",").forEach((v) => {
        unsetSelectedOption(
          `#filters-form select#${field} option[value='${v}']`,
        );
      });
    } else if (resourceFieldName_InputType[field] === "checkbox") {
      value.split(",").forEach((v) => {
        let valid = setInputChecked(`#filters-form input#${v}`, false);
        if (!valid) {
          setInputChecked(`#filters-form input#${field}_${v}`, false);
        }
      });
    } else if (resourceFieldName_InputType[field] === "textInput") {
      setInputValue(`#filters-form input#${field}`, "");
    } else if (resourceFieldName_InputType[field] === "dateInput") {
      setInputValue(`#filters-form input#${field}`, "");
    } else {
      throw new Error("need to add another option for SelectedFiltersItem");
    }

    this.updateForm();
  }

  async updateForm() {
    let form = document.querySelector("#filters-form") as HTMLFormElement;
    const data = new FormData(form);
    await updateAppWithFilters(data, window.app.store);
  }
}

customElements.define("selected-filters-item", SelectedFiltersItem);
