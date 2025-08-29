import type {
  TileLayer,
  Map,
  Control,
  Polygon,
  LayerOptions,
  PolylineOptions,
  GeoJSONOptions,
  GeoJSON,
} from "leaflet";
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
    layer_description: string;
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
  title?: string;
  subtitle?: string;
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
  placesMapLayers?: CustomGeoJSON;
  placesListEl: HTMLElement | null;
  inatApiParams: iNatApiParams;
  displayJsonEl: HTMLElement | null;
  color: string;
  map: { map: Map | null; layerControl: Control.Layers | null };
  boundingBox?: { nelat: number; nelng: number; swlat: number; swlng: number };
  refreshMap: {
    refreshMapButtonEl: HTMLElement | null;
    showRefreshMapButton: boolean;
    layer: CustomPolygon | null;
  };
}

export type MapStoreKeys = keyof MapStore;

type iNatApiParams = {
  nelat?: number;
  nelng?: number;
  swlat?: number;
  swlng?: number;
  per_page?: number;
  taxon_id?: number;
  place_id?: number;
  color?: string;
  spam?: boolean;
  verifiable?: boolean;
};

export type AppUrlParams = {
  nelat?: number;
  nelng?: number;
  swlat?: number;
  swlng?: number;
  taxa_id?: string;
  places_id?: string;
  colors?: string;
  spam?: boolean;
  verifiable?: boolean;
};

export type AppUrlParamsKeys = keyof AppUrlParams;

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

export interface CustomLayer extends LayerOptions {
  options: CustomLayerOptions;
  _bounds: LeafletBounds;
  _path: string;
  _container: string;
}

export interface CustomLayerOptions extends LayerOptions {
  layer_description?: string;
}

export interface CustomPolygon extends Polygon {
  _bounds: { nelat?: number; nelng?: number; swlat?: number; swlng?: number };
  options: CustomPolygonOptions;
}

export interface CustomPolygonOptions extends PolylineOptions {
  layer_description: string;
}

export interface CustomGeoJSON extends GeoJSON {
  options: CustomGeoJSONOptions;
}

export interface CustomGeoJSONOptions extends GeoJSONOptions {
  layer_description: string;
}
