import { loggerEvent, loggerRender } from "../../lib/logger";
import type { DataComponentType, AppStoreType } from "../../types/app";
import { createSequence } from "./utils";

type PaginationProps = {
  perPage: number;
  currentPage: number;
  totalRecords: number;
  appStore: AppStoreType;
  paginationCallback: (
    pageNumber: number,
    appStore: AppStoreType,
  ) => Promise<void>;
  scrollToSelector?: string;
};

export class Pagination extends HTMLElement {
  constructor() {
    super();
  }

  currentPage = 0;
  paginationCallback: any = undefined;
  scrollToSelector: string | undefined = undefined;
  perPage = 0;
  totalRecords = 0;

  connectedCallback() {
    loggerRender("++ Pagination connectedCallback");

    let data = (this as unknown as DataComponentType).data as PaginationProps;
    this.perPage = data.perPage;
    this.currentPage = data.currentPage;
    this.totalRecords = data.totalRecords;
    this.paginationCallback = data.paginationCallback;
    this.scrollToSelector = data.scrollToSelector;

    this.render();

    let nextEl = this.querySelector(".next");
    let prevEl = this.querySelector(".prev");

    this.querySelectorAll("li").forEach((li) => {
      let value = li.innerText;
      // add event listner for pages
      if (/^\d+$/.test(value)) {
        li.addEventListener("click", this);
        // add event listner for next
      } else if (nextEl && li.className === "next") {
        let numPages = Math.ceil(this.totalRecords / this.perPage);
        if (this.currentPage <= numPages - 1) {
          nextEl.addEventListener("click", this);
        }
        // add event listner for prev
      } else if (prevEl && li.className === "prev") {
        if (this.currentPage > 1) {
          prevEl.addEventListener("click", this);
        }
      }
    });
  }

  disconnectedCallback() {
    loggerRender("++ Pagination disconnectedCallback");

    this.querySelectorAll("li").forEach((li) => {
      li.removeEventListener("click", this);
    });
  }

  handleEvent(event: Event) {
    let target = event.target as HTMLElement;
    if (!target) return;
    loggerEvent(`[Pagination event] ${event.type}`);

    let value = Number(target.innerText);

    if (target.className === "next") {
      this.paginationCallback(this.currentPage + 1, window.app.store);
    } else if (target.className === "prev") {
      this.paginationCallback(this.currentPage - 1, window.app.store);
    } else if (value !== this.currentPage) {
      // do fetch request and render new records
      this.paginationCallback(Number(value), window.app.store);
      // scroll to top of page
      if (this.scrollToSelector) {
        document.querySelector(this.scrollToSelector)?.scrollIntoView();
      }
    }
  }

  render() {
    loggerRender("++ Pagination render");

    let numPages = Math.ceil(this.totalRecords / this.perPage);
    const sequence = createSequence(numPages, this.currentPage);

    let listEl = document.createElement("ul");
    listEl.className = "pagination";

    let prevEl = document.createElement("li");
    prevEl.textContent = "Prev";
    prevEl.className = "prev";

    if (this.currentPage === 1) {
      prevEl.className = "disable";
    }
    listEl.appendChild(prevEl);

    sequence.forEach((pageNum) => {
      let liEl = document.createElement("li");
      liEl.textContent = pageNum.toString();
      if (pageNum === this.currentPage) {
        liEl.className = "current-page";
      }
      listEl.appendChild(liEl);
    });

    let nextEl = document.createElement("li");
    nextEl.textContent = "Next";
    nextEl.className = "next";

    if (this.currentPage === numPages) {
      nextEl.className = "disable";
    }

    listEl.appendChild(nextEl);
    this.append(listEl);
  }
}

customElements.define("app-pagination", Pagination);
