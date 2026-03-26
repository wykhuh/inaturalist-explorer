==


5 Physalia species

https://inat-explorer.dataexplorers.info/?taxon_id=117302,1631517,1631519,1631518,1651898&colors=%234477aa,%2366ccee,%23228833,%23ccbb44,%23ee6677&verifiable=true&spam=false&per_page=24&view=observations_observations&subview=media

==

Identified Species: Painted Turtle (Chrysemys picta)
Identifier: maxallen (Max Allen)

https://inat-explorer.dataexplorers.info/identifications/?taxon_id=39771&user_id=854537&per_page=24&view=identifications_identifications&subview=grid
8 identifications


https://inat-explorer.dataexplorers.info/?ident_user_id=854537&verifiable=true&spam=false&ident_taxon_id=39771&per_page=24&view=observations_observations&subview=grid
29 observations

==

==

Thanks for the feedback!

- Add `unobserved_by_user_id` as requested by @deanhester94 to find species not observed by user. Filters > Users > Unobserved by user.
- Add 'Identifications' view as requested by to show the identifications. Click 'Identifications' in the header.
- Add `ident_user_id` to find observations by identifier. Filters > Users > Identified by user. Due to limitations of the iNaturalist API, only one user can be selected.
- Add `locale` to set the common name language. Settings > Common Name Language.

Here is an example search for butterflies or dragonflies, in Los Angeles or San Diego, that are observed by hogpotato or biohexx1, and identified by nlblock.

https://inat-explorer-api.pages.dev/?taxon_id=47792,47157&place_id=962,829&user_id=164822,81261&colors=%2366ccee,%23228833&verifiable=true&spam=false&ident_user_id=39752


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

==

http://localhost:5173/?taxon_id=47163,3&place_id=962,829&project_id=224063,65248&user_id=12809,223005,818374,513214&colors=%23228833,%23ccbb44&verifiable=true&spam=false

LA SD, 2 CNC, 4 users, 2 taxa

==

Green Tree Frog
(Pelodryas caerulea)

http://localhost:5173/?taxon_id=1633145&place_id=962
http://localhost:5173/identifications/?taxon_id=1633145&place_id=962

2 casual observations, 3 idenifications

==

(Acnemia varipennis)

http://localhost:5173/identifications/?taxon_id=1554704&place_id=962

3 research grade observations, 6 identifications

==

http://localhost:5173/identifications/?taxon_id=55276&place_id=962

Candy Cap
(Lactarius rubidus)

27 observations, 54 idenifications


example with lots of disagreements in identifications

==

Golden-crowned Sparrow at Mt. San Antonio Wildlife Sanctuary 

https://api.inaturalist.org/v1/identifications/?place_id=201657&per_page=0&observation_taxon_id=9185

{
    "total_results": 3,
    "page": 1,
    "per_page": 0,
    "results": []
}

https://api.inaturalist.org/v1/identifications/?place_id=201657&per_page=0&taxon_id=9185

{
    "total_results": 2,
    "page": 1,
    "per_page": 0,
    "results": []
}

https://www.inaturalist.org/observations/249243630

Golden-crowned Sparrow
Zonotrichia atricapilla
Research Grade, 3

Activity
grasshopper_enjoyer suggested an ID
Zonotrichia Sparrows
Genus Zonotrichia

bridgetspencer suggested an ID
Golden-crowned Sparrow
Zonotrichia atricapilla

david99 suggested an ID
Golden-crowned Sparrow
Zonotrichia atricapilla

~~


Band-tailed Pigeon  at at Mt. San Antonio Wildlife Sanctuary 

https://api.inaturalist.org/v1/identifications/?place_id=201657&per_page=0&taxon_id=3108
{
    "total_results": 5,
    "page": 1,
    "per_page": 0,
    "results": []
}

https://api.inaturalist.org/v1/identifications/?place_id=201657&per_page=0&observation_taxon_id=3108
{
    "total_results": 6,
    "page": 1,
    "per_page": 0,
    "results": []
}


https://www.inaturalist.org/observations?place_id=201657&taxon_id=3108
research grade, 4
research grade, 2


https://www.inaturalist.org/observations/257737465
drewskipoo suggested an ID
Pigeons and Doves
Family Columbidae

thomasabenson suggested an ID
Band-tailed Pigeon
Patagioenas fasciata

david99 suggested an ID
Band-tailed Pigeon
Patagioenas fasciata

karakaxa suggested an ID
Band-tailed Pigeon
Patagioenas fasciata

https://www.inaturalist.org/observations/214124343
drewskipoo suggested an ID
Band-tailed Pigeon
Patagioenas fasciata

locomotive suggested an ID
Band-tailed Pigeon
Patagioenas fasciata

==

http://localhost:5173/identifications/?observation_taxon_id=81977&place_id=962&colors=%234477aa&view=identifications_identifications

==

