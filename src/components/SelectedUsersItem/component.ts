import { setupComponent } from "../../lib/component_utils";
import { loggerRender } from "../../lib/logger";
import { removeUser } from "../../lib/search_users";
import { removeUserIdentifier } from "../../lib/search_users_identifiers";
import { pluralize } from "../../lib/utils";
import type { NormalizediNatUser } from "../../types/app";
import { template } from "./template";

class SelectedUsersItem extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  async render() {
    if (!this.dataset.user) return;
    let userType = this.dataset.user_type;
    if (!userType) return;

    loggerRender("++ SelectedUsersItem render");

    setupComponent(template, this);

    let user = JSON.parse(this.dataset.user) as NormalizediNatUser;
    let nameEl = this.querySelector(".name");
    if (nameEl && user.login) {
      let text = user.login;
      if (user.name) {
        text += ` (${user.name})`;
      }
      nameEl.textContent = text;
    }

    let countEl = this.querySelector(".count");
    if (countEl) {
      countEl.textContent = pluralize(
        user.observations_count,
        userType === "observer" ? "observation" : "identification",
        true,
      );
    }

    let butttonEl = this.querySelector(".close-button");
    if (butttonEl) {
      butttonEl.addEventListener("click", async function () {
        if (user.id !== undefined) {
          if (userType === "observer") {
            await removeUser(user.id, window.app.store);
          } else {
            await removeUserIdentifier(user.id, window.app.store);
          }
        }
      });
    }
  }
}

customElements.define("users-list-item", SelectedUsersItem);
