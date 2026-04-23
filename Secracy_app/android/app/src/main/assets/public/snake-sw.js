const CACHE_NAME = "secracy-snake-v1";
const APP_SHELL = [
    "./",
    "./index.html",
    "./snake.html",
    "./snake-game.mjs",
    "./snake-logic.mjs",
    "./snake.webmanifest",
    "./snake-icon.svg",
    "./snake-maskable.svg",
    "./vendor/bootstrap/bootstrap.min.css",
    "./vendor/bootstrap/bootstrap.bundle.min.js"
];

self.addEventListener("install", (event) => {
    event.waitUntil(precache());
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(cleanOldCaches());
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(cacheFirst(event.request));
});

async function precache() {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
}

async function cleanOldCaches() {
    const keys = await caches.keys();

    await Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) {
            return caches.delete(key);
        }

        return Promise.resolve(false);
    }));
}

async function cacheFirst(request) {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
        return response;
    } catch {
        if (request.mode === "navigate") {
            return caches.match("./snake.html");
        }

        throw new Error("Offline and no cached response available.");
    }
}
