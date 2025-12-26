import { generateFromObj } from "@bramus/pagination-sequence";

export function createSequence(numPages: number, currentPage: number) {
  if (numPages === 0) {
    return [];
  }

  return generateFromObj({
    curPage: currentPage,
    numPages: numPages,
    numPagesAtEdges: 1,
    numPagesAroundCurrent: 1,
    glue: "…",
  });
}
