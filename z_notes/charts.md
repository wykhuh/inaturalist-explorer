==

Plant phenology graph data
https://forum.inaturalist.org/t/plant-phenology-graph-data/


Is there a way to download the monthly data from a species phenology graph?

~~

the underlying data comes from the API via /v1/observations/popular_field_values.

for example, you could get data for Rudbeckia amplexicaulis (taxon 200073) from https://api.inaturalist.org/v1/observations/popular_field_values?taxon_id=200073&per_page=50&unannotated=true

you can also get the data via /v1/observations/histogram. this one will allow you to specify different time intervals (ex. month of year, monthly, daily, weekly, etc.), though you will have to make a separate request for each phenology value (flowering, budding, etc.).

for example, the corresponding month-of-year “flowering” data set for R. amplexicaulis could be obtained from https://api.inaturalist.org/v1/observations/histogram?term_id=12&term_value_id=13&taxon_id=200073&interval=month_of_year

this page may help to display this data in a more human-friendly format:
https://jumear.github.io/stirfry/iNatAPIv1_observation_histogram?term_id=12&term_value_id=13&taxon_id=200073&interval=month_of_year

annotation codes can be found here: https://forum.inaturalist.org/t/how-to-use-inaturalists-search-urls-wiki-part-2/18792#heading--annotations


==

Downloading seasonality data
https://forum.inaturalist.org/t/downloading-seasonality-data/37445
~~

You can get that info from the API via GET /observations/histogram.

To narrow that down by phenology, it’s a little less straightforward since you need to refer to annotations and values by ID instead of by label. You can get those IDs from the GET /controlled_terms endpoint. Here are the relevant parts:

Then plug those values into the term_id and term_value_id fields for the histogram endpoint. For example, getting observation counts of Acer platanoides by month for “Plant Phenology: Fruiting” would be:

https://api.inaturalist.org/v1/observations/histogram?taxon_name=Acer%20platanoides&interval=month_of_year&term_id=12&term_value_id=14

~~

if you need basically same the information that shows up on the taxon page seasonality graphs, you can get this from the API via /v1/observations/popular_field_values. it’s a little more efficient than getting that information /v1/observations/histogram, although /histogram will allow you to specify a few more options when retrieving data. see https://forum.inaturalist.org/t/plant-phenology-graph-data/31862/2 for more information.

==

inat western honey bee seasonality

https://api.inaturalist.org/v2/observations/histogram?verifiable=true&taxon_id=47219&date_field=observed&interval=month_of_year&quality_grade=research

inat western honey bee history

https://api.inaturalist.org/v2/observations/histogram?verifiable=true&taxon_id=47219&date_field=observed&interval=month

==

How can I cut and paste the Seasonality graph?
https://forum.inaturalist.org/t/how-can-i-cut-and-paste-the-seasonality-graph/30249

The seasonality charts use data from the /observations/histogram endpoint.
https://api.inaturalist.org/v1/docs/#!/Observations/get_observations_histogram

The phenology charts use a different endpoint – /observations/popular_field_values
https://api.inaturalist.org/v1/docs/#!/Observations/get_observations_popular_field_values

~~

it wouldn’t be as efficient to get all the data using the latter endpoint if you want to get data to exactly match the iNat phenology charts, but the latter endpoint offers more options to allow you to get the data in other formats – for example, by day, by week, etc.

just for example, here’s how you might get flowering eastern redbuds by month of year:
https://api.inaturalist.org/v1/observations/histogram?term_id=12&term_value_id=13&taxon_id=48502

