import "./components/Header/component.ts";
import "./components/SelectedTaxaItem/component.ts";
import "./components/SelectedPlacesItem/component.ts";
import "./components/SelectedProjectsItem/component.ts";
import "./components/SelectedUsersItem/component.ts";
import "./components/SelectedUsersIdentifiersItem/component.ts";
import "./components/ObservationsFilters/component.ts";
import "./components/ObservationsHeader/component.ts";
import "./components/ViewMap/component.ts";
import "./components/ViewSpecies/component.ts";
import "./components/ViewIdentifiers/component.ts";
import "./components/ViewObservers/component.ts";
import "./components/CardSpecies/component.ts";
import "./components/CardObservation/component.ts";
import "./components/ObservationsMenu/component.ts";
import "./components/SettingsMenu/component.ts";

import mapStore from "./lib/store.ts";
import { initPopulateStore } from "./lib/init_app.ts";

import { decodeAppUrl } from "./lib/utils.ts";
import { viewAndTemplateObject } from "./lib/data_utils.ts";
import { searchHeadingSetup, multisearchSetup } from "./lib/search_utils.ts";

window.app = { store: mapStore };

let viewContainerEl = document.querySelector("#view-container");
if (viewContainerEl) {
  let urlData = decodeAppUrl(window.location.search);
  multisearchSetup(window.app.store);
  searchHeadingSetup();
  await initPopulateStore(window.app.store, urlData);

  if (window.app.store.currentView) {
    let templateName = viewAndTemplateObject(window.app.store.currentView);
    let view = document.createElement(templateName);
    viewContainerEl.appendChild(view);
  }

  toggleSidebarHandler();
  toggleObservationsHandler();
  toggleSettingsHandler();
}

function toggleSidebarHandler() {
  let toggleEl = document.querySelector("#sidebar-toggle") as HTMLButtonElement;
  if (!toggleEl) return;
  let siteLayoutEl = document.querySelector("#site-layout") as HTMLElement;
  if (!siteLayoutEl) return;
  let siteControlsEl = document.querySelector("#site-controls") as HTMLElement;
  if (!siteControlsEl) return;

  toggleEl.addEventListener("click", (event) => {
    let target = event.target as HTMLElement;
    if (target === null) return;

    if (siteLayoutEl.classList.contains("sidebar-open")) {
      siteLayoutEl.classList.replace("sidebar-open", "sidebar-close");
      siteControlsEl.classList.replace("sidebar-open", "sidebar-close");
    } else {
      siteLayoutEl.classList.replace("sidebar-close", "sidebar-open");
      siteControlsEl.classList.replace("sidebar-close", "sidebar-open");
    }
  });
}

function toggleObservationsHandler() {
  let toggleEl = document.querySelector(
    "#observations-menu-toggle",
  ) as HTMLButtonElement;
  if (!toggleEl) return;

  toggleEl.addEventListener("click", (event) => {
    let target = event.target as HTMLElement;
    if (target === null) return;

    showElement("#observations-menu");
    hideElement("#settings-menu");
    hideElement("#favorites-menu");
  });
}

function toggleSettingsHandler() {
  let toggleEl = document.querySelector(
    "#settings-menu-toggle",
  ) as HTMLButtonElement;
  if (!toggleEl) return;

  toggleEl.addEventListener("click", (event) => {
    let target = event.target as HTMLElement;
    if (target === null) return;

    hideElement("#observations-menu");
    showElement("#settings-menu");
    hideElement("#favorites-menu");
  });
}

function hideElement(selector: string) {
  let menuEl = document.querySelector(selector) as HTMLElement;
  if (!menuEl) return;

  menuEl.style.display = "none";
}

function showElement(selector: string) {
  let menuEl = document.querySelector(selector) as HTMLElement;
  if (!menuEl) return;

  menuEl.style.display = "block";
}
