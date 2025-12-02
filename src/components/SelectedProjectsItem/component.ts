import { setupComponent } from "../../lib/component_utils.ts";
import { removeProject } from "../../lib/search_projects.ts";
import type { MapStore, NormalizediNatProject } from "../../types/app";
import { loggerRender } from "../../lib/logger.ts";
import { template } from "./template";
import { renderSelectedCounts } from "../../lib/selected_items_utils.ts";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render(window.app.store);
  }

  async render(appStore: MapStore) {
    if (!this.dataset.project) return;
    loggerRender("++ SelectedProjectsItem render");

    setupComponent(template, this);

    let project = JSON.parse(this.dataset.project) as NormalizediNatProject;

    let nameEl = this.querySelector(".name");
    if (nameEl && project.name) {
      nameEl.textContent = project.name;
    }

    renderSelectedCounts(project, appStore, this);

    let butttonEl = this.querySelector(".close-button");
    if (butttonEl) {
      butttonEl.addEventListener("click", async function () {
        if (project.id !== undefined) {
          await removeProject(project.id, window.app.store);
        }
      });
    }
  }
}

customElements.define("projects-list-item", MyComponent);
