npm create vite@latest

==

https://alvin.codes/snippets/prettier-svelte

Install the extension Svelte for VS Code

Install the Prettier Svelte Plugin.

Open your settings, then open your settings.json file

"[svelte]": {
"editor.defaultFormatter": "svelte.svelte-vscode"
},

==

How do I setup a multi page app using vite?

https://stackoverflow.com/questions/77498366/how-do-i-setup-a-multi-page-app-using-vite

Vite for Multi-Page Apps: A Comprehensive Guide
https://runebook.dev/en/articles/vite/guide/build/multi-page-app

==

Svelte multipage website with Vite DevTool
https://stackoverflow.com/questions/73751536/svelte-multipage-website-with-vite-devtool

It's a defect on vite's part. See #6596. If you really need to config the behavior differently, this issue comment provides a solution. If it doesn't bother you much, just add a trailing slash to that path and live with it until vite team resolve the issue.

localhost:5173/about # this doesn't work
localhost:5173/about/ # this works

==

https://github.com/LeaVerou/awesomplete
7k stars

https://github.com/algolia/autocomplete
5k stars

https://github.com/TarekRaafat/autoComplete.js
4k stars

https://tarekraafat.github.io/autoComplete.js/#/

How can I disable search and make autoComplete just display the API result set #400
https://github.com/TarekRaafat/autoComplete.js/issues/400

==

https://typescriptcenter.substack.com/p/how-to-fix-could-not-find-declaration

==

https://medium.com/geoman-blog/testing-maps-e2e-with-cypress-ba9e5d903b2b

==

Ideas for a revamped Explore/Observations Search Page

https://forum.inaturalist.org/t/ideas-for-a-revamped-explore-observations-search-page/8439/378

==

```js
if (import.meta.env?.MODE !== "development") {
  return;
}
if (process.env.npm_lifecycle_event === "e2e") return;
let ua = navigator.userAgent;
```

==
What's a good way to mock window.location? #2213

https://github.com/vitest-dev/vitest/discussions/2213

==

Testing history.pushState with spies in Vitest
https://www.yellowduck.be/posts/testing-history-pushstate-with-spies-in-vitest

==

Encode URL in JavaScript
https://stackoverflow.com/questions/332872/encode-url-in-javascript/58879100

==

https://freshman.tech/snippets/typescript/fix-value-not-exist-eventtarget/

==

CSS native variables not working in media queries
https://stackoverflow.com/questions/40722882/css-native-variables-not-working-in-media-queries

==

deleting and setting a property in observationsApiParams does not trigger the
an update in proxy store. Need to replace observationsApiParams to trigger
an update in proxy store.

==

http://localhost:5173/?taxon_id=47126,1&place_id=962&project_id=31997,16065,62506,224219,189339&user_id=34687,12809,81779,223005,81779,223005&colors=%2366ccee,%23228833&verifiable=true&spam=false

==

https://transform.tools/json-to-typescript

https://www.urldecoder.org

==
How to measure time taken by a function to execute
https://stackoverflow.com/questions/313893/how-to-measure-time-taken-by-a-function-to-execute

==

https://www.geeksforgeeks.org/css/css-popover-menu/

Web Components, pass data to and from
https://stackoverflow.com/questions/50404970/web-components-pass-data-to-and-from

--

https://fungi-finders-example.netlify.app/mushroom-guide

===

todo

cache api request

save requests in browser database

==

https://leaflet-extras.github.io/leaflet-providers/preview/

==

https://stackoverflow.com/questions/78270011/insert-a-table-row-with-custom-web-components

==

leaflet errors

https://runebook.dev/en/articles/leaflet/index/tileerrorevent-coords

tileerror does not fire if we add invalid layer to map

tileerror does fire if layer already added to map , and we zoom in and out

==

decodeAppUrl

- handle both observations and identifications

initApp,

- fill both observationsApiParams and identificationsApiParams

updateAppUrl

- handle both observations and identifications

when connecting to API

- use observationsApiParams or identificationsApiParams

==

```html
<div class="tp-wrapper">
  <span class="tp-trigger" aria-describedby="tp-xxx">?</span>
  <p id="tp-xxx" role="tooltip">xxx</p>
</div>
```

==

favicon

https://realfavicongenerator.net

https://css-tricks.com/svg-favicons-in-action/

==
Local First from Scratch - How to make a web app with local data
https://www.youtube.com/watch?v=Qoqh9Mdmk80
invoice app with svelte and indexeddb

Local Data: Sqlite, LocalStorage, Session, Cookies and IndexDB
https://www.youtube.com/watch?v=VzUHeLsJOrs
dexie to interact with indexeddb

IndexedDB - Progressive Web App Training
https://www.youtube.com/watch?v=VNFDoawcmNc

Local First from Scratch - How to make a web app with local data
https://www.youtube.com/watch?v=Qoqh9Mdmk80

SQLite as frontend storage - Delete localStorage and IndexedDB?
https://www.youtube.com/watch?v=faSxK3hK2KI

IndexedDB Part 1 - Creating and Versioning
https://www.youtube.com/watch?v=gb5ovg7YCig

