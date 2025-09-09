import type { Spinner } from "../types/app";

export function createSpinner(selector = ".loader"): Spinner {
  let element = undefined as unknown as HTMLElement;
  function init(selector: string) {
    let el = document.querySelector(selector) as HTMLElement;
    if (el) {
      element = el;
    }
  }
  return {
    start: function () {
      init(selector);
      if (element) {
        element.style.display = "inline-block";
      }
    },
    stop() {
      if (element) {
        element.style.display = "none";
      }
    },
  };
}
