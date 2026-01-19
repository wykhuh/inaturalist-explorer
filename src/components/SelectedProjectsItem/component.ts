import { setupComponent } from "../../lib/component_utils.ts";
import { removeProject } from "../../lib/search_projects.ts";
import type { AppStoreType, NormalizediNatProjectType } from "../../types/app";
import { loggerRender } from "../../lib/logger.ts";
import { template } from "./template";
import { renderSelectedCounts } from "../../lib/selected_items_utils.ts";
import { removeWithoutProject } from "../../lib/search_without_project.ts";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render(window.app.store);
  }

  async render(appStore: AppStoreType) {
    if (!this.dataset.project) return;
    if (!this.dataset.type) return;
    loggerRender("++ SelectedProjectsItem render");

    let type = this.dataset.type;

    setupComponent(template, this);

    let project = JSON.parse(this.dataset.project) as NormalizediNatProjectType;

    let nameEl = this.querySelector(".name");
    if (nameEl && project.name) {
      nameEl.textContent = project.name;
    }

    if (type === "project") {
      renderSelectedCounts(project, appStore, this);
    }

    let butttonEl = this.querySelector(".close-button");
    if (butttonEl) {
      butttonEl.addEventListener("click", async function () {
        if (type === "project") {
          await removeProject(project.id, window.app.store);
        } else if (type === "withoutProject") {
          await removeWithoutProject(project.id, window.app.store);
        }
      });
    }
  }
}

customElements.define("projects-list-item", MyComponent);
