// Rol 1: Docente (Seño Belén)
import { html, useState, useEffect } from './preact.js';
import {
  store, acciones, intentar, horarioActivo, consultasDocente, enEspera, ultimoAviso, vistos, sinLeer,
} from './estado.js';
import { Pantalla, BarraInferior, Vacio, ir, avisar, cuando, normalizar, comprimirImagen } from './ui.js';
import {
  ALUMNOS, PLANTILLAS, MATERIALES, CAJONES, PROBLEMAS_SALA, TOTAL_FAMILIAS, material, nombresMateriales,
} from './datos.js';
import { Perfil, Chat, BarraEscribir, BotonSalir, EstadoHorario, ListaEventos } from './comun.js';
import { dibujo } from './dibujos.js';

const nav = activa => html`<${BarraInferior} activa=${activa} items=${[
  { id: 'inicio', icono: '🏠', texto: 'Inicio', ruta: '#/docente' },
  { id: 'mensajes', icono: '✉️', texto: 'Mensajes', ruta: '#/docente/comunicacion', insignia: sinLeer.docenteConsultas() },
  { id: 'actividades', icono: '🎨', texto: 'Actividades', ruta: '#/docente/actividades' },
  { id: 'perfil', icono: '👤', texto: 'Perfil', ruta: '#/docente/perfil' },
]} />`;

export function PantallasDocente({ partes, query }) {
  const [, seccion, sub] = partes;
  if (seccion === 'comunicacion') return html`<${Comunicacion} pestana=${sub} />`;
  if (seccion === 'actividades') {
    if (sub === 'nueva') return html`<${NuevaActividad} />`;
    if (sub) return html`<${DetalleActividad} id=${sub} />`;
    return html`<${BancoActividades} />`;
  }
  if (seccion === 'gestion') return html`<${Gestion} pedir=${query.pedir} ver=${query.ver} />`;
  if (seccion === 'perfil') return html`<${Perfil} rol="docente" nav=${nav('perfil')} />`;
  return html`<${Inicio} />`;
}

// ---------- 1.0 Inicio ----------
const TarjetaInicio = ({ color, icono, titulo, texto, ruta, insignia }) => html`
  <button class=${'tarjeta-home ' + color} onClick=${() => ir(ruta)}>
    <span class="tarjeta-icono">${icono}</span>
    <span class="tarjeta-textos"><strong>${titulo}</strong><small>${texto}</small></span>
    ${insignia > 0 ? html`<span class="insignia insignia-tarjeta">${insignia}</span>` : html`<span class="flecha">›</span>`}
  </button>`;

function Inicio() {
  const aviso = ultimoAviso();
  return html`<${Pantalla} logo derecha=${html`<${BotonSalir} />`} nav=${nav('inicio')}>
    <section class="saludo">
      <h1>¡Hola, Seño Belén! 👋</h1>
      <span class="etiqueta">Sala Roja - Turno Tarde</span>
    </section>
    ${aviso && !aviso.leidoDocente && html`
      <button class="banner-aviso" onClick=${() => ir('#/docente/gestion?ver=aviso')}>
        <span class="banner-icono">📢</span>
        <span class="banner-textos"><strong>Nuevo aviso de Dirección</strong><small>${aviso.texto}</small></span>
        <span class="flecha">›</span>
      </button>`}
    <${TarjetaInicio} color="celeste" icono="📣" titulo="Comunicación" texto="Mensajes y avisos a las familias"
      ruta="#/docente/comunicacion" insignia=${sinLeer.docenteConsultas()} />
    <${TarjetaInicio} color="amarilla" icono="📒" titulo="Banco de Actividades" texto="Planificar, guías del mueble y subir ideas 💡"
      ruta="#/docente/actividades" />
    <${TarjetaInicio} color="verde" icono="🧰" titulo="Gestión Interna" texto="Stock del mueble, estado de sala y dirección"
      ruta="#/docente/gestion" insignia=${sinLeer.docenteAviso()} />
    <${EstadoHorario} rol="docente" />
  <//>`;
}

