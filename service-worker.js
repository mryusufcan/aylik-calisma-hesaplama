const CACHE = "worktime-v2";

const FILES = [

"./",
"index.html",
"style.css",
"app.js",
"calendar.js",
"storage.js",
"holidays.js",
"charts.js",
"manifest.json"

];

self.addEventListener("install", e => {

    self.skipWaiting();

    e.waitUntil(

        caches.open(CACHE)
            .then(c => c.addAll(FILES))

    );

});

self.addEventListener("activate", e => {

    e.waitUntil(

        caches.keys().then(keys =>

            Promise.all(
                keys
                    .filter(key => key !== CACHE)
                    .map(key => caches.delete(key))
            )

        ).then(() => self.clients.claim())

    );

});

self.addEventListener("fetch", e => {

    e.respondWith(

        caches.match(e.request)
            .then(r => r || fetch(e.request))
            .catch(() => caches.match("index.html"))

    );

});
