import type { AppStoreType } from "../../types/app";
import { displayAppstoreData } from "../AppstoreViewer/utils";

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
  createMenuComponent("observations-menu", componentCtx, true);
}

export function toggleIdentificationsHandler(componentCtx: HTMLElement) {
  createMenuComponent("identifications-menu", componentCtx, true);
}

export function toggleSettingsHandler(componentCtx: HTMLElement) {
  createMenuComponent("settings-menu", componentCtx);
}

export function toggleLinksHandler(componentCtx: HTMLElement) {
  createMenuComponent("links-menu", componentCtx);
}

export function toggleLinksIdentificationsHandler(componentCtx: HTMLElement) {
  createMenuComponent("links-identifications-menu", componentCtx);
}

export function toggleDownloadIdentificationsHandler(
  componentCtx: HTMLElement,
) {
  createMenuComponent("download-identifications-menu", componentCtx);
}

function createMenuComponent(
  elementTag: string,
  componentCtx: HTMLElement,
  createAppViewer = false,
) {
  let parentEl = componentCtx.querySelector("#sidebar-menu");
  if (!parentEl) return;

  let menu = document.createElement(elementTag);
  parentEl.innerHTML = "";
  parentEl.append(menu);

  if (createAppViewer) {
    let el = document.createElement("appstore-viewer");
    parentEl.append(el);
    displayAppstoreData(window.app.store, "createMenuComponent");
  }
}
