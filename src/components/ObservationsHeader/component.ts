class MyComponent extends HTMLElement {
  constructor() {
    super();
  }

  async render() {
    const parser = new DOMParser();
    let resp;
    try {
      resp = await fetch("/src/components/ObservationsHeader/template.html");
    } catch (error) {
      console.error(error);
    }

    if (!resp) return;

    const html = await resp.text();

    const template = parser
      .parseFromString(html, "text/html")
      .querySelector("template");

    if (!template) return;

    this.appendChild(template.content.cloneNode(true));

    this.viewChangeHandler("#observations-header #observations", "map");
    this.viewChangeHandler("#observations-header #species", "species");
    this.viewChangeHandler("#observations-header #identifiers", "identifiers");
    this.viewChangeHandler("#observations-header #observers", "observers");
  }

  viewChangeHandler(selector: string, view: string) {
    let viewContainerEl = document.querySelector("#view-container");
    let viewEl = document.querySelector(selector);

    if (viewEl && viewContainerEl) {
      viewEl.addEventListener("click", () => {
        this.updateView(view, viewContainerEl);
      });
    }
  }

  updateView(targetView: string, parentEl: Element) {
    if (!parentEl) return;

    parentEl.innerHTML = "";

    let view;
    if (targetView === "species") {
      view = document.createElement("x-view-species");
    } else if (targetView === "identifiers") {
      view = document.createElement("x-view-identifiers");
    } else if (targetView === "observers") {
      view = document.createElement("x-view-observers");
    } else {
      view = document.createElement("x-view-map");
    }
    parentEl.appendChild(view);
  }

  connectedCallback() {
    this.render();
  }
}

customElements.define("x-observations-header", MyComponent);
