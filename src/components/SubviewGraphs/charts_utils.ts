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
  type ChartTypeRegistry,
  type TooltipItem,
} from "chart.js";
import "chartjs-adapter-spacetime";

import type {
  AppStoreSelectedResourcesKeysType,
  AppStoreType,
  PopularFieldForGraph,
} from "../../types/app";
import type { iNatObservationsHistogramResult } from "../../types/inat_api";
import { formatTaxonName } from "../../lib/data_utils";
import { hexToRgb } from "../../lib/utils";

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
  borderDash?: number[];
};

function createLineSvg(
  x2: number,
  y: number,
  strokeColor: string,
  strokeWidth: number,
  strokeDasharray: number[],
) {
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

  var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", "0");
  line.setAttribute("y1", y.toString());
  line.setAttribute("x2", x2.toString());
  line.setAttribute("y2", y.toString());
  line.setAttribute("stroke", strokeColor || "#555");
  line.setAttribute("stroke-width", strokeWidth.toString());
  line.setAttribute("stroke-dasharray", strokeDasharray.join(" "));

  svg.appendChild(line);

  return svg;
}

const htmlLegendPlugin = {
  id: "htmlLegend",
  afterUpdate(chart: Chart, _args: any, options: any) {
    const legendContainer = document.getElementById(options.containerID);
    if (!legendContainer) return;

    // Remove old legend items
    while (legendContainer.firstChild) {
      legendContainer.firstChild.remove();
    }

    let header = document.createElement("div");
    header.className = "title";
    header.innerText = chart.options.plugins?.title?.text?.toString() || "";
    legendContainer.appendChild(header);

    let listContainer = document.createElement("ul");
    listContainer.classList.add("graph-custom-legend");
    legendContainer.appendChild(listContainer);

    // Reuse the built-in legendItems generator
    let generateLabels = chart.options.plugins?.legend?.labels?.generateLabels;
    if (!generateLabels) return;

    let annotations = new Set();
    const items = generateLabels(chart);
    items.forEach((item) => {
      let annotationValue = item.text.split("-")[0].trim();
      if (annotations.has(annotationValue)) return;
      annotations.add(annotationValue);

      let indexes: number[] = [];
      items.forEach((item) => {
        if (
          item.datasetIndex !== undefined &&
          annotationValue === item.text.split("-")[0].trim()
        ) {
          indexes.push(item.datasetIndex);
        }
      });

      const liEl = document.createElement("li");
      liEl.onclick = () => {
        indexes.forEach((index) => {
          chart.setDatasetVisibility(index, !chart.isDatasetVisible(index));
        });
        chart.update();
      };

      // line
      const swatchEl = document.createElement("span");
      swatchEl.className = "swatch";
      swatchEl.appendChild(
        createLineSvg(
          200,
          8,
          item.strokeStyle as string,
          item.lineWidth as number,
          item.lineDash as number[],
        ),
      );

      // Text
      const textContainer = document.createElement("p");
      textContainer.style.color = item.fontColor as string;
      textContainer.style.textDecoration = item.hidden ? "line-through" : "";
      textContainer.innerText = annotationValue;

      liEl.appendChild(swatchEl);
      liEl.appendChild(textContainer);
      listContainer.appendChild(liEl);
    });
  },
};

function formatTooltipTitle(
  context: TooltipItem<keyof ChartTypeRegistry>[],
  timeUnit: TimeUnits | null,
) {
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
}

function createLineGraph(
  containerEl: HTMLCanvasElement,
  data: number[][],
  labels: string[],
  colors: string[],
  borderDash: number[][],
  xAxisLabels: string[] | number[] | Date[],
  chartTitle = "",
  timeUnit: TimeUnits | null,
  useDefaultLegend: boolean,
) {
  let config = formatConfig(
    data,
    labels,
    colors,
    borderDash,
    xAxisLabels,
    chartTitle,
    timeUnit,
    useDefaultLegend,
  );

  if (config) {
    new Chart(containerEl as ChartItem, config);
  }
}

function formatData(
  data: number[][],
  labels: string[],
  colors: string[],
  borderDash: number[][],
) {
  return data.map((datum, i) => {
    let colorRGBA;
    if (colors[i]) {
      let colorRGBAString = hexToRgb(colors[i], 0.25);
      colorRGBA = colorRGBAString ? `rgba(${colorRGBAString})` : colors[1];
    }

    let config: ChartDataConfig = {
      data: datum,
      borderColor: colors[i],
      backgroundColor: colorRGBA,
      label: labels[i],
      borderDash: borderDash[i],
      cubicInterpolationMode: "monotone",
    };
    return config;
  });
}

