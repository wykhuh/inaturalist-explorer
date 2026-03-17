// @vitest-environment jsdom

import { expect, test, describe } from "vitest";
import { formatAPIUrl } from "../../../components/MenuDownloadObservations/shared_utils";

describe("formatAPIUrl", () => {
  test("replaces per_page with perPage parameter", () => {
    let url = "http://example.com/?per_page=100";
    let perPage = 25;
    let lastId = null;
    let result = formatAPIUrl(url, perPage, lastId);

    expect(result).toEqual("http://example.com/?per_page=25");
  });

  test("removes order and order_by", () => {
    let url = "http://example.com/?per_page=25&order=desc&order_by=id";
    let perPage = 25;
    let lastId = null;
    let result = formatAPIUrl(url, perPage, lastId);

    expect(result).toEqual("http://example.com/?per_page=25");
  });

  test("adds id_below if lastId is a number", () => {
    let url = "http://example.com/?per_page=25";
    let perPage = 25;
    let lastId = 50;
    let result = formatAPIUrl(url, perPage, lastId);

    expect(result).toEqual("http://example.com/?per_page=25&id_below=50");
  });

  test("does not change other params", () => {
    let url = "http://example.com/?id=1&per_page=25&name=a";
    let perPage = 25;
    let lastId = null;
    let result = formatAPIUrl(url, perPage, lastId);

    expect(result).toEqual("http://example.com/?id=1&per_page=25&name=a");
  });
});
