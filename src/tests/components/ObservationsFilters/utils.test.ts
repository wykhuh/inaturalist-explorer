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
} from "../../../components/ObservationsFilters/utils";
import { mapStore } from "../../../lib/store";
import { createMockServer } from "../../test_helpers";
import {
  observationsFieldName_InputType,
  observationsFilterableImplementedArrays,
} from "../../../data/app_data";
import { template } from "../../../components/ObservationsFilters/template";

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
    data.append("sounds", "false");

    let result = processFiltersForm(data);

    let expected = {
      params: { verifiable: true, sounds: false },
      string: "verifiable=true&sounds=false",
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

  test.each(observationsFilterableImplementedArrays)(
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
    data.append("iconic_taxa", "Aves");
    data.append("hrank", "kingdom");
    data.append("iconic_taxa", "Reptiles");

    let result = processFiltersForm(data);

    let expected = {
      params: {
        hrank: "kingdom",
        iconic_taxa: "Aves,Reptiles",
      },
      string: "hrank=kingdom&iconic_taxa=Aves,Reptiles",
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
      observationsFieldName_InputType,
    )) {
      if (value === type) {
        validFields.push(field);
      }
    }
    return validFields;
  }

  test.each(getValidFields("textInput"))(
    "uses observationsApiParams to set option for text input fields",
    (field) => {
      let el = document.querySelector<HTMLInputElement>(
        `input#${field}[type='text']`,
      );
      if (!el) {
        throw new Error(`textInput ${field} error`);
      }

      let store = structuredClone(mapStore);
      store.observationsApiParams = {
        [field]: "abc",
      };

      expect(el.value).toBe("");

      initFilters(store);

      expect(el.value).toBe("abc");
    },
  );

  test.each(getValidFields("dateInput"))(
    "uses observationsApiParams to set value for input date fields",
    (field) => {
      let el = document.querySelector<HTMLInputElement>(
        `input[type='date']#${field}`,
      );
      if (!el) {
        throw new Error(`dateInput ${field} error`);
      }

      let store = structuredClone(mapStore);
      store.observationsApiParams = {
        [field]: "2000-01-01",
      };

      expect(el.value).toBe("");

      initFilters(store);

      expect(el.value).toBe("2000-01-01");
    },
  );

  test.each(getValidFields("select"))(
    "uses observationsApiParams to set option for select fields",
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

      store.observationsApiParams = {
        [field]: optionEl.value,
      };

      if (field !== "verifiable") {
        expect(optionEl.selected).toBe(false);
      }

      initFilters(store);

      expect(optionEl.selected).toBe(true);
    },
  );

  test.each(getValidFields("multiselect"))(
    "uses observationsApiParams to set option to selected for multi select fields",
    (field) => {
      let el = document.querySelector<HTMLSelectElement>(`#${field}`);
      if (!el) {
        el = document.querySelector<HTMLSelectElement>(`[name='${field}']`);
        if (!el) {
          throw new Error(`multiselect ${field} error`);
        }
      }
      let optionEl = el.querySelectorAll("option");
      let optionEl1 = optionEl[1];
      let optionEl2 = optionEl[2];

      let store = structuredClone(mapStore);
      store.observationsApiParams = {
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
    "uses observationsApiParams to set option to selected for checkbox fields",
    (field) => {
      let el = document.querySelector<HTMLInputElement>(
        `input[name='${field}']`,
      );
      if (!el) {
        throw new Error(`checkbox ${field} error`);
      }

      let store = structuredClone(mapStore);
      store.observationsApiParams = {
        [field]: el.value,
      };

      expect(el.checked).toBe(false);

      initFilters(store);

      expect(el.checked).toBe(true);
    },
  );
});
