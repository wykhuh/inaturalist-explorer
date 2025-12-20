export function toggleSidebar(componentCtx: HTMLElement) {
  let siteLayoutEl =
    componentCtx.querySelector<HTMLButtonElement>("#site-layout");
  let siteControlsEl =
    componentCtx.querySelector<HTMLButtonElement>("#site-controls");

  if (siteLayoutEl?.classList.contains("sidebar-open")) {
    siteLayoutEl?.classList.replace("sidebar-open", "sidebar-close");
    siteControlsEl?.classList.replace("sidebar-open", "sidebar-close");
  } else {
    siteLayoutEl?.classList.replace("sidebar-close", "sidebar-open");
    siteControlsEl?.classList.replace("sidebar-close", "sidebar-open");
  }
}

export function toggleObservationsHandler(componentCtx: HTMLElement) {
  showMenu("#observations-menu", componentCtx);
  hideMenu("#settings-menu", componentCtx);
}

export function toggleIdentificationsHandler(componentCtx: HTMLElement) {
  showMenu("#identifications-menu", componentCtx);
  hideMenu("#settings-menu", componentCtx);
}

export function toggleSettingsHandler(componentCtx: HTMLElement) {
  hideMenu("#observations-menu", componentCtx);
  hideMenu("#identifications-menu", componentCtx);
  showMenu("#settings-menu", componentCtx);
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
