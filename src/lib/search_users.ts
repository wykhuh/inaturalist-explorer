import autoComplete from "@tarekraafat/autocomplete.js";

import "../assets/autocomplete.css";
import "../components/TaxaListItem/component.ts";
import "../components/PlacesListItem/component.ts";
import "../components/ProjectsListItem/component.ts";
import "../components/UsersListItem/component.ts";
import "../components/ObservationsFilters/component.ts";
import type { AutoCompleteEvent, NormalizediNatUser } from "../types/app.d.ts";
import {
  renderAutocompleteUser,
  processAutocompleteUser,
  userSelectedHandler,
} from "../lib/autocomplete_utils.ts";
import { autocomplete_users_api } from "../lib/inat_api.ts";
import type { iNatUsersAPI } from "../types/inat_api";

import { loggerUrl } from "../lib/logger.ts";

export function renderUserSearch() {
  const autoCompleteUsersJS = new autoComplete({
    autocomplete: "off",
    selector: "#inatUsersAutoComplete",
    placeHolder: "Enter user name",
    threshold: 2,
    searchEngine: (_query: string, record: NormalizediNatUser) => {
      return renderAutocompleteUser(record);
    },
    data: {
      src: async (query: string) => {
        try {
          let url = `${autocomplete_users_api}&per_page=25&q=${query}`;
          loggerUrl(url);
          let res = await fetch(url);
          let data = (await res.json()) as iNatUsersAPI;
          return processAutocompleteUser(data);
        } catch (error) {
          console.error(error);
        }
      },
    },
    resultsList: {
      maxResults: 25,
    },
    events: {
      input: {
        selection: (event: AutoCompleteEvent) => {
          const selection = event.detail.selection.value as NormalizediNatUser;
          autoCompleteUsersJS.input.value = selection.login;
        },
      },
    },
  });
}

let userSearchEl = document.querySelector("#inatUsersAutoComplete");
if (userSearchEl) {
  userSearchEl.addEventListener("selection", async function (event: any) {
    let selection = event.detail.selection.value;
    await userSelectedHandler(selection, event.detail.query, window.app.store);
  });
}
