// import autoComplete from "@tarekraafat/autocomplete.js";
// import {
//   processAutocompleteUser,
//   renderAutocompleteUser,
//   userSelectedHandler,
// } from "../../lib/autocomplete_utils";
// import type { AutoCompleteEvent, NormalizediNatUser } from "../../types/app";
// import { autocomplete_users_api } from "../../lib/inat_api";
// import type { iNatUsersAPI } from "../../types/inat_api";
// // // import "../../assets/autocomplete.css";

// // import {
// //   processAutocompleteProject,
// //   processAutocompleteUser,
// //   projectSelectedHandler,
// //   renderAutocompleteProject,
// //   renderAutocompleteUser,
// //   userSelectedHandler,
// // } from "../../lib/autocomplete_utils";
// // import type {
// //   AutoCompleteEvent,
// //   NormalizediNatProject,
// //   NormalizediNatUser,
// // } from "../../types/app";
// // import {
// //   autocomplete_projects_api,
// //   autocomplete_users_api,
// // } from "../../lib/inat_api";
// // import type {
// //   iNatProjectsAPI,
// //   iNatAutcompleteUsersAPI,
// //   iNatTaxaAPI,
// // } from "../../types/inat_api";

// // =====================
// // project search
// // =====================

// const autoCompleteProjectJS = new autoComplete({
//   autocomplete: "off",
//   selector: "#inatProjectsAutoComplete",
//   placeHolder: "Enter projects name",
//   threshold: 2,
//   searchEngine: (_query: string, record: NormalizediNatProject) => {
//     return renderAutocompleteProject(record);
//   },
//   data: {
//     src: async (query: string) => {
//       try {
//         let res = await fetch(
//           `${autocomplete_projects_api}&per_page=50&q=${query}`,
//         );
//         let data = (await res.json()) as iNatProjectsAPI;
//         return processAutocompleteProject(data);
//       } catch (error) {
//         console.error(error);
//       }
//     },
//   },
//   resultsList: {
//     maxResults: 50,
//   },
//   events: {
//     input: {
//       selection: (event: AutoCompleteEvent) => {
//         const selection = event.detail.selection.value;
//         autoCompleteProjectJS.input.value = selection.title;
//       },
//     },
//   },
// });

// document
//   .querySelector("#inatProjectsAutoComplete")!
//   .addEventListener("selection", async function (event: any) {
//     let selection = event.detail.selection.value;
//     await projectSelectedHandler(
//       selection,
//       event.detail.query,
//       window.app.store,
//     );
//   });

// // =====================
// // users search
// // =====================

// const autoCompleteUsersJS = new autoComplete({
//   autocomplete: "off",
//   selector: "#inatUsersAutoComplete",
//   placeHolder: "Enter user name",
//   threshold: 2,
//   searchEngine: (_query: string, record: NormalizediNatUser) => {
//     return renderAutocompleteUser(record);
//   },
//   data: {
//     src: async (query: string) => {
//       try {
//         let res = await fetch(
//           `${autocomplete_users_api}&per_page=50&q=${query}`,
//         );
//         let data = (await res.json()) as iNatAutcompleteUsersAPI;
//         return processAutocompleteUser(data);
//       } catch (error) {
//         console.error(error);
//       }
//     },
//   },
//   resultsList: {
//     maxResults: 50,
//   },
//   events: {
//     input: {
//       selection: (event: AutoCompleteEvent) => {
//         const selection = event.detail.selection.value as NormalizediNatUser;
//         autoCompleteUsersJS.input.value = selection.login;
//       },
//     },
//   },
// });

// let usersEl = document.querySelector("#inatUsersSearch");

// if (usersEl) {
//   usersEl.addEventListener("selection", async function (event: any) {
//     let selection = event.detail.selection.value;
//     await userSelectedHandler(selection, event.detail.query, window.app.store);
//   });
// }
