const CACHE = "gam-demo-v2";
const FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.webmanifest",
    "./assets/logo.png",
    "./assets/hero.jpg",
    "./assets/llavero.jpg",
    "./assets/galvano.jpg",
    "./assets/timbre.jpg",
    "./assets/organizador.jpg",
    "./assets/alcancia.jpg",
    "./assets/3d.jpg",
    "./assets/icon-192.png",
    "./assets/icon-512.png",
];
self.addEventListener("install", (e) => {
    e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
    self.skipWaiting();
});
self.addEventListener("activate", (e) => {
    e.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
            ),
    );
    self.clients.claim();
});
self.addEventListener("fetch", (e) => {
    if (e.request.method !== "GET" || new URL(e.request.url).origin !== self.location.origin)
        return;
    e.respondWith(
        fetch(e.request)
            .then((r) => r)
            .catch(() =>
                caches
                    .match(e.request)
                    .then((r) => r || new Response("Sin conexión", { status: 503 })),
            ),
    );
});
