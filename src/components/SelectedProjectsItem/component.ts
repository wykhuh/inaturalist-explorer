import { setupComponent } from "../../lib/component_utils.ts";
import { removeProject } from "../../lib/search_projects.ts";
import type { NormalizediNatProject } from "../../types/app";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  async render() {
    if (!this.dataset.project) return;

    await setupComponent(
      "/src/components/SelectedProjectsItem/template.html",
      this,
    );

    let project = JSON.parse(this.dataset.project) as NormalizediNatProject;

    let nameEl = this.querySelector(".name");
    if (nameEl && project.name) {
      nameEl.textContent = project.name;
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
