// @vitest-environment jsdom

import { expect, test, describe } from "vitest";
import {
  iNatApiNonFilterableNames,
  iNatApiFilterableNames,
} from "../data/inat_data";

describe("check iNat keys", () => {
  test.each(iNatApiNonFilterableNames)(
    "iNatApiNonFilterableNames are not in iNatApiFilterableNames",
    (name) => {
      expect(iNatApiFilterableNames.includes(name)).toBeFalsy();
    },
  );
});