How to use IndexedDB to store data for your web application in the browser
https://www.youtube.com/watch?v=yZ26CXny3iI

How I power my React app with IndexedDB
https://www.youtube.com/watch?v=kImH1afFRNk

==
External links best practices
https://blog.cogitactive.com/website/external-links-best-practices/

External links best practices—cont’d
https://blog.cogitactive.com/website/external-links-best-practices-contd/

==

offline maps

Everything You Need to Know to Build Offline Maps: Tiles, Projections, and MBTiles

https://medium.com/@rao_/a-guide-to-offline-maps-map-tiles-and-mbtiles-for-beginners-7d412b837d25

MBTiles is a file format used to store map tiles for offline use.
It stores many map tiles inside a single file, making maps easy to distribute and manage.

==

Why use MBTiles?

https://www.mikegravel.org/why-use-mbtiles/

==

mbtiles/pmtiles for GEBCO gridded bathymetry data
https://github.com/openwatersio/gebco-tiles

Pyramids of map tiles in a single file on static storage
https://github.com/protomaps/PMTiles

Offline tiles in a webapp #588
https://github.com/protomaps/PMTiles/discussions/588

MapLibre GL JS Offline Tiles: Adding Realism with Terrain Visualization
https://keimaps.com/articles/self-hosted-basemap-maplibre-terrain

https://github.com/jtbaker/pmtiles-offline

Creating a Maplibre application using a self hosted basemap
https://www.keimaps.com/articles/self-hosted-basemap-maplibre

From .osm data to a complete map viewer
https://github.com/hemanth2004/offline-osm-viewer

Creating a CesiumJS application using a self hosted basemap
https://medium.com/@keimapsapp/creating-a-cesiumjs-application-using-a-self-hosted-basemap-f6fd482fde37

OpenStreetMap Data Extracts
http://download.geofabrik.de

The BBBike extract service offers PMTiles for an area of your choosing.
https://extract.bbbike.org/

https://wiki.openstreetmap.org/wiki/PMTiles

https://github.com/systemed/tilemaker
tilemaker creates vector tiles (in Mapbox Vector Tile format) from an .osm.pbf planet extract, as typically downloaded from providers like Geofabrik. It aims to be 'stack-free': you need no database and there is only one executable to install.

==

Cant set up database, not owner of psql extension postgis?
https://github.com/inaturalist/inaturalist/issues/4738

==

https://stackoverflow.com/questions/42729822/leaflet-add-layer-on-layeradd-event

Info about added layer from map.on(layeradd) event in Leaflet
https://gis.stackexchange.com/questions/404603/info-about-added-layer-from-map-onlayeradd-event-in-leaflet

```js
L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  myLayerId: 1,
}).addTo(map);

map.on("layeradd", function (evt) {
  console.log("Layer added: ", evt.layer.options.myLayerId);
});
```

How to get selected layers in control.layers?
https://stackoverflow.com/questions/44322326/how-to-get-selected-layers-in-control-layers

```js

// Add method to layer control class
L.Control.Layers.include({
    getActiveOverlays: function () {

        // Create array for holding active layers
        var active = [];

        // Iterate all layers in control
        this._layers.forEach(function (obj) {

            // Check if it's an overlay and added to the map
            if (obj.overlay && this._map.hasLayer(obj.layer)) {

                // Push layer to active array
                active.push(obj.layer);
            }
        });

        // Return array
        return active;
    }
});

var control = new L.Control.Layers(...),
    active = control.getActiveOverlays();
```

```js
if (appStore.map.map === null) {
  initRenderMap(appStore);
} else {
  appStore.map.map;
  if (appStore.map.layerControl) {
    if (obj.overlay && this._map.hasLayer(obj.layer)) {
      // Push layer to active array
      active.push(obj.layer);
    }

    appStore.map.layerControl._layers.forEach((layer) => {
      if (layer.overlay && appStore.map.map.hasLayer(layer.layer)) {
        // Push layer to active array
        console.log(layer.layer);
      }

      // map.addLayer(layer.layer);
      appStore.map.map.addLayer(layer.layer);
    });
  }
}
```

========

map - keep selected basemapm and layers when map is udated

goal

- know which taxa inat map layers should be displayed on the map when selected taxa changes, when switching to map view, when animating maps

leaflet fires event

- layer added
- layer removed

want to track

- when user adds or removes layer by clicking map control
- when user removes selected taxa
- when user adds selected taxa

ignore

- when map is deleted, which deletes layers
- when map is created, which adds layers
- when map layer is deleted and replaced with updated layer

click x

- removeTaxon
- removeOneTaxonFromMap
- layerremove event
- removeOneTaxonFromStore

========

leaflet button

https://stackoverflow.com/questions/64046196/

```js
const customButton = L.control({ position: "topleft" });
customButton.onAdd = () => {
  const buttonDiv = L.DomUtil.create("div", "button-wrapper");

  buttonDiv.innerHTML = `<button>Custom Button</button>`;
  buttonDiv.addEventListener("click", () => console.log("click"));
  return buttonDiv;
};
customButton.addTo(map);
```
