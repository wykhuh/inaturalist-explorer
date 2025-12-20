import { setupComponent } from "../../lib/component_utils";
import { loggerRender } from "../../lib/logger";
import {
  toggleObservationsHandler,
  toggleSettingsHandler,
  toggleSidebar,
} from "./shared_utils";
import { template } from "./template";

export class PageObservations extends HTMLElement {
  constructor() {
    super();
  }

  toggleSidebarEl: HTMLButtonElement | null = null;
  searchMenuToggleEl: HTMLButtonElement | null = null;
  settingsMenuToggleEl: HTMLButtonElement | null = null;

  connectedCallback() {
    loggerRender("++ PageObservations connectedCallback");

    setupComponent(template, this);

    this.toggleSidebarEl =
      this.querySelector<HTMLButtonElement>("#sidebar-toggle");
    this.searchMenuToggleEl = this.querySelector<HTMLButtonElement>(
      "#search-menu-toggle",
    );
    this.settingsMenuToggleEl = this.querySelector<HTMLButtonElement>(
      "#settings-menu-toggle",
    );

    this.toggleSidebarEl?.addEventListener("click", this);
    this.searchMenuToggleEl?.addEventListener("click", this);
    this.settingsMenuToggleEl?.addEventListener("click", this);
  }

  disconnectedCallback() {
    loggerRender("++ PageObservations disconnectedCallback");

    this.toggleSidebarEl?.removeEventListener("click", this);
    this.searchMenuToggleEl?.removeEventListener("click", this);
    this.settingsMenuToggleEl?.removeEventListener("click", this);
  }

  handleEvent(event: Event) {
    let target = event.target as HTMLElement;
    if (!target) return;

    if (event.type === "click") {
      if (target.id === "sidebar-toggle") {
        toggleSidebar(this);
      } else if (
        target.id === "search-menu-toggle" ||
        target.closest("button")?.id === "search-menu-toggle"
      ) {
        toggleObservationsHandler(this);
      } else if (target.id === "settings-menu-toggle") {
        toggleSettingsHandler(this);
      }
    }
  }
}

customElements.define("page-observations", PageObservations);