// ---------- 1.1 Comunicación con familias ----------
function Comunicacion({ pestana }) {
  const activo = horarioActivo();
  const enConsultas = pestana === 'consultas';
  const pendientes = sinLeer.docenteConsultas();

  const cambiarHorario = () => {
    const nuevo = !activo;
    const esperando = nuevo ? enEspera().length : 0;
    intentar(acciones.cambiarHorario(nuevo));
    if (!nuevo) avisar('🔒 Horario cerrado: las consultas de las familias quedan en espera');
    else if (esperando) avisar(`🟢 Horario activo: te ${esperando === 1 ? 'llegó 1 consulta' : `llegaron ${esperando} consultas`} en espera`, 'info', true);
    else avisar('🟢 Horario activo: las familias ya pueden escribirte');
  };

  return html`<${Pantalla} titulo="Comunicación - Sala Roja" volver="#/docente" nav=${nav('mensajes')}
    pie=${enConsultas && html`<${BarraEscribir} placeholder="Escribí tu respuesta…" textoBoton="Responder"
      alEnviar=${t => intentar(acciones.enviarConsulta('docente', t))} />`}>
    <button class=${'interruptor ' + (activo ? 'on' : 'off')} role="switch" aria-checked=${activo ? 'true' : 'false'} onClick=${cambiarHorario}>
      <span class="switch"><span class="perilla"></span></span>
      <span class="interruptor-textos">
        <strong>${activo ? '🟢 Horario Escolar Activo (13:00 a 17:00 hs)' : '🔒 Fuera de Horario (Chat bloqueado para familias)'}</strong>
        <small>Tocá para ${activo ? 'cerrar' : 'abrir'} el horario de consultas</small>
      </span>
    </button>
    <div class="pestanas">
      <button class=${enConsultas ? '' : 'activa'} onClick=${() => ir('#/docente/comunicacion')}>📢 Comunicados</button>
      <button class=${enConsultas ? 'activa' : ''} onClick=${() => ir('#/docente/comunicacion/consultas')}>
        💬 Consultas${pendientes > 0 && html` <span class="insignia insignia-linea">${pendientes}</span>`}
      </button>
    </div>
    ${enConsultas
      ? html`<${ConsultasDocente} activo=${activo} />`
      : html`<${NuevoComunicado} /><${HistorialComunicados} />`}
  <//>`;
}

function NuevoComunicado() {
  const [tipo, setTipo] = useState('general');
  const [alumno, setAlumno] = useState(ALUMNOS[0]);
  const [texto, setTexto] = useState('');

  const enviar = () => {
    const t = texto.trim();
    if (!t) return;
    intentar(acciones.enviarComunicado(tipo, alumno, t));
    setTexto('');
    avisar(tipo === 'general' ? '✅ Comunicado enviado a todas las familias' : `✅ Nota enviada a la familia de ${alumno}`);
  };

  return html`<section class="caja">
    <h2>✏️ Nuevo comunicado</h2>
    <div class="selector-tipo">
      <button class=${'opcion-tipo ' + (tipo === 'general' ? 'sel' : '')} onClick=${() => setTipo('general')}>
        <span>📢</span><strong>Aviso general</strong><small>A toda la sala</small>
      </button>
      <button class=${'opcion-tipo ' + (tipo === 'individual' ? 'sel' : '')} onClick=${() => setTipo('individual')}>
        <span>👦</span><strong>Nota individual</strong><small>A un alumno</small>
      </button>
    </div>
    ${tipo === 'individual' && html`
      <p class="rotulo">¿Para quién es la nota?</p>
      <div class="chips">
        ${ALUMNOS.map(a => html`<button key=${a} class=${'chip ' + (alumno === a ? 'sel' : '')} onClick=${() => setAlumno(a)}>${a}</button>`)}
      </div>`}
    <p class="rotulo">⚡ Plantillas rápidas <small>(tocá una y se completa sola)</small></p>
    <div class="plantillas">
      ${PLANTILLAS.map(p => html`<button key=${p} class="chip plantilla" onClick=${() => setTexto(p)}>${p}</button>`)}
    </div>
    <textarea rows="3" placeholder="…o escribí tu mensaje acá" value=${texto} onInput=${e => setTexto(e.target.value)} maxlength="500"></textarea>
    <button class="btn btn-primario btn-grande" disabled=${!texto.trim()} onClick=${enviar}>📤 Enviar comunicado</button>
  </section>`;
}

