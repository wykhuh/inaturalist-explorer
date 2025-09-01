// @vitest-environment jsdom

import { expect, test, describe } from "vitest";

import { mapStore } from "../lib/store.ts";
import { getColor, defaultColorScheme } from "../lib/map_colors_utils.ts";

describe("getColor", () => {
  test("returns first color in color array if color not set in store", () => {
    mapStore.color = "";
    let result = getColor(mapStore, defaultColorScheme);

    expect(result).toBe(defaultColorScheme[0]);
  });

  test("returns next color in color array if color is set in store", () => {
    mapStore.color = defaultColorScheme[2];
    let result = getColor(mapStore, defaultColorScheme);

    expect(result).toBe(defaultColorScheme[3]);
  });

  test("returns first color in color array if color is last color in array", () => {
    mapStore.color = defaultColorScheme[5];
    let result = getColor(mapStore, defaultColorScheme);

    expect(result).toBe(defaultColorScheme[0]);
  });
});
