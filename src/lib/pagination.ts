import { generateFromObj } from "@bramus/pagination-sequence";

export function createPagination(
  perPage: number,
  currentPage: number,
  totalRecords: number,
  callback: (pageNumber: number) => void,
) {
  let numPages = Math.ceil(totalRecords / perPage);
  const sequence = generateFromObj({
    curPage: currentPage,
    numPages: numPages,
    numPagesAtEdges: 1,
    numPagesAroundCurrent: 1,
    glue: "…",
  });

  let listEl = document.createElement("ul");
  listEl.className = "pagination";

  let prevEl = document.createElement("li");
  prevEl.textContent = "Prev";
  if (currentPage === 1) {
    prevEl.className = "disable";
  }
  if (currentPage > 1) {
    prevEl.addEventListener("click", () => {
      callback(currentPage - 1);
    });
  }
  listEl.appendChild(prevEl);

  sequence.forEach((pageNum) => {
    let liEl = document.createElement("li");
    liEl.textContent = pageNum.toString();
    if (pageNum === currentPage) {
      liEl.className = "current-page";
    }
    if (typeof pageNum === "number") {
      liEl.addEventListener("click", () => {
        callback(pageNum);
      });
    }
    listEl.appendChild(liEl);
  });

  let nextEl = document.createElement("li");
  nextEl.textContent = "Next";
  if (currentPage === numPages) {
    nextEl.className = "disable";
  }
  if (currentPage <= numPages - 1) {
    nextEl.addEventListener("click", () => {
      callback(currentPage + 1);
    });
  }

  listEl.appendChild(nextEl);

  return listEl;
}