function HistorialComunicados() {
  const lista = store.datos.comunicados;
  return html`<section>
    <h2 class="titulo-seccion">🗂️ Comunicados enviados</h2>
    ${lista.length === 0
      ? html`<${Vacio} emoji="📭">Todavía no enviaste comunicados.<//>`
      : lista.map(c => {
        const n = vistos(c);
        return html`<article key=${c.id} class="caja item-comunicado">
          <div class="item-cabecera">
            <span class=${'tipo ' + c.tipo}>${c.tipo === 'general' ? '📢 Aviso general' : `👦 Nota para ${c.alumno}`}</span>
            <time>${cuando(c.ts)}</time>
          </div>
          <p class="item-texto">${c.texto}</p>
          ${c.tipo === 'general'
            ? html`<div class="visto">
                <span>👀 Visto por <strong>${n}/${TOTAL_FAMILIAS}</strong> familias</span>
                <span class="barra-visto"><span style=${{ width: (n / TOTAL_FAMILIAS) * 100 + '%' }}></span></span>
              </div>`
            : html`<div class="visto">${n > 0 ? '✔️ Visto por la familia' : '⏳ La familia todavía no lo vio'}</div>`}
        </article>`;
      })}
  </section>`;
}

function ConsultasDocente({ activo }) {
  const mensajes = consultasDocente();
  const esperando = enEspera().length;
  useEffect(() => { acciones.marcarConsultasLeidas('docente'); });
  return html`
    <div class="conversacion-cabecera">
      <span class="avatar">👨‍👩‍👧</span>
      <div><strong>Familia de Mateo</strong><small>Consultas privadas</small></div>
    </div>
    ${!activo && html`<div class="aviso-cerrado">
      🔒 Estás fuera de horario. Las consultas nuevas quedan en espera y las vas a ver cuando actives el horario.
      ${esperando > 0 && html` <strong>(${esperando} en espera)</strong>`}
    </div>`}
    <${Chat} mensajes=${mensajes} yo="docente" vacio="Todavía no hay consultas de las familias."
      etiqueta=${m => (m.autor === 'docente' ? (m.leidoFamilia ? '✔️✔️ Leído' : '✔️ Enviado') : '')} />`;
}

// ---------- 1.2 Banco de actividades ----------
function BancoActividades() {
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('todo');
  const q = normalizar(busqueda.trim());
  const lista = store.datos.actividades.filter(a =>
    (filtro === 'todo' || (a.materiales || []).includes(filtro)) &&
    (!q || normalizar(`${a.titulo} ${a.descripcion || ''} ${(a.pasos || []).join(' ')}`).includes(q)));

  return html`<${Pantalla} titulo="Banco de Actividades" volver="#/docente" nav=${nav('actividades')}>
    <button class="btn btn-primario btn-grande" onClick=${() => ir('#/docente/actividades/nueva')}>➕ Subir nueva actividad</button>
    <label class="buscador">
      <span>🔎</span>
      <input type="search" placeholder="Buscar actividad…" value=${busqueda} onInput=${e => setBusqueda(e.target.value)} />
    </label>
    <div class="chips-scroll">
      <button class=${'chip ' + (filtro === 'todo' ? 'sel' : '')} onClick=${() => setFiltro('todo')}>Todo</button>
      ${MATERIALES.map(m => html`<button key=${m.id} class=${'chip ' + (filtro === m.id ? 'sel' : '')} onClick=${() => setFiltro(m.id)}>${m.emoji} ${m.nombre}</button>`)}
    </div>
    ${lista.length === 0
      ? html`<${Vacio} emoji="🔍">No encontramos actividades con ese filtro.<//>`
      : html`<div class="lista-actividades">
        ${lista.map(a => html`<button key=${a.id} class="tarjeta-actividad" onClick=${() => ir('#/docente/actividades/' + a.id)}>
          <img src=${a.foto || dibujo(a.ilustracion)} alt="" loading="lazy" />
          <span class="ta-cuerpo">
            <strong>${a.titulo}</strong>
            <span class="etiquetas-mat">
              ${(a.materiales || []).map(material).filter(Boolean).map(m => html`<span key=${m.id} class="mat">${m.emoji} ${m.nombre}</span>`)}
            </span>
            <span class="ver-guia">Ver guía ›</span>
          </span>
        </button>`)}
      </div>`}
  <//>`;
}

