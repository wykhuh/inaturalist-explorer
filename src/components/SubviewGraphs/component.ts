import { graphTemplate } from "./template";

import { loggerEvent, loggerRender } from "../../lib/logger";
import { setupComponent } from "../../lib/component_utils";
import type {
  AppStoreSelectedResourcesKeysType,
  AppStoreType,
  DataComponentType,
  ObservationsGraphData,
  ViewMetadataGraphs,
} from "../../types/app";
import {
  disableGroupByForSelectedResources,
  fetchDataForGraphCategories,
  fetchGraphData,
  getAPIHistogramData,
  getAPIPopularFieldsData,
  graphMaxObservationMessage,
  initGraphFilters,
  renderGraphCategorySelect,
  renderGraphs,
  updateGraphs,
  updateInvalidGraphCategory,
} from "./utils";
import { resetGraphCache } from "../SubviewGrid/shared_utils";

type PropType = {
  selectedResource?: AppStoreSelectedResourcesKeysType;
  data?: ObservationsGraphData;
};
class SubviewObservationsGraphs extends HTMLElement {
  constructor() {
    super();
  }

  graphForm: null | HTMLFormElement = null;

  connectedCallback() {
    loggerRender("++ SubviewObservationsGraphs connectedCallback");
    setupComponent(graphTemplate, this);

    this.graphForm = this.querySelector<HTMLFormElement>("#graph-form");
    if (!this.graphForm) return;

    let data: PropType = (this as DataComponentType).data;
    this.render(data.data, data.selectedResource, window.app.store);

    window.addEventListener("selectedTaxaUpdate", this);
    window.addEventListener("selectedPlacesUpdate", this);
    window.addEventListener("observationsChange", this);
    window.addEventListener("popularFieldsOptionsChange", this);
    this.graphForm.addEventListener("change", this);
  }

  disconnectedCallback() {
    loggerRender("++ SubviewObservationsGraphs disconnectedCallback");

    window.removeEventListener("selectedTaxaUpdate", this);
    window.removeEventListener("selectedPlacesUpdate", this);
    window.removeEventListener("observationsChange", this);
    window.removeEventListener("popularFieldsOptionsChange", this);
    this.graphForm?.removeEventListener("change", this);
  }

  handleEvent(event: Event) {
    let target = event.target as HTMLElement;
    if (!target) return;
    if (!this.graphForm) return;

    loggerEvent(`[SubviewObservationsGraphs event] ${event.type}`);

    if ("selectedTaxaUpdate" === event.type) {
      disableGroupByForSelectedResources(window.app.store, this);

      // fetchDataForGraphCategories dispatches popularFieldsOptionsChange
      fetchDataForGraphCategories(window.app.store);
    }
    if ("selectedPlacesUpdate" === event.type) {
      disableGroupByForSelectedResources(window.app.store, this);
    }
    if ("popularFieldsOptionsChange" === event.type) {
      renderGraphCategorySelect(
        window.app.store,
        this,
        "select#graphs-category",
      );
    }
    if ("observationsChange" === event.type) {
      this.fetchAndRender(window.app.store);
    }

    if (target.id === "graphs-group-by") {
      const data = new FormData(this.graphForm);
      updateGraphs(data, window.app.store, this);
    }

    if (target.id === "graphs-category") {
      const data = new FormData(this.graphForm);
      updateGraphs(data, window.app.store, this);

      disableGroupByForSelectedResources(window.app.store, this);
    }

    if (target.id === "graphs-value-type") {
      const data = new FormData(this.graphForm);
      updateGraphs(data, window.app.store, this);
    }
  }

  async render(
    data: ObservationsGraphData | undefined,
    selectedResource: AppStoreSelectedResourcesKeysType | undefined,
    appStore: AppStoreType,
  ) {
    loggerRender("++ SubviewObservationsGraphs render");

    if (graphMaxObservationMessage(appStore, this)) {
      return;
    }

    renderGraphCategorySelect(appStore, this, "select#graphs-category");
    disableGroupByForSelectedResources(appStore, this);
    initGraphFilters(appStore);

    renderGraphs(data, appStore, this, selectedResource);
  }

  async fetchAndRender(appStore: AppStoreType) {
    if (graphMaxObservationMessage(appStore, this)) {
      return;
    }

    let graphsMetadata = appStore.viewMetadata.observations_observations
      .graphs as ViewMetadataGraphs;

    updateInvalidGraphCategory(appStore, graphsMetadata);
    resetGraphCache(appStore);
    let data = await fetchGraphData(
      appStore,
      getAPIHistogramData,
      getAPIPopularFieldsData,
    );

    if (appStore.viewMetadata.popularFieldsOptions.length == 0) {
      await fetchDataForGraphCategories(appStore);
    }

    let selectedResource: AppStoreSelectedResourcesKeysType | undefined =
      undefined;
    if (graphsMetadata.groupBy === "species") {
      selectedResource = "selectedTaxa";
    } else if (graphsMetadata.groupBy === "places") {
      selectedResource = "selectedPlaces";
    }

    this.render(data, selectedResource, appStore);
  }
}

customElements.define("subview-observations-graphs", SubviewObservationsGraphs);
