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
  showMenu("#observations-menu", componentCtx);
  hideMenu("#settings-menu", componentCtx);
  hideMenu("#download-menu", componentCtx);
}

export function toggleIdentificationsHandler(componentCtx: HTMLElement) {
  showMenu("#identifications-menu", componentCtx);
  hideMenu("#settings-menu", componentCtx);
}

export function toggleSettingsHandler(componentCtx: HTMLElement) {
  hideMenu("#observations-menu", componentCtx);
  hideMenu("#identifications-menu", componentCtx);
  showMenu("#settings-menu", componentCtx);
  hideMenu("#download-menu", componentCtx);
}

export function toggleDownloadHandler(componentCtx: HTMLElement) {
  hideMenu("#observations-menu", componentCtx);
  hideMenu("#settings-menu", componentCtx);
  showMenu("#download-menu", componentCtx);
}

function hideMenu(selector: string, componentCtx: HTMLElement) {
  let menuEl = componentCtx.querySelector(selector) as HTMLElement;
  if (!menuEl) return;

  menuEl.style.display = "none";
}

function showMenu(selector: string, componentCtx: HTMLElement) {
  let menuEl = componentCtx.querySelector(selector) as HTMLElement;
  if (!menuEl) return;

  menuEl.style.display = "block";
}
