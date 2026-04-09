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
  type LegendItem,
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
import {
  getColorByIndex,
  secondaryColorScheme,
} from "../../lib/map_colors_utils";
import { MONTHS } from "./charts_data";

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
  hidden?: boolean;
};

type LineGraphOptions = {
  data: ChartDataConfig[];
  xAxisLabels: string[] | number[] | Date[];
  chartTitle: string;
  timeUnit: TimeUnits | null;
  valueUnit: string | null;
  useCustomLegend: boolean;
  legendSelector: string | null;
  legendType: "default" | "popularGroupBySpecies" | "popularGroupByPlaces";
};

const notAnnotated = "Not annotated";
const notAnnotatedBorderDash = calculateBorderDash(1, 3, 6);

function defaultBorderDash(i: number) {
  return calculateBorderDash(i, 10, 2);
}

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

function getValueUnits(appStore: AppStoreType) {
  let graphMetadata = appStore.viewMetadata.observations_observations.graphs;
  if (!graphMetadata) return null;

  return graphMetadata.valueType === "percents" ? "%" : null;
}

function formatData(
  data: number[],
  i: number,
  labelSource: string | undefined,
  color: string | undefined,
  borderDash: number[] | undefined,
  appStore: AppStoreType,
) {
  let graphMetadata = appStore.viewMetadata.observations_observations.graphs;

  let label;
  if (labelSource === "selectedTaxa") {
    let taxon = appStore.selectedTaxa[i];
    let { title, subtitle } = formatTaxonName(taxon, appStore);
    label = subtitle ? `${title} (${subtitle})` : title;
  } else if (labelSource === "selectedPlaces") {
    let place = appStore.selectedPlaces[i];
    label = place.name;
  } else if (labelSource) {
    label = labelSource;
  }

  let colorRGBA;
  if (color) {
    let colorRGBAString = hexToRgb(color, 0.25);
    if (colorRGBAString) {
      colorRGBA = colorRGBAString ? `rgba(${colorRGBAString})` : color;
    }
  }

  if (graphMetadata && graphMetadata.valueType === "percents") {
    data = calculatePercents(data);
  }

  let config: ChartDataConfig = {
    data: data,
    borderColor: color,
    backgroundColor: colorRGBA || color,
    cubicInterpolationMode: "monotone",
  };
  if (label) {
    config.label = label;
    if (label.startsWith(notAnnotated)) {
      config.hidden = true;
    }
  }
  if (borderDash && borderDash.length > 0) {
    config.borderDash = borderDash;
  }

  return config;
}

function selectColor(
  i: number,
  selectedResource: string | undefined,
  appStore: AppStoreType,
) {
  let color;
  if (selectedResource === "selectedTaxa") {
    color = appStore.selectedTaxa[i].color;
  } else if (selectedResource === "selectedPlaces") {
    color = getColorByIndex(i, secondaryColorScheme);
  }

  return color;
}

export function createGraphs(
  results: iNatObservationsHistogramResult[],
  legendSelector: string,
  selectedResource: AppStoreSelectedResourcesKeysType | undefined,
  appStore: AppStoreType,
) {
  if (results.length === 0) return;

  let canvasEl = document.createElement("canvas");
  let id = `graph-${Math.round(new Date().getTime() * Math.random())}`;
  canvasEl.id = id;

  let xAxisLabels: string[] | Date[] = [];
  let data: ChartDataConfig[] = [];
  let chartTitle = "";
  let timeUnit: TimeUnits | null = null;

  if (results[0].month_of_year) {
    xAxisLabels = formatMonthOfYearData(results[0].month_of_year).labels;
    data = results.map((result, i) => {
      // @ts-ignore
      let counts = formatMonthOfYearData(result.month_of_year).values;
      return formatData(
        counts,
        i,
        selectedResource,
        selectColor(i, selectedResource, appStore),
        undefined,
        appStore,
      );
    });
    chartTitle = "Observations by month/year";
    timeUnit = null;
  } else if (results[0].year) {
    xAxisLabels = formatYearData(results[0].year).labels;
    data = results.map((result, i) => {
      // @ts-ignore
      let counts = formatYearData(result.year).values;
      return formatData(
        counts,
        i,
        selectedResource,
        selectColor(i, selectedResource, appStore),
        undefined,
        appStore,
      );
    });
    chartTitle = "Observations by year";
    timeUnit = "year";
  } else if (results[0].month) {
    xAxisLabels = formatMonthData(results[0].month).labels;
    data = results.map((result, i) => {
      // @ts-ignore
      let counts = formatMonthData(result.month).values;
      return formatData(
        counts,
        i,
        selectedResource,
        selectColor(i, selectedResource, appStore),
        undefined,
        appStore,
      );
    });
    chartTitle = "Observations by month";
    timeUnit = "month";
  }

  let options: LineGraphOptions = {
    data,
    xAxisLabels,
    chartTitle,
    timeUnit,
    valueUnit: getValueUnits(appStore),
    useCustomLegend: true,
    legendSelector,
    legendType: "default",
  };
  createLineGraph(options, canvasEl);
  return canvasEl;
}

