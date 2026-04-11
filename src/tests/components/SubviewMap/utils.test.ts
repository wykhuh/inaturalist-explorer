// @vitest-environment jsdom

import { expect, test, describe } from "vitest";

import { mapStore } from "../../../lib/store";
import { formatTimePeriodsParams } from "../../../components/SubviewMap/utils";

describe("formatTimePeriodsParams", () => {
  test("takes array of months and returns array of month params", () => {
    let store = structuredClone(mapStore);
    store.viewMetadata.observations_observations.map.category = "month_of_year";
    store.viewMetadata.mapTimePeriods = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    let results = formatTimePeriodsParams(store);

    expect(results).toStrictEqual([
      { month: "1" },
      { month: "2" },
      { month: "3" },
      { month: "4" },
      { month: "5" },
      { month: "6" },
      { month: "7" },
      { month: "8" },
      { month: "9" },
      { month: "10" },
      { month: "11" },
      { month: "12" },
    ]);
  });

  test("takes array of years and returns array of year params", () => {
    let store = structuredClone(mapStore);
    store.viewMetadata.mapTimePeriods = [2000, 2001, 2002];
    store.viewMetadata.observations_observations.map.category = "year";

    let results = formatTimePeriodsParams(store);

    expect(results).toStrictEqual([
      { year: "2000" },
      { year: "2001" },
      { year: "2002" },
    ]);
  });

  test("takes array of month dates and returns array of d1 and d2 params", () => {
    let store = structuredClone(mapStore);
    store.viewMetadata.observations_observations.map.category = "month";
    store.viewMetadata.mapTimePeriods = [
      "2000-01-01",
      "2000-02-01",
      "2000-03-01",
      "2000-04-01",
      "2000-05-01",
      "2000-06-01",
      "2000-07-01",
      "2000-08-01",
      "2000-09-01",
      "2000-10-01",
      "2000-11-01",
      "2000-12-01",
    ];

    let results = formatTimePeriodsParams(store);

    expect(results).toStrictEqual([
      { d1: "2000-01-01", d2: "2000-01-31" },
      { d1: "2000-02-01", d2: "2000-02-28" },
      { d1: "2000-03-01", d2: "2000-03-31" },
      { d1: "2000-04-01", d2: "2000-04-30" },
      { d1: "2000-05-01", d2: "2000-05-31" },
      { d1: "2000-06-01", d2: "2000-06-30" },
      { d1: "2000-07-01", d2: "2000-07-31" },
      { d1: "2000-08-01", d2: "2000-08-31" },
      { d1: "2000-09-01", d2: "2000-09-30" },
      { d1: "2000-10-01", d2: "2000-10-31" },
      { d1: "2000-11-01", d2: "2000-11-30" },
      { d1: "2000-12-01", d2: "2000-12-31" },
    ]);
  });
});
