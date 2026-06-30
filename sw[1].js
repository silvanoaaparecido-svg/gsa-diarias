// GSA Diárias — Service Worker v5
const CACHE = 'gsa-v5';
const ASSETS = [
  './',
  './index.html'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Só intercepta GETs da mesma origem
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(resp => {
        if (resp.ok) {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => cached);
      return cached || network;
    })
  );
});

// Notificações agendadas via mensagem do app
self.addEventListener('message', e => {
  if (e.data && e.data.tipo === 'agendar-notif') {
    const { titulo, corpo, ms } = e.data;
    setTimeout(() => {
      self.registration.showNotification(titulo, {
        body: corpo,
        icon: './icon-192.png',
        badge: './icon-192.png',
        vibrate: [200, 100, 200],
        tag: 'gsa-ponto',
        renotify: true
      });
    }, ms);
  }
});
