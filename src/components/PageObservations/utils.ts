import { createMenuComponent } from "./shared_utils";

export function toggleObservationsHandler(componentCtx: HTMLElement) {
  createMenuComponent("observations-menu", componentCtx, true);
}

export function toggleLinksHandler(componentCtx: HTMLElement) {
  createMenuComponent("links-menu", componentCtx);
}

export function toggleDownloadObservationsHandler(componentCtx: HTMLElement) {
  createMenuComponent("download-observations-menu", componentCtx);
}
