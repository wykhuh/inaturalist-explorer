import { setupComponent } from "../../lib/component_utils.ts";
import { removeProject } from "../../lib/search_projects.ts";
import type {
  AppStoreType,
  DataComponentType,
  NormalizediNatProjectType,
} from "../../types/app";
import { loggerRender } from "../../lib/logger.ts";
import { template } from "./template";
import { renderSelectedCounts } from "../../lib/selected_items_utils.ts";
import { removeWithoutProject } from "../../lib/search_without_project.ts";
import { iNatProjectsUrl } from "../../data/inat_data.ts";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loggerRender("++ SelectedProjectsItem connectedCallback");

    setupComponent(template, this);

    this.render(window.app.store);
  }

  async render(appStore: AppStoreType) {
    let project = (this as DataComponentType).data as NormalizediNatProjectType;
    let type = (this as DataComponentType).type;
    if (!project) return;
    if (!type) return;

    loggerRender("++ SelectedProjectsItem render");

    let nameEl = this.querySelector(".name");
    if (nameEl && project.name) {
      let linkEl = document.createElement("a");
      linkEl.href = `${iNatProjectsUrl}/${project.slug}`;
      linkEl.textContent = project.name;
      nameEl.appendChild(linkEl);
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