function Mueble({ resaltar }) {
  return html`<div class="mueble" aria-label="Mueble-estación con 6 cajones">
    <div class="mueble-tapa">📱 Soporte del celular</div>
    <div class="mueble-cajones">
      ${CAJONES.map(c => {
        const usa = resaltar.includes(c.n);
        return html`<div key=${c.n} class=${'cajon ' + (usa ? 'resaltado' : '')}>
          <span class="cajon-num">${usa ? '✓ ' : ''}Cajón ${c.n}</span>
          <span class="cajon-nombre">${c.nombre}</span>
          <span class="manija"></span>
        </div>`;
      })}
    </div>
    <div class="mueble-patas"><span></span><span></span></div>
  </div>`;
}

function DetalleActividad({ id }) {
  const a = store.datos.actividades.find(x => x.id === id);
  if (!a) {
    return html`<${Pantalla} titulo="Guía de actividad" volver="#/docente/actividades" nav=${nav('actividades')}>
      <${Vacio} emoji="🤷">Esta actividad ya no está disponible.<//>
    <//>`;
  }
  const mats = (a.materiales || []).map(material).filter(Boolean);
  const cajones = [...new Set(mats.map(m => m.cajon))];
  const paraPedir = mats.filter(m => m.consumible).map(m => m.id);

  return html`<${Pantalla} titulo="Guía de actividad" volver="#/docente/actividades" nav=${nav('actividades')}>
    <img class="detalle-imagen" src=${a.foto || dibujo(a.ilustracion)} alt=${a.titulo} />
    <h2 class="detalle-titulo">${a.titulo}</h2>
    ${a.descripcion && html`<p class="detalle-desc">${a.descripcion}</p>`}
    ${mats.length > 0 && html`<section class="caja">
      <h2>📍 ¿Dónde están los materiales?</h2>
      <${Mueble} resaltar=${cajones} />
      <ul class="lista-materiales">
        ${mats.map(m => html`<li key=${m.id}><span class="num-cajon">${m.cajon}</span> ${m.emoji} ${m.nombre}<small>Cajón ${m.cajon}</small></li>`)}
      </ul>
    </section>`}
    <section class="caja">
      <h2>👣 Paso a paso</h2>
      <ol class="pasos">${(a.pasos || []).map((p, i) => html`<li key=${i}>${p}</li>`)}</ol>
    </section>
    <button class="btn btn-falta btn-grande" onClick=${() => ir('#/docente/gestion' + (paraPedir.length ? '?pedir=' + paraPedir.join(',') : ''))}>
      ¿Notaste que falta material en el mueble? ➔ Ir a pedir stock
    </button>
    <p class="autor">Subida por ${a.autor || 'Seño Belén'} · ${cuando(a.ts)}</p>
  <//>`;
}

