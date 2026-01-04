// @vitest-environment jsdom

import { expect, test, describe, beforeAll, afterAll, afterEach } from "vitest";

import { mapStore } from "../../../lib/store";
import { createMockServer, defaultParams } from "../../test_helpers";
import {
  observationsFilterableImplemented,
  observationsFilterableImplementedArrays,
} from "../../../data/app_data";
import { updateAppWithFilters } from "../../../components/ObservationsFilters/shared_utils";

const server = createMockServer();
beforeAll(() => {
  server.listen();
});
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => {
  server.close();
});

describe("updateAppWithFilters", () => {
  test("returns original observationsApiParams and empty params if form is not changed", async () => {
    let store = structuredClone(mapStore);
    let formData = new FormData();
    formData.append("verifiable", "true");

    await updateAppWithFilters(formData, store);

    expect(store.observationsApiParams).toStrictEqual(defaultParams);
    expect(window.location.search).toBe("");
  });

  test("removes verifiable from observationsApiParams and url if verifiable has no value", async () => {
    let store = structuredClone(mapStore);
    let formData = new FormData();
    formData.append("verifiable", "");

    await updateAppWithFilters(formData, store);

    expect(store.observationsApiParams).toStrictEqual({
      spam: false,
      locale: "en",
    });
    expect(window.location.search).toBe("?spam=false");
  });

  test.each(observationsFilterableImplemented)(
    "update observationsApiParams and url for each form field",
    async (field) => {
      let store = structuredClone(mapStore);
      let formData = new FormData();
      formData.append(field, "abc");

      await updateAppWithFilters(formData, store);

      expect(store.observationsApiParams).toStrictEqual({
        locale: "en",
        spam: false,
        [field]: "abc",
      });

      let params = `?spam=false&${field}=abc`;
      if (field === "verifiable") {
        params = "?verifiable=abc&spam=false";
      }

      expect(window.location.search).toBe(params);
    },
  );

  test.each(observationsFilterableImplementedArrays)(
    "update observationsApiParams and url for each form field that acceps multiple values",
    async (field) => {
      let store = structuredClone(mapStore);
      let formData = new FormData();
      formData.append(field, "abc");
      formData.append(field, "def");

      await updateAppWithFilters(formData, store);

      expect(store.observationsApiParams).toStrictEqual({
        locale: "en",
        spam: false,
        [field]: "abc,def",
      });

      let params = `?spam=false&${field}=abc,def`;
      expect(window.location.search).toBe(params);
    },
  );

  test("handles multiple fields", async () => {
    let store = structuredClone(mapStore);
    let formData = new FormData();
    formData.append("verifiable", "false");
    formData.append("threatened", "true");
    formData.append("iconic_taxa", "Aves");
    formData.append("month", "1");
    formData.append("month", "2");

    await updateAppWithFilters(formData, store);

    expect(store.observationsApiParams).toStrictEqual({
      spam: false,
      verifiable: false,
      threatened: true,
      iconic_taxa: "Aves",
      month: "1,2",
      locale: "en",
    });
    expect(window.location.search).toBe(
      "?verifiable=false&spam=false&threatened=true&iconic_taxa=Aves&month=1,2",
    );
  });
});
