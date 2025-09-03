// @vitest-environment jsdom

import { expect, test, describe } from "vitest";

import {
  processFiltersForm,
  resetForm,
} from "../../../components/ObservationsFilters/utils";
import { mapStore } from "../../../lib/store";

function createFormData() {
  const formData = new FormData();
  return formData;
}

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

describe("resetForm", () => {
  test("returns original store if no changes have been made to store ", () => {
    let store = structuredClone(mapStore);

    resetForm(store);

    expect(store.inatApiParams).toStrictEqual({
      spam: false,
      verifiable: true,
    });
    expect(store).toStrictEqual(structuredClone(mapStore));
  });

  test("removes inatApiParams that are set by the filters form", () => {
    let store = structuredClone(mapStore);
    store.inatApiParams.threatened = true;
    store.inatApiParams.iconic_taxa = "Aves";
    store.inatApiParams.month = "1,2";

    resetForm(store);

    expect(store.inatApiParams).toStrictEqual({
      spam: false,
      verifiable: true,
    });
    expect(store).toStrictEqual(structuredClone(mapStore));
  });

  test("does not change inatApiParams that are in iNatApiNonFilterableNames", () => {
    let store = structuredClone(mapStore);
    store.inatApiParams.taxon_id = "123";
    store.inatApiParams.colors = "#4477aa";
    store.inatApiParams.place_id = "456";
    store.inatApiParams.nelat = 1;
    store.inatApiParams.nelng = 2;
    store.inatApiParams.swlat = 3;
    store.inatApiParams.swlng = 4;

    resetForm(store);

    expect(store.inatApiParams).toStrictEqual({
      spam: false,
      verifiable: true,
      taxon_id: "123",
      colors: "#4477aa",
      place_id: "456",
      nelat: 1,
      nelng: 2,
      swlat: 3,
      swlng: 4,
    });
  });

  test("reset verify and spam to default values", () => {
    let store = structuredClone(mapStore);
    store.inatApiParams.spam = true;
    store.inatApiParams.verifiable = false;

    resetForm(store);

    expect(store.inatApiParams).toStrictEqual({
      spam: false,
      verifiable: true,
    });
  });
});
