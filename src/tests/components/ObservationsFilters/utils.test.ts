// @vitest-environment jsdom

import { expect, test, describe, beforeAll, afterAll, afterEach } from "vitest";

import {
  processFiltersForm,
  updateAppWithFilters,
} from "../../../components/ObservationsFilters/utils";
import { mapStore } from "../../../lib/store";
import { createMockServer } from "../../test_helpers";

function createFormData() {
  const formData = new FormData();
  return formData;
}

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

describe("processFiltersForm", () => {
  test("returns empty string when form data are empty strings", () => {
    let data = createFormData();

    let result = processFiltersForm(data);

    let expected = {
      params: {},
      string: "",
    };
    expect(result).toStrictEqual(expected);
  });

  test("returns search params when one field has a value", () => {
    let data = createFormData();
    data.append("verifiable", "true");

    let result = processFiltersForm(data);

    let expected = {
      params: { verifiable: true },
      string: "verifiable=true",
    };
    expect(result).toStrictEqual(expected);
  });

  test("returns search params when multiple fields have a value", () => {
    let data = createFormData();
    data.append("verifiable", "any");
    processFiltersForm(data);
    data.append("quality_grade", "research");

    let result = processFiltersForm(data);

    let expected = {
      params: { verifiable: "any", quality_grade: "research" },
      string: "verifiable=any&quality_grade=research",
    };
    expect(result).toStrictEqual(expected);
  });

  test("ignore field name if value is 'on'", () => {
    let data = createFormData();
    data.append("verifiable", "any");
    processFiltersForm(data);
    data.append("sounds", "on");

    let result = processFiltersForm(data);

    let expected = {
      params: { verifiable: "any" },
      string: "verifiable=any",
    };
    expect(result).toStrictEqual(expected);
  });

  test("returns iconic_taxa  if there is one iconic_taxa", () => {
    let data = createFormData();
    data.append("iconic_taxa", "Aves");

    let result = processFiltersForm(data);

    let expected = {
      params: {
        iconic_taxa: "Aves",
      },
      string: "iconic_taxa=Aves",
    };
    expect(result).toStrictEqual(expected);
  });

  test("returns iconic_taxa as comma-separated string if multiple iconic_taxa", () => {
    let data = createFormData();
    data.append("iconic_taxa", "Aves");
    processFiltersForm(data);
    data.append("iconic_taxa", "Amphibia");

    let result = processFiltersForm(data);

    let expected = {
      params: { iconic_taxa: "Aves,Amphibia" },
      string: "iconic_taxa=Aves,Amphibia",
    };
    expect(result).toStrictEqual(expected);
  });

  test("returns month if month is current field and only one month is set", () => {
    let data = createFormData();
    data.append("on", "2021-01-01");
    processFiltersForm(data);
    data.append("month", "1");
    data.delete("on");

    let result = processFiltersForm(data);

    let expected = {
      params: { month: "1" },
      string: "month=1",
    };
    expect(result).toStrictEqual(expected);
  });

  test("returns month as comma-separated string if month is current field and multiple months", () => {
    let data = createFormData();
    data.append("month", "1");
    processFiltersForm(data);
    data.append("on", "2021-01-01");
    processFiltersForm(data);
    data.append("month", "3");
    data.delete("on");

    let result = processFiltersForm(data);

    let expected = {
      params: { month: "1,3" },
      string: "month=1,3",
    };
    expect(result).toStrictEqual(expected);
  });

  test("returns on if on is current field", () => {
    let data = createFormData();
    data.append("month", "1");
    processFiltersForm(data);
    data.append("on", "2021-01-01");
    data.delete("month");

    let result = processFiltersForm(data);

    let expected = {
      params: { on: "2021-01-01" },
      string: "on=2021-01-01",
    };
    expect(result).toStrictEqual(expected);
  });

  test("returns d1 if d1 is current field", () => {
    let data = createFormData();
    data.append("month", "1");
    processFiltersForm(data);
    data.append("d1", "2022-02-02");
    data.delete("month");

    let result = processFiltersForm(data);

    let expected = {
      params: { d1: "2022-02-02" },
      string: "d1=2022-02-02",
    };
    expect(result).toStrictEqual(expected);
  });

  test("returns d2 if d2 is current field", () => {
    let data = createFormData();
    data.append("month", "1");
    processFiltersForm(data);
    data.append("d2", "2023-03-03");
    data.delete("month");

    let result = processFiltersForm(data);

    let expected = {
      params: { d2: "2023-03-03" },
      string: "d2=2023-03-03",
    };
    expect(result).toStrictEqual(expected);
  });

  test("returns d1 and d2 if d1 is current field and both are set", () => {
    let data = createFormData();
    data.append("month", "1");
    processFiltersForm(data);
    data.append("d2", "2023-03-03");
    processFiltersForm(data);
    data.append("d1", "2022-02-02");
    data.delete("month");

    let result = processFiltersForm(data);

    let expected = {
      params: { d1: "2022-02-02", d2: "2023-03-03" },
      string: "d1=2022-02-02&d2=2023-03-03",
    };
    expect(result).toStrictEqual(expected);
  });

  test("returns d1 and d2 if d2 is current field and both are set", () => {
    let data = createFormData();
    data.append("month", "1");
    processFiltersForm(data);
    data.append("d1", "2022-02-02");
    processFiltersForm(data);
    data.append("d2", "2023-03-03");
    data.delete("month");

    let result = processFiltersForm(data);

    let expected = {
      params: { d1: "2022-02-02", d2: "2023-03-03" },
      string: "d1=2022-02-02&d2=2023-03-03",
    };
    expect(result).toStrictEqual(expected);
  });

  test("returns the last date format", () => {
    let data = createFormData();
    data.append("month", "1");
    processFiltersForm(data);
    data.append("on", "2020-01-01");
    processFiltersForm(data);
    data.append("iconic_taxa", "Aves");
    data.delete("month");

    let result = processFiltersForm(data);

    let expected = {
      params: {
        iconic_taxa: "Aves",
        on: "2020-01-01",
      },
      string: "iconic_taxa=Aves&on=2020-01-01",
    };
    expect(result).toStrictEqual(expected);
  });

  test("returns the last date format for multiple months", () => {
    let data = createFormData();
    data.append("month", "1");
    processFiltersForm(data);
    data.append("on", "2020-01-01");
    processFiltersForm(data);
    data.append("month", "2");
    processFiltersForm(data);
    data.append("iconic_taxa", "Aves");
    data.delete("on");

    let result = processFiltersForm(data);

    let expected = {
      params: {
        iconic_taxa: "Aves",
        month: "1,2",
      },
      string: "iconic_taxa=Aves&month=1,2",
    };
    expect(result).toStrictEqual(expected);
  });
});

