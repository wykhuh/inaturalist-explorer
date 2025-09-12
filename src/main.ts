import "./components/SelectedTaxaItem/component.ts";
import "./components/SelectedPlacesItem/component.ts";
import "./components/SelectedProjectsItem/component.ts";
import "./components/SelectedUsersItem/component.ts";
import "./components/ObservationsFilters/component.ts";
import "./components/ObservationsHeader/component.ts";
import "./components/ViewMap/component.ts";
import "./components/ViewSpecies/component.ts";
import "./components/ViewIdentifiers/component.ts";
import "./components/ViewObservers/component.ts";
import "./components/CardSpecies/component.ts";

import mapStore from "./lib/store.ts";

window.app = { store: mapStore };

let defaultView = "x-view-map";

let viewContainerEl = document.querySelector("#view-container");
if (viewContainerEl) {
  let view = document.createElement(defaultView);
  viewContainerEl.appendChild(view);
}
