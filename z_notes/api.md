https://api.inaturalist.org/v2/observations?verifiable=true&order_by=id&order=desc&page=1&spam=false&taxon_id=71338&swlng=-2.291547859930363&swlat=-8.872015160315106&nelng=40.77485839006964&nelat=15.084883409567645&locale=en-US&per_page=24&fields=(comments_count%3A!t%2Ccreated_at%3A!t%2Ccreated_at_details%3Aall%2Ccreated_time_zone%3A!t%2Cfaves_count%3A!t%2Cgeoprivacy%3A!t%2Cid%3A!t%2Cidentifications%3A(current%3A!t)%2Cidentifications_count%3A!t%2Clocation%3A!t%2Cmappable%3A!t%2Cobscured%3A!t%2Cobserved_on%3A!t%2Cobserved_on_details%3Aall%2Cobserved_time_zone%3A!t%2Cphotos%3A(id%3A!t%2Curl%3A!t)%2Cplace_guess%3A!t%2Cprivate_geojson%3A!t%2Cquality_grade%3A!t%2Csounds%3A(id%3A!t)%2Ctaxon%3A(iconic_taxon_id%3A!t%2Cname%3A!t%2Cpreferred_common_name%3A!t%2Cpreferred_common_names%3A(name%3A!t)%2Crank%3A!t%2Crank_level%3A!t)%2Ctime_observed_at%3A!t%2Cuser%3A(icon_url%3A!t%2Cid%3A!t%2Clogin%3A!t))

{total_results: 1481, page: 1, per_page: 24,…}

==

https://api.inaturalist.org/v2/observations/species_counts?verifiable=true&spam=false&taxon_id=71338&swlng=-2.291547859930363&swlat=-8.872015160315106&nelng=40.77485839006964&nelat=15.084883409567645&locale=en-US&per_page=50&include_ancestors=true&fields=(taxon%3A(ancestor_ids%3A!t%2Cancestors%3A(default_photo%3A(square_url%3A!t)%2Ciconic_taxon_name%3A!t%2Cid%3A!t%2Cis_active%3A!t%2Cname%3A!t%2Cpreferred_common_name%3A!t%2Cpreferred_common_names%3A(name%3A!t)%2Crank%3A!t%2Crank_level%3A!t%2Cuuid%3A!t)%2Cancestry%3A!t%2Cconservation_status%3A(status%3A!t)%2Cdefault_photo%3A(attribution%3A!t%2Clicense_code%3A!t%2Cmedium_url%3A!t%2Csquare_url%3A!t%2Curl%3A!t)%2Cestablishment_means%3A(establishment_means%3A!t)%2Ciconic_taxon_name%3A!t%2Cid%3A!t%2Cis_active%3A!t%2Cname%3A!t%2Cpreferred_common_name%3A!t%2Cpreferred_common_names%3A(name%3A!t)%2Crank%3A!t%2Crank_level%3A!t))

# {total_results: 9, page: 1, per_page: 50,…}

https://api.inaturalist.org/v2/observations/identifiers?verifiable=true&spam=false&taxon_id=71338&swlng=-2.291547859930363&swlat=-8.872015160315106&nelng=40.77485839006964&nelat=15.084883409567645&locale=en-US&per_page=0&fields=(user%3A(icon_url%3A!t%2Cid%3A!t%2Clogin%3A!t%2Cname%3A!t))

{total_results: 290, page: 1, per_page: 0, results: []}

===

https://api.inaturalist.org/v2/observations/observers?verifiable=true&spam=false&taxon_id=71338&swlng=-2.291547859930363&swlat=-8.872015160315106&nelng=40.77485839006964&nelat=15.084883409567645&locale=en-US&per_page=0&fields=(user%3A(icon_url%3A!t%2Cid%3A!t%2Clogin%3A!t%2Cname%3A!t))

{"total_results":659,"page":1,"per_page":0,"results":[]}

==

