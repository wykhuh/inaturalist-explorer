import { setupComponent } from "../../lib/component_utils";
import { loggerRender } from "../../lib/logger";
import { removeUser } from "../../lib/search_users";
import { pluralize } from "../../lib/utils";
import type { NormalizediNatUser } from "../../types/app";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  async render() {
    if (!this.dataset.user) return;
    loggerRender("++ SelectedUsersItem render");

    await setupComponent(
      "/src/components/SelectedUsersItem/template.html",
      this,
    );

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
        "observation",
        true,
      );
    }

    let butttonEl = this.querySelector(".close-button");
    if (butttonEl) {
      butttonEl.addEventListener("click", async function () {
        if (user.id !== undefined) {
          await removeUser(user.id, window.app.store);
        }
      });
    }
  }
}

customElements.define("x-users-list-item", MyComponent);
