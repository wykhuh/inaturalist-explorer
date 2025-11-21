import type { RouterType } from "../types/app";
import { loggerRender } from "./logger";

const Router: RouterType = {
  init: () => {
    // Event Handler for URL changes
    window.addEventListener("popstate", (event) => {
      Router.go(event.state.route, event.state.params, false);
    });

    // Check the initial URL
    Router.go(location.pathname, location.search);
  },
  go: (path: string, params = undefined, addToHistory = true) => {
    loggerRender(`Going to ${path}`);

    if (addToHistory) {
      history.pushState({ path, params }, "", path + params);
    }
    let pageElement = null;
    switch (path) {
      case "/":
        pageElement = document.createElement("page-observations");
        break;
      case "/identifications/":
        pageElement = document.createElement("page-identifications");
        break;
      case "/about/":
        pageElement = document.createElement("page-about");
        break;
      default:
        pageElement = document.createElement("page-404");
    }

    loggerRender("pageElement:", pageElement);

    // document.querySelector("main").children[0].remove();
    const mainEl = document.querySelector("main") as HTMLElement;
    mainEl.innerHTML = "";
    mainEl.appendChild(pageElement);
    window.scrollX = 0;
    window.scrollY = 0;
  },
};
export default Router;
