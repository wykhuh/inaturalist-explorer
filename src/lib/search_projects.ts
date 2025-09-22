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
  addValueToCommaSeparatedString,
  getObservationsCountForProject,
  removeOneProjectFromStore,
} from "./data_utils.ts";
import { updateAppUrl } from "./utils.ts";
import { renderTaxaList } from "./search_taxa.ts";
import {
  updateCountForAllPlaces,
  updateCountForAllProjects,
  updateTilesAndCountForAllTaxa,
} from "./search_utils.ts";
import { renderPlacesList } from "./search_places.ts";

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
  let project = selection;
  appStore.selectedProjects = [...appStore.selectedProjects, project];
  appStore.inatApiParams = {
    ...appStore.inatApiParams,
    project_id: addValueToCommaSeparatedString(
      project.id,
      appStore.inatApiParams.project_id,
    ),
  };

  // get iNat map tiles for selected place
  await updateTilesAndCountForAllTaxa(appStore);
  await updateCountForAllPlaces(appStore);

  let paramsTemp = {
    ...appStore.inatApiParams,
    project_id: project.id.toString(),
  };
  await getObservationsCountForProject(project, appStore, paramsTemp);

  renderTaxaList(appStore);
  renderProjectsList(appStore);
  renderPlacesList(appStore);
  updateAppUrl(window.location, appStore);
  window.dispatchEvent(new Event("observationsChange"));
}

export function renderProjectsList(appStore: MapStore) {
  let listEl = document.querySelector("#selected-projects-list");
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
  await updateTilesAndCountForAllTaxa(appStore);
  await updateCountForAllPlaces(appStore);
  await updateCountForAllProjects(appStore);

  renderTaxaList(appStore);
  renderPlacesList(appStore);
  renderProjectsList(appStore);
  updateAppUrl(window.location, appStore);
  window.dispatchEvent(new Event("observationsChange"));
}
