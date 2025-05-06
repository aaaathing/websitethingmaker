const cacheName = "thingmaker-cache4"
const assets = [
  "/",
  "/minekhan/",
  "/minekhan/favicon.ico",
  "/minekhan/maps.json",
  "/minekhan/features.js",
  "/minekhan/manifest.json",
  "/particleLife/",
  "/grapher/",
  "/grapher/math.js",
  "/grapher/script.js",
  "/favicon.ico",
  "/style.css",
  "/platformer/",
  "/minekhan/Monocraft.ttf",
  "/code%20editor/pythoninterpreter.html",
  "/minekhan/assets/sounds.txt",
]

function canCache(url) {
	return url.startsWith(location.origin) && assets.includes(url.replace(location.origin,'')) ||
    url.startsWith(location.origin+"/minekhan/assets/images/") && !url.endsWith("/") ||
    url.startsWith(location.origin+"/minekhan/assets/lang/") && !url.endsWith("/") ||
    url.startsWith(location.origin+"/assets/")
}

self.addEventListener("install", event => {
	// Kick out the old service worker
  event.waitUntil(
    caches.open(cacheName)
    //.then(cache => cache.addAll(assets))
    .then(() => self.skipWaiting())
  )
})
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => {
    return Promise.all(keys.map(key => {
      if (key !== cacheName) {
        return caches.delete(key)
      }
    }))
  }))
})
self.addEventListener("fetch", event => {
	//if (event.request.method !== 'GET' || event.request.status >= 300) return // Use default behavior
 	if(!canCache(event.request.url)) return
  event.respondWith((async () => {
    let cache = await caches.open(cacheName)
    /*
		let url = event.request.url
    if(cacheForever(url)){
      let cacheres = await caches.match(event.request)
      if(cacheres) return cacheres
    }*/
    let fetchRes = await fetch(event.request).catch(() => ({}))
    if (fetchRes.ok) {
      cache.put(event.request, fetchRes.clone())
    }else{
			let cacheres = await caches.match(event.request)
      if(cacheres) return cacheres
		}
    return fetchRes
  })())
})