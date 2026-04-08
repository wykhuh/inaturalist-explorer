const version = 1;
const cacheName = `inat_api_cache_${version}`;
const cacheTime = 60 * 60 * 1000; // one hour

self.addEventListener("install", (ev) => {
  console.log("sw installed");
});

self.addEventListener("activate", (ev) => {
  console.log("sw activated");
  //delete old versions of the cache
  ev.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key != cacheName).map((nm) => caches.delete(nm)),
      );
    }),
  );
});

const observations_api = "https://api.inaturalist.org/v1/observations";
// set max-age Cache-Control HTTP header to 30 days
const histogram_year_api = `https://api.inaturalist.org/v1/observations/histogram?date_field=observed&interval=year&ttl=${60 * 60 * 24 * 30}`;

self.addEventListener("fetch", (ev) => {
  let url = ev.request.url;

  if (url.startsWith("https://api.inaturalist.org/v2/observations")) {
    cacheInatAPI(ev);
  } else if (url.startsWith("https://api.inaturalist.org/v1/identifications")) {
    cacheInatAPI(ev);
  } else if (/https:\/\/api.inaturalist.org\/v1\/taxa\/\d+/.test(url)) {
    cacheInatAPI(ev);
  } else if (/https:\/\/api.inaturalist.org\/v1\/places\/\d+/.test(url)) {
    cacheInatAPI(ev);
  } else if (/https:\/\/api.inaturalist.org\/v1\/projects\/\d+/.test(url)) {
    cacheInatAPI(ev);
  } else if (/https:\/\/api.inaturalist.org\/v1\/users\/\d+/.test(url)) {
    cacheInatAPI(ev);
  } else if (url.startsWith("http://localhost")) {
  } else if (url.startsWith("https://inaturalist-open-data.s3.amazonaws.com")) {
  } else if (url.startsWith("https://static.inaturalist.org")) {
  } else if (url.startsWith("https://api.inaturalist.org/v1/grid")) {
  } else if (url.includes("tile.openstreetmap.org")) {
  } else {
    // console.log("sw fetch ", url);
  }
});

async function cacheInatAPI(ev) {
  const cacheResponse = await caches.match(ev.request);

  // return cache if response timestamp is recent enough
  if (cacheResponse) {
    let timestamp = cacheResponse.headers.get("X-timestamp");
    if (timestamp && Date.now() - Number(timestamp) < cacheTime) {
      return cacheResponse;
    }
  }

  // fetch
  // console.log("++ sw fetch", ev.request.url);
  try {
    let response = await fetch(ev.request);

    // create new response and add timestamp to header
    const newHeaders = new Headers(response.headers);
    newHeaders.append("X-timestamp", Date.now().toString());
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });

    // save response to cache
    const cache = await caches.open(cacheName);
    cache.put(ev.request, newResponse.clone());

    return newResponse;
  } catch (err) {
    return new Response(null, { status: 504, statusText: "Network error" });
  }
}
