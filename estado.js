// Estado compartido de la app: datos en tiempo real, acciones y avisos de novedades.
import { conectar, COLECCIONES } from './db.js';
import { datosIniciales, HIJO, TOTAL_FAMILIAS, nombresMateriales } from './datos.js';
import { avisar } from './ui.js';

// Identifica esta pestaña (para no avisarse a sí misma) y este dispositivo (para los "visto").
export const ID_PESTANA = Math.random().toString(36).slice(2, 10);
export const ID_DISPOSITIVO = (() => {
  try {
    let id = localStorage.getItem('salita-dispositivo');
    if (!id) {
      id = 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      localStorage.setItem('salita-dispositivo', id);
    }
    return id;
  } catch {
    return 'd' + ID_PESTANA;
  }
})();

const porFechaDesc = (a, b) => (b.ts || 0) - (a.ts || 0);
const ORDEN = {
  consultas: (a, b) => (a.ts || 0) - (b.ts || 0),
  eventos: (a, b) => (a.fecha || '').localeCompare(b.fecha || ''),
};

export const store = {
  db: null,
  modo: null,
  listo: false,
  error: null,
  rol: null,
  datos: Object.fromEntries(COLECCIONES.map(c => [c, []])),
};
const oyentes = new Set();
export const suscribir = f => { oyentes.add(f); return () => oyentes.delete(f); };
const refrescar = () => oyentes.forEach(f => f());

export async function iniciar() {
  try {
    const db = await conectar();
    store.modo = db.modo;
    refrescar();
    await db.asegurarDatos(datosIniciales);
    store.db = db;
    const faltan = new Set(COLECCIONES);
    for (const col of COLECCIONES) {
      db.escuchar(col, docs => {
        const antes = store.datos[col];
        store.datos = { ...store.datos, [col]: docs.sort(ORDEN[col] || porFechaDesc) };
        if (faltan.has(col)) {
          faltan.delete(col);
          if (faltan.size === 0) store.listo = true;
        } else {
          novedades(col, antes, store.datos[col]);
        }
        refrescar();
      }, err => {
        console.error(err);
        store.error = 'Se perdió la conexión con la base de datos.';
        refrescar();
      });
    }
  } catch (err) {
    console.error(err);
    store.error = 'No se pudo conectar con la base de datos. Revisá la conexión a internet.';
    refrescar();
  }
}

// ---------- Consultas sobre los datos ----------
export const config = () => store.datos.config.find(d => d.id === 'estado') || {};
export const horarioActivo = () => config().horarioActivo !== false;
export const paraFamilia = c => c.tipo === 'general' || c.alumno === HIJO;
export const comunicadosFamilia = () => store.datos.comunicados.filter(paraFamilia);
export const leidoPorMi = c => (c.vistoPor || []).includes(ID_DISPOSITIVO);
export const vistos = c => Math.min(TOTAL_FAMILIAS, (c.vistosBase || 0) + (c.vistoPor || []).length);
// La seño no ve las consultas que llegaron fuera de horario hasta que abre el horario
export const consultasDocente = () => store.datos.consultas.filter(m => m.autor === 'docente' || !m.enEspera);
export const enEspera = () => store.datos.consultas.filter(m => m.enEspera);
export const ultimoAviso = () => store.datos.avisosDireccion[0] || null;

export const sinLeer = {
  docenteConsultas: () => consultasDocente().filter(m => m.autor === 'familia' && !m.leidoDocente).length,
  docenteAviso: () => (ultimoAviso() && !ultimoAviso().leidoDocente ? 1 : 0),
  familiaAvisos: () => comunicadosFamilia().filter(c => !leidoPorMi(c)).length,
  familiaConsultas: () => store.datos.consultas.filter(m => m.autor === 'docente' && !m.leidoFamilia).length,
  direccion: () => store.datos.stock.filter(s => s.estado === 'pendiente').length + store.datos.reportes.filter(r => !r.visto).length,
};

// ---------- Acciones ----------
const db = () => store.db;
const ahora = () => Date.now();
const yaMarcadas = new Set();

// Ejecuta una acción y, si falla, muestra un aviso. Devuelve true/false.
export function intentar(promesa, error = 'No se pudo guardar. Revisá la conexión a internet.') {
  return Promise.resolve(promesa).then(() => true, err => {
    console.error(err);
    avisar(error, 'error');
    return false;
  });
}

