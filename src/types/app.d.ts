import type { TileLayer, Map, Control, Polygon } from "leaflet";
import { Polygon, MultiPolygon } from "./inat_api";

declare global {
  interface Window {
    app: { store: MapStore };
  }
}

export type TileSettings = {
  name: string;
  type: "overlay" | "basemap";
  url: string;
  options: {
    attribution: string;
    minZoom: number;
    maxZoom: number;
  };
};

export type NormalizediNatTaxon = {
  name: string;
  default_photo?: string;
  preferred_common_name?: string;
  matched_term: string;
  rank: string;
  id: number;
  color?: string;
  observations_count?: number;
  display_name?: string;
};

export type NormalizediNatPlace = {
  display_name: string;
  name: string;
  geometry?: Polygon | MultiPolygon;
  bounding_box?: LngLat[];
  id: number;
};

export interface MapStore {
  selectedTaxa: NormalizediNatTaxon[];
  taxaMapLayers: { [index: string]: TileLayer[] };
  taxaListEl: HTMLElement | null;
  selectedPlaces?: NormalizediNatPlace;
  placesMapLayers?: L.GeoJSON;
  placesListEl: HTMLElement | null;
  inatApiParams: iNatApiParams;
  displayJsonEl: HTMLElement | null;
  color: string;
  map: { map: Map | null; layerControl: Control.Layers | null };
  boundingBox?: { nelat: number; nelng: number; swlat: number; swlng: number };
  refreshMap: {
    refreshMapButtonEl: HTMLElement | null;
    showRefreshMapButton: boolean;
    layer: Polygon | null;
  };
}

type iNatApiParams = {
  nelat?: number;
  nelng?: number;
  swlat?: number;
  swlng?: number;
  per_page?: number;
  color?: string;
  taxon_id?: number;
  spam?: boolean;
  verifiable?: boolean;
  place_id?: number;
};

export interface AutoCompleteEvent {
  detail: {
    query: string;
    selection: { index: number; match: string; value: NormalizediNatTaxon };
  };
}

// https://freshman.tech/snippets/typescript/fix-value-not-exist-eventtarget/
type ButtonEvent = Event & {
  target: HTMLButtonElement;
};

type LeafletBounds = {
  _northEast: { lat: number; lng: number };
  _southWest: { lat: number; lng: number };
};

type Lng = number;
type Lat = number;
export type LngLat = [Lng, Lat];
export type LatLng = [Lat, Lng];
export type Coordinates = LngLat | LatLng;