export function createPopularFieldsGraphs(
  result: PopularFieldForGraph,
  legendSelector: string,
  appStore: AppStoreType,
) {
  let containerEl = document.createElement("canvas");
  let id = `graph-${Math.round(new Date().getTime() * Math.random())}`;
  containerEl.id = id;

  let xAxisLabels = formatMonthOfYearData(
    result.annotations[0].month_of_year,
  ).labels;

  let combinedValues = [] as ChartDataConfig[];
  result.annotations.forEach((annotation, i) => {
    let { values } = formatMonthOfYearData(annotation.month_of_year);
    let data = formatData(
      values,
      i,
      annotation.controlled_value.label,
      undefined,
      undefined,
      appStore,
    );
    combinedValues.push(data);
  });

  let { values } = formatMonthOfYearData(result.unannotated.month_of_year);
  let data = formatData(
    values,
    0,
    notAnnotated,
    undefined,
    undefined,
    appStore,
  );
  combinedValues.push(data);

  let options: LineGraphOptions = {
    data: combinedValues,
    xAxisLabels,
    chartTitle: `${result.taxon_name} - ${result.controlled_attribute.label}`,
    timeUnit: null,
    valueUnit: getValueUnits(appStore),
    useCustomLegend: true,
    legendSelector,
    legendType: "default",
  };
  createLineGraph(options, containerEl);

  return containerEl;
}

export function createPopularFieldsGraphsGroupSpecies(
  results: PopularFieldForGraph[],
  legendSelector: string,
  appStore: AppStoreType,
) {
  let containerEl = document.createElement("canvas");
  let id = `graph-${Math.round(new Date().getTime() * Math.random())}`;
  containerEl.id = id;

  let combinedValues = [] as ChartDataConfig[];
  let xAxisLabels = [] as string[];
  results.forEach((result) => {
    result.annotations.forEach((annotation, i) => {
      let { values, labels } = formatMonthOfYearData(annotation.month_of_year);
      let data = formatData(
        values,
        i,
        `${annotation.controlled_value.label} - ${result.taxon_name}`,
        result.taxon_color,
        defaultBorderDash(i),
        appStore,
      );
      combinedValues.push(data);
      xAxisLabels = labels;
    });

    let { values } = formatMonthOfYearData(result.unannotated.month_of_year);
    let data = formatData(
      values,
      0,
      `${notAnnotated} - ${result.taxon_name}`,
      result.taxon_color,
      notAnnotatedBorderDash,
      appStore,
    );
    combinedValues.push(data);
  });

  let options: LineGraphOptions = {
    data: combinedValues,
    xAxisLabels,
    chartTitle: `${results[0].controlled_attribute.label}`,
    timeUnit: null,
    valueUnit: getValueUnits(appStore),
    useCustomLegend: true,
    legendSelector,
    legendType: "popularGroupBySpecies",
  };
  createLineGraph(options, containerEl);

  return containerEl;
}

