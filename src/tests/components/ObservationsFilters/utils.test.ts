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

  test("convert string boolean to boolean", () => {
    let data = createFormData();
    data.append("verifiable", "true");
    data.append("sound", "false");

    let result = processFiltersForm(data);

    let expected = {
      params: { verifiable: true, sound: false },
      string: "verifiable=true&sound=false",
    };
    expect(result).toStrictEqual(expected);
  });

  test("ignore fields with empty string values", () => {
    let data = createFormData();
    data.append("sound", "");
    data.append("iconic_taxa", "");
    data.append("term_value_id-9", "");

    let result = processFiltersForm(data);

    let expected = {
      params: {},
      string: "",
    };
    expect(result).toStrictEqual(expected);
  });

  test("remove trailing and leading space; replace inner spaces with +", () => {
    let data = createFormData();
    data.append("sound", " a b ");
    data.append("iconic_taxa", " c d ");
    data.append("term_value_id-9", " e f ");

    let result = processFiltersForm(data);

    let expected = {
      params: {
        sound: "a b",
        iconic_taxa: "c d",
        term_id: "9",
        term_value_id: "e f",
      },
      string: "sound=a+b&iconic_taxa=c+d&term_id=9&term_value_id=e+f",
    };
    expect(result).toStrictEqual(expected);
  });

  test.each([
    "iconic_taxa",
    "month",
    "year",
    "license",
    "photo_license",
    "sound_license",
    "quality_grade",
    "created_month",
    "created_year",
  ])(
    "returns comma-separated string for fields that accept multiple values",
    (field) => {
      let data = createFormData();
      data.append(field, "a");
      processFiltersForm(data);
      data.append(field, "b");

      let result = processFiltersForm(data);

      let expected = {
        params: { [field]: "a,b" },
        string: `${field}=a,b`,
      };
      expect(result).toStrictEqual(expected);
    },
  );

  test("allow deleting a field", () => {
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

  test("returns d1 and d2 if both are set", () => {
    let data = createFormData();
    data.append("d2", "2023-03-03");
    processFiltersForm(data);
    data.append("d1", "2022-02-02");

    let result = processFiltersForm(data);

    let expected = {
      params: { d1: "2022-02-02", d2: "2023-03-03" },
      string: "d2=2023-03-03&d1=2022-02-02",
    };
    expect(result).toStrictEqual(expected);
  });

  test("returns single value fields and  multiple values fields", () => {
    let data = createFormData();
    data.append("month", "1");
    processFiltersForm(data);
    data.append("on", "2020-01-01");
    processFiltersForm(data);
    data.append("month", "2");
    processFiltersForm(data);
    data.append("iconic_taxa", "Aves");

    let result = processFiltersForm(data);

    let expected = {
      params: {
        iconic_taxa: "Aves",
        month: "1,2",
        on: "2020-01-01",
      },
      string: "on=2020-01-01&iconic_taxa=Aves&month=1,2",
    };
    expect(result).toStrictEqual(expected);
  });

  test("convert term_value_id-number into comma seperated term_id and term_value_id", () => {
    let data = createFormData();
    data.append("term_value_id-1", "4");
    data.append("term_value_id-1", "5");
    data.append("term_value_id-9", "10");
    data.append("term_value_id-9", "11");

    let result = processFiltersForm(data);

    let expected = {
      params: { term_id: "1,9", term_value_id: "4,5,10,11" },
      string: "term_id=1,9&term_value_id=4,5,10,11",
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
