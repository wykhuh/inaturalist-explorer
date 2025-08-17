// https://leoneck.de/blog/wc-split-setup
const template = document.createElement("template");
template.innerHTML = `
  <style>
    .class-one {
      font-size: 2rem;
      color: tomato;
    }
    .class-two {
      font-size: 4rem;
      color: cornflowerblue;
    }
  </style>
  <div class="class-one">
    Hello <span class="class-two">World</span> header_1_ok.js
  </div>
  <p>lorem ipsum</p>
`;

class MyComponent2 extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).appendChild(
      template.content.cloneNode(true)
    );
  }
}

customElements.define("x-header1", MyComponent2);
