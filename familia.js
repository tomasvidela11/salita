// Rol 2: Familia (Familia de Mateo)
import { html, useEffect } from './preact.js';
import { store, acciones, intentar, horarioActivo, comunicadosFamilia, leidoPorMi, sinLeer } from './estado.js';
import { Pantalla, BarraInferior, Vacio, ir, avisar, cuando } from './ui.js';
import { HIJO } from './datos.js';
import { Perfil, Chat, BarraEscribir, EstadoHorario } from './comun.js';

const nav = activa => html`<${BarraInferior} activa=${activa} items=${[
  { id: 'avisos', icono: '🏠', texto: 'Avisos', ruta: '#/familia', insignia: sinLeer.familiaAvisos() },
  { id: 'consultas', icono: '💬', texto: 'Consultas', ruta: '#/familia/consultas', insignia: sinLeer.familiaConsultas() },
  { id: 'perfil', icono: '👤', texto: 'Perfil', ruta: '#/familia/perfil' },
]} />`;

export function PantallasFamilia({ partes }) {
  const seccion = partes[1];
  if (seccion === 'consultas') return html`<${Consultas} />`;
  if (seccion === 'perfil') return html`<${Perfil} rol="familia" nav=${nav('perfil')} />`;
  return html`<${Avisos} />`;
}

// ---------- 2.0 Inicio: muro de comunicados ----------
function Avisos() {
  const lista = comunicadosFamilia();
  const consultas = store.datos.consultas;
  const ultimo = consultas[consultas.length - 1];
  const selectorHijo = html`<button class="selector-hijo" onClick=${() => avisar(`En esta demo solo está cargado ${HIJO} 🙂`)}>👦 ${HIJO} - Sala Roja ▾</button>`;

  return html`<${Pantalla} logo derecha=${selectorHijo} nav=${nav('avisos')}>
    <${EstadoHorario} rol="familia" />
    <h2 class="titulo-seccion">📌 Comunicados de la seño</h2>
    ${lista.length === 0
      ? html`<${Vacio} emoji="📭">Todavía no hay comunicados.<//>`
      : lista.map(c => {
        const leido = leidoPorMi(c);
        return html`<article key=${c.id} class=${'caja comunicado ' + (leido ? 'leido' : 'nuevo')}>
          <div class="item-cabecera">
            <span class=${'tipo ' + c.tipo}>${c.tipo === 'general' ? '📢 Aviso general' : `👦 Nota para ${HIJO}`}</span>
            ${!leido && html`<span class="punto-nuevo">Nuevo</span>`}
          </div>
          <p class="comunicado-texto">${c.texto}</p>
          <div class="comunicado-pie">
            <time>${cuando(c.ts)}</time>
            ${leido
              ? html`<span class="leido-ok">✔️ Leído</span>`
              : html`<button class="btn btn-verde btn-chico" onClick=${() => intentar(acciones.marcarComunicadoLeido(c.id))}>✔️ Marcar como leído</button>`}
          </div>
        </article>`;
      })}
    <section class="caja celeste consultas-preview">
      <h2>💬 Consultas con la Seño Belén</h2>
      ${ultimo && html`<p class="ultimo-mensaje"><strong>${ultimo.autor === 'familia' ? 'Vos' : 'Seño Belén'}:</strong> ${ultimo.texto}</p>`}
      <button class="btn btn-primario btn-grande" onClick=${() => ir('#/familia/consultas')}>Escribirle a la seño</button>
    </section>
  <//>`;
}

// ---------- 2.1 Consultas con restricción horaria ----------
function Consultas() {
  const activo = horarioActivo();
  useEffect(() => { acciones.marcarConsultasLeidas('familia'); });

  const enviar = texto => {
    intentar(acciones.enviarConsulta('familia', texto));
    if (!activo) avisar('🕓 Tu mensaje quedó en espera: le llega a la seño cuando empiece el horario.');
  };
  const etiqueta = m => {
    if (m.autor !== 'familia') return '';
    if (m.enEspera) return '🕓 En espera';
    return m.leidoDocente ? '✔️✔️ Leído' : '✔️ Entregado';
  };

  return html`<${Pantalla} titulo="Consultas a la Seño Belén" volver="#/familia" nav=${nav('consultas')}
    pie=${html`<${BarraEscribir} placeholder="Escribí tu consulta…" textoBoton=${activo ? 'Enviar mensaje' : 'Enviar 🕓'}
      claseBoton=${activo ? 'btn-primario' : 'btn-gris'} alEnviar=${enviar} />`}>
    ${activo
      ? html`<${EstadoHorario} rol="familia" />`
      : html`<div class="aviso-cerrado">
          🔒 <strong>Horario de atención finalizado</strong> (Lunes a Viernes de 13:00 a 17:00 hs). Su mensaje será recibido cuando inicie el próximo turno.
        </div>`}
    <${Chat} mensajes=${store.datos.consultas} yo="familia" vacio="Todavía no le escribiste a la seño." etiqueta=${etiqueta} />
  <//>`;
}
