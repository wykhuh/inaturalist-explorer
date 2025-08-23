// @vitest-environment jsdom

import { expect, test, describe } from "vitest";
import { getBoundingBox, convertBoundsObjectToPolygon } from "../lib/map_utils";
import type { LngLat } from "../types/app";

describe("getBoundingBox", () => {
  test("creates bounding for for an array of features", () => {
    let la: LngLat = [-118.2610169697, 34.1980014782];
    let san_diego: LngLat = [-116.7702074446, 33.028203199];
    let places = [la, san_diego];
    let expected = {
      _northEast: { lat: 34.1980014782, lng: -116.7702074446 },
      _southWest: { lat: 33.028203199, lng: -118.2610169697 },
    };

    let results = getBoundingBox(places);
    expect(results).toStrictEqual(expected);
  });
});

describe("convertLeafletBoundsToPolygon", () => {
  test("convert leaflet bounds object into polygon coordinate arrays", () => {
    let bounds = {
      _northEast: { lat: 34.1980014782, lng: -116.7702074446 },
      _southWest: { lat: 33.028203199, lng: -118.2610169697 },
    };
    let expected = [
      [-116.7702074446, 34.1980014782],
      [-116.7702074446, 33.028203199],
      [-118.2610169697, 33.028203199],
      [-118.2610169697, 34.1980014782],
    ];

    let result = convertBoundsObjectToPolygon(bounds);

    expect(result).toStrictEqual(expected);
  });
});
