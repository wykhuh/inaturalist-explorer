import {
  Chart,
  Colors,
  LineController,
  PointElement,
  CategoryScale,
  LinearScale,
  LineElement,
  Legend,
  Tooltip,
  Title,
  type ChartItem,
  TimeScale,
  type ChartConfiguration,
} from "chart.js";
import "chartjs-adapter-spacetime";

import type {
  AppStoreSelectedResourcesKeysType,
  AppStoreType,
  PopularFieldForGraph,
} from "../../types/app";
import type { iNatObservationsHistogramResult } from "../../types/inat_api";
import { formatTaxonName } from "../../lib/data_utils";
import { getColorByIndex } from "../../lib/map_colors_utils";

Chart.register(
  Colors,
  LineController,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
  Title,
  TimeScale,
);

function formatMonthOfYearData(records: { [k: string]: number }) {
  let labels: string[] = [];
  let values: number[] = [];
  Object.entries(records).forEach(([k, v]) => {
    labels.push(MONTHS[Number(k) - 1]);
    values.push(v);
  });

  return { labels, values };
}

function formatYearData(records: { [k: string]: number }) {
  let labels: Date[] = [];
  let values: number[] = [];
  Object.entries(records).forEach(([k, v]) => {
    let date = new Date(`${k} 00:05:00`);
    labels.push(date);
    values.push(v);
  });

  return { labels: labels, values: values };
}

function formatMonthData(records: { [k: string]: number }) {
  let labels: Date[] = [];
  let values: number[] = [];
  Object.entries(records).forEach(([k, v]) => {
    let date = new Date(`${k} 00:05:00`);
    labels.push(date);
    values.push(v);
  });

  return { labels: labels, values: values };
}

export const FULL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const CHART_COLORS = {
  blue: "rgba(54, 162, 235, 1)",
  red: "rgba(255, 99, 132, 1)",
  orange: "rgba(255, 159, 64, 1)",
  yellow: "rgba(255, 205, 86, 1)",
  green: "rgba(75, 192, 192, 1)",
  purple: "rgba(153, 102, 255, 1)",
  grey: "rgba(201, 203, 207, 1)",
};

type TimeUnits = "day" | "week" | "month" | "quarter" | "year";

type ChartDataConfig = {
  label?: string;
  data: any[];
  borderColor?: string;
  fill?: boolean;
  cubicInterpolationMode?: "monotone";
  tension?: number;
  backgroundColor?: string;
  borderDash?: [number, number];
};