function NuevaActividad() {
  const [titulo, setTitulo] = useState('');
  const [pasos, setPasos] = useState('');
  const [mats, setMats] = useState([]);
  const [foto, setFoto] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [publicando, setPublicando] = useState(false);

  const elegirFoto = async e => {
    const archivo = e.target.files?.[0];
    e.target.value = '';
    if (!archivo) return;
    setProcesando(true);
    try {
      setFoto(await comprimirImagen(archivo));
    } catch {
      avisar('No se pudo leer esa foto. Probá con otra.', 'error');
    }
    setProcesando(false);
  };
  const alternar = id => setMats(mats.includes(id) ? mats.filter(x => x !== id) : [...mats, id]);
  const listaPasos = pasos.split('\n').map(s => s.replace(/^\s*(\d+\s*[.)-]|[-•*])\s*/, '').trim()).filter(Boolean);
  const puede = titulo.trim() && listaPasos.length && !publicando && !procesando;

  const publicar = async () => {
    setPublicando(true);
    const ok = await intentar(
      acciones.publicarActividad({ titulo: titulo.trim(), descripcion: '', pasos: listaPasos, materiales: mats, foto }),
      'No se pudo publicar la actividad. Revisá la conexión a internet.',
    );
    if (ok) {
      avisar('🎉 ¡Actividad publicada en el banco!');
      ir('#/docente/actividades');
    } else {
      setPublicando(false);
    }
  };

  return html`<${Pantalla} titulo="Nueva actividad" volver="#/docente/actividades" nav=${nav('actividades')}>
    <label class="campo">
      <span>Título de la actividad</span>
      <input type="text" placeholder="Ej: Pintamos con sellos de corcho" value=${titulo} onInput=${e => setTitulo(e.target.value)} maxlength="80" />
    </label>
    <label class="campo">
      <span>Descripción / Paso a paso</span>
      <textarea rows="6" placeholder=${'Escribí un paso por renglón. Por ejemplo:\nRepartimos las hojas blancas\nPintamos con los dedos'}
        value=${pasos} onInput=${e => setPasos(e.target.value)}></textarea>
      <small>Cada renglón va a ser un paso de la guía.</small>
    </label>
    <fieldset class="campo">
      <legend>Materiales del mueble que usa</legend>
      <div class="grilla-checks">
        ${MATERIALES.map(m => html`<label key=${m.id} class=${'check ' + (mats.includes(m.id) ? 'sel' : '')}>
          <input type="checkbox" checked=${mats.includes(m.id)} onChange=${() => alternar(m.id)} />
          <span>${m.emoji} ${m.nombre}</span>
        </label>`)}
      </div>
    </fieldset>
    <div class="campo">
      <span>Foto</span>
      ${foto
        ? html`<div class="foto-preview">
            <img src=${foto} alt="Foto elegida" />
            <button class="btn btn-secundario btn-chico" onClick=${() => setFoto(null)}>Quitar foto</button>
          </div>`
        : html`<label class="btn btn-secundario btn-grande subir-foto">
            ${procesando ? '⏳ Preparando foto…' : '📷 Sacar o elegir foto'}
            <input class="oculto-visual" type="file" accept="image/*" onChange=${elegirFoto} />
          </label>`}
      <small class="aviso-privacidad">⚠️ Es una demo pública: no subas fotos donde se vean caras de chicos.</small>
    </div>
    <button class="btn btn-primario btn-grande" disabled=${!puede} onClick=${publicar}>
      ${publicando ? 'Publicando…' : '🚀 Publicar actividad'}
    </button>
    ${!titulo.trim() || !listaPasos.length ? html`<p class="ayuda">Completá el título y al menos un paso para publicar.</p>` : null}
  <//>`;
}

