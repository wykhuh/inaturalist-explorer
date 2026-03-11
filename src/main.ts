import "./components/SelectedTaxaItem/component.ts";
import "./components/SelectedTaxaBasicItem/component.ts";
import "./components/SelectedPlacesItem/component.ts";
import "./components/SelectedProjectsItem/component.ts";
import "./components/SelectedUsersItem/component.ts";
import "./components/SelectedFiltersItem/component.ts";
import "./components/ObservationsFilters/component.ts";
import "./components/ObservationsHeader/component.ts";
import "./components/IdentificationsFilters/component.ts";
import "./components/IdentificationsHeader/component.ts";
import "./components/ViewObservations/component.ts";
import "./components/ViewSpecies/component.ts";
import "./components/ViewIdentifiers/component.ts";
import "./components/ViewIdentifications/component.ts";
import "./components/ViewObservers/component.ts";
import "./components/CardSpecies/component.ts";
import "./components/CardObservation/component.ts";
import "./components/CardMedia/component.ts";
import "./components/CardIdentification/component.ts";
import "./components/CardIdentificationIdentification/component.ts";
import "./components/CardIdentificationObservation/component.ts";
import "./components/ObservationsMenu/component.ts";
import "./components/IdentificationsMenu/component.ts";
import "./components/SettingsMenu/component.ts";
import "./components/PageAbout/component.ts";
import "./components/PageIdentifications/component.ts";
import "./components/PageObservations/component.ts";
import "./components/AppstoreViewer/component.ts";
import "./components/Header/component.ts";
import "./components/Page404/component.ts";
import "./components/Pagination/component.ts";
import "./components/Tooltip/component.ts";
import "./components/LinksObservationsMenu/component.ts";
import "./components/Accordion/component.ts";
import "./components/SubviewTable/component.ts";
import "./components/SubviewMap/component.ts";
import "./components/SubviewGrid/component.ts";
import "./components/SubviewMedia/component.ts";
import "./components/SubviewGraphs/component.ts";
import "./components/LinksIdentificationsMenu/component.ts";

import mapStore from "./lib/store.ts";
import Router from "./lib/router.ts";
import { initApp } from "./lib/init_app.ts";

window.app = { store: mapStore, router: Router };

// router.init() loads page components
window.app.router.init();

// initApp() load iNaturalist data and populate app.store
initApp();