http://localhost:5173/?taxon_id=3,47158&place_id=829,962&project_id=224219,224063&user_id=8159696,1518277&ident_user_id=80984,1653276&colors=%2366ccee,%23ccbb44&verifiable=true&spam=false&view=observations_species


==

western honey bee identified as western fence lizard

http://localhost:5173/?taxon_id=47219&colors=%23228833&verifiable=true&spam=false&per_page=24&ident_taxon_id=36204


==

observations page

http://localhost:5173/?taxon_id=47851&place_id=14&colors=%234477aa&verifiable=true&spam=false&per_page=24&ident_taxon_id=49011,47850

observed: oaks 76,315 observations
identified: Valley Oak 20,518 observations, Coast Live Oak 55,892 observations

~~
click on identifications
identifications page

http://localhost:5173/identifications/?observation_taxon_id=47851&taxon_id=49011,47850&place_id=14&colors=%234477aa&per_page=24

observed: oaks 142,284 identifications
identified: Valley Oak 37,883 identifications, Coast Live Oak 104,401 identifications

~~

click on observations
observations page

http://localhost:5173/?taxon_id=47851&place_id=14&colors=%234477aa&verifiable=true&spam=false&per_page=24&ident_taxon_id=49011,47850

==

identifications page

http://localhost:5173/identifications/?observation_taxon_id=47851&taxon_id=49011,47850&place_id=14&colors=%234477aa&per_page=24

~~

click on observations
observations page

http://localhost:5173/?taxon_id=47851&place_id=14&colors=%234477aa&verifiable=true&spam=false&ident_taxon_id=49011,47850&per_page=24

~~

click on identifications
identifications page

http://localhost:5173/identifications/?observation_taxon_id=47851&taxon_id=49011,47850&place_id=14&colors=%234477aa&per_page=24

==

 

http://localhost:5173/?taxon_id=47367&colors=%2366ccee&verifiable=true&spam=false&ident_taxon_id=47118&per_page=24

Observed Species: Harvestmen
Identified Species: Spiders

==
22 identications for gopher snake observations made by ki6h at griffith park
http://localhost:5173/identifications/?observation_taxon_id=29044&place_id=52141&user_id=44715&colors=%234477aa&per_page=100&view=identifications_observers

5 identications for gopher snake observations and identifications made by ki6h at griffith park
http://localhost:5173/identifications/?observation_taxon_id=29044&place_id=52141&colors=%234477aa&per_page=100&view=identifications_observers

ki6h not listed on observation identifiers for gopher snake observations  at griffith park
http://localhost:5173/?taxon_id=29044&place_id=52141&colors=%234477aa&verifiable=true&spam=false&per_page=100&page=1&view=observations_identifiers

==

 chickeroni has 137 identifications for gopher snake observations  at griffith park
 
https://www.inaturalist.org/observations?place_id=52141&taxon_id=29044&view=identifiers

http://localhost:5173/?taxon_id=29044&place_id=52141&colors=%234477aa&verifiable=true&spam=false&per_page=100&view=observations_identifiers

http://localhost:5173/?taxon_id=29044&place_id=52141&ident_user_id=6191605&colors=%234477aa&verifiable=true&spam=false&per_page=100&view=observations_identifiers

http://localhost:5173/identifications/?observation_taxon_id=29044&place_id=52141&colors=%234477aa&per_page=100&view=identifications_identifiers

==

Observed Species
Lizards
(Suborder Sauria)
90,513 observations

Places
California
90,513 observations

Exclude Species
Western Fence Lizard (Sceloporus occidentalis)

Exclude Places
San Francisco Bay Area

Exclude Projects
Los Angeles City Nature Challenge Cumulative Observations 2016-2025

Exclude Observers
mgruen (Matt Gruen)

Exclude Identifiers
petezani (Pete Zani (born @ 325 ppm))


http://localhost:5173/?taxon_id=85552&place_id=14&colors=%234477aa&verifiable=true&spam=false&per_page=24&not_in_place=54321&without_taxon_id=36204&without_ident_user_id=3960107&not_user_id=252388&not_in_project=65248

==

Observed Species
Lizards
(Suborder Sauria)

Identified Species
Phrynosomatid Lizards
(Family Phrynosomatidae)

Places
California

Projects
Los Angeles City Nature Challenge Cumulative Observations 2016-2025

Observers
scubabruin (LSchare (she/her))

Identifiers
gregpauly (Greg Pauly)

Annotators
joesjoes20 (joesjoes20) 


http://localhost:5173/?taxon_id=85552&place_id=14&project_id=65248&user_id=81779&ident_user_id=17630&colors=%234477aa&verifiable=true&spam=false&per_page=24&ident_taxon_id=36074&annotation_user_id=5983024&view=observations_observations&subview=grid

==

http://localhost:5173/?taxon_id=52687,47129,53433,55552&place_id=14&verifiable=true&spam=false&per_page=24&view=observations_observations&subview=graph&graphs_category=12&graphs_group_by=species