describe("updateAppWithFilters", () => {
  test("returns original inatApiParams and empty params if form is not changed", async () => {
    let store = structuredClone(mapStore);
    let formData = new FormData();
    formData.set("verifiable", "true");

    await updateAppWithFilters(formData, store);

    expect(store.inatApiParams).toStrictEqual({
      spam: false,
      verifiable: true,
    });
    expect(window.location.search).toBe("");
  });

  test("removes verifiable from inatApiParams and url if verifiable has no value", async () => {
    let store = structuredClone(mapStore);
    let formData = new FormData();
    formData.set("verifiable", "");

    await updateAppWithFilters(formData, store);

    expect(store.inatApiParams).toStrictEqual({
      spam: false,
    });
    expect(window.location.search).toBe("?spam=false");
  });

  test("update inatApiParams and url with form data", async () => {
    let store = structuredClone(mapStore);
    let formData = new FormData();
    formData.set("verifiable", "false");
    formData.set("threatened", "true");
    formData.set("iconic_taxa", "Aves");
    formData.set("month", "1,2");

    await updateAppWithFilters(formData, store);

    expect(store.inatApiParams).toStrictEqual({
      spam: false,
      verifiable: false,
      threatened: true,
      iconic_taxa: "Aves",
      month: "1,2",
    });
    expect(window.location.search).toBe(
      "?verifiable=false&spam=false&threatened=true&iconic_taxa=Aves&month=1,2",
    );
  });
});
