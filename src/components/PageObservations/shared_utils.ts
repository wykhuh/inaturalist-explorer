import type { AppStoreType } from "../../types/app";

export function toggleSidebar(appStore: AppStoreType, componentCtx: any) {
  if (appStore.viewMetadata.side_menu === "show") {
    appStore.viewMetadata.side_menu = "hide";
    componentCtx.siteLayoutEl?.classList.replace(
      "sidebar-open",
      "sidebar-close",
    );
    componentCtx.siteControlsEl?.classList.replace(
      "sidebar-open",
      "sidebar-close",
    );
  } else {
    appStore.viewMetadata.side_menu = "show";
    componentCtx.siteLayoutEl?.classList.replace(
      "sidebar-close",
      "sidebar-open",
    );
    componentCtx.siteControlsEl?.classList.replace(
      "sidebar-close",
      "sidebar-open",
    );
  }
}

export function initSidebarState(appStore: AppStoreType, componentCtx: any) {
  if (appStore.viewMetadata.side_menu === "show") {
    componentCtx.siteLayoutEl?.classList.replace(
      "sidebar-close",
      "sidebar-open",
    );
    componentCtx.siteControlsEl?.classList.replace(
      "sidebar-close",
      "sidebar-open",
    );
  } else {
    componentCtx.siteLayoutEl?.classList.replace(
      "sidebar-open",
      "sidebar-close",
    );
    componentCtx.siteControlsEl?.classList.replace(
      "sidebar-open",
      "sidebar-close",
    );
  }
}

export function toggleObservationsHandler(componentCtx: HTMLElement) {
  createMenuComponent("observations-menu", componentCtx);
}

export function toggleIdentificationsHandler(componentCtx: HTMLElement) {
  createMenuComponent("identifications-menu", componentCtx);
}

export function toggleSettingsHandler(componentCtx: HTMLElement) {
  createMenuComponent("settings-menu", componentCtx);
}

export function toggleLinksHandler(componentCtx: HTMLElement) {
  createMenuComponent("links-menu", componentCtx);
}

function createMenuComponent(elementTag: string, componentCtx: HTMLElement) {
  let parentEl = componentCtx.querySelector("#sidebar-menu");
  if (!parentEl) return;

  let menu = document.createElement(elementTag);
  parentEl.innerHTML = "";
  parentEl.append(menu);
}
