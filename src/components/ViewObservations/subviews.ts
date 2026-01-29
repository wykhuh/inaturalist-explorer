import vegaEmbed, { type VisualizationSpec } from "vega-embed";

import type { DataComponentType } from "../../types/app";
import type {
  iNatObservationsHistogramResult,
  ObservationsResult,
} from "../../types/inat_api";
// import { displayJSON } from "./utils";

function monthOfYearSpec(data: { month: string; count: number }[]) {
  return {
    $schema: "https://vega.github.io/schema/vega-lite/v6.json",
    data: { values: data },
    mark: {
      type: "line",
      point: true,
    },
    encoding: {
      x: {
        timeUnit: "month",
        field: "month",
      },
      y: {
        field: "count",
        type: "quantitative",
      },
    },
  } as VisualizationSpec;
}

function yearSpec(data: { date: string; count: number }[]) {
  return {
    $schema: "https://vega.github.io/schema/vega-lite/v6.json",
    data: { values: data },
    mark: {
      type: "line",
      point: true,
    },
    encoding: {
      x: {
        field: "date",
        timeUnit: "year",
      },
      y: {
        field: "count",
        type: "quantitative",
      },
    },
  } as VisualizationSpec;
}

function monthSpec(data: { date: string; count: number }[]) {
  return {
    $schema: "https://vega.github.io/schema/vega-lite/v6.json",
    data: { values: data },
    mark: {
      type: "line",
      point: true,
    },
    encoding: {
      x: {
        field: "date",
        timeUnit: "yearmonth",
      },
      y: {
        field: "count",
        type: "quantitative",
      },
    },
  } as VisualizationSpec;
}

function formatYearData(records: { [k: string]: number }) {
  let data: { date: string; count: number }[] = [];
  let dates = Object.keys(records);
  Object.entries(records).forEach(([k, v]) => {
    // get data for last ten years
    let lastYear = new Date(dates[dates.length - 2]).getFullYear();
    let recordYear = new Date(k).getFullYear();

    if (lastYear - 9 > recordYear || recordYear > lastYear) return;
    data.push({ date: k, count: v });
  });

  return data;
}

function formatMonthOfYearData(records: { [k: string]: number }) {
  let data: { month: string; count: number }[] = [];
  Object.entries(records).forEach(([k, v]) => {
    data.push({ month: k, count: v });
  });

  return data;
}

function formatMonthData(records: { [k: string]: number }) {
  let data: { date: string; count: number }[] = [];
  let dates = Object.keys(records);
  Object.entries(records).forEach(([k, v]) => {
    // get data for last ten years
    let lastYear = new Date(dates[dates.length - 2]).getFullYear();
    let recordYear = new Date(k).getFullYear();

    if (lastYear - 9 > recordYear || recordYear > lastYear) return;
    data.push({ date: k, count: v });
  });

  return data;
}

export async function createGraph(
  results: iNatObservationsHistogramResult,
  parentEl: HTMLDivElement,
) {
  let containerEl = document.createElement("div");
  let id = `graph-${Math.round(new Date().getTime() * Math.random())}`;
  containerEl.className = id;

  let spec: VisualizationSpec = {};
  if (results.month_of_year) {
    let data = formatMonthOfYearData(results.month_of_year);
    spec = monthOfYearSpec(data);
    // displayJSON(data, parentEl);
  } else if (results.year) {
    let data = formatYearData(results.year);
    spec = yearSpec(data);
    // displayJSON(data, parentEl);
  } else if (results.month) {
    let data = formatMonthData(results.month);
    spec = monthSpec(data);
    // displayJSON(data, parentEl);
  }

  setTimeout(async () => {
    parentEl.append(containerEl);

    await vegaEmbed(`.${id}`, spec).then(() => {});
  }, 0);

  return containerEl;
}

export function createGrid(results: ObservationsResult[]) {
  let containerEl = document.createElement("div");
  containerEl.className = "observations-grid grid-auto-fill";

  results.forEach((row) => {
    let cardEl = document.createElement(
      "card-observation",
    ) as unknown as DataComponentType;
    cardEl.data = row;
    containerEl.appendChild(cardEl);
  });

  return containerEl;
}

export function createMediaGrid(results: ObservationsResult[]) {
  let containerEl = document.createElement("div");
  containerEl.className = "observations-media-grid grid-auto-fill";
  results.forEach((record) => {
    let media = record.photos.concat(record.sounds);
    media.forEach((medium, j) => {
      let cardEl = document.createElement(
        "card-media",
      ) as unknown as DataComponentType;
      cardEl.data = {
        observation: record,
        media: medium,
        mediaIndex: j,
        type: medium.url ? "photo" : "sound",
      };
      containerEl.appendChild(cardEl);
    });
  });

  return containerEl;
}

export function createMap() {
  let divEl = document.createElement("div");
  divEl.id = "map";
  return divEl;
}
