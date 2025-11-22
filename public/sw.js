// Minimal no-op service worker to avoid 404s during development
self.addEventListener("install", () => {
  self.skipWaiting();
});
self.addEventListener("activate", () => {
  self.clients.claim();
});
self.addEventListener("fetch", (event) => {
  // Intentionally do nothing — let the network handle requests.
});
