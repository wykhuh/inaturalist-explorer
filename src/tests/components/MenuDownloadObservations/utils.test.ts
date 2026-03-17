// @vitest-environment jsdom

import { expect, test, describe } from "vitest";
import {
  filterObservationsByAnnotations,
  processAnnotationsResults,
} from "../../../components/MenuDownloadObservations/utils";
import { mapStore } from "../../../lib/store";
import type { ObservationsResult } from "../../../types/inat_api";
import { observations } from "../../../data/api/observations";

let obs_no_annotations: ObservationsResult = {
  ...observations.results[0],
  id: 1,
  annotations: [],
};
let obs_annotations_1_2: ObservationsResult = {
  ...observations.results[1],
  id: 2,
  annotations: [
    {
      user: observations.results[1].user,
      uuid: "12",
      controlled_attribute_id: 1,
      controlled_value_id: 2,
    },
  ],
};
let obs_annotations_1_3: ObservationsResult = {
  ...observations.results[2],
  id: 3,
  annotations: [
    {
      user: observations.results[2].user,
      uuid: "13",
      controlled_attribute_id: 1,
      controlled_value_id: 3,
    },
  ],
};
let obs_annotations_9_10: ObservationsResult = {
  ...observations.results[3],
  id: 5,
  annotations: [
    {
      user: observations.results[3].user,
      uuid: "910",
      controlled_attribute_id: 9,
      controlled_value_id: 10,
    },
  ],
};

let obs_annotations_1_2_9_10: ObservationsResult = {
  ...observations.results[1],
  id: 4,
  annotations: [
    {
      user: observations.results[1].user,
      uuid: "12",
      controlled_attribute_id: 1,
      controlled_value_id: 2,
    },
    {
      user: observations.results[3].user,
      uuid: "910",
      controlled_attribute_id: 9,
      controlled_value_id: 10,
    },
  ],
};
let obs_annotations_1_3_9_10: ObservationsResult = {
  ...observations.results[2],
  id: 5,
  annotations: [
    {
      user: observations.results[2].user,
      uuid: "13",
      controlled_attribute_id: 1,
      controlled_value_id: 3,
    },
    {
      user: observations.results[2].user,
      uuid: "910",
      controlled_attribute_id: 9,
      controlled_value_id: 10,
    },
  ],
};

