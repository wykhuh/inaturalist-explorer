IdentificationsFilters/utils.js
ObservationsFilters/utils.js

updateAppWithFilters -> updateTilesForSelectedTaxa

==

lib/data_utils.js

refreshBoundingBox(appStore: AppStoreType)

refreshBoundingBox -> updateTilesForSelectedTaxa

==

lib/init_app.ts

function initRenderMap(appStore: AppStoreType)

initRenderMap -> updateTilesForSelectedTaxa

==

search_places.ts
search_projects.ts
search_unobserved.ts
search_users.ts
search_identifiers.ts

xxxSelectedHandler(
selection: NormalizediNatPlaceType,
\_query: string,
appStore: AppStoreType,
)

xxxSelectedHandler -> updateTilesForSelectedTaxa

removeOneXxxFromStoreAndMap(appStore, placeId)

removeOneXxxFromStoreAndMap -> updateTilesForSelectedTaxa

=============
lib/search_utils.ts

updateTilesForSelectedTaxa - add map tiles for all selectedTaxon

function updateTilesForSelectedTaxa(appStore: AppStoreType)

updateTilesForSelectedTaxa -> fetchiNatMapDataForTaxon

==

lib/search_taxa.ts

taxonSelectedHandler - called when taxon selected in search menu

function taxonSelectedHandler(
selection: NormalizediNatTaxonType,
\_searchTerm: string,
appStore: AppStoreType,
)

taxonSelectedHandler -> fetchiNatMapDataForTaxon

==

lib/data_utils.js

addDefaultTaxaRecordToMap - add default, all taxa layer to map

function addDefaultTaxaRecordToMap(appStore: AppStoreType)

addDefaultTaxaRecordToMap -> fetchiNatMapDataForTaxon

=============

lib/data_utils.js

fetchiNatMapDataForTaxon - add map tiles to leaflet map for a given taxon

function fetchiNatMapDataForTaxon(
taxonObj: NormalizediNatTaxonType,
appStore: AppStoreType,
paramsTemp: ObservationsApiParamsType,
)

fetchiNatMapDataForTaxon -> getiNatMapTiles

add clean params here

=============

lib/inat_api.js

getiNatMapTiles - get my predefined map tile

getiNatMapTiles = (
observationsApiParams: Params,
taxonObj: NormalizediNatTaxonType,
)
