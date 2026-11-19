// Rol 3: Dirección del Jardín
import { html, useState } from './preact.js';
import { store, acciones, intentar, horarioActivo, ultimoAviso, sinLeer } from './estado.js';
import { Pantalla, BarraInferior, Vacio, avisar, confirmar, cuando } from './ui.js';
import { PLANTILLAS_DIRECCION, nombresMateriales, fechaISO } from './datos.js';
import { Perfil, BotonSalir, ListaEventos } from './comun.js';

const nav = activa => html`<${BarraInferior} activa=${activa} items=${[
  { id: 'panel', icono: '📊', texto: 'Panel General', ruta: '#/direccion', insignia: sinLeer.direccion() },
  { id: 'avisos', icono: '📢', texto: 'Avisos a Docentes', ruta: '#/direccion/avisos' },
  { id: 'perfil', icono: '👤', texto: 'Perfil', ruta: '#/direccion/perfil' },
]} />`;

export function PantallasDireccion({ partes }) {
  const seccion = partes[1];
  if (seccion === 'avisos') return html`<${AvisosDocentes} />`;
  if (seccion === 'perfil') return html`<${Perfil} rol="direccion" nav=${nav('perfil')} />`;
  return html`<${Panel} />`;
}

const estadoAviso = a => (a.leidoDocente ? '✔️ Leído por Seño Belén' : '⏳ Todavía sin leer');

function RedactarAviso({ conPlantillas }) {
  const [texto, setTexto] = useState('');
  const enviar = () => {
    const t = texto.trim();
    if (!t) return;
    intentar(acciones.enviarAviso(t));
    setTexto('');
    avisar('📢 Aviso enviado a todas las docentes');
  };
  return html`<div class="redactar">
    ${conPlantillas && html`<div class="plantillas">
      ${PLANTILLAS_DIRECCION.map(p => html`<button key=${p} class="chip plantilla" onClick=${() => setTexto(p)}>${p}</button>`)}
    </div>`}
    <textarea rows="3" placeholder="Escribí un aviso para todas las docentes…" value=${texto} onInput=${e => setTexto(e.target.value)} maxlength="300"></textarea>
    <button class="btn btn-azul btn-grande" disabled=${!texto.trim()} onClick=${enviar}>📢 Enviar a todas las docentes</button>
  </div>`;
}

