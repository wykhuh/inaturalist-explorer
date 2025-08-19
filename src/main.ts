import autoComplete from "@tarekraafat/autocomplete.js";
import "./assets/autocomplete.css";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  getMapTiles,
  getiNatMapTiles,
  addLayerToMap,
  addOverlayToLayerControl,
  getBoundingBoxValues,
} from "./lib/map_utils";
import {
  processAutocompleteTaxa,
  renderAutocompleteTaxon,
  formatTaxonName,
} from "./lib/inat_utils";
import type { NormalizediNatTaxon } from "./types.d.ts";
import { displayJson } from "./lib/utils.ts";

let api = "https://api.inaturalist.org/v1/taxa/autocomplete?q=";

let selectedTaxa: NormalizediNatTaxon[] = [];
let inatTilesParams = {};

let displayJsonEl = document.getElementById("display-json");
let taxaListEl = document.getElementById("taxa-list-container");

// =====================
// taxa search
// =====================

const autoCompleteJS = new autoComplete({
  selector: "#inatTaxaAutoComplete",
  placeHolder: "Enter species name",
  threshold: 3,
  searchEngine: (query: string, record: NormalizediNatTaxon) => {
    return renderAutocompleteTaxon(record, query);
  },
  data: {
    src: async (query: string) => {
      let res = await fetch(api + query);
      let data = await res.json();
      return processAutocompleteTaxa(data);
    },
  },
  resultsList: {
    maxResults: 10,
  },
  events: {
    input: {
      selection: (event) => {
        const selection = event.detail.selection.value;
        autoCompleteJS.input.value = selection.preferred_common_name;
      },
    },
  },
});

// =====================
// taxa search
// =====================

let map = L.map("map", {
  center: [0, 0],
  zoom: 2,
  maxZoom: 19,
});
var layerControl = L.control.layers().addTo(map);

let { OpenStreetMap, OpenTopo } = getMapTiles();
addLayerToMap(OpenStreetMap, map, layerControl, true);
addLayerToMap(OpenTopo, map, layerControl);

document
  .querySelector("#inatTaxaAutoComplete")!
  .addEventListener("selection", function (event) {
    let selection = event.detail.selection.value;

    taxonSelectedHandler(selection, event.detail.query);
  });

// =====================
// misc
// =====================

function removeTaxon(e) {
  let taxonId = e.target.dataset.taxonId;
  selectedTaxa = selectedTaxa.filter((taxon) => taxon.id !== Number(taxonId));
  // document.querySelector(`.taxon-tag[data-taxon-id='${taxonId}']`)!.remove();
  displayJson(selectedTaxa, displayJsonEl);
  renderTaxaList(selectedTaxa, taxaListEl);
}

function renderTaxaList(
  taxalist: NormalizediNatTaxon[],
  containerEl: HTMLElement | null
) {
  if (!containerEl) return;
  containerEl.innerHTML = "";

  taxalist.forEach((taxon) => {
    let spanEl = document.createElement("span");
    spanEl.className = "taxon-tag";
    spanEl.innerText = taxon.preferred_common_name || taxon.name;
    spanEl.dataset.taxonId = taxon.id.toString();

    let closeSpanEl = document.createElement("span");
    closeSpanEl.innerText = "x";
    closeSpanEl.className = "taxon-tag-close";
    closeSpanEl.dataset.taxonId = taxon.id.toString();
    closeSpanEl.addEventListener("click", removeTaxon);

    spanEl.appendChild(closeSpanEl);
    containerEl.appendChild(spanEl);
  });
}

function taxonSelectedHandler(
  taxonObj: NormalizediNatTaxon,
  searchTerm: string
) {
  selectedTaxa.push(taxonObj);
  displayJson(selectedTaxa, displayJsonEl);
  renderTaxaList(selectedTaxa, taxaListEl);

  let bbValues = getBoundingBoxValues(map.getBounds());
  inatTilesParams = {
    ...inatTilesParams,
    ...bbValues,
    taxon_id: taxonObj.id,
  };
  let paramsString = new URLSearchParams(inatTilesParams).toString();

  let { iNatGrid, iNatHeatmap, iNatTaxonRange, iNatPoint } = getiNatMapTiles(
    taxonObj.id,
    paramsString
  );

  let { title } = formatTaxonName(taxonObj, searchTerm, false);

  let iNatGridLayer = addOverlayToLayerControl(
    iNatGrid,
    map,
    layerControl,
    title,
    true
  );
  let iNatPointLayer = addOverlayToLayerControl(
    iNatPoint,
    map,
    layerControl,
    title
  );
  let iNatHeatmapLayer = addOverlayToLayerControl(
    iNatHeatmap,
    map,
    layerControl,
    title
  );
  let iNatTaxonRangeLayer = addOverlayToLayerControl(
    iNatTaxonRange,
    map,
    layerControl,
    title
  );
}
