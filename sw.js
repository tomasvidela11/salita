// Service worker: permite instalar la app y que abra aunque la conexión esté floja.
// Archivos propios: primero internet (así siempre se ve la última versión), si no hay, la copia guardada.
// Librerías externas (versiones fijas): primero la copia guardada.
const VERSION = 'salita-v1';
const PROPIOS = [
  './', 'index.html', 'estilos.css', 'app.js', 'preact.js', 'ui.js', 'comun.js', 'estado.js', 'db.js',
  'datos.js', 'dibujos.js', 'docente.js', 'familia.js', 'direccion.js', 'firebase-config.js',
  'manifest.webmanifest', 'icono.svg', 'icono-192.png',
];
const EXTERNOS = ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com', 'www.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(PROPIOS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(claves => Promise.all(claves.filter(c => c !== VERSION).map(c => caches.delete(c))))
      .then(() => self.clients.claim()),
  );
});

const guardar = (pedido, respuesta) => {
  if (respuesta.ok || respuesta.type === 'opaque') {
    const copia = respuesta.clone();
    caches.open(VERSION).then(c => c.put(pedido, copia));
  }
  return respuesta;
};

self.addEventListener('fetch', e => {
  const pedido = e.request;
  if (pedido.method !== 'GET') return;
  const url = new URL(pedido.url);
  if (url.origin === location.origin) {
    e.respondWith(
      fetch(pedido)
        .then(r => guardar(pedido, r))
        .catch(() => caches.match(pedido).then(r => r || caches.match('index.html'))),
    );
  } else if (EXTERNOS.includes(url.hostname)) {
    e.respondWith(caches.match(pedido).then(r => r || fetch(pedido).then(res => guardar(pedido, res))));
  }
});
