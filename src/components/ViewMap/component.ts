import L from "leaflet";
import "leaflet/dist/leaflet.css";

import "../../assets/leaflet.css";
import "../../assets/autocomplete.css";

import {
  getMapTiles,
  addLayerToMap,
  createRefreshMapButton,
} from "../../lib/map_utils";
import { getObservationsYears } from "../../lib/inat_api";
import { decodeAppUrl } from "../../lib/utils";
import { initApp, loadCachedStore } from "../../lib/init_app";
import type { SearchOptions, SearchOptionsKeys } from "../../types/app";
import { setupTaxaSearch, taxonSelectedHandler } from "../../lib/search_taxa";
import { setupUserSearch, userSelectedHandler } from "../../lib/search_users";
import {
  projectSelectedHandler,
  setupProjectSearch,
} from "../../lib/search_projects";
import {
  placeSelectedHandler,
  setupPlacesSearch,
} from "../../lib/search_places";
import {
  fetchAndRenderData,
  paginationcCallback,
  perPage,
  toggleSubview,
} from "./utils";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  async render() {
    const parser = new DOMParser();
    const resp = await fetch("/src/components/ViewMap/template.html");
    const html = await resp.text();

    const template = parser
      .parseFromString(html, "text/html")
      .querySelector("template");

    if (!template) return;
    this.appendChild(template.content.cloneNode(true));

    // called when switching views
    if (window.app.store.map.map) {
      // remove cached map and event listeners
      window.app.store.map.map.remove();
      // create new map
      this.renderMap();
      // load cached data from store
      loadCachedStore(window.app.store);
      this.searchHeadingSetup();

      // called on intial page load
    } else {
      // create new map
      this.renderMap();
      // connect to api to get data
      await this.dataSetup();
      this.searchSetup();
      this.searchHeadingSetup();
    }

    let currentPage = 1;
    fetchAndRenderData(
      currentPage,
      perPage,
      paginationcCallback,
      window.app.store,
    );

    window.addEventListener("appUrlChange", () => {
      fetchAndRenderData(
        currentPage,
        perPage,
        paginationcCallback,
        window.app.store,
      );
    });

    this.subviewHandler();
  }

  renderMap() {
    let map = L.map("map", {
      center: [0, 0],
      zoom: 2,
      maxZoom: 19,
    });
    var layerControl = L.control.layers().addTo(map);

    let { OpenStreetMap, OpenTopo } = getMapTiles();
    addLayerToMap(OpenStreetMap, map, layerControl, true);
    addLayerToMap(OpenTopo, map, layerControl);

    window.app.store.map.map = map;
    window.app.store.map.layerControl = layerControl;

    window.app.store.refreshMap.showRefreshMapButton = false;
    let button = createRefreshMapButton(window.app.store);
    window.app.store.refreshMap.refreshMapButtonEl = button;

    map.on("zoomend", function () {
      let store = window.app.store;

      if (
        store.refreshMap.refreshMapButtonEl &&
        store.refreshMap.showRefreshMapButton === false
      ) {
        store.refreshMap.refreshMapButtonEl.hidden = false;
        // refreshMap.showRefreshMapButton = true;
        store.refreshMap = {
          ...store.refreshMap,
          showRefreshMapButton: true,
        };
      }
    });
  }

  async dataSetup() {
    let urlData = decodeAppUrl(window.location.search);
    initApp(window.app.store, urlData);

    let data = await getObservationsYears();
    if (data) {
      let years = [];
      for (let [date, _count] of Object.entries(data.year)) {
        years.push(Number(date.split("-")[0]));
      }
      window.app.store.iNatStats = { years: years.sort().reverse() };
      window.dispatchEvent(new Event("observationYearsLoaded"));
    }
  }

  searchSetup() {
    let searchSelector = "#inatAutocomplete";
    let searchInputEl = document.querySelector(
      searchSelector,
    ) as HTMLInputElement;
    let searchSelectEl = document.querySelector(
      "#search-type",
    ) as HTMLSelectElement;

    let searchOptions: SearchOptions = {
      places: {
        setup: setupPlacesSearch,
        selectedHandler: placeSelectedHandler,
      },
      projects: {
        setup: setupProjectSearch,
        selectedHandler: projectSelectedHandler,
      },
      users: {
        setup: setupUserSearch,
        selectedHandler: userSelectedHandler,
      },
      taxa: {
        setup: setupTaxaSearch,
        selectedHandler: taxonSelectedHandler,
      },
    };
    let setup: any;
    let selectedHandler: any;

    if (searchInputEl) {
      // when user selects an search result,
      searchInputEl.innerHTML = "";
      setup = setupTaxaSearch(searchSelector);
      selectedHandler = taxonSelectedHandler;

      searchInputEl.addEventListener("selection", async function (event: any) {
        let selection = event.detail.selection.value;
        let query = event.detail.query;

        selectedHandler(selection, query, window.app.store);
      });
    }

    if (searchSelectEl && searchInputEl) {
      // update search input when user changes the search type
      searchSelectEl.addEventListener("change", (event) => {
        let target = event.target as HTMLInputElement;
        if (target === null) return;

        // remove event listerner for autocomplete search
        setup.unInit();
        // clear search input
        searchInputEl.innerHTML = "";
        searchInputEl.value = "";

        let targetSearch = searchOptions[target.value as SearchOptionsKeys];

        setup = targetSearch.setup(searchSelector);
        selectedHandler = targetSearch.selectedHandler;
      });
    }
  }

  searchHeadingSetup() {
    let placesHeading = document.querySelector(
      "#home .menu .places-heading",
    ) as HTMLElement;
    let projectsHeading = document.querySelector(
      "#home .menu .projects-heading",
    ) as HTMLElement;
    let usersHeading = document.querySelector(
      "#home .menu .users-heading",
    ) as HTMLElement;

    window.addEventListener("selectedPlacesChange", () => {
      if (!placesHeading) return;
      let resource = window.app.store.selectedPlaces;
      placesHeading.hidden = resource.length === 0 ? true : false;
    });
    window.addEventListener("selectedProjectsChange", () => {
      if (!projectsHeading) return;
      let resource = window.app.store.selectedProjects;
      projectsHeading.hidden = resource.length === 0 ? true : false;
    });
    window.addEventListener("selectedUsersChange", () => {
      if (!usersHeading) return;
      let resource = window.app.store.selectedUsers;
      usersHeading.hidden = resource.length === 0 ? true : false;
    });
  }

  subviewHandler() {
    let tableLinkEl = this.querySelector(".subview-table") as HTMLElement;
    let gridLinkEl = this.querySelector(".subview-grid") as HTMLElement;

    // set current-subview
    let subview = window.app.store.currentObservationsSubview;
    if (subview === "table") {
      tableLinkEl.classList.add("current-subview");
    } else {
      gridLinkEl.classList.add("current-subview");
    }

    // change subview when clicked
    if (tableLinkEl && gridLinkEl) {
      tableLinkEl.addEventListener("click", (event) => {
        toggleSubview(event, tableLinkEl, gridLinkEl, window.app.store);
      });
      gridLinkEl.addEventListener("click", (event) => {
        toggleSubview(event, tableLinkEl, gridLinkEl, window.app.store);
      });
    }
  }
}

customElements.define("x-view-map", MyComponent);
