# Salita.

Demo de una app web para comunicar a la **docente**, las **familias** y la **dirección** de un jardín
(Sala Roja - Turno Tarde). Funciona en iPhone, Android y computadora, y se puede instalar como app.

> Es una demo pública: no cargar datos reales ni fotos donde se vean caras de chicos.

## Cómo está armada

- Archivos HTML, CSS y JavaScript comunes: no hay que compilar nada, se suben tal cual.
- Se publica gratis con **GitHub Pages**.
- Los datos se guardan en **Firebase Firestore** (plan gratis) y se actualizan en tiempo real entre celulares.
- Sin Firebase configurado, la app funciona en "modo prueba local": anda, pero cada celular ve solo sus datos.

## 1. Crear la base de datos (Firebase)

1. Entrar a https://console.firebase.google.com con una cuenta de Google.
2. **Crear un proyecto** → nombre `salita-demo` → Google Analytics se puede desactivar → Crear.
3. Menú **Compilación → Firestore Database → Crear base de datos**.
   - Ubicación: `southamerica-east1 (São Paulo)`.
   - Modo: **producción**.
4. En la pestaña **Reglas**, borrar lo que hay, pegar el contenido de `firestore.rules` y tocar **Publicar**.
5. Ir a ⚙️ **Configuración del proyecto** → abajo, en "Tus apps", tocar el ícono web `</>` →
   apodo `salita` (sin marcar Hosting) → **Registrar app**.
6. Copiar el bloque `const firebaseConfig = { ... }` y pegarlo en `firebase-config.js`
   (reemplazando `null` por el objeto entre llaves).

## 2. Publicar en GitHub Pages

1. En https://github.com → **New repository** → nombre `salita` → **Public** → Create repository.
2. Tocar **uploading an existing file**, arrastrar **todos los archivos de esta carpeta** y tocar **Commit changes**.
3. **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / `(root)` → **Save**.
4. En 1 o 2 minutos queda en: `https://<usuario>.github.io/salita/`

Para actualizar la app: volver a subir los archivos que cambiaron (GitHub reemplaza los anteriores).

## 3. Antes de presentar

- Abrir la app → 👤 Perfil → **Reiniciar demo** (borra las pruebas y vuelve a los datos de ejemplo).
- La guía para las profesoras, con el código QR, está en `guia.html` (botón para imprimir incluido).

## Archivos

| Archivo | Qué tiene |
|---|---|
| `index.html`, `estilos.css` | La página y su diseño |
| `app.js` | Arranque, navegación y pantalla para elegir perfil |
| `docente.js`, `familia.js`, `direccion.js` | Las pantallas de cada rol |
| `comun.js`, `ui.js` | Piezas compartidas (perfil, chat, avisos, fechas, fotos) |
| `estado.js`, `db.js` | Datos en tiempo real y conexión con Firebase |
| `datos.js` | Textos fijos, materiales, cajones del mueble y datos de ejemplo |
| `dibujos.js`, `icono*` | Ilustraciones y logo |
| `firebase-config.js` | Configuración de Firebase (completar) |
| `firestore.rules` | Reglas de la base de datos (pegar en la consola de Firebase) |
| `guia.html` | Guía imprimible con QR para las profesoras |
| `manifest.webmanifest`, `sw.js` | Lo necesario para instalarla como app |
