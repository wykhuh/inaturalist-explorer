// @vitest-environment jsdom

import { expect, test, describe } from "vitest";

import { processFiltersForm } from "../../../components/ObservationsFilters/utils";

function createFormData() {
  const formData = new FormData();
  return formData;
}

describe("processFiltersForm", () => {
  test("returns empty string when form data are empty strings", () => {
    let data = createFormData();

    let result = processFiltersForm(data);

    expect(result).toBe("");
  });

  test("returns search params when one field has a value", () => {
    let data = createFormData();
    data.append("verifiable", "any");

    let result = processFiltersForm(data);

    expect(result).toBe("verifiable=any");
  });

  test("returns search params when multiple fields have a value", () => {
    let data = createFormData();
    data.append("verifiable", "any");
    processFiltersForm(data);
    data.append("quality_grade", "research");

    let result = processFiltersForm(data);

    expect(result).toBe("verifiable=any&quality_grade=research");
  });

  test("returns field name if value is 'on'", () => {
    let data = createFormData();
    data.append("verifiable", "any");
    processFiltersForm(data);
    data.append("sounds", "on");

    let result = processFiltersForm(data);

    expect(result).toBe("verifiable=any&sounds");
  });

  test("returns iconic_taxa  if there is one iconic_taxa", () => {
    let data = createFormData();
    data.append("iconic_taxa", "Aves");

    let result = processFiltersForm(data);

    expect(result).toBe("iconic_taxa=Aves");
  });

  test("returns iconic_taxa as comma-separated string if multiple iconic_taxa", () => {
    let data = createFormData();
    data.append("iconic_taxa", "Aves");
    processFiltersForm(data);
    data.append("iconic_taxa", "Amphibia");

    let result = processFiltersForm(data);

    expect(result).toBe("iconic_taxa=Aves,Amphibia");
  });

  test("returns month if month is current field and only one month is set", () => {
    let data = createFormData();
    data.append("on", "2021-01-01");
    processFiltersForm(data);
    data.append("month", "1");
    data.delete("on");

    let result = processFiltersForm(data);

    expect(result).toBe("month=1");
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

    expect(result).toBe("month=1,3");
  });

  test("returns on if on is current field", () => {
    let data = createFormData();
    data.append("month", "1");
    processFiltersForm(data);
    data.append("on", "2021-01-01");
    data.delete("month");

    let result = processFiltersForm(data);

    expect(result).toBe("on=2021-01-01");
  });

  test("returns d1 if d1 is current field", () => {
    let data = createFormData();
    data.append("month", "1");
    processFiltersForm(data);
    data.append("d1", "2022-02-02");
    data.delete("month");

    let result = processFiltersForm(data);

    expect(result).toBe("d1=2022-02-02");
  });

  test("returns d2 if d2 is current field", () => {
    let data = createFormData();
    data.append("month", "1");
    processFiltersForm(data);
    data.append("d2", "2023-03-03");
    data.delete("month");

    let result = processFiltersForm(data);

    expect(result).toBe("d2=2023-03-03");
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

    expect(result).toBe("d1=2022-02-02&d2=2023-03-03");
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

    expect(result).toBe("d1=2022-02-02&d2=2023-03-03");
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

    expect(result).toBe("iconic_taxa=Aves&on=2020-01-01");
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

    expect(result).toBe("iconic_taxa=Aves&month=1,2");
  });
});