// ---------- 1.3 Gestión interna ----------
function Gestion({ pedir, ver }) {
  const consumibles = MATERIALES.filter(m => m.consumible);
  // Desde el cartel del inicio: ir directo a la tarjeta de avisos de Dirección
  useEffect(() => {
    if (ver === 'aviso') document.getElementById('avisos-direccion')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, []);
  const [inicial] = useState(() => (pedir || '').split(',').filter(id => consumibles.some(m => m.id === id)));
  const [seleccion, setSeleccion] = useState(inicial);
  const [reporteAbierto, setReporteAbierto] = useState(false);
  const [problemas, setProblemas] = useState([]);
  const [nota, setNota] = useState('');
  const pedidos = store.datos.stock.slice(0, 4);
  const reportes = store.datos.reportes.slice(0, 3);
  const aviso = ultimoAviso();
  const alternar = (lista, setLista, valor) => setLista(lista.includes(valor) ? lista.filter(x => x !== valor) : [...lista, valor]);

  const notificar = () => {
    intentar(acciones.pedirStock(seleccion));
    avisar(`📨 Pedido enviado a Dirección: ${nombresMateriales(seleccion)}`);
    setSeleccion([]);
  };
  const confirmarReporte = () => {
    intentar(acciones.enviarReporte(problemas, nota.trim()));
    avisar('📨 Reporte enviado a Dirección');
    setProblemas([]);
    setNota('');
    setReporteAbierto(false);
  };
  const entendido = () => {
    intentar(acciones.confirmarAviso(aviso.id));
    avisar('✔️ Dirección ya sabe que leíste el aviso');
  };

  return html`<${Pantalla} titulo="Gestión Interna" volver="#/docente" nav=${nav('inicio')}>
    <section class="caja roja">
      <h2>⚠️ STOCK CRÍTICO DEL MUEBLE</h2>
      <p class="parrafo">¿Un cajón del mueble llegó a la línea roja de reserva? Avisá a dirección qué falta reponer:</p>
      ${inicial.length > 0 && html`<p class="nota-pre">Marcamos los materiales de la actividad. Dejá solo los que faltan.</p>`}
      <div class="chips">
        ${consumibles.map(m => html`<button key=${m.id} class=${'chip chip-rojo ' + (seleccion.includes(m.id) ? 'sel' : '')}
          aria-pressed=${seleccion.includes(m.id) ? 'true' : 'false'} onClick=${() => alternar(seleccion, setSeleccion, m.id)}>${m.nombre}</button>`)}
      </div>
      <button class="btn btn-rojo btn-grande" disabled=${!seleccion.length} onClick=${notificar}>🔔 Notificar a Dirección</button>
      ${pedidos.length > 0 && html`<ul class="lista-estados">
        ${pedidos.map(p => html`<li key=${p.id} class=${'estado-pedido ' + p.estado}>
          ${p.estado === 'repuesto'
            ? `✅ Dirección ya repuso el material: ${nombresMateriales(p.materiales)}`
            : `⏳ Pedido enviado: ${nombresMateriales(p.materiales)} (Pendiente de reposición)`}
          <small>${cuando(p.ts)}</small>
        </li>`)}
      </ul>`}
    </section>

    <section class="caja naranja">
      <h2>📝 ESTADO DE LA SALA (Cambio de turno)</h2>
      <p class="parrafo">Reportar si el turno anterior dejó la sala o el mueble desordenado.</p>
      ${reporteAbierto
        ? html`<div class="reporte-form">
            ${PROBLEMAS_SALA.map(p => html`<label key=${p} class=${'check ' + (problemas.includes(p) ? 'sel' : '')}>
              <input type="checkbox" checked=${problemas.includes(p)} onChange=${() => alternar(problemas, setProblemas, p)} />
              <span>${p}</span>
            </label>`)}
            <input type="text" placeholder="Nota breve (opcional)" value=${nota} onInput=${e => setNota(e.target.value)} maxlength="140" />
            <div class="fila-botones">
              <button class="btn btn-secundario" onClick=${() => setReporteAbierto(false)}>Cancelar</button>
              <button class="btn btn-naranja" disabled=${!problemas.length && !nota.trim()} onClick=${confirmarReporte}>Confirmar</button>
            </div>
          </div>`
        : html`<button class="btn btn-naranja btn-grande" onClick=${() => setReporteAbierto(true)}>📝 Enviar reporte</button>`}
      ${reportes.length > 0 && html`<ul class="lista-estados">
        ${reportes.map(r => html`<li key=${r.id} class="estado-reporte">
          ${r.visto ? '👀 Dirección lo vio' : '📨 Enviado'}: ${[...(r.problemas || []), r.nota].filter(Boolean).join(' · ')}
          <small>${cuando(r.ts)}</small>
        </li>`)}
      </ul>`}
    </section>

    <section class="caja azul" id="avisos-direccion">
      <h2>📢 AVISOS DE DIRECCIÓN</h2>
      ${aviso
        ? html`<div class="aviso-direccion"><p>${aviso.texto}</p><small>${cuando(aviso.ts)}</small></div>
          ${aviso.leidoDocente
            ? html`<button class="btn btn-grande btn-confirmado" disabled>✔️ Confirmado</button>`
            : html`<button class="btn btn-azul btn-grande" onClick=${entendido}>👍 Entendido</button>`}`
        : html`<p class="parrafo">No hay avisos de Dirección por ahora.</p>`}
    </section>

    <section class="caja verde">
      <h2>📅 EVENTOS & FECHAS</h2>
      <${ListaEventos} />
    </section>
  <//>`;
}
