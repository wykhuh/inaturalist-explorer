import { removeProject } from "../../lib/search_projects.ts";
import type { NormalizediNatProject } from "../../types/app";

class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  async render() {
    if (!this.dataset.project) return;

    const parser = new DOMParser();
    const resp = await fetch("/src/components/ProjectsListItem/template.html");
    const html = await resp.text();

    const template = parser
      .parseFromString(html, "text/html")
      .querySelector("template");

    if (!template) return;
    this.appendChild(template.content.cloneNode(true));

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

  connectedCallback() {
    this.render();
  }
}

customElements.define("x-projects-list-item", MyComponent);
