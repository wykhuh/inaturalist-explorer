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

observation fields

~~

autocomplete

https://api.inaturalist.org/v1/observation_fields/autocomplete?callback=observationFieldAutocompleteCallback&q=inb&per_page=10&not_id=3126

typeof observationFieldAutocompleteCallback === 'function' && observationFieldAutocompleteCallback({
    "total_results": 293,
    "page": 1,
    "per_page": 10,
    "results": [{
        "id": 7997,
        "name": "Interès",
        "description": "",
        "datatype": "text",
        "allowed_values": "\"No|Punt alimentació|Niu\"",
        "values_count": 1865
    }]
});
~~

How can I download the complete list of Observation Fields?
https://forum.inaturalist.org/t/how-can-i-download-the-complete-list-of-observation-fields/33345

https://www.inaturalist.org/observation_fields.json?page=1

~~

Observation Field for Flowers and Pollinators
https://forum.inaturalist.org/t/observation-field-for-flowers-and-pollinators/35806/3

For example, for Bombus pascuorum, you would use this link: https://www.inaturalist.org/taxa/55637-Bombus-pascuorum?test=interactions and click on the Interactions tab.

Another way to do this is through one of the Observation Fields that does the reverse, such as “Interaction: Flower visited by”. Here are all the observations with that field, where the flower visitor is the honeybee Apis mellifera:

https://www.inaturalist.org/observations?verifiable=any&place_id=any&field:Interaction->Flower%20visited%20by=47219

However, this field is less used than the field identifying the plant in observations of insects, so you won’t see all the information that iNaturalist really has to offer. For example, 4,612 observations of honeybees have the field “Interaction: visited flower of”, but only 224 observations of plants have the field “Interaction: flower visited by” with honeybee as the visitor. This is why we need a better way to record interactions on iNaturalist, so that an interaction can be recorded between two observations, and remain easily searchable from either taxon.

@@

GloBI does this automatically.

My main interest is insect-plant interactions, especially plant host relationships. I’m the lead user of the iNaturalist observation field Interaction->Visited flower of.

I rarely use the inverse relationship, Interaction->Flower visited by. Another issue is that you can only use these observation fields once. Typically, I’m observing multiple species on a plant, and the fields don’t support this many to one relationship. I would have to duplicate the plant observation just to record each interaction, even if they’re all visiting flowers on the same individual plant.

But GloBI understands that the relationship Visited flower of is reciprocal with Flower visited by. For example, I observed Eristalis arbustorum visiting Allium flowers in my garden. GloBI imports this insect-plant association in both directions.

I spoke about iNaturalist for the Torrey Botanical Society in March of 2022. Here’s where I talk about integration of iNat interaction-/association-related Observation Fields with GloBI.

https://youtu.be/DZRIk81Z5s0?t=740


@@

I was looking for a post about observation fields but probably this topic fits as well. There is no video about observation fields already, it there? Found only these https://www.inaturalist.org/pages/video+tutorials
https://github.com/globalbioticinteractions/globalbioticinteractions/issues/822

~~

Bees on plants in botanical gardens
https://forum.inaturalist.org/t/bees-on-plants-in-botanical-gardens/70448/2

~~

Quick search regarding Observation Fields
https://forum.inaturalist.org/t/quick-search-regarding-observation-fields/44962/12

~~

globi api  

https://github.com/globalbioticinteractions/inaturalist/blob/main/interaction_types_mapping.csv

https://api.globalbioticinteractions.org/interaction?sourceTaxon=Bombus%20pascuorum&type=json.v2&accordingTo=inaturalist

https://api.globalbioticinteractions.org/interaction?sourceTaxon=Bombus%20pascuorum&accordingTo=inaturalist

https://github.com/globalbioticinteractions/globalbioticinteractions/wiki/API

create video to show how to add observations fields in iNaturalist 
https://github.com/globalbioticinteractions/globalbioticinteractions/issues/822


~~

inat projects with interactions

https://www.inaturalist.org/projects/interactions-linked

Step 1: filter for these, store with interaction type
https://www.inaturalist.org/observations?verifiable=any&place_id=any&field:Visiting%20a%20flower%20of:%20(Interaction)

for each of
• Visiting a flower of: (Interaction)
• Eating: (Interaction)
• Parasitizing: (Interaction)
• Carrying: (Interaction)
• Attached to: (Interaction)
• Associated with: (Interaction)
• Passive Partner to: (Interaction)

~~

Add interactions to species pages
https://forum.inaturalist.org/t/add-interactions-to-species-pages/

@@

Both the New Zealanders and southern Africans have projects dealing with this.
Ours is visible at https://www.inaturalist.org/projects/interactions-s-afr

