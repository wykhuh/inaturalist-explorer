// @vitest-environment jsdom

import { expect, test, describe, beforeEach } from "vitest";
import jsdom from "jsdom";

import { mapStore } from "../../../lib/store";
import { defaultParams } from "../../test_helpers";
import { template } from "../../../components/ObservationsFilters/template";
import { deleteFilter } from "../../../components/SelectedFiltersItem/utils";
import { updateAppWithFilters } from "../../../components/ObservationsFilters/shared_utils";

beforeEach(() => {
  const { JSDOM } = jsdom;

  let dom = new JSDOM(
    `<!doctype html>
<html lang="en">
  <body>
      ${template}
      <div id="view-container">demo</div>
  </body>
</html>`,
  );

  global.document = dom.window.document;
});

describe("deleteFilter", () => {
  function setupForm() {
    let form = document.querySelector<HTMLFormElement>("#filters-form");
    if (!form) {
      throw new Error("missing form");
    }
    return form;
  }
  function setupFormInput(selector: string, value: any) {
    let input = document.querySelector<HTMLInputElement>(selector);
    if (!input) {
      throw new Error("missing element");
    }
    input.value = value;

    return input;
  }
  function setupFormCheckbox(selector: string, value: any) {
    let input = document.querySelector<HTMLInputElement>(selector);
    if (!input) {
      throw new Error("missing element");
    }
    input.checked = value;

    return input;
  }
  function setupFormTermId(selector: string, value: any) {
    let input = document.querySelector<HTMLInputElement>(selector);
    if (!input) {
      throw new Error("missing element");
    }
    input.checked = true;
    let relatedSelect = document.querySelector<HTMLSelectElement>(
      `select[data-related-term-id="${value}"]`,
    );
    if (!relatedSelect) {
      throw new Error("missing select");
    }
    relatedSelect.disabled = false;
    return { input, relatedSelect };
  }

  function setupFormOption(selector: string, value: any) {
    let input = document.querySelector<HTMLOptionElement>(selector);
    if (!input) {
      throw new Error("missing element");
    }
    input.selected = value;

    return input;
  }

  test("reset select option and update store", async () => {
    const store = structuredClone(mapStore);
    let form = setupForm();
    let input = setupFormOption(
      "select[name='hrank'] option[value='kingdom']",
      true,
    );
    let formData = new FormData(form);
    await updateAppWithFilters(formData, store);

    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      hrank: "kingdom",
    });
    expect(input.selected).toBe(true);

    await deleteFilter("hrank", "kingdom", store);

    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
    });
    expect(input.selected).toBe(false);
  });

  test("reset multiple select options and update store", async () => {
    const store = structuredClone(mapStore);
    let form = setupForm();
    let input1 = setupFormOption(
      "select[name='rank'] option[value='kingdom']",
      true,
    );
    let input2 = setupFormOption(
      "select[name='rank'] option[value='phylum']",
      true,
    );
    let formData = new FormData(form);
    await updateAppWithFilters(formData, store);

    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      rank: "kingdom,phylum",
    });
    expect(input1.selected).toBe(true);
    expect(input2.selected).toBe(true);

    await deleteFilter("rank", "kingdom,phylum", store);

    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
    });
    expect(input1.selected).toBe(false);
    expect(input2.selected).toBe(false);
  });

  test("reset multiple checkboxes and update store", async () => {
    const store = structuredClone(mapStore);
    let form = setupForm();
    let input1 = setupFormCheckbox("input[type='checkbox']#Aves", true);
    let input2 = setupFormCheckbox("input[type='checkbox']#Amphibia", true);
    let formData = new FormData(form);
    await updateAppWithFilters(formData, store);

    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      iconic_taxa: "Aves,Amphibia",
    });
    expect(input1.checked).toBe(true);
    expect(input2.checked).toBe(true);

    await deleteFilter("iconic_taxa", "Aves,Amphibia", store);

    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
    });
    expect(input1.checked).toBe(false);
    expect(input2.checked).toBe(false);
  });

  test("reset text input and update store", async () => {
    const store = structuredClone(mapStore);
    let form = setupForm();
    let input = setupFormInput("input[name='q']", "demo");
    let formData = new FormData(form);
    await updateAppWithFilters(formData, store);

    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      q: "demo",
    });
    expect(input.value).toBe("demo");

    await deleteFilter("q", "demo", store);

    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
    });
    expect(input.value).toBe("");
  });

  test("reset date input and update store", async () => {
    const store = structuredClone(mapStore);
    let form = setupForm();
    let input = setupFormInput("input[name='d2']", "2000-01-01");
    let formData = new FormData(form);
    await updateAppWithFilters(formData, store);

    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      d2: "2000-01-01",
    });
    expect(input.value).toBe("2000-01-01");

    await deleteFilter("d2", "2000-01-01", store);

    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
    });
    expect(input.value).toBe("");
  });

  test("reset search input and update store", async () => {
    const store = structuredClone(mapStore);
    let form = setupForm();
    let input = setupFormInput("input[name='viewer_id']", "abc");
    let formData = new FormData(form);
    await updateAppWithFilters(formData, store);

    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      viewer_id: "abc",
    });
    expect(input.value).toBe("abc");

    await deleteFilter("viewer_id", "abc", store);

    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
    });
    expect(input.value).toBe("");
  });

  test("reset term_id and update store", async () => {
    const store = structuredClone(mapStore);
    let form = setupForm();
    let { input, relatedSelect } = setupFormTermId(
      "input[name='term_id'][value='9']",
      9,
    );
    let option = setupFormOption(
      "select[data-related-term-id='9'] option[value='10']",
      true,
    );
    let formData = new FormData(form);
    await updateAppWithFilters(formData, store);

    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      term_id: "9",
      term_value_id: "10",
    });
    expect(input.checked).toBe(true);
    expect(option.selected).toBe(true);
    expect(relatedSelect.disabled).toBe(false);

    await deleteFilter("term_id", "9", store);

    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
    });
    expect(input.checked).toBe(false);
    expect(option.selected).toBe(false);
    expect(relatedSelect.disabled).toBe(true);
  });

  test("reset term_value_id and update store", async () => {
    const store = structuredClone(mapStore);
    let form = setupForm();
    let { input, relatedSelect } = setupFormTermId(
      "input[name='term_id'][value='9']",
      9,
    );
    let option = setupFormOption(
      "select[data-related-term-id='9'] option[value='10']",
      true,
    );
    let formData = new FormData(form);
    await updateAppWithFilters(formData, store);

    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      term_id: "9",
      term_value_id: "10",
    });
    expect(input.checked).toBe(true);
    expect(option.selected).toBe(true);
    expect(relatedSelect.disabled).toBe(false);

    await deleteFilter("term_value_id", "10", store);

    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      term_id: "9",
    });
    expect(input.checked).toBe(true);
    expect(option.selected).toBe(false);
    expect(relatedSelect.disabled).toBe(false);
  });
});