describe("filterObservationsByAnnotations", () => {
  test("return empty array if term_id and term_value_id are not in observation_params", () => {
    let store = structuredClone(mapStore);

    let apiResults: ObservationsResult[] = [
      obs_no_annotations,
      obs_annotations_1_2,
      obs_annotations_9_10,
    ];

    let result = filterObservationsByAnnotations(apiResults, store);

    expect(result).toStrictEqual([]);
  });

  test("ignores observation with no annotations", () => {
    let store = structuredClone(mapStore);
    store.observationsApiParams.term_id = "1";
    store.observationsApiParams.term_value_id = "2";

    let apiResults: ObservationsResult[] = [obs_no_annotations];

    let result = filterObservationsByAnnotations(apiResults, store);

    expect(result).toStrictEqual([]);
  });

  test(
    "return observsations with matching term_id if" +
      " term_id is in observation_params",
    () => {
      let store = structuredClone(mapStore);
      store.observationsApiParams.term_id = "1";

      let apiResults: ObservationsResult[] = [
        obs_no_annotations,
        obs_annotations_1_2,
        obs_annotations_9_10,
      ];

      let result = filterObservationsByAnnotations(apiResults, store);

      expect(result).toStrictEqual([obs_annotations_1_2]);
    },
  );

  test(
    "return observsations with matching term_id and term_value_id  if" +
      " term_id and term_value_id are in observation_params",
    () => {
      let store = structuredClone(mapStore);
      store.observationsApiParams.term_id = "1";
      store.observationsApiParams.term_value_id = "2";

      let apiResults: ObservationsResult[] = [
        obs_no_annotations,
        obs_annotations_1_2,
      ];

      let result = filterObservationsByAnnotations(apiResults, store);

      expect(result).toStrictEqual([obs_annotations_1_2]);
    },
  );

  test(
    "return observsations with matching term_id_or_unknown and term_value_id  if" +
      " term_id_or_unknown and term_value_id are in observation_params",
    () => {
      let store = structuredClone(mapStore);
      store.observationsApiParams.term_id_or_unknown = "1";
      store.observationsApiParams.term_value_id = "2";

      let apiResults: ObservationsResult[] = [
        obs_no_annotations,
        obs_annotations_1_2,
      ];

      let result = filterObservationsByAnnotations(apiResults, store);

      expect(result).toStrictEqual([obs_annotations_1_2]);
    },
  );

  test(
    "return observsations with matching term_id and term_value_id  if" +
      " term_id and multiple term_value_id are in observation_params",
    () => {
      let store = structuredClone(mapStore);
      store.observationsApiParams.term_id = "1";
      store.observationsApiParams.term_value_id = "2,3";

      let apiResults: ObservationsResult[] = [
        obs_no_annotations,
        obs_annotations_1_2,
        obs_annotations_1_3,
      ];

      let result = filterObservationsByAnnotations(apiResults, store);

      expect(result).toStrictEqual([obs_annotations_1_2, obs_annotations_1_3]);
    },
  );

  test(
    "return observsations with matching term_id and term_value_id  if" +
      "multiple term_id and multiple term_value_id are in observation_params",
    () => {
      let store = structuredClone(mapStore);
      store.observationsApiParams.term_id = "1,9";
      store.observationsApiParams.term_value_id = "2,10";

      let apiResults: ObservationsResult[] = [
        obs_no_annotations,
        obs_annotations_1_2,
        obs_annotations_9_10,
      ];

      let result = filterObservationsByAnnotations(apiResults, store);

      expect(result).toStrictEqual([obs_annotations_1_2, obs_annotations_9_10]);
    },
  );

  test(
    "ignores observsations that don't match" +
      " term_id and term_value_id in observation_params",
    () => {
      let store = structuredClone(mapStore);
      store.observationsApiParams.term_id = "9";
      store.observationsApiParams.term_value_id = "10";

      let apiResults: ObservationsResult[] = [
        obs_no_annotations,
        obs_annotations_1_2,
        obs_annotations_9_10,
      ];

      let result = filterObservationsByAnnotations(apiResults, store);

      expect(result).toStrictEqual([obs_annotations_9_10]);
    },
  );

  test(
    "ignores observsations that match term_id but does not match" +
      " term_value_id in observation_params",
    () => {
      let store = structuredClone(mapStore);
      store.observationsApiParams.term_id = "1";
      store.observationsApiParams.term_value_id = "2";

      let apiResults: ObservationsResult[] = [
        obs_annotations_1_2,
        obs_annotations_1_3,
      ];

      let result = filterObservationsByAnnotations(apiResults, store);

      expect(result).toStrictEqual([obs_annotations_1_2]);
    },
  );

  test(
    "returns observations with multiple annotation if one annotation " +
      "matches term_id and term_value_id in observation_params",
    () => {
      let store = structuredClone(mapStore);
      store.observationsApiParams.term_id = "1";
      store.observationsApiParams.term_value_id = "2";

      let apiResults: ObservationsResult[] = [
        obs_no_annotations,
        obs_annotations_1_2,
        obs_annotations_1_2_9_10,
        obs_annotations_1_3_9_10,
        obs_annotations_9_10,
      ];

      let result = filterObservationsByAnnotations(apiResults, store);

      expect(result).toStrictEqual([
        obs_annotations_1_2,
        {
          ...obs_annotations_1_2_9_10,
          // @ts-ignore
          annotations: [obs_annotations_1_2_9_10.annotations[0]],
        },
      ]);
    },
  );

  test(
    "returns observations with multiple annotation if multiple annotations " +
      "matches term_id and term_value_id in observation_params",
    () => {
      let store = structuredClone(mapStore);
      store.observationsApiParams.term_id = "1,9";
      store.observationsApiParams.term_value_id = "2,10";

      let apiResults: ObservationsResult[] = [
        obs_no_annotations,
        obs_annotations_1_2,
        obs_annotations_1_2_9_10,
        obs_annotations_1_3_9_10,
        obs_annotations_9_10,
      ];

      let result = filterObservationsByAnnotations(apiResults, store);

      expect(result).toStrictEqual([
        obs_annotations_1_2,
        obs_annotations_1_2_9_10,
        {
          ...obs_annotations_1_3_9_10,
          // @ts-ignore
          annotations: [obs_annotations_1_3_9_10.annotations[1]],
        },
        obs_annotations_9_10,
      ]);
    },
  );
});

describe("processAnnotationsResults", () => {
  test("returns array of flatten observation with annotations ids", () => {
    let result = processAnnotationsResults([
      obs_annotations_1_2,
      obs_annotations_9_10,
    ]);

    expect(result.length).toBe(2);
    expect(result[0].annotation_controlled_attribute_id).toBe(1);
    expect(result[0].annotation_controlled_value_id).toBe(2);
    expect(result[1].annotation_controlled_attribute_id).toBe(9);
    expect(result[1].annotation_controlled_value_id).toBe(10);
  });

  test.only("returns array of multiple flattent observation if multiple annotations", () => {
    let result = processAnnotationsResults([obs_annotations_1_2_9_10]);

    expect(result.length).toBe(2);
    expect(result[0].annotation_controlled_attribute_id).toBe(1);
    expect(result[0].annotation_controlled_value_id).toBe(2);
    expect(result[1].annotation_controlled_attribute_id).toBe(9);
    expect(result[1].annotation_controlled_value_id).toBe(10);
  });

  test("if no annotations, return undefined annotations ids", () => {
    let result = processAnnotationsResults([obs_no_annotations]);

    expect(result.length).toBe(1);
    expect(result[0].annotation_controlled_attribute_id).toBe(undefined);
    expect(result[0].annotation_controlled_value_id).toBe(undefined);
  });
});
