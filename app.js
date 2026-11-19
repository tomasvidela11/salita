// Punto de entrada: navegación entre pantallas y selector de rol (Pantalla 0).
import { html, render, useState, useEffect } from './preact.js';
import { store, suscribir, iniciar } from './estado.js';
import { Toasts, Confirmacion, Logo } from './ui.js';
import { ROLES, SALA } from './datos.js';
import { rolGuardado, elegirRol } from './comun.js';
import { CASITA } from './dibujos.js';
import { PantallasDocente } from './docente.js';
import { PantallasFamilia } from './familia.js';
import { PantallasDireccion } from './direccion.js';

const PANTALLAS = { docente: PantallasDocente, familia: PantallasFamilia, direccion: PantallasDireccion };

// "#/docente/gestion?pedir=plasticola" → { partes: ['docente', 'gestion'], query: { pedir: 'plasticola' } }
function leerRuta() {
  const [camino, consulta = ''] = (location.hash || '#/').replace(/^#\/?/, '').split('?');
  return {
    clave: location.hash,
    partes: camino.split('/').filter(Boolean),
    query: Object.fromEntries(new URLSearchParams(consulta)),
  };
}

// ---------- Pantalla 0: selector de rol ----------
function SelectorRol() {
  return html`<div class="pantalla selector">
    <main class="contenido">
      <div class="selector-marca">
        <img src=${CASITA} alt="" width="96" height="96" />
        <div class="selector-logo">Salita<span class="punto">.</span></div>
      </div>
      <p class="selector-sub">Seleccioná tu perfil para ingresar a <strong>${SALA}</strong></p>
      <div class="roles">
        ${Object.values(ROLES).map(r => html`<button key=${r.id} class=${'tarjeta-rol ' + r.id} onClick=${() => elegirRol(r.id)}>
          <span class="rol-emoji">${r.emoji}</span>
          <span class="rol-textos"><strong>${r.titulo}</strong><small>Ingresa como: ${r.nombre}</small></span>
          <span class="flecha">›</span>
        </button>`)}
      </div>
      <a class="link-guia" href="guia.html" target="_blank" rel="noopener">📄 ¿Primera vez? Mirá la guía para probarla</a>
      ${store.modo === 'local' && html`<p class="aviso-local">
        ⚠️ Modo prueba local: todavía no está conectada la base de datos, así que los cambios no viajan entre celulares.
      </p>`}
      <p class="pie-selector">Demo · Proyecto escolar</p>
    </main>
  </div>`;
}

function Cargando() {
  const [lento, setLento] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLento(true), 9000);
    return () => clearTimeout(t);
  }, []);
  return html`<div class="arranque">
    <${Logo} />
    <div class="ruedita"></div>
    <p>Conectando…</p>
    ${lento && html`<p class="ayuda">Está tardando más de lo normal. Revisá que haya internet.</p>`}
  </div>`;
}

function Problema({ texto }) {
  return html`<div class="arranque">
    <${Logo} />
    <p class="problema">😕 ${texto}</p>
    <button class="btn btn-primario" onClick=${() => location.reload()}>Reintentar</button>
  </div>`;
}

function App() {
  const [, forzar] = useState(0);
  const [ruta, setRuta] = useState(leerRuta);
  useEffect(() => {
    const quitar = suscribir(() => forzar(x => x + 1));
    forzar(x => x + 1); // por si los datos llegaron antes de suscribirse
    return quitar;
  }, []);
  useEffect(() => {
    const f = () => setRuta(leerRuta());
    addEventListener('hashchange', f);
    return () => removeEventListener('hashchange', f);
  }, []);

  // La ruta manda: así se pueden abrir dos roles distintos en dos pestañas de la misma compu.
  const rol = ROLES[ruta.partes[0]] ? ruta.partes[0] : null;
  const guardado = ROLES[rolGuardado()] ? rolGuardado() : null;
  store.rol = rol;

  // Si ya eligió un rol antes, entra directo a ese rol
  useEffect(() => {
    if (!rol && guardado) location.replace(ROLES[guardado].inicio);
  }, [rol, guardado]);

  let contenido = null;
  if (!rol) {
    if (!guardado) contenido = html`<${SelectorRol} />`;
  } else if (store.error) {
    contenido = html`<${Problema} texto=${store.error} />`;
  } else if (!store.listo) {
    contenido = html`<${Cargando} />`;
  } else {
    const Pantallas = PANTALLAS[rol];
    contenido = html`<${Pantallas} key=${ruta.clave} partes=${ruta.partes} query=${ruta.query} />`;
  }

  return html`<div class="raiz">
    ${store.modo === 'local' && rol && html`<div class="franja-local">⚠️ Modo prueba local: los cambios no viajan entre celulares</div>`}
    ${contenido}
    <${Toasts} />
    <${Confirmacion} />
  </div>`;
}

const raiz = document.getElementById('app');
raiz.innerHTML = '';
render(html`<${App} />`, raiz);
window.salitaLista = true;
iniciar();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
