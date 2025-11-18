import { loggerRender } from "../../lib/logger";

export class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ AppstoreViewer render");

    const template = document.getElementById(
      "appstore-viewer-template",
    ) as HTMLTemplateElement;
    if (!template) return;
    const content = template.content.cloneNode(true);
    this.appendChild(content);

    this.render();
  }

  render() {
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

customElements.define("x-appstore-viewer", MyComponent);
