/* The Long Way Home is public now (no code). On a device that unlocked the preview, this takes over from the preview's
   worker: it deletes the preview's copy of the game, sends an open preview page to the public game (or the store TV's
   board to its new home), and steps aside. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  // unregister first: the pages it still controls keep it until they move on, and nothing waits on their navigation
  const scope = self.registration.scope, app = new URL('app/', scope).pathname;
  try { await caches.delete('ltwh-game'); } catch (err) {}
  try { await self.registration.unregister(); } catch (err) {}
  // index.html, not game/ itself: the browser may still hold the preview's gate for game/ in its HTTP cache (max-age)
  for (const c of await self.clients.matchAll({ type: 'window' })) {
    const p = new URL(c.url).pathname;
    if (p.startsWith(app)) c.navigate(new URL(p.endsWith('scores/board.html') ? 'board/' : 'index.html', scope).href).catch(() => {});
  }
})()));
