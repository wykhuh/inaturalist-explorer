import { setupComponent } from "../../lib/component_utils";
import { loggerRender } from "../../lib/logger";
import { removeUser } from "../../lib/search_users";
import { removeUserAnnotator } from "../../lib/search_users_annotators";
import { removeUserIdentifier } from "../../lib/search_users_identifiers";
import { renderSelectedCounts } from "../../lib/selected_items_utils";
import type { AppStoreType, NormalizediNatUserType } from "../../types/app";
import { template } from "./template";

class SelectedUsersItem extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render(window.app.store);
  }

  async render(appStore: AppStoreType) {
    if (!this.dataset.user) return;
    let userType = this.dataset.user_type;
    if (!userType) return;

    loggerRender("++ SelectedUsersItem render");

    setupComponent(template, this);

    let user = JSON.parse(this.dataset.user) as NormalizediNatUserType;
    let nameEl = this.querySelector(".name");
    if (nameEl && user.login) {
      let text = user.login;
      if (user.name) {
        text += ` (${user.name})`;
      }
      nameEl.textContent = text;
    }

    renderSelectedCounts(user, appStore, this);

    let butttonEl = this.querySelector(".close-button");
    if (butttonEl) {
      butttonEl.addEventListener("click", async function () {
        if (user.id !== undefined) {
          // NOTE: update when adding selectedResource
          if (userType === "observer") {
            await removeUser(user.id, window.app.store);
          } else if (userType === "user") {
            await removeUserIdentifier(user.id, window.app.store);
          } else if (userType === "annotator") {
            await removeUserAnnotator(user.id, window.app.store);
          } else {
            throw Error("need to add remove function for " + userType);
          }
        }
      });
    }
  }
}

customElements.define("users-list-item", SelectedUsersItem);
