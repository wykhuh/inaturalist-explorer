import {
  expect,
  test,
  describe,
  vi,
  type MockInstance,
  afterEach,
  beforeEach,
} from "vitest";
import { logger } from "../lib/logger";

let consoleMock: MockInstance;

beforeEach(() => {
  consoleMock = vi.spyOn(console, "log").mockImplementation(() => undefined);
});
afterEach(() => {
  consoleMock.mockReset();
  vi.stubEnv("VITE_LOGGER", "false");
});

describe("logger if VITE_LOGGER is true", () => {
  test("logs one argument", () => {
    vi.stubEnv("VITE_LOGGER", "true");

    logger("abc");

    expect(consoleMock).toHaveBeenLastCalledWith("abc");
  });

  test("logs multiple argument", () => {
    vi.stubEnv("VITE_LOGGER", "true");

    logger("abc", "def", "ghi");

    expect(consoleMock).toHaveBeenLastCalledWith("abc", "def", "ghi");
  });
});

describe("logger if VITE_LOGGER is false", () => {
  test("does not log one argument", () => {
    vi.stubEnv("VITE_LOGGER", "false");

    logger("abc");

    expect(consoleMock).not.toHaveBeenLastCalledWith("abc");
  });

  test("does not logs multiple argument", () => {
    vi.stubEnv("VITE_LOGGER", "false");

    logger("abc", "def", "ghi");

    expect(consoleMock).not.toHaveBeenLastCalledWith("abc", "def", "ghi");
  });
});
