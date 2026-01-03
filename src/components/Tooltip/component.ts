import { loggerRender } from "../../lib/logger";

export class Tooltip extends HTMLElement {
  constructor() {
    super();
  }

  content = "";
  tooltip = "";
  id = "";

  connectedCallback() {
    loggerRender("++ Tooltip connectedCallback");

    this.content =
      this.getAttribute("data-content") || "Tooltip content not defined";
    this.tooltip = this.getAttribute("data-tooltip") || "Tooltip not defined";
    this.id = this.getAttribute("data-id") || "Tooltip id not defined";

    this.render();
  }

  render() {
    loggerRender("++ Tooltip render");

    let content = formatTooltip(this.id, this.content, this.tooltip);

    this.innerHTML = content;
  }
}

customElements.define("app-tooltip", Tooltip);

export function formatTooltip(id: string, content: string, tooltip: string) {
  let html = '<span class="tp-wrapper">';
  html += `<span class="btn-borderless tp-trigger" aria-describedby="${id}">${content}</span>`;
  html += `<span id='${id}' role='tooltip'>${tooltip}</span>`;
  html += "</span>";
  return html;
}