function createLineGraph(
  containerEl: HTMLCanvasElement,
  data: number[][],
  labels: string[],
  colors: string[],
  borderDash: [number, number][],
  xAxisLabels: string[] | number[] | Date[],
  chartTitle = "",
  timeUnit: TimeUnits | null,
) {
  let dataSets = data.map((datum, i) => {
    let config: ChartDataConfig = {
      data: datum,
      borderColor: colors[i],
      backgroundColor: colors[i] ? colors[i].replace("1)", ".5)") : undefined,
      label: labels[i],
      borderDash: borderDash[i],
      cubicInterpolationMode: "monotone",
    };
    return config;
  });

  let config: ChartConfiguration = {
    type: "line",
    options: {
      responsive: true,
      plugins: {
        legend: { display: labels.length > 0 },
        title: {
          display: true,
          text: chartTitle,
        },
        tooltip: {
          callbacks: {
            title: function (context) {
              let label = context[0].label;
              // format date string
              if (new Date(label)) {
                let matches = label.match(/(\w+) \d+, (\d+)/);
                if (matches) {
                  if (timeUnit === "year") {
                    label = `${matches[2]}`;
                  } else if (timeUnit === "month") {
                    label = `${matches[1]} ${matches[2]}`;
                  }
                }
              }

              return label;
            },
          },
        },
      },
      interaction: {
        mode: "index",
        intersect: false,
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
    data: {
      labels: xAxisLabels,
      datasets: dataSets,
    },
  };

  if (timeUnit && config.options && config.options.scales) {
    config.options.scales.x = {
      type: "time",
      time: {
        unit: timeUnit,
      },
    };
  }

  new Chart(containerEl as ChartItem, config);
}

export function createGraphs(
  results: iNatObservationsHistogramResult[],
  appStore: AppStoreType,
  selectedResource?: AppStoreSelectedResourcesKeysType,
) {
  if (results.length === 0) return;

  let canvasEl = document.createElement("canvas");
  let id = `graph-${Math.round(new Date().getTime() * Math.random())}`;
  canvasEl.id = id;

  let colors: string[] = [];
  let labels: string[] = [];
  let borderDash: [number, number][] = [];
  if (selectedResource === "selectedTaxa") {
    appStore.selectedTaxa.forEach((taxon) => {
      colors.push(`${taxon.color}`);

      let { title, subtitle } = formatTaxonName(taxon, appStore);
      let name = subtitle ? `${title} (${subtitle})` : title;
      labels.push(`${name}`);
    });
  } else if (selectedResource === "selectedPlaces") {
    appStore.selectedPlaces.map((place) => {
      labels.push(`${place.name}`);
    });
  }

  if (results[0].month_of_year) {
    let combinedXAxisLabels = formatMonthOfYearData(
      results[0].month_of_year,
    ).labels;
    let combinedValues = results.map((result) => {
      // @ts-ignore
      return formatMonthOfYearData(result.month_of_year).values;
    });

    createLineGraph(
      canvasEl,
      combinedValues,
      labels,
      colors,
      borderDash,
      combinedXAxisLabels,
      "Observations by month/year",
      null,
    );
  } else if (results[0].year) {
    let combinedXAxisLabels = formatYearData(results[0].year).labels;
    let combinedValues = results.map((result) => {
      // @ts-ignore
      return formatYearData(result.year).values;
    });

    createLineGraph(
      canvasEl,
      combinedValues,
      labels,
      colors,
      borderDash,
      combinedXAxisLabels,
      "Observations by year",
      "year",
    );
  } else if (results[0].month) {
    let combinedXAxisLabels = formatMonthData(results[0].month).labels;
    let combinedValues = results.map((result) => {
      // @ts-ignore
      return formatMonthData(result.month).values;
    });

    createLineGraph(
      canvasEl,
      combinedValues,
      labels,
      colors,
      borderDash,
      combinedXAxisLabels,
      "Observations by month",
      "month",
    );
  }

  return canvasEl;
}

export function createPopularFieldsGraphsForTaxon(
  result: PopularFieldForGraph,
) {
  let containerEl = document.createElement("canvas");
  let id = `graph-${Math.round(new Date().getTime() * Math.random())}`;
  containerEl.id = id;

  let colors: string[] = [];
  let borderDash: [number, number][] = [];

  let labels = result.annotations
    .map((a) => a.controlled_value.label)
    .concat(["Unannotated"]);

  let combinedXAxisLabels = formatMonthOfYearData(
    result.annotations[0].month_of_year,
  ).labels;

  let combinedValues = [] as number[][];
  result.annotations.forEach((annotation) => {
    let { values } = formatMonthOfYearData(annotation.month_of_year);
    combinedValues.push(values);
  });
  let { values } = formatMonthOfYearData(result.unannotated.month_of_year);
  combinedValues.push(values);

  createLineGraph(
    containerEl,
    combinedValues,
    labels,
    colors,
    borderDash,
    combinedXAxisLabels,
    `${result.taxon_name} - ${result.controlled_attribute.label}`,
    null,
  );

  return containerEl;
}

export function createPopularFieldsGraphs(results: PopularFieldForGraph[]) {
  let containerEl = document.createElement("canvas");
  let id = `graph-${Math.round(new Date().getTime() * Math.random())}`;
  containerEl.id = id;

  let chartColors = Object.values(CHART_COLORS);
  let colors: string[] = [];
  let labels: string[] = [];
  let borderDash: [number, number][] = [];

  results.forEach((result, i) => {
    result.annotations.forEach((a, j) => {
      borderDash.push([i * 2, i * 2]);
      colors.push(getColorByIndex(j - 1, chartColors));
      labels.push(`${a.controlled_value.label} - ${result.taxon_name}`);
    });

    // add not annotated data
    borderDash.push([i * 2, i * 2]);
    colors.push(getColorByIndex(result.annotations.length - 1, chartColors));
    labels.push(`Not annotated - ${result.taxon_name}`);
  });

  let combinedValues = [] as number[][];
  let combinedXAxisLabels = [] as string[];
  results.forEach((result) => {
    result.annotations.forEach((annotation) => {
      let { values, labels } = formatMonthOfYearData(annotation.month_of_year);
      combinedValues.push(values);
      combinedXAxisLabels = labels;
    });
    let { values } = formatMonthOfYearData(result.unannotated.month_of_year);
    combinedValues.push(values);
  });

  createLineGraph(
    containerEl,
    combinedValues,
    labels,
    colors,
    borderDash,
    combinedXAxisLabels,
    ` ${results[0].controlled_attribute.label}`,
    null,
  );

  return containerEl;
}