but if you to see things change by week, you could use: https://api.inaturalist.org/v1/observations/histogram?term_id=12&term_value_id=13&taxon_id=48502&interval=week
(which you could also quickly visualize at https://jumear.github.io/stirfry/iNatAPIv1_observation_histogram.html?term_id=12&term_value_id=13&taxon_id=48502&interval=week)


==

Plant phenology graph data
https://forum.inaturalist.org/t/plant-phenology-graph-data/31862

Is there a way to download the monthly data from a species phenology graph?
Thanks

~~
the underlying data comes from the API via /v1/observations/popular_field_values.

for example, you could get data for Rudbeckia amplexicaulis (taxon 200073) from https://api.inaturalist.org/v1/observations/popular_field_values?taxon_id=200073&per_page=50&unannotated=true


you can also get the data via /v1/observations/histogram. this one will allow you to specify different time intervals (ex. month of year, monthly, daily, weekly, etc.), though you will have to make a separate request for each phenology value (flowering, budding, etc.).

for example, the corresponding month-of-year “flowering” data set for R. amplexicaulis could be obtained from https://api.inaturalist.org/v1/observations/histogram?term_id=12&term_value_id=13&taxon_id=200073&interval=month_of_year

this page may help to display this data in a more human-friendly format:
https://jumear.github.io/stirfry/iNatAPIv1_observation_histogram?term_id=12&term_value_id=13&taxon_id=200073&interval=month_of_year

annotation codes can be found here: https://forum.inaturalist.org/t/how-to-use-inaturalists-search-urls-wiki-part-2/18792#heading--annotations

==

place_id=981d9cf2-e161-4c66-af02-493dc335be47

same as 

place_id=1

which is united states

==

Western Fence Lizard
https://www.inaturalist.org/taxa/36204-Sceloporus-occidentalis

seasonality - 3 api calls

https://api.inaturalist.org/v2/observations/popular_field_values?taxon_id=36204&per_page=50&place_id=981d9cf2-e161-4c66-af02-493dc335be47&no_histograms=true
&fields=(controlled_attribute%3A(excepted_taxon_ids%3A!t%2Cid%3A!t%2Clabel%3A!t%2Ctaxon_ids%3A!t)%2Ccontrolled_value%3A(excepted_taxon_ids%3A!t%2Cid%3A!t%2Clabel%3A!t%2Ctaxon_ids%3A!t)%2Ccount%3A!t%2Cmonth_of_year%3Aall%2Cunannotated%3Aall)

https://api.inaturalist.org/v2/observations/histogram?verifiable=true&taxon_id=36204&place_id=981d9cf2-e161-4c66-af02-493dc335be47&preferred_place_id=1&date_field=observed&interval=month_of_year&quality_grade=research

https://api.inaturalist.org/v2/observations/histogram?verifiable=true&taxon_id=36204&place_id=981d9cf2-e161-4c66-af02-493dc335be47&preferred_place_id=1&date_field=observed&interval=month_of_year


history - 2 api calls

https://api.inaturalist.org/v2/observations/histogram?verifiable=true&taxon_id=36204&place_id=981d9cf2-e161-4c66-af02-493dc335be47&preferred_place_id=1&date_field=observed&interval=month

https://api.inaturalist.org/v2/observations/histogram?verifiable=true&taxon_id=36204&place_id=981d9cf2-e161-4c66-af02-493dc335be47&preferred_place_id=1&date_field=observed&interval=month&quality_grade=research


sex 
life stage

https://api.inaturalist.org/v2/observations/popular_field_values?taxon_id=36204&per_page=50&place_id=981d9cf2-e161-4c66-af02-493dc335be47&unannotated=true
&fields=(controlled_attribute%3A(excepted_taxon_ids%3A!t%2Cid%3A!t%2Clabel%3A!t%2Ctaxon_ids%3A!t)%2Ccontrolled_value%3A(excepted_taxon_ids%3A!t%2Cid%3A!t%2Clabel%3A!t%2Ctaxon_ids%3A!t)%2Ccount%3A!t%2Cmonth_of_year%3Aall%2Cunannotated%3Aall)


~~

Laurel Sumac
https://www.inaturalist.org/taxa/64122-Malosma-laurina

seasonality - 3 api calls

https://api.inaturalist.org/v2/observations/popular_field_values?taxon_id=64122&per_page=50&place_id=981d9cf2-e161-4c66-af02-493dc335be47&no_histograms=true&fields=(controlled_attribute%3A(excepted_taxon_ids%3A!t%2Cid%3A!t%2Clabel%3A!t%2Ctaxon_ids%3A!t)%2Ccontrolled_value%3A(excepted_taxon_ids%3A!t%2Cid%3A!t%2Clabel%3A!t%2Ctaxon_ids%3A!t)%2Ccount%3A!t%2Cmonth_of_year%3Aall%2Cunannotated%3Aall)

https://api.inaturalist.org/v2/observations/histogram?verifiable=true&taxon_id=64122&place_id=981d9cf2-e161-4c66-af02-493dc335be47&preferred_place_id=1&date_field=observed&interval=month_of_year


https://api.inaturalist.org/v2/observations/histogram?verifiable=true&taxon_id=64122&place_id=981d9cf2-e161-4c66-af02-493dc335be47&preferred_place_id=1&date_field=observed&interval=month_of_year&quality_grade=research


history - 2 api calls

https://api.inaturalist.org/v2/observations/histogram?verifiable=true&taxon_id=64122&place_id=981d9cf2-e161-4c66-af02-493dc335be47&preferred_place_id=1&date_field=observed&interval=month

https://api.inaturalist.org/v2/observations/histogram?verifiable=true&taxon_id=64122&place_id=981d9cf2-e161-4c66-af02-493dc335be47&preferred_place_id=1&date_field=observed&interval=month&quality_grade=research


sex 
flowers and fruits
leaves
- all use same api call

https://api.inaturalist.org/v2/observations/popular_field_values?taxon_id=64122&per_page=50&place_id=981d9cf2-e161-4c66-af02-493dc335be47&unannotated=true&fields=(controlled_attribute%3A(excepted_taxon_ids%3A!t%2Cid%3A!t%2Clabel%3A!t%2Ctaxon_ids%3A!t)%2Ccontrolled_value%3A(excepted_taxon_ids%3A!t%2Cid%3A!t%2Clabel%3A!t%2Ctaxon_ids%3A!t)%2Ccount%3A!t%2Cmonth_of_year%3Aall%2Cunannotated%3Aall)

==

https://api.inaturalist.org/v2/observations/popular_field_values?per_page=40&fields=%28controlled_attribute%3A%28excepted_taxon_ids%3A%21t%2Cid%3A%21t%2Clabel%3A%21t%2Ctaxon_ids%3A%21t%29%2Ccontrolled_value%3A%28excepted_taxon_ids%3A%21t%2Cid%3A%21t%2Clabel%3A%21t%2Ctaxon_ids%3A%21t%29%2Ccount%3A%21t%2Cmonth_of_year%3Aall%2Cunannotated%3Aall%29&unannotated%3Dtrue=true

no place. Life Stage, Adult
"count": 32080464,

place = 1. Life Stage, Adult
"count": 32079869,

==

chart item properties

borderRadius: undefined
datasetIndex: 0
fillStyle: "#66ccee"
fontColor: "#666"
hidden: false
lineCap: "butt"
lineDash: [0, 0] (2)
lineDashOffset: 0
lineJoin: "miter"
lineWidth: 3
pointStyle: undefined
rotation: undefined
strokeStyle: "#66ccee"
text: "Breaking Leaf Buds - milkweed!"
textAlign: undefined