// ---------- 3.0 Panel de control ----------
function Panel() {
  const pendientes = store.datos.stock.filter(s => s.estado === 'pendiente');
  const reportes = store.datos.reportes.slice(0, 6);
  const reportesNuevos = store.datos.reportes.filter(r => !r.visto).length;
  const aviso = ultimoAviso();
  const activo = horarioActivo();

  const repuesto = s => {
    intentar(acciones.marcarRepuesto(s.id));
    avisar('✅ Listo: la seño ya ve que repusiste el material');
  };

  return html`<${Pantalla} logo subtitulo="Panel de Dirección" derecha=${html`<${BotonSalir} />`} nav=${nav('panel')}>
    <section class="estadisticas">
      <div class="estadistica">
        <strong>🏫 1</strong><span>sala activa</span>
        <small>Sala Roja · ${activo ? '🟢 en horario' : '🔒 fuera de horario'}</small>
      </div>
      <div class=${'estadistica ' + (pendientes.length ? 'alerta' : '')}>
        <strong>⚠️ ${pendientes.length}</strong><span>${pendientes.length === 1 ? 'pedido de stock' : 'pedidos de stock'}</span>
      </div>
      <div class=${'estadistica ' + (reportesNuevos ? 'alerta-naranja' : '')}>
        <strong>📝 ${reportesNuevos}</strong><span>${reportesNuevos === 1 ? 'reporte nuevo' : 'reportes nuevos'}</span>
      </div>
    </section>

    <section class="caja roja">
      <h2>⚠️ Alertas de Stock del Mueble</h2>
      ${pendientes.length === 0
        ? html`<p class="sin-datos">Sin pedidos pendientes 🎉</p>`
        : pendientes.map(s => html`<div key=${s.id} class="item-alerta">
            <p><strong>${s.sala || 'Sala Roja'}</strong> - Solicita reposición de ${nombresMateriales(s.materiales)}</p>
            <small>${cuando(s.ts)}</small>
            <button class="btn btn-verde btn-grande" onClick=${() => repuesto(s)}>✅ Marcar como repuesto / aprobado</button>
          </div>`)}
    </section>

    <section class="caja naranja">
      <h2>📝 Reportes de Sala / Novedades</h2>
      ${reportes.length === 0
        ? html`<p class="sin-datos">Sin novedades de las salas.</p>`
        : reportes.map(r => html`<div key=${r.id} class=${'item-reporte ' + (r.visto ? 'visto' : '')}>
            <p><strong>${r.sala || 'Sala Roja'}:</strong> ${(r.problemas || []).join(' y ') || 'Novedad'}</p>
            ${r.nota && html`<p class="nota">"${r.nota}"</p>`}
            <div class="item-pie">
              <small>${cuando(r.ts)}</small>
              ${r.visto
                ? html`<span class="leido-ok">✔️ Visto</span>`
                : html`<button class="btn btn-naranja btn-chico" onClick=${() => intentar(acciones.marcarReporteVisto(r.id))}>👀 Marcar como visto</button>`}
            </div>
          </div>`)}
    </section>

    <section class="caja azul">
      <h2>📢 Panel de Comunicados Generales</h2>
      <p class="parrafo">Escribí un aviso de último momento: les aparece al instante a todas las docentes.</p>
      <${RedactarAviso} />
      ${aviso && html`<div class="ultimo-aviso">
        <small>Último aviso enviado · ${cuando(aviso.ts)}</small>
        <p>${aviso.texto}</p>
        <span class=${'estado-aviso ' + (aviso.leidoDocente ? 'ok' : '')}>${estadoAviso(aviso)}</span>
      </div>`}
    </section>
  <//>`;
}

// ---------- Avisos a docentes y fechas ----------
function AvisosDocentes() {
  const avisos = store.datos.avisosDireccion;
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState(() => fechaISO(Date.now() + 7 * 86400000));

  const agregar = () => {
    const t = titulo.trim();
    if (!t || !fecha) return;
    intentar(acciones.agregarEvento(t, fecha));
    setTitulo('');
    avisar('📅 Fecha agregada: ya la ven las docentes');
  };
  const borrar = async ev => {
    const ok = await confirmar({ titulo: '¿Borrar esta fecha?', texto: ev.titulo, si: 'Sí, borrar', peligro: true });
    if (ok) intentar(acciones.borrarEvento(ev.id));
  };

  return html`<${Pantalla} titulo="Avisos a Docentes" nav=${nav('avisos')}>
    <section class="caja azul">
      <h2>📢 Nuevo aviso para docentes</h2>
      <${RedactarAviso} conPlantillas />
    </section>

    <h2 class="titulo-seccion">🗂️ Avisos enviados</h2>
    ${avisos.length === 0
      ? html`<${Vacio} emoji="📭">Todavía no enviaste avisos.<//>`
      : avisos.map(a => html`<article key=${a.id} class="caja item-aviso">
          <p>${a.texto}</p>
          <div class="item-pie">
            <small>${cuando(a.ts)}</small>
            <span class=${'estado-aviso ' + (a.leidoDocente ? 'ok' : '')}>${estadoAviso(a)}</span>
          </div>
        </article>`)}

    <section class="caja verde">
      <h2>📅 Eventos & Fechas</h2>
      <p class="parrafo">Las fechas que cargues aparecen en la Gestión Interna de las docentes.</p>
      <div class="form-fecha">
        <input type="text" placeholder="Ej: Acto de fin de año" value=${titulo} onInput=${e => setTitulo(e.target.value)} maxlength="100" />
        <input type="date" value=${fecha} onInput=${e => setFecha(e.target.value)} />
        <button class="btn btn-verde btn-grande" disabled=${!titulo.trim() || !fecha} onClick=${agregar}>➕ Agregar fecha</button>
      </div>
      <${ListaEventos} alBorrar=${borrar} />
    </section>
  <//>`;
}
