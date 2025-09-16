import { logger, loggerStore } from "../../lib/logger";

const setup = async () => {
  const parser = new DOMParser();
  const resp = await fetch("/src/components/Header/template.html");
  const html = await resp.text();

  const template = parser
    .parseFromString(html, "text/html")
    .querySelector("template");

  class MyComponent extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      loggerStore("++ Header render");
      if (!template) return;

      this.appendChild(template.content.cloneNode(true));
    }
  }

  customElements.define("x-header", MyComponent);
};

setup();