function formatConfig(
  data: number[][],
  labels: string[],
  colors: string[],
  borderDash: number[][],
  xAxisLabels: string[] | number[] | Date[],
  chartTitle = "",
  timeUnit: TimeUnits | null,
  useDefaultLegend: boolean,
) {
  let config: ChartConfiguration = {
    type: "line",
    options: {
      responsive: true,
      plugins: {
        htmlLegend: {},
        legend: {
          display: useDefaultLegend && labels.length > 0,
          labels: { boxHeight: 0 },
        },
        title: {
          display: useDefaultLegend,
          text: chartTitle,
        },
        tooltip: {
          boxWidth: 20,
          callbacks: {
            title: (context) => {
              return formatTooltipTitle(context, timeUnit);
            },
            // @ts-ignore
            labelColor: function (context) {
              return {
                borderColor: context.dataset.borderColor,
                backgroundColor: context.dataset.backgroundColor,
                borderWidth: 2,
                borderDash: context.dataset.borderDash,
                borderRadius: 0,
              };
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
      datasets: formatData(data, labels, colors, borderDash),
    },
    plugins: [],
  };

  if (!useDefaultLegend) {
    // @ts-ignore
    if (config.options?.plugins?.htmlLegend) {
      // @ts-ignore
      config.options.plugins.htmlLegend = {
        // ID of the container to put the legend in
        containerID: "legend-container",
      };
    }
    config.plugins = [htmlLegendPlugin];
  } else {
    const legendContainer = document.getElementById("legend-container");
    if (!legendContainer) return;

    // Remove old legend items
    while (legendContainer.firstChild) {
      legendContainer.firstChild.remove();
    }
  }

  if (timeUnit && config.options && config.options.scales) {
    config.options.scales.x = {
      type: "time",
      time: {
        unit: timeUnit,
      },
    };
  }


  return config;
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

  let graphMetadata = appStore.viewMetadata.observations_observations.graphs;

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
      let counts = formatMonthOfYearData(result.month_of_year).values;
      if (graphMetadata && graphMetadata.valueType === "percents") {
        return calculatePercents(counts);
      } else {
        return counts;
      }
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
      true,
    );
  } else if (results[0].year) {
    let combinedXAxisLabels = formatYearData(results[0].year).labels;
    let combinedValues = results.map((result) => {
      // @ts-ignore
      let counts = formatYearData(result.year).values;
      if (graphMetadata && graphMetadata.valueType === "percents") {
        return calculatePercents(counts);
      } else {
        return counts;
      }
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
      true,
    );
  } else if (results[0].month) {
    let combinedXAxisLabels = formatMonthData(results[0].month).labels;
    let combinedValues = results.map((result) => {
      // @ts-ignore
      let counts = formatMonthData(result.month).values;
      if (graphMetadata && graphMetadata.valueType === "percents") {
        return calculatePercents(counts);
      } else {
        return counts;
      }
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
      true,
    );
  }

  return canvasEl;
}

export function createPopularFieldsGraphsForTaxon(
  result: PopularFieldForGraph,
  appStore: AppStoreType,
) {
  let containerEl = document.createElement("canvas");
  let id = `graph-${Math.round(new Date().getTime() * Math.random())}`;
  containerEl.id = id;

  let graphMetadata = appStore.viewMetadata.observations_observations.graphs;

  let colors: string[] = [];
  let borderDash: [number, number][] = [];

  let labels = result.annotations
    .map((a) => a.controlled_value.label)
    .concat(["Not annotated"]);

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

  if (graphMetadata && graphMetadata.valueType === "percents") {
    combinedValues = combinedValues.map((values) => calculatePercents(values));
  }

  createLineGraph(
    containerEl,
    combinedValues,
    labels,
    colors,
    borderDash,
    combinedXAxisLabels,
    `${result.taxon_name} - ${result.controlled_attribute.label}`,
    null,
    true,
  );

  return containerEl;
}

export function calculateBorderDash(
  index: number,
  lineLength: number,
  spaceLength: number,
) {
  // let results = [index * lineLength, index * spaceLength];
  if (index === 0) {
    return [0, 0];
  } else if (index === 1) {
    return [lineLength, spaceLength];
  } else {
    let results = [lineLength, spaceLength];
    let count = index - 1;
    while (count > 0) {
      results.push(spaceLength);
      results.push(spaceLength);
      count -= 1;
    }
    return results;
  }
}

export function createPopularFieldsGraphs(
  results: PopularFieldForGraph[],
  appStore: AppStoreType,
) {
  let containerEl = document.createElement("canvas");
  let id = `graph-${Math.round(new Date().getTime() * Math.random())}`;
  containerEl.id = id;

  let graphMetadata = appStore.viewMetadata.observations_observations.graphs;

  let colors: string[] = [];
  let labels: string[] = [];
  let borderDash: number[][] = [];

  results.forEach((result) => {
    result.annotations.forEach((a, j) => {
      borderDash.push(calculateBorderDash(j, 10, 2));
      colors.push(result.taxon_color);
      labels.push(`${a.controlled_value.label} - ${result.taxon_name}`);
    });

    // add not annotated data
    let length = result.annotations.length;
    borderDash.push(calculateBorderDash(length, 10, 2));
    colors.push(result.taxon_color);
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

  if (graphMetadata && graphMetadata.valueType === "percents") {
    combinedValues = combinedValues.map((values) => calculatePercents(values));
  }

  createLineGraph(
    containerEl,
    combinedValues,
    labels,
    colors,
    borderDash,
    combinedXAxisLabels,
    ` ${results[0].controlled_attribute.label}`,
    null,
    false,
  );

  return containerEl;
}

function calculatePercents(counts: number[]) {
  let sum = counts.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0,
  );
  return counts.map((count) => {
    if (sum === 0) {
      return 0;
    } else {
      return (count / sum) * 100;
    }
  });
}
