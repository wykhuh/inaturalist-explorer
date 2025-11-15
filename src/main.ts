import "./components/Header/component.ts";
import "./components/SelectedTaxaItem/component.ts";
import "./components/SelectedPlacesItem/component.ts";
import "./components/SelectedProjectsItem/component.ts";
import "./components/SelectedUsersItem/component.ts";
import "./components/ObservationsFilters/component.ts";
import "./components/ObservationsHeader/component.ts";
import "./components/IdentificationsFilters/component.ts";
import "./components/IdentificationsHeader/component.ts";
import "./components/ViewMap/component.ts";
import "./components/ViewSpecies/component.ts";
import "./components/ViewIdentifiers/component.ts";
import "./components/ViewIdentifications/component.ts";
import "./components/ViewObservers/component.ts";
import "./components/CardSpecies/component.ts";
import "./components/CardObservation/component.ts";
import "./components/ObservationsMenu/component.ts";
import "./components/IdentificationsMenu/component.ts";
import "./components/SettingsMenu/component.ts";
import "./components/PageAbout.ts";
import "./components/PageIdentifications.ts";
import "./components/PageObservations.ts";
import "./components/AppstoreViewer/component.ts";

import mapStore from "./lib/store.ts";
import Router from "./lib/router.ts";
import { initApp } from "./lib/init_app.ts";

window.app = { store: mapStore, router: Router };

window.addEventListener(
  "appPageLoaded",
  (event: CustomEventInit<{ route: string }>) => {
    if (!event.detail) return;
    event.detail.route;
    console.log("Whoop!", event.detail.route);

    switch (event.detail.route) {
      case "/":
        window.app.store.record_type = "observations";
        initApp();
        break;
      case "/identifications/":
        window.app.store.record_type = "identifications";
        initApp();
        break;
      default:
        window.app.store.record_type = "other";
    }
  },
);

window.app.router.init();
