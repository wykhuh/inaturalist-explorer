import { createMenuComponent } from "../PageObservations/shared_utils";

export function toggleIdentificationsHandler(componentCtx: HTMLElement) {
  createMenuComponent("identifications-menu", componentCtx, true);
}

export function toggleLinksIdentificationsHandler(componentCtx: HTMLElement) {
  createMenuComponent("links-identifications-menu", componentCtx);
}

export function toggleDownloadIdentificationsHandler(
  componentCtx: HTMLElement,
) {
  createMenuComponent("download-identifications-menu", componentCtx);
}
