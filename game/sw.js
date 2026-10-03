/* The Long Way Home preview: the gate (index.html) decrypts the game into Cache Storage on this device; this worker
   serves it under app/, so the game runs unchanged. Anything not unlocked yet goes back to the gate. */
const CACHE = 'ltwh-game';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url), app = new URL('app/', self.registration.scope);
  if (u.origin !== app.origin || !u.pathname.startsWith(app.pathname)) return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    if (e.request.mode === 'navigate') {      // opening the game: if a newer build is out, back through the gate to get it
      try {
        const r = await fetch(new URL('bundle.json', self.registration.scope).href, { cache: 'no-cache' });
        if (r.ok) {
          const M = await r.json(), have = await c.match(new URL('app/__v', self.registration.scope).href);
          if (!have || (await have.text()) !== M.v) return Response.redirect(self.registration.scope, 302);
        }
      } catch (err) { /* offline: play the build that's here */ }
    }
    const hit = await c.match(new URL(u.pathname.endsWith('/') ? u.pathname + 'index.html' : u.pathname, u.origin).href);
    if (hit) return hit;
    if (e.request.mode === 'navigate') return Response.redirect(self.registration.scope, 302);
    return new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain' } });
  })());
});