export function createPopularFieldsGraphsGroupPlaces(
  results: PopularFieldForGraph[],
  legendSelector: string,
  appStore: AppStoreType,
) {
  let containerEl = document.createElement("canvas");
  let id = `graph-${Math.round(new Date().getTime() * Math.random())}`;
  containerEl.id = id;

  let combinedValues = [] as ChartDataConfig[];
  let xAxisLabels = [] as string[];
  results.forEach((result) => {
    result.annotations.forEach((annotation, i) => {
      let { values, labels } = formatMonthOfYearData(annotation.month_of_year);
      let data = formatData(
        values,
        i,
        `${annotation.controlled_value.label} - ${result.place_name}`,
        result.place_color,
        defaultBorderDash(i),
        appStore,
      );
      combinedValues.push(data);
      xAxisLabels = labels;
    });

    let { values } = formatMonthOfYearData(result.unannotated.month_of_year);
    let data = formatData(
      values,
      0,
      `${notAnnotated} - ${result.place_name}`,
      result.place_color,
      notAnnotatedBorderDash,
      appStore,
    );
    combinedValues.push(data);
  });

  let options: LineGraphOptions = {
    data: combinedValues,
    xAxisLabels,
    chartTitle: `${results[0]?.taxon_name} - ${results[0]?.controlled_attribute.label}`,
    timeUnit: null,
    valueUnit: getValueUnits(appStore),
    useCustomLegend: true,
    legendSelector,
    legendType: "popularGroupByPlaces",
  };
  createLineGraph(options, containerEl);

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

// ==================
// create config for chart library
// ==================

function createLineGraph(
  options: LineGraphOptions,
  containerEl: HTMLCanvasElement,
) {
  let config = formatConfig(options);

  if (config) {
    new Chart(containerEl as ChartItem, config);
  }
}

function formatConfig(options: LineGraphOptions) {
  let config: ChartConfiguration = {
    type: "line",
    options: {
      responsive: true,
      plugins: {
        htmlLegend: {},
        legend: {
          display: options.useCustomLegend === false,
          labels: { boxHeight: 0 },
        },
        title: {
          display: options.useCustomLegend === false,
          text: options.chartTitle,
        },
        tooltip: {
          boxWidth: 20,
          callbacks: {
            title: (context) => {
              return formatTooltipTitle(context, options.timeUnit);
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
      labels: options.xAxisLabels,
      datasets: options.data,
    },
    plugins: [],
  };

  if (options.useCustomLegend) {
    // @ts-ignore
    if (config.options?.plugins?.htmlLegend) {
      // @ts-ignore
      config.options.plugins.htmlLegend = {
        // ID of the container to put the legend in
        containerID: options.legendSelector,
      };
    }
    config.plugins = [htmlLegendPlugin(options)];
  }

  if (options.timeUnit && config.options && config.options.scales) {
    config.options.scales.x = {
      type: "time",
      time: {
        unit: options.timeUnit,
      },
    };
  }

  if (options.valueUnit) {
    let labelConfig = config.options?.plugins?.tooltip?.callbacks;
    if (labelConfig) {
      labelConfig.label = function (context) {
        let label = context.dataset.label || "";

        if (context.parsed.y !== null) {
          if (options.valueUnit === "%") {
            label += `: ${context.parsed.y.toFixed(1)}%`;
          } else {
            label += `: ${context.parsed.y}`;
          }
        }
        return label;
      };
    }
  }

  return config;
}

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

function htmlLegendPlugin(lineGraphOptions: LineGraphOptions) {
  return {
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

      // Reuse the built-in legendItems generator
      let generateLabels =
        chart.options.plugins?.legend?.labels?.generateLabels;
      if (!generateLabels) return;

      const items = generateLabels(chart);

      if (lineGraphOptions.legendType === "default") {
        let list1El = createDefaultLegend(items, chart);
        legendContainer.appendChild(list1El);
      } else {
        let list1El = createGroupByLegend(items);
        legendContainer.appendChild(list1El);

        let list2El = createAnnotationLegend(items, chart);
        legendContainer.appendChild(list2El);
      }
    },
  };
}

function createDefaultLegend(items: LegendItem[], chart: Chart) {
  let listContainer = document.createElement("ul");
  listContainer.classList.add("graph-annotation-legend");

  items.forEach((item) => {
    let index = item.datasetIndex;
    if (index === undefined) return;

    const liEl = document.createElement("li");
    liEl.className = item.hidden ? "inactive" : "active";

    liEl.onclick = () => {
      chart.setDatasetVisibility(index, !chart.isDatasetVisible(index));
      chart.update();
    };

    // Color box
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
    textContainer.innerText = item.text;

    liEl.appendChild(swatchEl);
    liEl.appendChild(textContainer);
    listContainer.appendChild(liEl);
  });
  return listContainer;
}

function createGroupByLegend(items: LegendItem[]) {
  let listContainer = document.createElement("ul");
  listContainer.classList.add("graph-groupby-legend");

  let groupByLabels = new Set();
  items.forEach((item) => {
    let groupByValue = item.text.split("-")[1].trim();

    if (groupByLabels.has(groupByValue)) return;
    groupByLabels.add(groupByValue);

    let indexes: number[] = [];
    items.forEach((item) => {
      if (
        item.datasetIndex !== undefined &&
        groupByValue === item.text.split("-")[1].trim()
      ) {
        indexes.push(item.datasetIndex);
      }
    });

    const liEl = document.createElement("li");

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
    // textContainer.style.textDecoration = item.hidden ? "line-through" : "";
    textContainer.innerText = groupByValue;

    liEl.appendChild(swatchEl);
    liEl.appendChild(textContainer);
    listContainer.appendChild(liEl);
  });
  return listContainer;
}

function createAnnotationLegend(items: LegendItem[], chart: Chart) {
  let listContainer = document.createElement("ul");
  listContainer.classList.add("graph-annotation-legend");

  let annotations = new Set();
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
    liEl.className = item.hidden ? "inactive" : "active";

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
        item.fontColor as string,
        item.lineWidth as number,
        item.lineDash as number[],
      ),
    );

    // Text
    const textContainer = document.createElement("p");
    textContainer.innerText = annotationValue;

    liEl.appendChild(swatchEl);
    liEl.appendChild(textContainer);
    listContainer.appendChild(liEl);
  });

  return listContainer;
}

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
