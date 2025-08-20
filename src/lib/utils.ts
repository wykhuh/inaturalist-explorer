import { map } from "leaflet";
import type {
  NormalizediNatTaxon,
  MapStore,
  ButtonEvent,
} from "../types/app.d.ts";

export function displayJson(json: any, el: HTMLElement | null) {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value#Examples
  const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (_key: string, value: any) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    };
  };

  if (el) {
    el.innerText = JSON.stringify(json, getCircularReplacer(), 2);
  }
}

export function renderTaxaList(
  mapStore: MapStore,
  layerControl: L.Control.Layers
) {
  if (!mapStore.taxaListEl || mapStore == null) return;

  mapStore.taxaListEl.innerHTML = "";

  mapStore.selectedTaxa.forEach((taxon) => {
    let spanEl = document.createElement("li");
    spanEl.className = "taxon-list-item";
    spanEl.innerText = taxon.preferred_common_name || taxon.name;
    spanEl.dataset.taxonId = taxon.id.toString();

    let closeSpanEl = document.createElement("button");
    closeSpanEl.innerHTML = "&#215;";
    closeSpanEl.className = "taxon-list-item-close";
    closeSpanEl.dataset.taxonId = taxon.id.toString();

    closeSpanEl.addEventListener("click", (e) =>
      removeTaxon(e, mapStore, layerControl)
    );

    spanEl.appendChild(closeSpanEl);
    mapStore.taxaListEl!.appendChild(spanEl);
  });
}

function removeTaxon(
  e: ButtonEvent,
  mapStore: MapStore,
  layerControl: L.Control.Layers
) {
  let taxonId = e.target.dataset.taxonId;
  if (!taxonId) return;

  mapStore.selectedTaxa = mapStore.selectedTaxa.filter(
    (taxon) => taxon.id !== Number(taxonId)
  );
  displayJson(mapStore.selectedTaxa, mapStore.displayJsonEl);
  renderTaxaList(mapStore, layerControl);

  let mapLayers = mapStore.taxaMapLayers[taxonId];
  mapLayers.forEach((layer) => {
    // remove layer from layer control
    layerControl.removeLayer(layer);
    // remove layer from map
    layer.remove();
  });
}
