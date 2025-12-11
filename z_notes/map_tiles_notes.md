IdentificationsFilters/utils.js
ObservationsFilters/utils.js

updateAppWithFilters -> updateTilesForSelectedTaxa

==

lib/data_utils.js

refreshBoundingBox(appStore: MapStore)

refreshBoundingBox -> updateTilesForSelectedTaxa

==

lib/init_app.ts

function initRenderMap(appStore: MapStore)

initRenderMap -> updateTilesForSelectedTaxa

==

search_places.ts
search_projects.ts
search_unobserved.ts
search_users.ts
search_identifiers.ts

xxxSelectedHandler(
  selection: NormalizediNatPlace,
  _query: string,
  appStore: MapStore,
)

xxxSelectedHandler -> updateTilesForSelectedTaxa

removeOneXxxFromStoreAndMap(appStore, placeId)

removeOneXxxFromStoreAndMap -> updateTilesForSelectedTaxa


=============
lib/search_utils.ts

updateTilesForSelectedTaxa - add map tiles for all selectedTaxon

function updateTilesForSelectedTaxa(appStore: MapStore)

updateTilesForSelectedTaxa -> fetchiNatMapDataForTaxon

==

lib/search_taxa.ts

taxonSelectedHandler - called when taxon selected in search menu

function taxonSelectedHandler(
  selection: NormalizediNatTaxon,
  _searchTerm: string,
  appStore: MapStore,
)

taxonSelectedHandler -> fetchiNatMapDataForTaxon


==

lib/data_utils.js

addDefaultTaxaRecordToMap - add default, all taxa layer to map

function addDefaultTaxaRecordToMap(appStore: MapStore)

addDefaultTaxaRecordToMap -> fetchiNatMapDataForTaxon

=============

lib/data_utils.js

fetchiNatMapDataForTaxon - add map tiles to leaflet map for a given taxon

function fetchiNatMapDataForTaxon(
  taxonObj: NormalizediNatTaxon,
  appStore: MapStore,
  paramsTemp: ObservationsApiParams,
)

fetchiNatMapDataForTaxon -> getiNatMapTiles


add clean params here

=============


lib/inat_api.js

getiNatMapTiles - get my predefined map tile

getiNatMapTiles = (
  observationsApiParams: Params,
  taxonObj: NormalizediNatTaxon,
)
