import autoComplete from "@tarekraafat/autocomplete.js";

import type {
  AutoCompleteEvent,
  NormalizediNatProject,
  MapStore,
  CustomGeoJSON,
} from "../types/app.d.ts";
import { autocomplete_projects_api, getPlaceById } from "../lib/inat_api.ts";
import type { iNatProjectsAPI } from "../types/inat_api";
import { loggerUrl } from "../lib/logger.ts";
import {
  addValueToCommaSeparatedString,
  removeOneProjectFromStoreAndMap,
  renderResourceGeometryLayer,
} from "./data_utils.ts";
import { updateCountForAll, updateCountForOne } from "./count_utils.ts";
import {
  updateTilesForAllTaxa,
  renderSelectedResources,
} from "./search_utils.ts";
import { fitBoundsPlaces } from "./map_utils.ts";

export function setupProjectSearch(selector: string, appStore: MapStore) {
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
          if (appStore.observationsApiParams.place_id) {
            url += `&place_id=${appStore.observationsApiParams.place_id}`;
          }
          let usersIds = appStore.observationsApiParams.user_id;
          if (usersIds) {
            // NOTE: iNaturalist API only allow one id for member_id
            let member_id = usersIds.split(",")[0];
            url += `&member_id=${member_id}`;
          }
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
      place_id: item.place_id,
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
  let map = appStore.map.map;
  let project = selection;

  // get place for project; only some projects  have places
  let place;
  if (project.place_id) {
    place = await getPlaceById(project.place_id);
    if (place) {
      project.bounding_box = place.bounding_box_geojson;
      project.geometry = place.geometry_geojson;
    }
  }

  let layer;
  if (map && place) {
    // draw boundaries of selected place
    layer = renderResourceGeometryLayer(place, map, "project layer");

    // remove selected place layer from map
    if (appStore.projectsMapLayers) {
      let layers = appStore.projectsMapLayers[project.id.toString()];
      if (layers) {
        layers.forEach((layer) => {
          layer.removeFrom(map);
        });
      }
    }

    // add project map layer
    appStore.projectsMapLayers = {
      ...appStore.projectsMapLayers,
      [project.id]: [layer as CustomGeoJSON],
    };
  }

  // add project to store
  appStore.selectedProjects = [...appStore.selectedProjects, project];
  appStore.observationsApiParams = {
    ...appStore.observationsApiParams,
    project_id: addValueToCommaSeparatedString(
      project.id,
      appStore.observationsApiParams.project_id,
    ),
  };

  let paramsTemp = {
    ...appStore.observationsApiParams,
    project_id: project.id.toString(),
  };
  await updateCountForOne(project, "selectedProjects", appStore, paramsTemp);
  await updateTilesForAllTaxa(appStore);
  await updateCountForAll("selectedProjects", appStore);

  // zoom to map to fit all selected places
  if (map) {
    fitBoundsPlaces(appStore);
  }

  renderSelectedResources(appStore);
}

export function renderProjectsList(appStore: MapStore) {
  let listEl = document.querySelector("#selected-projects-list");
  if (!listEl) return;

  listEl.innerHTML = "";

  appStore.selectedProjects.forEach((project) => {
    let templateEl = document.createElement("projects-list-item");
    templateEl.dataset.project = JSON.stringify(project);
    listEl.appendChild(templateEl);
  });
}

// called when user deletes a project
export async function removeProject(projectId: number, appStore: MapStore) {
  if (!appStore.selectedProjects) return;

  // remove project
  removeOneProjectFromStoreAndMap(appStore, projectId);

  // remove existing taxa tiles, and refetch taxa tiles
  await updateTilesForAllTaxa(appStore);
  await updateCountForAll("selectedProjects", appStore);

  if (appStore.map.map) {
    fitBoundsPlaces(appStore);
  }

  renderSelectedResources(appStore);
}
