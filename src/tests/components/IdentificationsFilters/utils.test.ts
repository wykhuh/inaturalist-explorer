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
  initFilters,
} from "../../../components/IdentificationsFilters/utils";
import { mapStore } from "../../../lib/store";
import { createMockServer } from "../../test_helpers";
import {
  identificationsFieldName_InputType,
  identificationsFilterableImplementedArrays,
} from "../../../data/app_data";
import { template } from "../../../components/IdentificationsFilters/template";

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
    data.append("quality_grade", "research");

    let result = processFiltersForm(data);

    let expected = {
      params: { quality_grade: "research" },
      string: "quality_grade=research",
    };
    expect(result).toStrictEqual(expected);
  });

  test("returns search params when multiple fields have a value", () => {
    let data = createFormData();
    data.append("d1", "2000-01-01");
    processFiltersForm(data);
    data.append("quality_grade", "research");

    let result = processFiltersForm(data);

    let expected = {
      params: { d1: "2000-01-01", quality_grade: "research" },
      string: "d1=2000-01-01&quality_grade=research",
    };
    expect(result).toStrictEqual(expected);
  });

  test("ignore fields with empty string values", () => {
    let data = createFormData();
    data.append("quality_grade", "");

    let result = processFiltersForm(data);

    let expected = {
      params: {},
      string: "",
    };
    expect(result).toStrictEqual(expected);
  });

  test("remove trailing and leading space; replace inner spaces with +", () => {
    let data = createFormData();
    data.append("quality_grade", " c d ");

    let result = processFiltersForm(data);

    let expected = {
      params: {
        quality_grade: "c d",
      },
      string: "quality_grade=c+d",
    };
    expect(result).toStrictEqual(expected);
  });

  test.each(identificationsFilterableImplementedArrays)(
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
    data.append("iconic_taxon_id", "3");
    processFiltersForm(data);
    data.append("hrank", "kingdom");
    data.delete("iconic_taxon_id");

    let result = processFiltersForm(data);

    let expected = {
      params: { hrank: "kingdom" },
      string: "hrank=kingdom",
    };
    expect(result).toStrictEqual(expected);
  });

  test("returns single value fields and  multiple values fields", () => {
    let data = createFormData();
    data.append("iconic_taxon_id", "3");
    data.append("hrank", "kingdom");
    data.append("iconic_taxon_id", "26036");

    let result = processFiltersForm(data);

    let expected = {
      params: {
        hrank: "kingdom",
        iconic_taxon_id: "3,26036",
      },
      string: "hrank=kingdom&iconic_taxon_id=3,26036",
    };
    expect(result).toStrictEqual(expected);
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

  function getValidFields(type: string) {
    let validFields = [];
    for (let [field, value] of Object.entries(
      identificationsFieldName_InputType,
    )) {
      if (value === type) {
        validFields.push(field);
      }
    }
    return validFields;
  }

  test.each(getValidFields("textInput"))(
    "uses identificationsApiParams to set option for text input fields",
    (field) => {
      let el = document.querySelector<HTMLInputElement>(
        `input#${field}[type='text']`,
      );
      if (!el) {
        throw new Error(`textInput ${field} error`);
      }

      let store = structuredClone(mapStore);
      store.record_type = "identifications";
      store.identificationsApiParams = {
        [field]: "abc",
      };

      expect(el.value).toBe("");

      initFilters(store);

      expect(el.value).toBe("abc");
    },
  );

  test.each(getValidFields("dateInput"))(
    "uses identificationsApiParams to set value for input date fields",
    (field) => {
      let el = document.querySelector<HTMLInputElement>(
        `input[type='date']#${field}`,
      );
      if (!el) {
        throw new Error(`dateInput ${field} error`);
      }

      let store = structuredClone(mapStore);
      store.record_type = "identifications";
      store.identificationsApiParams = {
        [field]: "2000-01-01",
      };

      expect(el.value).toBe("");

      initFilters(store);

      expect(el.value).toBe("2000-01-01");
    },
  );

  test.each(getValidFields("select"))(
    "uses identificationsApiParams to set option for select fields",
    (field) => {
      let el = document.querySelector<HTMLSelectElement>(`select#${field}`);
      if (!el) {
        throw new Error(`select ${field} error`);
      }
      let optionEl = el.querySelectorAll("option")[1];
      if (!optionEl) {
        throw new Error(`select ${field} option error`);
      }

      let store = structuredClone(mapStore);
      store.record_type = "identifications";
      store.identificationsApiParams = {
        [field]: optionEl.value,
      };

      expect(optionEl.selected).toBe(false);

      initFilters(store);

      expect(optionEl.selected).toBe(true);
    },
  );

  test.each(getValidFields("multiselect"))(
    "uses identificationsApiParams to set option to selected for multi select fields",
    (field) => {
      let el = document.querySelector<HTMLSelectElement>(`#${field}`);
      if (!el) {
        throw new Error(`multiselect ${field} error`);
      }
      let optionEl = el.querySelectorAll("option");
      let optionEl1 = optionEl[1];
      let optionEl2 = optionEl[2];

      let store = structuredClone(mapStore);
      store.record_type = "identifications";
      store.identificationsApiParams = {
        [field]: `${optionEl1.value},${optionEl2.value}`,
      };

      expect(optionEl1.selected).toBe(false);
      expect(optionEl2.selected).toBe(false);

      initFilters(store);

      expect(optionEl1.selected).toBe(true);
      expect(optionEl2.selected).toBe(true);
    },
  );

  test.each(getValidFields("checkbox"))(
    "uses identificationsApiParams to set option to selected for checkbox fields",
    (field) => {
      let el = document.querySelector<HTMLInputElement>(
        `input[name='${field}']`,
      );
      if (!el) {
        throw new Error(`checkbox ${field} error`);
      }

      let store = structuredClone(mapStore);
      store.record_type = "identifications";
      store.identificationsApiParams = {
        [field]: el.value,
      };

      expect(el.checked).toBe(false);

      initFilters(store);

      expect(el.checked).toBe(true);
    },
  );
});
