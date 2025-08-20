import type { MapStore } from "../types/app.d.ts";

export const mapStore: MapStore = {
  selectedTaxa: [],
  taxaMapLayers: {},
  inatApiParams: {},
  displayJsonEl: null,
  taxaListEl: null,
  color: "",
  map: { map: null, layerControl: null },
};
