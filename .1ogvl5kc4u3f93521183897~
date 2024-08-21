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
  "/platformer/"
]
const optionalAssets = [
  ...assets,
  "/minekhan/Monocraft.ttf",
  "/code%20editor/pythoninterpreter.html",
  "/minekhan/assets/sounds.epk"
]

function canCache(url) {
	return url.startsWith("https://thingmaker.us.eu.org") && optionalAssets.includes(url.replace("https://thingmaker.us.eu.org",'')) ||
    url.startsWith("https://thingmaker.us.eu.org/minekhan/assets/images/") && !url.endsWith("/") ||
    url.startsWith("https://thingmaker.us.eu.org/minekhan/assets/lang/") && !url.endsWith("/") || url.startsWith("https://thingmaker.us.eu.org/assets/")
}
function cacheForever(url){
  return url.startsWith("https://thingmaker.us.eu.org/minekhan/assets/sounds/")
}

importScripts("/assets/localforage.js")

self.addEventListener("install", event => {
	// Kick out the old service worker
  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(assets)).then(() => self.skipWaiting())
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
  event.respondWith(
    caches.open(cacheName).then(cache => {
      let url = event.request.url
      return caches.match(event.request).then(res => {
        if(res && cacheForever(url)) return res
        return fetch(event.request).then(fetchRes => {
          if (fetchRes.ok && canCache(url)) {
            cache.put(event.request, fetchRes.clone())
          }
          return fetchRes
        }).catch(() => res)
      })
    })
  )
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