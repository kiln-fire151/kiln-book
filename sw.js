// Keeps Kiln Book available when the studio has no signal.
// Opens the saved copy instantly, then quietly fetches a fresh copy for next time.
const CACHE = "kiln-book-shell";
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./", "./index.html", "./apple-touch-icon.png"])).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => { e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(e.request, { ignoreSearch: true });
    const fresh = fetch(e.request).then(r => { if (r && r.ok) cache.put(e.request, r.clone()); return r; }).catch(() => hit);
    if (hit) { e.waitUntil(fresh); return hit; }
    return fresh;
  })());
});
