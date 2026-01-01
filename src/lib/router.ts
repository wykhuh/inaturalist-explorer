import { viewChangeHandlerPopstate } from "../components/ObservationsHeader/shared_utils";
import { pathToRecordType } from "../data/app_data";
import type { RecordTypes, RouterType } from "../types/app";
import { loggerEvent, loggerRender } from "./logger";

const Router: RouterType = {
  init: () => {
    // Event Handler for URL changes
    window.addEventListener("popstate", (event) => {
      // load new page
      Router.go(event.state.recordType);

      // create new event to trigger loading a new view
      window.dispatchEvent(
        new CustomEvent("popstateAfter", {
          detail: {
            path: event.state.path,
            recordType: event.state.recordType,
            view: event.state.view,
          },
        }),
      );
    });

    // load new view after popstateAfter and new page is loaded
    window.addEventListener("popstateAfter", (e) => {
      let event = e as CustomEvent;
      loggerEvent("[main event] popstateAfter, " + event.detail.view);

      if (event.detail.view) {
        window.app.store.record_type = event.detail.recordType;
        window.app.store.currentView = event.detail.view;
        viewChangeHandlerPopstate(
          event.detail.view,
          window.app.store,
          document,
        );
      }
    });

    // Check the initial URL
    let recordType: RecordTypes = pathToRecordType[location.pathname];
    Router.go(recordType);
  },
  go: (recordType: RecordTypes) => {
    let pageElement = null;
    switch (recordType) {
      case "observations":
        pageElement = document.createElement("page-observations");
        break;
      case "identifications":
        pageElement = document.createElement("page-identifications");
        break;
      case "about":
        pageElement = document.createElement("page-about");
        break;
      default:
        pageElement = document.createElement("page-404");
    }

    loggerRender("pageElement:", pageElement);

    const mainEl = document.querySelector("#app") as HTMLElement;
    mainEl.innerHTML = "";
    mainEl.appendChild(pageElement);
    window.scrollX = 0;
    window.scrollY = 0;
  },
};
export default Router;