https://api.inaturalist.org/v2/observations?spam=false&taxon_id=42328

```json
{
  "total_results": 9015,
  "page": 1,
  "per_page": 30,
  "results": [
    {
      "uuid": "84b68f93-dae8-4758-ac47-67dddfad7014"
    },
    {
      "uuid": "2bb739db-c5ec-4895-a7e8-42981662ae0b"
    }
  ]
}
```

https://api.inaturalist.org/v2/observations/species_counts?spam=false&taxon_id=42328

```json
{
  "total_results": 1,
  "page": 1,
  "per_page": 500,
  "results": [
    {
      "count": 9015,
      "taxon": {
        "id": 42328
      }
    }
  ]
}
```

==

red oaks

https://www.inaturalist.org/observations?subview=map&taxon_id=861036
388,309

https://www.inaturalist.org/observations?subview=map&taxon_id=861036&verifiable=any
427,726

~~

https://api.inaturalist.org/v2/observations?taxon_id=861036&verifiable=true&per_page=0
388313

https://api.inaturalist.org/v2/observations?taxon_id=861036&verifiable=true&per_page=0&spam=false
388309

https://api.inaturalist.org/v2/observations?taxon_id=861036&per_page=0
427,734

https://api.inaturalist.org/v2/observations?taxon_id=861036&per_page=0&spam=false
427,729

~~

https://api.inaturalist.org/v2/observations/species_counts?spam=false&taxon_id=861036&per_page=200&include_ancestors=true&locale=en-US
"total_results": 175,
394602

https://api.inaturalist.org/v2/observations/species_counts?spam=false&taxon_id=861036&per_page=200&include_ancestors=true
"total_results": 175,
394602

https://api.inaturalist.org/v2/observations/species_counts?spam=false&taxon_id=861036&per_page=200
"total_results": 175,
394602

https://api.inaturalist.org/v2/observations/species_counts?spam=false&taxon_id=861036&per_page=200&verifiable=true
"total_results": 172,
358059

-==

Vitest: can't fetch a local file
https://stackoverflow.com/questions/75588945/vitest-cant-fetch-a-local-file

```js
import { readFile } from "fs/promises"

const load = async (fileName: string) => {
    try {
      const yamlString = await readFile(`${__dirname}/${fileName}`, "utf8")

      const data = YAML.parse(yamlString)
      ...
    } catch (error) {
      console.error("Failed to read style config: ", error)
    }
}
```

Binary responses
https://mswjs.io/docs/http/mocking-responses/binary

```js
http.get("/images/:imageId", async ({ params }) => {
  // Get an ArrayBuffer from reading the file from disk or fetching it.
  const buffer = await fetch(`/static/images/${params.imageId}`).then(
    (response) => response.arrayBuffer(),
  );

  return HttpResponse.arrayBuffer(buffer, {
    headers: {
      "content-type": "image/png",
    },
  });
});
```

==

https://pokeapi.co/api/v2/pokemon/ditto

https://a.tile.openstreetmap.org/1/1/1.png

https://api.inaturalist.org/v1/grid/1/1/1.png

==

```js
  http.get("https://*.tile.openstreetmap.org*", () => {
    return HttpResponse.json({ id: "abc-123" });
  }),
```

====================

https://www.inaturalist.org/observations?subview=map&taxon_id=861036

& verifiable=false
39,640
OBSERVATIONS

&verifiable=true
391,425
OBSERVATIONS

&verifiable=any
431,065
OBSERVATIONS

no params
391,425
OBSERVATIONS

==

https://api.inaturalist.org/v2/observations?verifiable=true&spam=false&taxon_id=861036

& verifiable=false
39,640
OBSERVATIONS

&verifiable=true
391,425
OBSERVATIONS

no params
431,065
OBSERVATIONS

==

filters
verifiable: checked -> web app: no params, api: &verifiable=true
verifiable: unchecked -> web app: &verifiable=any, api: no params

====================
