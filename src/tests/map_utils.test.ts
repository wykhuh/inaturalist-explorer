// @vitest-environment jsdom

import { expect, test, describe } from "vitest";
import { flipLatLng } from "../lib/map_utils";
import type { LngLatType } from "../types/app";

describe("flipLatLng", () => {
  test("flips the values array with two values", () => {
    let values: LngLatType = [34, 100];
    let expected = [100, 34];

    let results = flipLatLng(values);

    expect(results).toStrictEqual(expected);
  });
});
