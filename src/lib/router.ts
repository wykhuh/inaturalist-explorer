import type { RouterType } from "../types/app";

const Router: RouterType = {
  init: () => {
    document.querySelectorAll("a.navlink").forEach((a) => {
      a.addEventListener("click", (event) => {
        event.preventDefault();
        let target = event.target as HTMLLinkElement;
        if (!target) return;

        const url = target.getAttribute("href");
        if (!url) return;

        Router.go(url);
      });
    });
    // Event Handler for URL changes
    window.addEventListener("popstate", (event) => {
      Router.go(event.state.route, false);
    });

    // Check the initial URL
    Router.go(location.pathname);
  },
  go: (route: string, addToHistory = true) => {
    console.log(`Going to ${route}`);

    if (addToHistory) {
      history.pushState({ route }, "", route);
    }
    let pageElement = null;
    switch (route) {
      case "/":
        pageElement = document.createElement("x-page-observations");
        break;
      case "/identifications/":
        pageElement = document.createElement("x-page-identifications");
        break;
      case "/about/":
        pageElement = document.createElement("x-page-about");
        break;
    }

    if (pageElement) {
      console.log("pageElement:", pageElement);

      // document.querySelector("main").children[0].remove();
      const mainEl = document.querySelector("main") as HTMLElement;
      mainEl.innerHTML = "";
      mainEl.appendChild(pageElement);
      window.scrollX = 0;
      window.scrollY = 0;
      window.dispatchEvent(
        new CustomEvent("appPageLoaded", {
          detail: { route },
        }),
      );

      // switch (route) {
      //   case "/":
      //     window.app.store.record_type = "observations";

      //     break;
      //   case "/identifications/":
      //     window.app.store.record_type = "identifications";

      //     break;
      //   default:
      //     window.app.store.record_type = "other";
      //     break;
      // }
    } else {
      // 404
      const mainEl = document.querySelector("main") as HTMLElement;
      mainEl.innerHTML = "Oops, 404!";
    }
  },
};
export default Router;
