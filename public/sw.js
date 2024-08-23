const cacheName = "thingmaker-cache4"
const assets = [
  "/",
  "/minekhan",
  "/minekhan/",
  "/minekhan/favicon.ico",
  "/minekhan/maps.json",
  "/minekhan/features.js",
  "/particleLife",
  "/particleLife/",
  "/grapher",
  "/grapher/",
  "/grapher/math.js",
  "/grapher/script.js",
  "/favicon.ico",
  "/style.css",
  "/platformer",
  "/platformer/",
  "/minekhan/Monocraft.ttf",
  "/code%20editor/pythoninterpreter.html",
  "/minekhan/assets/sounds.epk",
]

function canCache(url) {
	return url.startsWith(location.origin) && assets.includes(url.replace(location.origin,'')) ||
    url.startsWith(location.origin+"/minekhan/assets/images/") && !url.endsWith("/") ||
    url.startsWith(location.origin+"/minekhan/assets/lang/") && !url.endsWith("/") ||
    url.startsWith(location.origin+"/assets/")
}
function cacheForever(url){
  return false
}

importScripts("/assets/localforage.js")

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
    let url = event.request.url
    let cache = await caches.open(cacheName)
    if(cacheForever(url)){
      let cacheres = await caches.match(event.request)
      if(cacheres) return cacheres
    }
    let fetchRes = await fetch(event.request)
    if (fetchRes.ok) {
      cache.put(event.request, fetchRes.clone())
    }
    return fetchRes
  })())
})

self.addEventListener('push', async event => {
  const data = event.data.json();

  if(data.type === "notif"){
    self.registration.showNotification("", {
      body: data.msg,
      actions:data.actions
    });
  }else if(data.type === "resetNotifs"){
    localforage.removeItem("notifs")
  }
  console.log("Message recieved:",data)
});
self.addEventListener("pushsubscriptionchange", async e => {
  localforage.removeItem("notifs")
})
function doAction(a){
  if(a.startsWith("open:")) clients.openWindow(a.replace("open:",""))
  else return false
  return true
}
self.addEventListener('notificationclick', e => {
  if(e.notification.actions.length){
    e.notification.close();
    if(!doAction(e.action)){
      doAction(e.notification.actions[0].action)
    }
  }
})