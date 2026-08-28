// RF Reciclagem 2 — Service Worker
// Versão do cache: incrementar aqui ao atualizar o app
const CACHE_NAME = 'rf-reciclagem-2-v1';

// Todos os arquivos necessários para funcionar offline
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// INSTALL: faz cache de todos os arquivos
self.addEventListener('install', event => {
  console.log('[SW] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Cacheando arquivos');
      return cache.addAll(FILES_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// ACTIVATE: remove caches antigos
self.addEventListener('activate', event => {
  console.log('[SW] Ativando...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] Removendo cache antigo:', k);
          return caches.delete(k);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// FETCH: serve do cache, fallback para rede
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        return cached;
      }
      return fetch(event.request).then(response => {
        // Cachear novas respostas válidas
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline e não está no cache
        return caches.match('./index.html');
      });
    })
  );
});
