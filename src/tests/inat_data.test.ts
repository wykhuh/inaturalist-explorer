// @vitest-environment jsdom

import { expect, test, describe } from "vitest";
import {
  ObservationsApiNonFilterableNames,
  ObservationsApiFilterableNames,
} from "../data/app_data";

describe("check iNat keys", () => {
  test.each(ObservationsApiNonFilterableNames)(
    "ObservationsApiNonFilterableNames are not in ObservationsApiFilterableNames",
    (name) => {
      expect(ObservationsApiFilterableNames.includes(name)).toBeFalsy();
    },
  );
});
