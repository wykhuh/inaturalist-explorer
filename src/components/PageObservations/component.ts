import { setupComponent } from "../../lib/component_utils";
import { loggerEvent, loggerRender } from "../../lib/logger";
import {
  initSidebarState,
  toggleLinksHandler,
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
  downloadMenuToggleEl: HTMLButtonElement | null = null;
  siteLayoutEl: HTMLDivElement | null = null;
  siteControlsEl: HTMLDivElement | null = null;

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
    this.downloadMenuToggleEl =
      this.querySelector<HTMLButtonElement>("#links-menu-toggle");
    this.siteLayoutEl = this.querySelector<HTMLDivElement>("#site-layout");
    this.siteControlsEl = this.querySelector<HTMLDivElement>("#site-controls");

    this.toggleSidebarEl?.addEventListener("click", this);
    this.searchMenuToggleEl?.addEventListener("click", this);
    this.settingsMenuToggleEl?.addEventListener("click", this);
    this.downloadMenuToggleEl?.addEventListener("click", this);

    this.render();
  }

  disconnectedCallback() {
    loggerRender("++ PageObservations disconnectedCallback");

    this.toggleSidebarEl?.removeEventListener("click", this);
    this.searchMenuToggleEl?.removeEventListener("click", this);
    this.settingsMenuToggleEl?.removeEventListener("click", this);
    this.downloadMenuToggleEl?.removeEventListener("click", this);
  }

  handleEvent(event: Event) {
    let target = event.target as HTMLElement;
    if (!target) return;
    loggerEvent(`[PageObservations event] ${event.type}`);

    if (event.type === "click") {
      if (target.id === "sidebar-toggle") {
        toggleSidebar(window.app.store, this);
      } else if (
        target.id === "search-menu-toggle" ||
        target.closest("button")?.id === "search-menu-toggle"
      ) {
        toggleObservationsHandler(this);
        loggerEvent("[PageObservations dispatchEvent] switchMenu");
        window.dispatchEvent(new Event("switchMenu"));
      } else if (target.id === "settings-menu-toggle") {
        toggleSettingsHandler(this);
      } else if (
        target.id === "links-menu-toggle" ||
        target.closest("button")?.id === "links-menu-toggle"
      ) {
        toggleLinksHandler(this);
      }
    }
  }

  render() {
    initSidebarState(window.app.store, this);
  }
}

customElements.define("page-observations", PageObservations);