export const acciones = {
  enviarComunicado: (tipo, alumno, texto) => db().agregar('comunicados', {
    tipo, alumno: tipo === 'individual' ? alumno : null, texto, ts: ahora(), vistoPor: [], vistosBase: 0, por: ID_PESTANA,
  }),
  marcarComunicadoLeido: id => db().sumarALista('comunicados', id, 'vistoPor', ID_DISPOSITIVO),

  // Al abrir el horario, las consultas en espera le llegan a la seño
  cambiarHorario(activo) {
    const esperando = activo ? enEspera() : [];
    return Promise.all([
      db().combinar('config', 'estado', { horarioActivo: activo }),
      ...esperando.map(m => db().actualizar('consultas', m.id, { enEspera: false, entregadoTs: ahora() })),
    ]);
  },
  enviarConsulta(autor, texto) {
    const espera = autor === 'familia' && !horarioActivo();
    return db().agregar('consultas', {
      autor, texto, ts: ahora(), enEspera: espera, leidoDocente: autor === 'docente', leidoFamilia: autor === 'familia', por: ID_PESTANA,
    });
  },
  marcarConsultasLeidas(rol) {
    const campo = rol === 'docente' ? 'leidoDocente' : 'leidoFamilia';
    const delOtro = rol === 'docente' ? 'familia' : 'docente';
    const visibles = rol === 'docente' ? consultasDocente() : store.datos.consultas;
    visibles
      .filter(m => m.autor === delOtro && !m[campo] && !yaMarcadas.has(m.id))
      .forEach(m => {
        yaMarcadas.add(m.id);
        db().actualizar('consultas', m.id, { [campo]: true }).catch(() => yaMarcadas.delete(m.id));
      });
  },

  publicarActividad: a => db().agregar('actividades', {
    ...a, ilustracion: a.foto ? null : 'generica', autor: 'Seño Belén', ts: ahora(), por: ID_PESTANA,
  }),

  pedirStock: materiales => db().agregar('stock', { materiales, sala: 'Sala Roja', estado: 'pendiente', ts: ahora(), por: ID_PESTANA }),
  marcarRepuesto: id => db().actualizar('stock', id, { estado: 'repuesto', repuestoTs: ahora() }),

  enviarReporte: (problemas, nota) => db().agregar('reportes', { problemas, nota, sala: 'Sala Roja', visto: false, ts: ahora(), por: ID_PESTANA }),
  marcarReporteVisto: id => db().actualizar('reportes', id, { visto: true }),

  enviarAviso: texto => db().agregar('avisosDireccion', { texto, leidoDocente: false, ts: ahora(), por: ID_PESTANA }),
  confirmarAviso: id => db().actualizar('avisosDireccion', id, { leidoDocente: true, leidoTs: ahora() }),

  agregarEvento: (titulo, fecha) => db().agregar('eventos', { titulo, fecha, ts: ahora(), por: ID_PESTANA }),
  borrarEvento: id => db().borrar('eventos', id),

  reiniciarDemo: () => db().reemplazarTodo(datosIniciales()),
};

// ---------- Avisos de novedades que llegan de otros dispositivos ----------
function novedades(col, antes, despues) {
  const rol = store.rol;
  if (!rol) return;
  const previos = new Map(antes.map(d => [d.id, d]));
  const nuevos = despues.filter(d => !previos.has(d.id) && !d.id.startsWith('seed-') && d.por !== ID_PESTANA);
  const cambios = despues.filter(d => previos.has(d.id)).map(d => [previos.get(d.id), d]);
  const sonar = texto => avisar(texto, 'info', true);

  if (col === 'config') {
    const [a, b] = cambios.find(([x]) => x.id === 'estado') || [];
    if (!a) return;
    if (a.reinicio !== b.reinicio) return avisar('♻️ La demo se reinició con los datos de ejemplo');
    if (rol === 'familia' && a.horarioActivo !== b.horarioActivo) {
      sonar(b.horarioActivo ? '🟢 La seño ya está recibiendo consultas' : '🔒 Terminó el horario de consultas');
    }
    return;
  }
  if (col === 'comunicados' && rol === 'familia' && nuevos.some(paraFamilia)) {
    sonar('📢 Nuevo comunicado de la Seño Belén');
  }
  if (col === 'consultas') {
    if (rol === 'familia') {
      if (nuevos.some(m => m.autor === 'docente')) sonar('💬 La Seño Belén te respondió');
      if (cambios.some(([a, b]) => a.enEspera && !b.enEspera)) avisar('✔️ Tu consulta en espera ya le llegó a la seño');
    }
    if (rol === 'docente' && nuevos.some(m => m.autor === 'familia' && !m.enEspera)) {
      sonar('💬 Nueva consulta de la Familia de Mateo');
    }
  }
  if (col === 'stock') {
    if (rol === 'direccion' && nuevos.length) sonar('⚠️ Nuevo pedido de stock de Sala Roja');
    if (rol === 'docente') {
      cambios
        .filter(([a, b]) => a.estado !== 'repuesto' && b.estado === 'repuesto')
        .forEach(([, b]) => sonar(`✅ Dirección repuso: ${nombresMateriales(b.materiales)}`));
    }
  }
  if (col === 'reportes' && rol === 'direccion' && nuevos.length) sonar('📝 Nuevo reporte de Sala Roja');
  if (col === 'avisosDireccion') {
    if (rol === 'docente' && nuevos.length) sonar('📢 Nuevo aviso de Dirección');
    if (rol === 'direccion' && cambios.some(([a, b]) => !a.leidoDocente && b.leidoDocente)) avisar('✔️ La Seño Belén confirmó el aviso');
  }
  if (col === 'actividades' && rol === 'docente' && nuevos.length) {
    avisar(`🎨 Nueva actividad en el banco: ${nuevos[0].titulo}`);
  }
}
