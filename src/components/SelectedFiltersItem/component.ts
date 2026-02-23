import { x } from "../../assets/icons";
import { loggerEvent, loggerRender } from "../../lib/logger";
import type {
  DataComponentType,
  IdentificationsApiParamsKeysType,
  ObservationsApiParamsKeysType,
} from "../../types/app";
import { deleteFilter, deleteObservationFieldFilter } from "./utils";

type PropType = {
  field: ObservationsApiParamsKeysType | IdentificationsApiParamsKeysType;
  value: string;
};
class SelectedFiltersItem extends HTMLElement {
  constructor() {
    super();
  }

  field:
    | null
    | ObservationsApiParamsKeysType
    | IdentificationsApiParamsKeysType = null;
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

    if (event.type === "click") {
      if (this.field?.startsWith("field:")) {
        deleteObservationFieldFilter(this.field as any, window.app.store);
      } else if (this.field && this.value) {
        deleteFilter(this.field as any, this.value, window.app.store);
      }
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
}

customElements.define("selected-filters-item", SelectedFiltersItem);
