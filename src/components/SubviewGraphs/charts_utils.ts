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
  red: "rgb(255, 99, 132)",
  orange: "rgb(255, 159, 64)",
  yellow: "rgb(255, 205, 86)",
  green: "rgb(75, 192, 192)",
  blue: "rgb(54, 162, 235)",
  purple: "rgb(153, 102, 255)",
  grey: "rgb(201, 203, 207)",
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
};

function createLineGraph(
  containerEl: HTMLCanvasElement,
  data: number[][],
  labels: string[] | number[] | Date[],
  appStore: AppStoreType,
  selectedResource: AppStoreSelectedResourcesKeysType | undefined | string[],
  chartTitle = "",
  timeUnit: TimeUnits | null,
) {
  let dataSets = data.map((datum, i) => {
    let config: ChartDataConfig = {
      data: datum,
      cubicInterpolationMode: "monotone",
    };

    if (
      selectedResource === "selectedTaxa" &&
      appStore.selectedTaxa.length > 0
    ) {
      let taxon = appStore.selectedTaxa[i];
      let { title, subtitle } = formatTaxonName(taxon, appStore);
      let name = subtitle ? `${title} (${subtitle})` : title;
      config.label = name;
      config.borderColor = taxon.color;
      config.backgroundColor = taxon.color;
    } else if (
      selectedResource === "selectedPlaces" &&
      appStore.selectedPlaces.length > 0
    ) {
      let place = appStore.selectedPlaces[i];
      config.label = place.name;
    } else if (Array.isArray(selectedResource)) {
      config.label = selectedResource[i];
    }
    return config;
  });

  let config: ChartConfiguration = {
    type: "line",
    options: {
      responsive: true,
      plugins: {
        legend: { display: selectedResource !== undefined },
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
      labels: labels,
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

  if (results[0].month_of_year) {
    let combinedValues = [] as number[][];
    let combinedLabels = [] as string[];
    results.forEach((result) => {
      if (result.month_of_year) {
        let { values, labels } = formatMonthOfYearData(result.month_of_year);
        combinedValues.push(values);
        combinedLabels = labels;
      }
    });
    // canvasEl = document.getElementById("myChart");
    createLineGraph(
      canvasEl,
      combinedValues,
      combinedLabels,
      appStore,
      selectedResource,
      "Observations by month/year",
      null,
    );
  } else if (results[0].year) {
    let combinedValues = [] as number[][];
    let combinedLabels = [] as Date[];
    results.forEach((result) => {
      if (result.year) {
        let { values, labels } = formatYearData(result.year);
        combinedValues.push(values);
        combinedLabels = labels;
      }
    });

    createLineGraph(
      canvasEl,
      combinedValues,
      combinedLabels,
      appStore,
      selectedResource,
      "Observations by year",
      "year",
    );
  } else if (results[0].month) {
    let combinedValues = [] as number[][];
    let combinedLabels = [] as Date[];
    results.forEach((result) => {
      if (result.month) {
        let { values, labels } = formatMonthData(result.month);
        combinedValues.push(values);
        combinedLabels = labels;
      }
    });

    createLineGraph(
      canvasEl,
      combinedValues,
      combinedLabels,
      appStore,
      selectedResource,
      "Observations by month",
      "month",
    );
  }

  return canvasEl;
}

export function createPopularFieldsGraphs(
  result: PopularFieldForGraph,
  appStore: AppStoreType,
) {
  let containerEl = document.createElement("canvas");
  let id = `graph-${Math.round(new Date().getTime() * Math.random())}`;
  containerEl.id = id;
  let combinedValues = [] as number[][];
  let combinedLabels = [] as string[];
  result.annotations.forEach((annotation) => {
    let { values, labels } = formatMonthOfYearData(annotation.month_of_year);
    combinedValues.push(values);
    combinedLabels = labels;
  });
  let { values } = formatMonthOfYearData(result.unannotated.month_of_year);
  combinedValues.push(values);

  createLineGraph(
    containerEl,
    combinedValues,
    combinedLabels,
    appStore,
    result.annotations
      .map((a) => a.controlled_value.label)
      .concat(["Unannotated"]),
    `${result.taxon_name} - ${result.controlled_attribute.label}`,
    null,
  );

  return containerEl;
}
