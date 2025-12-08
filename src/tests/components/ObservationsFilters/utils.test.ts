// @vitest-environment jsdom

import { expect, test, describe, beforeAll, afterAll, afterEach } from "vitest";

import {
  processFiltersForm,
  updateAppWithFilters,
} from "../../../components/ObservationsFilters/utils";
import { mapStore } from "../../../lib/store";
import { createMockServer, defaultParams } from "../../test_helpers";
import {
  createHeaderCountHash,
  updateHeaderCount,
} from "../../../components/ObservationsHeader/shared_utils";

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
  test("returns original observationsApiParams and empty params if form is not changed", async () => {
    let store = structuredClone(mapStore);
    let formData = new FormData();
    formData.set("verifiable", "true");

    await updateAppWithFilters(formData, store);

    expect(store.observationsApiParams).toStrictEqual(defaultParams);
    expect(window.location.search).toBe("");
  });

  test("removes verifiable from observationsApiParams and url if verifiable has no value", async () => {
    let store = structuredClone(mapStore);
    let formData = new FormData();
    formData.set("verifiable", "");

    await updateAppWithFilters(formData, store);

    expect(store.observationsApiParams).toStrictEqual({
      spam: false,
      locale: "en",
    });
    expect(window.location.search).toBe("?spam=false");
  });

  test("update observationsApiParams and url with form data", async () => {
    let store = structuredClone(mapStore);
    let formData = new FormData();
    formData.set("verifiable", "false");
    formData.set("threatened", "true");
    formData.set("iconic_taxa", "Aves");
    formData.set("month", "1,2");

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

describe("createHeaderCountHash", () => {
  let expectedHash =
    "01d13c8a58f50b9f529c28747efc1f045b7348f9ba2aa08dea6b6e6ede874198";
  let countLabel = "observations-observations";

  test("creates hash using given countLabel and search parans", async () => {
    let params = "?id=1";
    let params2 = "?id=10";

    let results1 = await createHeaderCountHash(countLabel, params);
    let results2 = await createHeaderCountHash(countLabel, params);
    let results3 = await createHeaderCountHash(countLabel, params2);

    expect(results1).toEqual(expectedHash);
    expect(results1).toEqual(results2);
    expect(results2).not.toEqual(results3);
  });

  test("ignores colors params when creating hash", async () => {
    let params = "?id=1&colors=red";

    let results = await createHeaderCountHash(countLabel, params);

    expect(results).toEqual(expectedHash);
  });

  test("ignores view params when creating hash", async () => {
    let params = "?id=1&view=observations";

    let results = await createHeaderCountHash(countLabel, params);

    expect(results).toEqual(expectedHash);
  });

  test("ignores subview params when creating hash", async () => {
    let params = "?id=1&subview=grid";

    let results = await createHeaderCountHash(countLabel, params);

    expect(results).toEqual(expectedHash);
  });
});

describe("updateHeaderCount", () => {
  function getRecords(value: number) {
    return { total_results: value };
  }

  let hash1 =
    "4041e3e7f63e5818f7a81cc2944b9eb6bef63091909c559fc930eb958434ec0b";
  let hash2 =
    "b7a898c2eef6719185c7d427ade59f85a7bd7234e0772c5f872bdf940f950203";
  let hash3 =
    "47565df9a7d62046d02b94872cb4cf32cacd4cea8ca56594b2d6a3d151ea8353";

  test(
    "fetches record, creates hash, saves hash to iNatStats.headerCountsIndex" +
      "and saves hash and total_results to iNatStats.headerCounts",
    async () => {
      let store = structuredClone(mapStore);

      let countLabel = "A-1";
      let params1 = "?id=1";
      let params2 = "?id=2";

      await updateHeaderCount(countLabel, () => getRecords(10), params1, store);

      expect(store.iNatStats.headerCountsIndex).toStrictEqual([hash1]);
      expect(store.iNatStats.headerCounts.get(hash1)).toStrictEqual(10);

      await updateHeaderCount(countLabel, () => getRecords(20), params2, store);

      expect(store.iNatStats.headerCountsIndex).toStrictEqual([hash1, hash2]);
      expect(store.iNatStats.headerCounts.get(hash1)).toStrictEqual(10);
      expect(store.iNatStats.headerCounts.get(hash2)).toStrictEqual(20);
    },
  );

  test("delete first item in headerCountsIndex and headerCounts if cache size > maxCacheSize", async () => {
    let store = structuredClone(mapStore);

    let countLabel = "A-1";
    let params1 = "?id=1";
    let params2 = "?id=2";
    let params3 = "?id=3";
    let perPage = 0;
    let maxSize = 2;

    await updateHeaderCount(
      countLabel,
      () => getRecords(10),
      params1,
      store,
      perPage,
      maxSize,
    ).then(() => {
      expect(store.iNatStats.headerCountsIndex).toStrictEqual([hash1]);
      expect(store.iNatStats.headerCounts.get(hash1)).toStrictEqual(10);
    });

    await updateHeaderCount(
      countLabel,
      () => getRecords(20),
      params2,
      store,
      perPage,
      maxSize,
    );

    expect(store.iNatStats.headerCountsIndex).toStrictEqual([hash1, hash2]);
    expect(store.iNatStats.headerCounts.get(hash1)).toStrictEqual(10);
    expect(store.iNatStats.headerCounts.get(hash2)).toStrictEqual(20);

    await updateHeaderCount(
      countLabel,
      () => getRecords(30),
      params3,
      store,
      perPage,
      maxSize,
    );

    expect(store.iNatStats.headerCountsIndex).toStrictEqual([hash2, hash3]);
    expect(store.iNatStats.headerCounts.get(hash2)).toStrictEqual(20);
    expect(store.iNatStats.headerCounts.get(hash3)).toStrictEqual(30);
  });
});
