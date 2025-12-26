// @vitest-environment jsdom

import { expect, test, describe } from "vitest";
import { createSequence } from "../components/Pagination/utils";

describe("createSequence", () => {
  test("returns array", () => {
    let numPages = 5;
    let currentPage = 1;

    let result = createSequence(numPages, currentPage);

    expect(result).toStrictEqual([1, 2, 3, 4, 5]);
  });

  test("returns array with ellipse", () => {
    let numPages = 8;
    let currentPage = 5;

    let result = createSequence(numPages, currentPage);

    expect(result).toStrictEqual([1, "…", 4, 5, 6, 7, 8]);
  });

  test("handles zero pages", () => {
    let numPages = 0;
    let currentPage = 1;

    let result = createSequence(numPages, currentPage);

    expect(result).toStrictEqual([]);
  });
});
