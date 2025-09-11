import autoComplete from "@tarekraafat/autocomplete.js";

import type {
  AutoCompleteEvent,
  NormalizediNatProject,
  MapStore,
} from "../types/app.d.ts";
import { autocomplete_projects_api } from "../lib/inat_api.ts";
import type { iNatProjectsAPI } from "../types/inat_api";
import { loggerUrl } from "../lib/logger.ts";
import {
  fetchiNatMapDataForTaxon,
  removeOneTaxonFromMap,
  addIdToCommaSeparatedString,
  getObservationsCountForTaxon,
  removeOneProjectFromStore,
} from "./data_utils.ts";
import { updateUrl } from "./utils.ts";
import { renderTaxaList } from "./search_taxa.ts";

export function setupProjectSearch(selector: string) {
  const autoCompleteProjectJS = new autoComplete({
    autocomplete: "off",
    selector: selector,
    placeHolder: "Enter projects name",
    threshold: 2,
    searchEngine: (_query: string, record: NormalizediNatProject) => {
      return renderAutocompleteProject(record);
    },
    data: {
      src: async (query: string) => {
        try {
          let url = `${autocomplete_projects_api}&per_page=50&q=${query}`;
          loggerUrl(url);
          let res = await fetch(url);
          let data = (await res.json()) as iNatProjectsAPI;
          return processAutocompleteProject(data);
        } catch (error) {
          console.error("setupProjectSearch ERROR:", error);
        }
      },
    },
    resultsList: {
      maxResults: 50,
    },
    events: {
      input: {
        selection: (event: AutoCompleteEvent) => {
          const selection = event.detail.selection.value;
          autoCompleteProjectJS.input.value = selection.name;
        },
      },
    },
  });

  return autoCompleteProjectJS;
}

export function processAutocompleteProject(
  data: iNatProjectsAPI,
): NormalizediNatProject[] {
  return data.results.map((item) => {
    return {
      name: item.title,
      id: item.id,
      slug: item.slug,
    };
  });
}

export function renderAutocompleteProject(item: NormalizediNatProject): string {
  let html = `
  <div class="projects-ac-option" data-testid="projects-ac-option">
    <div class="project-name">
    ${item.name}
    </div>
  </div>`;

  return html;
}

// called by autocomplete search when an project option is selected
export async function projectSelectedHandler(
  selection: NormalizediNatProject,
  _query: string,
  appStore: MapStore,
) {
  // add project to store
  appStore.selectedProjects = [...appStore.selectedProjects, selection];
  appStore.inatApiParams = {
    ...appStore.inatApiParams,
    project_id: addIdToCommaSeparatedString(
      selection.id,
      appStore.inatApiParams.project_id,
    ),
  };

  // get iNat map tiles for selected place
  for await (const taxon of appStore.selectedTaxa) {
    // remove existing taxon layers from map
    removeOneTaxonFromMap(appStore, taxon.id);
    appStore.inatApiParams = {
      ...appStore.inatApiParams,
      taxon_id: taxon.id.toString(),
      colors: taxon.color,
    };

    await fetchiNatMapDataForTaxon(taxon, appStore);
    await getObservationsCountForTaxon(taxon, appStore);
  }

  renderTaxaList(appStore);
  renderProjectsList(appStore);
  updateUrl(window.location, appStore);
}

export function renderProjectsList(appStore: MapStore) {
  let listEl = document.querySelector("#projects-list-container");
  if (!listEl) return;

  listEl.innerHTML = "";
  appStore.selectedProjects.forEach((project) => {
    let templateEl = document.createElement("x-projects-list-item");
    if (!templateEl) return;
    templateEl.dataset.project = JSON.stringify(project);
    listEl.appendChild(templateEl);
  });
}

// called when user deletes a project
export async function removeProject(projectId: number, appStore: MapStore) {
  if (!appStore.selectedProjects) return;

  // remove project
  removeOneProjectFromStore(appStore, projectId);

  // remove existing taxa tiles, and refetch taxa tiles
  for await (const taxon of appStore.selectedTaxa) {
    removeOneTaxonFromMap(appStore, taxon.id);

    appStore.inatApiParams = {
      ...appStore.inatApiParams,
      taxon_id: taxon.id.toString(),
      colors: taxon.color,
    };
    await fetchiNatMapDataForTaxon(taxon, appStore);
    await getObservationsCountForTaxon(taxon, appStore);
  }

  renderTaxaList(appStore);
  renderProjectsList(appStore);
  updateUrl(window.location, appStore);
}
