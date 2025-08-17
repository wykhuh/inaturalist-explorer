// https://stackoverflow.com/a/73874429

const setup = async () => {
  const parser = new DOMParser();
  const resp = await fetch("/src/components/demos/header_5_ok.html");
  const html = await resp.text();
  console.log("html", html);

  const template = parser
    .parseFromString(html, "text/html")
    .querySelector("template");
  console.log("template >>", template);

  return class MyComponent extends HTMLElement {
    constructor() {
      super();

      this.attachShadow({ mode: "open" }).appendChild(
        template.content.cloneNode(true)
      );
    }
  };
};

export default await setup();