Basically, we record only the active interaction (i.e. “a eats b”, not “b is eaten by a” - the latter just being the reciprocal of the first), although user pressure has resulted in us adding a passive field for the reciprocal observation, given that observations fields link only one way, so that these observations do not display their hosts) as:

Visiting flowers: https://www.inaturalist.org/observations?field:Visiting%20a%20flower%20of:%20(Interaction)
Eating: https://www.inaturalist.org/observations?field:Eating:%20(Interaction)
Parasitizing: https://www.inaturalist.org/observations?field:Parasitizing:%20(Interaction)
Attached to: https://www.inaturalist.org/observations?field:attached%20to:%20(Interaction)
Carrying: https://www.inaturalist.org/observations?field:Carrying:%20(Interaction)
Associated with: https://www.inaturalist.org/observations?field:Associated%20with:%20(Interaction)
& the passive
https://www.inaturalist.org/observations?field:Passive%20Partner%20to:%20(Interaction)

Note that in each case the field value is the url of the interacting observation. Unfortunately we cannot use this is a query to summarize the interactions.

We can ask
“What flowers does the Cape Sugarbird Visit?” - https://www.inaturalist.org/observations?place_id=113055&subview=grid&taxon_id=13442&field:Visiting%20a%20flower%20of:%20(Interaction)=
but we will only see the bird, and not the flowers, even though all the urls to the flowers are in the field - see: https://www.inaturalist.org/observation_fields/7459.



@@

The data that exists on iNaturalist is already enough to derive a handful of these relations, and so they wouldn’t all have to be manually added.

I was curious about this myself so I decided to work on a script in python that can derive these inter-species associations from a large iNaturalist dataset. I have an 8 GB Macbook Air with an M1 chip, and I managed to write a script that could easily handle over 800,000 observations and over 15,000 species. Here’s a Github link for the script I wrote: https://github.com/Jacob-Deutsch-Work/Finding-Inter-species-Associations-on-Large-Citizen-Science-Datasets

@@

I have noticed that interaction projects and fields are becoming more popular and it seems like every taxon group is creating their own project/fields. This is great, but it is also duplicating a lot of effort and causing a bit of confusion. I personally subscribe to https://www.inaturalist.org/projects/interactions-linked because it covers most (if not all) interactions, gets around the non-community identification issue (by linking the partner observation rather than a taxon id), and is not restricted to specific taxa. 


~~

Search all fields (search within observation fields)
https://forum.inaturalist.org/t/search-all-fields-search-within-observation-fields/63388/2

I’m mainly looking at mushrooms. If I want to see if someone indicated their find smelled or tasted sweet, I have to make separate searches for every one of these fields:
Smell
Odor
Odor or Taste
Taste/Odor
Odor - Macrofungi
Scent description
Scent?
Any scent?
mushroom taste
Taste - Macrofungi
Taste

If I want to search for finds with “anise” or “sweet” or “pleasant”, now that’s 33 searches, just for observation fields.

~~

Go (golang) client library for iNaturalist API
https://forum.inaturalist.org/t/go-golang-client-library-for-inaturalist-api/67921/5

Do you know how I can request specific observation fields be included in the response? This is possible in the web UI

@@

at best, i think you would just filter for observations that contain an observation field of interest, and then include ofvs in the API response (ex. https://api.inaturalist.org/v2/observations?per_page=10&field:Count&fields=species_guess,observed_on,ofvs.id,ofvs.name,ofvs.value). from there, you’d probably have to add your own code to pull out the specific item from the ofvs array.


~~
Find all observations for a taxon (including descendants) with observation fields
https://forum.inaturalist.org/t/find-all-observations-for-a-taxon-including-descendants-with-observation-fields/71803


How do I retrieve observations that have observation fields? I’m interested on what plants people found Basiprionotini(a tortoise beetle tribe). As there are many observation fields for this, I can’t search for a specific one.
~~

Issues keeping me from switching from Mushroom Observer to iNaturalist
https://forum.inaturalist.org/t/issues-keeping-me-from-switching-from-mushroom-observer-to-inaturalist/48519/67

use DNA info for observation fields

~~
obsevation with many observation fields

https://www.inaturalist.org/observations/96244133

~~

interaction using taxa

http://localhost:5173/?place_id=63038&taxon_id=52775&field:Interaction-%3EVisited%20flower%20of=47544

https://www.inaturalist.org/observations?place_id=63038&field:Interaction-%3EVisited%20flower%20of=47544&taxon_ids=52775&subview=map


http://localhost:5173/?place_id=63038&verifiable=true&spam=false&term_id=9&field%3AInteraction-%3EVisited+flower+of=47544&per_page=48&view=observations_observations&subview=grid

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
