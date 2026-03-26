// @vitest-environment jsdom

import { expect, test, describe } from "vitest";
import { calculateBorderDash } from "../../../components/SubviewGraphs/charts_utils";

describe("calculateBorderDash", () => {
  test("returns [0,0] if index is 0", () => {
    let index = 0;
    let lineLength = 5;
    let spaceLength = 1;
    let results = calculateBorderDash(index, lineLength, spaceLength);

    expect(results).toStrictEqual([0, 0]);
  });

  test("returns [lineLength,spaceLength] if index is 1", () => {
    let index = 1;
    let lineLength = 5;
    let spaceLength = 1;
    let results = calculateBorderDash(index, lineLength, spaceLength);

    expect(results).toStrictEqual([5, 1]);
  });

  test("returns [lineLength,spaceLength] + [spaceLength,spaceLength] if index greater than 1", () => {
    let index = 2;
    let lineLength = 5;
    let spaceLength = 1;
    let results = calculateBorderDash(index, lineLength, spaceLength);

    expect(results).toStrictEqual([5, 1, 1, 1]);
  });
});
