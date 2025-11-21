import { setupComponent } from "../../lib/component_utils";
import { loggerRender } from "../../lib/logger";
import { template } from "./template";

export class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ AppstoreViewer connectedCallback");

    setupComponent(template, this);

    this.render();
  }

  render() {
    loggerRender("++ AppstoreViewer render");

    let displayJsonWrapperEl = this.querySelector("#display-json-wrapper");
    if (!displayJsonWrapperEl) return;

    let buttonEl = this.querySelector("button");
    if (!buttonEl) return;

    buttonEl.addEventListener("click", () => {
      if (displayJsonWrapperEl.className === "hide") {
        displayJsonWrapperEl.className = "";
      } else {
        displayJsonWrapperEl.className = "hide";
      }
    });
  }
}

customElements.define("appstore-viewer", MyComponent);
