import type {
  NormalizediNatProjectType,
  AppStoreType,
  DataComponentType,
} from "../types/app.d.ts";
import {
  addValueToCommaSeparatedString,
  isObservationsCheck,
  removeIdfromInatApiParams,
  resetPageNumber,
} from "./data_utils.ts";
import { updateCountForAll } from "./count_utils.ts";
import {
  updateTilesForSelectedTaxa,
  renderSelectedResources,
  showHideHeader,
} from "./search_utils.ts";
import { setupProjectSearch } from "./search_projects.ts";

export function setupNotInProjectSearch(selector: string) {
  const autoCompleteProjectJS = setupProjectSearch(selector);

  return autoCompleteProjectJS;
}

// called by autocomplete search when an project option is selected
export async function notInProjectSelectedHandler(
  selection: NormalizediNatProjectType,
  _query: string,
  appStore: AppStoreType,
) {
  let isObservations = isObservationsCheck(appStore);
  if (!isObservations) return;

  let project = selection;

  // add project to store
  appStore.selectedWithoutProjects = [
    ...appStore.selectedWithoutProjects,
    project,
  ];
  resetPageNumber(appStore);

  appStore.observationsApiParams = {
    ...appStore.observationsApiParams,
    not_in_project: addValueToCommaSeparatedString(
      project.id,
      appStore.observationsApiParams.not_in_project,
    ),
  };

  updateTilesForSelectedTaxa(appStore);
  await updateCountForAll("selectedWithoutProjects", appStore);
  renderSelectedResources(appStore, true);
}

export function showHideWithoutProjectsHeader() {
  showHideHeader(
    "#sidebar-menu .without-projects-heading",
    "selectedWithoutProjects",
  );
}

export function renderWithoutProjectsList(appStore: AppStoreType) {
  let listEl = document.querySelector("#selected-without-projects-list");
  if (!listEl) return;

  listEl.innerHTML = "";
  appStore.selectedWithoutProjects.forEach((project) => {
    let templateEl = document.createElement(
      "projects-list-item",
    ) as DataComponentType;
    templateEl.data = project;
    templateEl.type = "withoutProject";
    listEl.appendChild(templateEl);
  });
}

// called when user deletes a place
export async function removeWithoutProject(
  projectId: number,
  appStore: AppStoreType,
) {
  if (!appStore.selectedWithoutProjects) return;

  removeOneWithoutProjectFromStore(appStore, projectId);
  updateTilesForSelectedTaxa(appStore);
  await updateCountForAll("all", appStore);
  renderSelectedResources(appStore, true);
}

export function removeOneWithoutProjectFromStore(
  appStore: AppStoreType,
  projectId: number,
) {
  appStore.selectedWithoutProjects = appStore.selectedWithoutProjects.filter(
    (project) => project.id !== projectId,
  );
  resetPageNumber(appStore);
  removeIdfromInatApiParams(appStore, "selectedWithoutProjects", projectId);
}
