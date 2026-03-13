import { copy } from "../../assets/icons";
import { html } from "../../lib/component_utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import { copyToClipboardHandler } from "./utils";

class CopyToClipboard extends HTMLElement {
  constructor() {
    super();
  }

  static observedAttributes = ["content"];

  id = "";
  content = "";
  buttonEl: null | HTMLButtonElement = null;

  connectedCallback() {
    loggerRender("++ CopyToClipboard connectedCallback");
    this.id = this.getAttribute("id") || "CopyToClipboard id not defined";

    this.render(this.id);

    this.buttonEl = this.querySelector("button");
    if (!this.buttonEl) return;

    this.buttonEl.addEventListener("click", this);
  }

  disconnectedCallback() {
    loggerRender("++ CopyToClipboard disconnectedCallback");

    this.buttonEl?.removeEventListener("click", this);
  }

  handleEvent(event: CustomEvent) {
    let target = event.target as HTMLElement;
    if (!target) return;
    loggerEvent(`[CopyToClipboard Event] ${target.id}`);

    if (event.type === "click") {
      copyToClipboardHandler(this.content, this);
    }
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    loggerRender("++ CopyToClipboard attributeChangedCallback");

    if (name === "content") {
      this.content = newValue;
    }
  }

  render(id: string) {
    loggerRender("++ CopyToClipboard render");

    let htmlString = html` <span class="tp-wrapper">
      <span class="btn-borderless tp-trigger" aria-describedby="${id}"
        ><button class="copy-to-clipboard">${copy}</button></span
      >
      <span id="${id}" role="tooltip">Copy link to clipboard</span>
    </span>`;

    this.innerHTML = htmlString;
  }
}

customElements.define("copy-to-clipboard", CopyToClipboard);
