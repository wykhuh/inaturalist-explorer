import autoComplete from "@tarekraafat/autocomplete.js";

import "../assets/autocomplete.css";
import "../components/TaxaListItem/component.ts";
import "../components/PlacesListItem/component.ts";
import "../components/ProjectsListItem/component.ts";
import "../components/UsersListItem/component.ts";
import "../components/ObservationsFilters/component.ts";
import type {
  AutoCompleteEvent,
  NormalizediNatProject,
} from "../types/app.d.ts";
import {
  renderAutocompleteProject,
  processAutocompleteProject,
  projectSelectedHandler,
} from "../lib/autocomplete_utils.ts";
import { autocomplete_projects_api } from "../lib/inat_api.ts";
import type { iNatProjectsAPI } from "../types/inat_api";

import { loggerUrl } from "../lib/logger.ts";

export function renderProjectSearch() {
  const autoCompleteProjectJS = new autoComplete({
    autocomplete: "off",
    selector: "#inatProjectsAutoComplete",
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
          console.error(error);
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
}

let projectSearchEl = document.querySelector("#inatProjectsAutoComplete");
if (projectSearchEl) {
  projectSearchEl.addEventListener("selection", async function (event: any) {
    let selection = event.detail.selection.value;
    await projectSelectedHandler(
      selection,
      event.detail.query,
      window.app.store,
    );
  });
}
