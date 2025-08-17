// https://stackoverflow.com/a/55081177

fetch("/src/components/demos/header_4_ok.html")
  .then((stream) => stream.text())
  .then((text) => {
    define(text);
  })
  .catch((err) => console.log(err));

function define(htmlstring) {
  class Header4 extends HTMLElement {
    constructor() {
      super();

      var shadow = this.attachShadow({ mode: "open" });
      shadow.innerHTML = htmlstring;
    }
  }

  customElements.define("x-header4", Header4);
}
