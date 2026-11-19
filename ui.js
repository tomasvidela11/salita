// Piezas de interfaz reutilizables y utilidades (fechas, fotos, avisos flotantes).
import { html, useState, useEffect } from './preact.js';
import { CASITA } from './dibujos.js';

export const ir = destino => {
  if (location.hash !== destino) location.hash = destino;
};

function useOyente(conjunto) {
  const [, forzar] = useState(0);
  useEffect(() => {
    const f = () => forzar(x => x + 1);
    conjunto.add(f);
    return () => conjunto.delete(f);
  }, []);
}

// ---------- Avisos flotantes ----------
let toasts = [];
let contadorToasts = 0;
const oyentesToast = new Set();
const refrescarToasts = () => oyentesToast.forEach(f => f());

export function avisar(texto, tipo = 'info', conSonido = false) {
  const id = ++contadorToasts;
  toasts = [...toasts.slice(-2), { id, texto, tipo }];
  refrescarToasts();
  if (conSonido) {
    campanita();
    try { if (navigator.userActivation?.hasBeenActive) navigator.vibrate?.(80); } catch {}
  }
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    refrescarToasts();
  }, tipo === 'error' ? 5500 : 4000);
}

export function Toasts() {
  useOyente(oyentesToast);
  const cerrar = id => {
    toasts = toasts.filter(t => t.id !== id);
    refrescarToasts();
  };
  return html`<div class="toasts" aria-live="polite">
    ${toasts.map(t => html`<div key=${t.id} class=${'toast toast-' + t.tipo} onClick=${() => cerrar(t.id)}>${t.texto}</div>`)}
  </div>`;
}

// ---------- Ventana de confirmación ----------
let pregunta = null;
const oyentesPregunta = new Set();

export function confirmar(opciones) {
  return new Promise(resolver => {
    pregunta = { si: 'Sí', no: 'Cancelar', ...opciones, resolver };
    oyentesPregunta.forEach(f => f());
  });
}

export function Confirmacion() {
  useOyente(oyentesPregunta);
  if (!pregunta) return null;
  const responder = valor => {
    const p = pregunta;
    pregunta = null;
    oyentesPregunta.forEach(f => f());
    p.resolver(valor);
  };
  return html`<div class="velo" onClick=${e => e.target === e.currentTarget && responder(false)}>
    <div class="modal" role="dialog" aria-modal="true">
      <h3>${pregunta.titulo}</h3>
      ${pregunta.texto && html`<p>${pregunta.texto}</p>`}
      <div class="acciones">
        <button class=${'btn btn-grande ' + (pregunta.peligro ? 'btn-rojo' : 'btn-primario')} onClick=${() => responder(true)}>${pregunta.si}</button>
        <button class="btn btn-grande btn-secundario" onClick=${() => responder(false)}>${pregunta.no}</button>
      </div>
    </div>
  </div>`;
}

// ---------- Sonidito de notificación (sin archivos de audio) ----------
let audio = null;
function prepararAudio() {
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
  } catch {}
}
['pointerdown', 'touchend', 'click'].forEach(ev => addEventListener(ev, prepararAudio, { passive: true }));

function campanita() {
  if (!audio || audio.state !== 'running') return;
  const t = audio.currentTime;
  [[784, 0], [1175, 0.13]].forEach(([frecuencia, demora]) => {
    const osc = audio.createOscillator();
    const vol = audio.createGain();
    osc.type = 'sine';
    osc.frequency.value = frecuencia;
    vol.gain.setValueAtTime(0.0001, t + demora);
    vol.gain.exponentialRampToValueAtTime(0.18, t + demora + 0.02);
    vol.gain.exponentialRampToValueAtTime(0.0001, t + demora + 0.6);
    osc.connect(vol).connect(audio.destination);
    osc.start(t + demora);
    osc.stop(t + demora + 0.65);
  });
}

// ---------- Estructura de pantalla ----------
export function Logo({ subtitulo }) {
  return html`<div class="logo">
    <img src=${CASITA} alt="" width="36" height="36" />
    <span class="logo-texto">Salita<span class="punto">.</span></span>
    ${subtitulo && html`<span class="logo-sub">${subtitulo}</span>`}
  </div>`;
}

export function Pantalla({ titulo, volver, logo, subtitulo, derecha, nav, pie, children }) {
  return html`<div class="pantalla">
    <header class="encabezado">
      ${volver && html`<button class="btn-volver" onClick=${() => ir(volver)}><b>‹</b> Volver</button>`}
      ${logo ? html`<${Logo} subtitulo=${subtitulo} />` : html`<h1 class="titulo-pantalla">${titulo}</h1>`}
      ${derecha && html`<div class="encabezado-derecha">${derecha}</div>`}
    </header>
    <main class="contenido">${children}</main>
    ${pie && html`<div class="pie">${pie}</div>`}
    ${nav}
  </div>`;
}

export function BarraInferior({ items, activa }) {
  return html`<nav class="barra-inferior">
    ${items.map(it => html`<button key=${it.id} class=${it.id === activa ? 'activa' : ''} onClick=${() => ir(it.ruta)}>
      <span class="icono">${it.icono}</span>
      <span>${it.texto}</span>
      ${it.insignia > 0 && html`<span class="insignia">${it.insignia}</span>`}
    </button>`)}
  </nav>`;
}

export const Vacio = ({ emoji, children }) => html`<div class="vacio"><span>${emoji}</span><p>${children}</p></div>`;

// ---------- Fechas ----------
const fmtHora = new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
const fmtDia = new Intl.DateTimeFormat('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });

export function cuando(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);
  const hora = fmtHora.format(d);
  if (d.toDateString() === hoy.toDateString()) return `Hoy ${hora} hs`;
  if (d.toDateString() === ayer.toDateString()) return `Ayer ${hora} hs`;
  return `${fmtDia.format(d)} · ${hora} hs`;
}

export function fechaEvento(iso) {
  const [a, m, d] = (iso || '').split('-').map(Number);
  const f = new Date(a, (m || 1) - 1, d || 1);
  return {
    dia: d,
    mes: f.toLocaleDateString('es-AR', { month: 'short' }).replace('.', '').toUpperCase(),
    semana: f.toLocaleDateString('es-AR', { weekday: 'long' }),
  };
}

// ---------- Textos ----------
export const normalizar = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// ---------- Fotos: se achican en el celular para guardarlas livianas ----------
export async function comprimirImagen(archivo, ladoMaximo = 1000) {
  const url = URL.createObjectURL(archivo);
  try {
    const img = await new Promise((ok, mal) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = mal;
      i.src = url;
    });
    const escala = Math.min(1, ladoMaximo / Math.max(img.naturalWidth, img.naturalHeight));
    const lienzo = document.createElement('canvas');
    lienzo.width = Math.round(img.naturalWidth * escala);
    lienzo.height = Math.round(img.naturalHeight * escala);
    lienzo.getContext('2d').drawImage(img, 0, 0, lienzo.width, lienzo.height);
    let calidad = 0.75;
    let datos = lienzo.toDataURL('image/jpeg', calidad);
    while (datos.length > 600000 && calidad > 0.35) {
      calidad -= 0.1;
      datos = lienzo.toDataURL('image/jpeg', calidad);
    }
    return datos;
  } finally {
    URL.revokeObjectURL(url);
  }
}
