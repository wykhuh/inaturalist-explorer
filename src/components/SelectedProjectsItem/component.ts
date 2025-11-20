import { setupComponent } from "../../lib/component_utils.ts";
import { removeProject } from "../../lib/search_projects.ts";
import type { NormalizediNatProject } from "../../types/app";
import { pluralize } from "../../lib/utils.ts";
import { loggerRender } from "../../lib/logger.ts";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  async render() {
    if (!this.dataset.project) return;
    loggerRender("++ SelectedProjectsItem render");

    await setupComponent(
      "/src/components/SelectedProjectsItem/template.html",
      this,
    );

    let project = JSON.parse(this.dataset.project) as NormalizediNatProject;

    let nameEl = this.querySelector(".name");
    if (nameEl && project.name) {
      nameEl.textContent = project.name;
    }

    let countEl = this.querySelector(".count");
    if (countEl) {
      countEl.textContent = pluralize(
        project.observations_count,
        "observation",
        true,
      );
    }

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

customElements.define("x-projects-list-item", MyComponent);
