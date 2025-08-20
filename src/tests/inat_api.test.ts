import { expect, test } from "vitest";

import { redOaksSpeciesCount } from "./fixtures/inatApi.js";

test("observations species count", () => {
  let res = redOaksSpeciesCount.results.reduce((prev, current) => {
    return prev + current.count;
  }, 0);
  expect(res).toBe(394602);
});
