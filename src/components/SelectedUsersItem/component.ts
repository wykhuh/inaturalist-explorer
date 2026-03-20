import { iNatUsersUrl } from "../../data/inat_data";
import { setupComponent } from "../../lib/component_utils";
import { loggerRender } from "../../lib/logger";
import { removeUser } from "../../lib/search_users";
import { removeUserAnnotator } from "../../lib/search_users_annotators";
import { removeUserIdentifier } from "../../lib/search_users_identifiers";
import { removeWithoutUser } from "../../lib/search_without_users";
import { removeWithoutUserIdentifier } from "../../lib/search_without_users_identifiers";
import { renderSelectedCounts } from "../../lib/selected_items_utils";
import type {
  AppStoreType,
  DataComponentType,
  NormalizediNatUserType,
} from "../../types/app";
import { template } from "./template";

class SelectedUsersItem extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ SelectedUsersItem connectedCallback");
    setupComponent(template, this);

    this.render(window.app.store);
  }

  async render(appStore: AppStoreType) {
    let user = (this as DataComponentType).data as NormalizediNatUserType;
    let type = (this as DataComponentType).type;
    if (!user) return;
    if (!type) return;

    loggerRender("++ SelectedUsersItem render");

    let nameEl = this.querySelector(".name");
    if (nameEl && user.login) {
      let linkEl = document.createElement("a");
      linkEl.href = `${iNatUsersUrl}/${user.login}`;
      linkEl.textContent = user.login;
      nameEl.appendChild(linkEl);
    }

    if (type === "observer") {
      renderSelectedCounts(user, appStore, this, "observation");
    }
    if (type === "identifier") {
      renderSelectedCounts(user, appStore, this, "identification");
    }
    if (type === "annotator") {
      renderSelectedCounts(user, appStore, this, "observation");
    }

    let butttonEl = this.querySelector(".close-button");
    if (butttonEl) {
      butttonEl.addEventListener("click", async function () {
        if (user.id !== undefined) {
          // NOTE: update when adding selectedResource; remove user
          if (type === "observer") {
            await removeUser(user.id, window.app.store);
          } else if (type === "identifier") {
            await removeUserIdentifier(user.id, window.app.store);
          } else if (type === "annotator") {
            await removeUserAnnotator(user.id, window.app.store);
          } else if (type === "withoutObserver") {
            await removeWithoutUser(user.id, window.app.store);
          } else if (type === "withoutIdentifier") {
            await removeWithoutUserIdentifier(user.id, window.app.store);
          } else {
            throw Error("need to add remove function for " + type);
          }
        }
      });
    }
  }
}

customElements.define("users-list-item", SelectedUsersItem);
