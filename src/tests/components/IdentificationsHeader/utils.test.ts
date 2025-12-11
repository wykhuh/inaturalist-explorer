// @vitest-environment jsdom

import { describe, test } from "vitest";
import { updateCountsHeader } from "../../../components/IdentificationsHeader/utils";
import { mapStore } from "../../../lib/store";
import { life } from "../../test_helpers";

describe("updateCountsHeader", () => {
  test("handles when observation_iconic_taxon_id is single value", async () => {
    let store = structuredClone(mapStore);
    store.selectedTaxa = [life()];
    store.record_type = "identifications";
    store.identificationsApiParams = {
      observation_iconic_taxon_id: 1,
    };

    updateCountsHeader(store);
  });

  test("handles when observation_iconic_taxon_id is multiple values", async () => {
    let store = structuredClone(mapStore);
    store.selectedTaxa = [life()];
    store.record_type = "identifications";
    store.identificationsApiParams = {
      observation_iconic_taxon_id: "1,2",
    };

    updateCountsHeader(store);
  });
});
