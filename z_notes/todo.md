Paginate the Photo Browser view (vs. endless scrolling)
https://forum.inaturalist.org/t/paginate-the-photo-browser-view-vs-endless-scrolling/67059

https://www.inaturalist.org/taxa/147930-Rabidosa-rabida/browse_photos

sex: male
https://api.inaturalist.org/v1/observations?taxon_id=147930&order_by=votes&quality_grade=research&term_id=9&term_value_id=11&photos=true&page=&per_page=12

===
Understanding and exporting annotations
https://forum.inaturalist.org/t/understanding-and-exporting-annotations/67998/3

list of annotaions
term_id & term_value_id

Searching for Annotations - Basic to Advanced
https://forum.inaturalist.org/t/searching-for-annotations-basic-to-advanced/65375

==
Changes to City Nature Challenge 2026: from the Global Organizing Team
https://forum.inaturalist.org/t/changes-to-city-nature-challenge-2026-from-the-global-organizing-team/72291/38

==

https://github.com/jumear/stirfry/tree/master

https://jumear.github.io/stirfry/iNat_UTFGrid_data_interpreter

https://github.com/jumear/stirfry/blob/master/iNat_UTFgrid_based_density_comparison_map.html

==

https://forum.inaturalist.org/t/world-map-representation-is-mercator-the-most-adequate-for-inat/7806/10

https://forum.inaturalist.org/t/access-to-the-api-denied/57916/4

https://forum.inaturalist.org/t/is-there-a-way-to-exclude-my-observations-from-a-search/71428



==

account creation
user_after=1w - in the past week
user_before=1w - more than a week ago


descriptions/tag 
q=


without annotation
without_term_id=17


Geospatial
Hide observations with private locations
geoprivacy=open,obscured&taxon_geoprivacy=open,obscured

Not expected nearby
expected_nearby=false

==

Easiest way to rank areas by biodiversity using iNaturalist data
https://forum.inaturalist.org/t/easiest-way-to-rank-areas-by-biodiversity-using-inaturalist-data/72706/31


==
How to export annotated observations
https://forum.inaturalist.org/t/how-to-export-annotated-observations/39708/2


I created a website to explore iNaturalist data. https://inat-explorer.dataexplorers.info. The site can be used to download annotated observations.

To download observations for *Vanessa tameamea* with `Life Stage = Adult`. 

1."Search for" should be set to "Observed species" 
2. Enter  'Vanessa tameamea'  as the search term, and select item from the popup menu.

![Screenshot 2026-02-22 at 5.57.11 PM|690x315, 50%](upload://xVfx3B8x92i0ruP5AIZby5mH9r0.png)


3. Click the 'Filters' button. Click 'Annotations' tab. Click 'Life Stage' check box, and select 'Adult'.  

![Screenshot 2026-02-22 at 5.33.07 PM|690x207](upload://63hTNEfIFCoXdaMT6fW58meiqTB.png)

4. To download the observations, click the iNaturalist Links icon.

If you want to download the observations using the iNaturalist Export page, click 'Export page'. If you will use custom code to download the observations with annotations and you want the search params used to query the observations API, click 'Observations API' .

![Screenshot 2026-02-22 at 6.29.08 PM|470x499, 50%](upload://6vwnOlMnziX2UQgypVOshhWSDZn.png)
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

How to print high quality herbarium labels with iNaturalist observation information

https://forum.inaturalist.org/t/how-to-print-high-quality-herbarium-labels-with-inaturalist-observation-information/72302/18
