// @vitest-environment jsdom

import { expect, test, describe } from "vitest";
import {
  observationsApiNonFilterableNames,
  observationsApiFilterableNames,
} from "../data/app_data";

describe("check iNat keys", () => {
  test.each(observationsApiNonFilterableNames)(
    "ObservationsApiNonFilterableNames are not in observationsApiFilterableNames",
    (name) => {
      expect(observationsApiFilterableNames.includes(name)).toBeFalsy();
    },
  );
});
