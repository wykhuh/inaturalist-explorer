// @vitest-environment jsdom

import { expect, test, describe } from "vitest";

import { colorsSixTolBright } from "../lib/map_colors_utils.ts";
import { mapStore } from "../lib/store.ts";
import { getColor } from "../lib/map_colors_utils.ts";

describe("getColor", () => {
  test("returns first color in color array if color not set in store", () => {
    mapStore.color = "";
    let result = getColor(mapStore, colorsSixTolBright);

    expect(result).toBe(colorsSixTolBright[0]);
  });

  test("returns next color in color array if color is set in store", () => {
    mapStore.color = colorsSixTolBright[2];
    let result = getColor(mapStore, colorsSixTolBright);

    expect(result).toBe(colorsSixTolBright[3]);
  });

  test("returns first color in color array if color is last color in array", () => {
    mapStore.color = colorsSixTolBright[5];
    let result = getColor(mapStore, colorsSixTolBright);

    expect(result).toBe(colorsSixTolBright[0]);
  });
});
