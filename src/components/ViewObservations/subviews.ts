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

// import Chart from "chart.js/auto";

import type { DataComponentType } from "../../types/app";
import type {
  iNatObservationsHistogramResult,
  ObservationsResult,
} from "../../types/inat_api";
// import { displayJSON } from "./utils";

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

function formatYearData(records: { [k: string]: number }, lastTenYears = true) {
  let labels: Date[] = [];
  let values: number[] = [];
  Object.entries(records).forEach(([k, v]) => {
    let date = new Date(`${k} 0:05:00`);

    labels.push(date);
    values.push(v);
  });

  // get last full ten years
  if (lastTenYears) {
    let length = labels.length;
    labels = labels.slice(length - 10);
    values = values.slice(length - 10);
  }

  return { labels: labels, values: values };
}

function formatMonthData(
  records: { [k: string]: number },
  lastTenYears = true,
) {
  let labels: Date[] = [];
  let values: number[] = [];
  Object.entries(records).forEach(([k, v]) => {
    let date = new Date(`${k} 0:05:00`);
    labels.push(date);
    values.push(v);
  });

  // get last ten years
  if (lastTenYears) {
    let length = labels.length;
    labels = labels.slice(length - 12 * 10);
    values = values.slice(length - 12 * 10);
  }
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

function createLineGraph(
  containerEl: HTMLCanvasElement,
  data: number[],
  labels: string[] | number[] | Date[],
  chartTitle = "",
  timeUnit: TimeUnits | null,
) {
  let config: ChartConfiguration = {
    type: "line",
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
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
            // label: function (context) {
            //   let label = context.formattedValue;
            //   // if (context.parsed.y !== null) {
            //   //   label += new Intl.NumberFormat("en-US", {
            //   //     style: "currency",
            //   //     currency: "USD",
            //   //   }).format(context.parsed.y);
            //   // }
            //   return label;
            // },
          },
        },
      },
      scales: {
        // y axis always start at zero
        y: {
          beginAtZero: true,
        },
      },
    },
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          cubicInterpolationMode: "monotone",
        },
      ],
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

export async function createGraph(results: iNatObservationsHistogramResult) {
  let containerEl = document.createElement("canvas");
  let id = `graph-${Math.round(new Date().getTime() * Math.random())}`;
  containerEl.id = id;

  if (results.month_of_year) {
    let { values, labels } = formatMonthOfYearData(results.month_of_year);
    createLineGraph(
      containerEl,
      values,
      labels,
      "Observations by month/year",
      null,
    );
    // displayJSON(results.month_of_year, parentEl);
  } else if (results.year) {
    let { labels, values } = formatYearData(results.year);
    createLineGraph(
      containerEl,
      values,
      labels,
      "Observations by year",
      "year",
    );
    // displayJSON(results.year, parentEl);
  } else if (results.month) {
    let { labels, values } = formatMonthData(results.month);
    createLineGraph(
      containerEl,
      values,
      labels,
      "Observations by month",
      "month",
    );
    // displayJSON(results.month, parentEl);
  }

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
