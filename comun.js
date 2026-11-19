// Piezas que usan los tres roles: perfil, chat, estado del horario, cambio de rol, eventos.
import { html, useEffect, useRef, useState } from './preact.js';
import { store, horarioActivo, acciones, intentar } from './estado.js';
import { Pantalla, ir, confirmar, cuando, fechaEvento } from './ui.js';
import { ROLES, SALA } from './datos.js';

// ---------- Rol elegido (queda guardado en el dispositivo) ----------
const CLAVE_ROL = 'salita-rol';

export function rolGuardado() {
  try { return localStorage.getItem(CLAVE_ROL); } catch { return null; }
}

export function elegirRol(id) {
  try { localStorage.setItem(CLAVE_ROL, id); } catch {}
  ir(ROLES[id].inicio);
}

export function cambiarRol() {
  try { localStorage.removeItem(CLAVE_ROL); } catch {}
  store.rol = null;
  ir('#/');
}

export async function cambiarRolConConfirmacion() {
  const ok = await confirmar({
    titulo: '¿Cambiar de rol?',
    texto: 'Vas a volver a la pantalla para elegir con qué perfil entrar.',
    si: 'Sí, cambiar de rol',
  });
  if (ok) cambiarRol();
}

export const BotonSalir = () => html`<button class="btn-salir" onClick=${cambiarRolConConfirmacion}>🚪 Cambiar rol</button>`;

// ---------- Horario de atención ----------
export function EstadoHorario({ rol }) {
  const activo = horarioActivo();
  const texto = rol === 'familia'
    ? (activo ? '🟢 La Seño Belén está recibiendo consultas (13:00 a 17:00 hs)' : '🔒 Fuera de horario: la seño no recibe consultas ahora')
    : (activo ? '🟢 Horario escolar activo: las familias pueden escribirte' : '🔒 Fuera de horario: las consultas quedan en espera');
  return html`<div class=${'estado-horario ' + (activo ? 'on' : 'off')}>${texto}</div>`;
}

// ---------- Chat de consultas ----------
export function Chat({ mensajes, yo, vacio, etiqueta }) {
  const fin = useRef(null);
  useEffect(() => { fin.current?.scrollIntoView({ block: 'end' }); }, [mensajes.length]);
  if (!mensajes.length) return html`<div class="vacio"><span>💬</span><p>${vacio}</p></div>`;
  return html`<div class="chat">
    ${mensajes.map(m => {
      const extra = etiqueta?.(m);
      return html`<div key=${m.id} class=${'burbuja ' + (m.autor === yo ? 'mia' : 'otra') + (m.enEspera ? ' espera' : '')}>
        <p>${m.texto}</p>
        <span class="meta">${cuando(m.ts)}${extra ? ' · ' + extra : ''}</span>
      </div>`;
    })}
    <div ref=${fin}></div>
  </div>`;
}

export function BarraEscribir({ placeholder, textoBoton, claseBoton = 'btn-primario', alEnviar }) {
  const [texto, setTexto] = useState('');
  const enviar = () => {
    const t = texto.trim();
    if (!t) return;
    alEnviar(t);
    setTexto('');
  };
  const teclado = e => {
    // En la compu, Enter envía (Shift+Enter hace un renglón nuevo)
    if (e.key === 'Enter' && !e.shiftKey && matchMedia('(pointer: fine)').matches) {
      e.preventDefault();
      enviar();
    }
  };
  return html`<div class="barra-escribir">
    <textarea rows=${Math.min(4, texto.split('\n').length)} placeholder=${placeholder} value=${texto}
      onInput=${e => setTexto(e.target.value)} onKeyDown=${teclado} maxlength="500"></textarea>
    <button class=${'btn ' + claseBoton} disabled=${!texto.trim()} onClick=${enviar}>${textoBoton}</button>
  </div>`;
}

// ---------- Eventos y fechas ----------
export function ListaEventos({ alBorrar }) {
  const eventos = store.datos.eventos;
  if (!eventos.length) return html`<p class="sin-datos">No hay fechas cargadas.</p>`;
  return html`<ul class="eventos">
    ${eventos.map(ev => {
      const f = fechaEvento(ev.fecha);
      return html`<li key=${ev.id} class="evento">
        <span class="evento-fecha"><strong>${f.dia}</strong><small>${f.mes}</small></span>
        <span class="evento-titulo">${ev.titulo}<small>${f.semana}</small></span>
        ${alBorrar && html`<button class="btn-borrar" aria-label="Borrar fecha" onClick=${() => alBorrar(ev)}>🗑️</button>`}
      </li>`;
    })}
  </ul>`;
}

// ---------- Perfil ----------
export function Perfil({ rol, nav }) {
  const r = ROLES[rol];
  const reiniciar = async () => {
    const ok = await confirmar({
      titulo: '¿Reiniciar la demo?',
      texto: 'Se borran los mensajes, pedidos, reportes y actividades que se cargaron en las pruebas, y todo vuelve a los datos de ejemplo. Afecta a todos los celulares que estén usando la app.',
      si: 'Sí, reiniciar todo',
      peligro: true,
    });
    if (ok) intentar(acciones.reiniciarDemo(), 'No se pudo reiniciar. Revisá la conexión a internet.');
  };
  return html`<${Pantalla} titulo="Mi perfil" nav=${nav}>
    <section class="perfil-cabecera">
      <div class="perfil-avatar">${r.emoji}</div>
      <h2>${r.nombre}</h2>
      <p>${rol === 'direccion' ? 'Jardín de Infantes' : SALA}</p>
      <span class=${'conexion ' + store.modo}>
        ${store.modo === 'firebase' ? '🟢 Conectado en tiempo real' : '⚠️ Modo prueba local (sin conexión entre celulares)'}
      </span>
    </section>
    <button class="btn btn-primario btn-grande" onClick=${cambiarRol}>🔄 Cambiar de rol</button>
    <p class="ayuda">Volvés a la pantalla de inicio para entrar como Docente, Familia o Dirección.</p>
    <section class="caja">
      <h2>📲 Instalarla como app</h2>
      <p class="parrafo"><strong>iPhone:</strong> abrí el link en Safari, tocá el botón Compartir (el cuadrado con la flechita ⬆️) y elegí <em>"Agregar a pantalla de inicio"</em>.</p>
      <p class="parrafo"><strong>Android:</strong> abrí el link en Chrome, tocá el menú <strong>⋮</strong> y elegí <em>"Instalar aplicación"</em> o <em>"Agregar a pantalla principal"</em>.</p>
    </section>
    <a class="btn btn-secundario btn-grande" href="guia.html" target="_blank" rel="noopener">📄 Ver la guía para probar la app</a>
    <section class="caja caja-peligro">
      <h2>♻️ Reiniciar la demo</h2>
      <p class="parrafo">Borra todo lo que se cargó en las pruebas y vuelve a los datos de ejemplo. Conviene usarlo justo antes de presentar.</p>
      <button class="btn btn-contorno-rojo btn-grande" onClick=${reiniciar}>Reiniciar demo</button>
    </section>
  <//>`;
}
