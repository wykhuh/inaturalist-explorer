// @vitest-environment jsdom

import {
  expect,
  test,
  describe,
  beforeAll,
  afterAll,
  afterEach,
  beforeEach,
} from "vitest";
import jsdom from "jsdom";

import {
  processFiltersForm,
  updateAppWithFilters,
  setTermId,
  initFilters,
} from "../../../components/ObservationsFilters/utils";
import { mapStore } from "../../../lib/store";
import { createMockServer, defaultParams } from "../../test_helpers";
import {
  createHeaderCountHash,
  updateHeaderCount,
} from "../../../components/ObservationsHeader/shared_utils";
import {
  inputFieldsObservations,
  multipleSelectFieldsObservations,
  ObservationsFilterableImplemented,
  ObservationsFilterableImplementedArrays,
  selectFieldsObservations,
  trueFalseFieldsObservations,
} from "../../../data/app_data";
import { template } from "../../../components/ObservationsFilters/template";
import type { ObservationViewsType } from "../../../types/app";

const { JSDOM } = jsdom;

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

    let result = processFiltersForm(data);

    let expected = {
      params: {
        sound: "a b",
        iconic_taxa: "c d",
      },
      string: "sound=a+b&iconic_taxa=c+d",
    };
    expect(result).toStrictEqual(expected);
  });

  test.each(ObservationsFilterableImplementedArrays)(
    "returns comma-separated string for fields that accept multiple values",
    (field) => {
      let data = createFormData();
      data.append(field, "a");
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
    data.append("on", "2020-01-01");
    data.append("month", "2");
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

  test.each(ObservationsFilterableImplemented)(
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

  test.each(ObservationsFilterableImplementedArrays)(
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

describe("createHeaderCountHash", () => {
  let expectedHash =
    "3a50ee7ae6026e64c15ce76b50558435d6c8960343d435f807d2b4d722f5288a";
  let countLabel: ObservationViewsType = "observations_observations";

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
    "3a50ee7ae6026e64c15ce76b50558435d6c8960343d435f807d2b4d722f5288a";
  let hash2 =
    "4157a0a5913c8893e08b9b90e0c3208debd9ede75a71d944680b61e01d4ec46b";
  let hash3 =
    "06217bb9ea07f2eb7d390936a5bbc87f3adff1504f07f1f9fb112eca5bf519a7";

  test(
    "fetches record, creates hash, saves hash to iNatStats.headerCountsIndex" +
      "and saves hash and total_results to iNatStats.headerCounts",
    async () => {
      let store = structuredClone(mapStore);

      let countLabel: ObservationViewsType = "observations_observations";
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

    let countLabel: ObservationViewsType = "observations_observations";
    let params1 = "?id=1";
    let params2 = "?id=2";
    let params3 = "?id=3";
    let tooltip = null;
    let perPage = 0;
    let maxSize = 2;

    await updateHeaderCount(
      countLabel,
      () => getRecords(10),
      params1,
      store,
      tooltip,
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
      tooltip,
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
      tooltip,
      perPage,
      maxSize,
    );

    expect(store.iNatStats.headerCountsIndex).toStrictEqual([hash2, hash3]);
    expect(store.iNatStats.headerCounts.get(hash2)).toStrictEqual(20);
    expect(store.iNatStats.headerCounts.get(hash3)).toStrictEqual(30);
  });
});

describe("setTermId", () => {
  test("set term_id input using data-termid from term_value_id input", () => {
    let dom = new JSDOM(
      `<!doctype html>
  <html lang="en">
    <body>
    <input id="term_id" name="term_id" />
    <input name="term_value_id" id="term_value_id" data-termid="123" value="1" />
    </body>
  </html>`,
    );
    global.document = dom.window.document;

    let ctx = document.querySelector("body");
    let target = document.querySelector("#term_value_id") as HTMLInputElement;
    if (!target) return;

    setTermId(target, ctx);

    let termIdEl = document.querySelector("#term_id") as HTMLInputElement;
    expect(termIdEl.value).toBe("123");
  });

  test("append term_id when term_id input has an existing value", () => {
    let dom = new JSDOM(
      `<!doctype html>
  <html lang="en">
    <body>
    <input id="term_id" name="term_id" value="123" />
    <input name="term_value_id" id="term_value_id" data-termid="234" value="1" />
    </body>
  </html>`,
    );
    global.document = dom.window.document;

    let ctx = document.querySelector("body");
    let target = document.querySelector("#term_value_id") as HTMLInputElement;
    if (!target) return;

    setTermId(target, ctx);

    let termIdEl = document.querySelector("#term_id") as HTMLInputElement;
    expect(termIdEl.value).toBe("123,234");
  });

  test("set term_id  to '' if term_value_id is ''", () => {
    let dom = new JSDOM(
      `<!doctype html>
  <html lang="en">
    <body>
    <input id="term_id" name="term_id" value="123" />
    <input name="term_value_id" id="term_value_id" data-termid="123" value="" />
    </body>
  </html>`,
    );
    global.document = dom.window.document;

    let ctx = document.querySelector("body");
    let target = document.querySelector("#term_value_id") as HTMLInputElement;
    if (!target) return;

    setTermId(target, ctx);

    let termIdEl = document.querySelector("#term_id") as HTMLInputElement;
    expect(termIdEl.value).toBe("");
  });
});

describe("initFilters", () => {
  beforeEach(() => {
    let dom = new JSDOM(
      `<!doctype html>
  <html lang="en">
    <body>
    ${template}
    </body>
  </html>`,
    );
    global.document = dom.window.document;
  });

  test.each(trueFalseFieldsObservations)(
    "uses observationsApiParams to set option to selected for true/false select fields",
    (field) => {
      let el = document.querySelector(`#${field}`) as HTMLSelectElement;
      if (!el) return;
      let optionEl = el.querySelector("[value='true']") as HTMLOptionElement;
      if (!optionEl) return;

      let store = structuredClone(mapStore);
      store.observationsApiParams = {
        [field]: true,
      };

      initFilters(store);

      expect(optionEl.selected).toBe(true);
    },
  );

  test.each(inputFieldsObservations)(
    "uses observationsApiParams to set value input fields",
    (field) => {
      let store = structuredClone(mapStore);
      store.observationsApiParams = {
        [field]: "2000-01-01",
      };

      initFilters(store);

      let el = document.querySelector(`#${field}`) as HTMLSelectElement;
      if (!el) return;

      expect(el.value).toBe("2000-01-01");
    },
  );

  test.each(selectFieldsObservations)(
    "uses observationsApiParams to set option to selected for select fields",
    (field) => {
      let el = document.querySelector(`#${field}`) as HTMLSelectElement;
      if (!el) return;
      let optionEl = el.querySelectorAll("option")[1];
      if (!optionEl) return;

      let store = structuredClone(mapStore);

      store.observationsApiParams = {
        [field]: optionEl.value,
      };

      initFilters(store);

      expect(optionEl.selected).toBe(true);
    },
  );

  test.each(multipleSelectFieldsObservations)(
    "uses observationsApiParams to set option to selected for multi select fields",
    (field) => {
      let el = document.querySelector(`#${field}`) as HTMLSelectElement;
      if (!el) return;
      let optionEl = el.querySelectorAll("option");
      let optionEl1 = optionEl[1];
      let optionEl2 = optionEl[2];

      let store = structuredClone(mapStore);

      store.observationsApiParams = {
        [field]: `${optionEl1.value},${optionEl2.value}`,
      };

      initFilters(store);

      expect(optionEl1.selected).toBe(true);
      expect(optionEl2.selected).toBe(true);
    },
  );
});
