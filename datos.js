// Datos fijos de la demo y datos de ejemplo con los que arranca la app.

export const SALA = 'Sala Roja - Turno Tarde';
export const TOTAL_FAMILIAS = 25;
export const HIJO = 'Mateo';
export const ALUMNOS = ['Mateo', 'Sofía', 'Lucas'];

export const ROLES = {
  docente: { id: 'docente', emoji: '🍎', titulo: 'Soy Docente', nombre: 'Seño Belén', inicio: '#/docente' },
  familia: { id: 'familia', emoji: '👨‍👩‍👧', titulo: 'Soy Familia', nombre: 'Familia de Mateo', inicio: '#/familia' },
  direccion: { id: 'direccion', emoji: '🏫', titulo: 'Soy Directivo', nombre: 'Dirección del Jardín', inicio: '#/direccion' },
};

// Los 6 cajones del mueble-estación
export const CAJONES = [
  { n: 1, nombre: 'Cartulinas y cartones' },
  { n: 2, nombre: 'Papeles de colores' },
  { n: 3, nombre: 'Hojas blancas' },
  { n: 4, nombre: 'Afiches' },
  { n: 5, nombre: 'Tijeras y plasticola' },
  { n: 6, nombre: 'Cintas e hilos' },
];

// consumible: se puede pedir reposición (las tijeras no se gastan)
export const MATERIALES = [
  { id: 'tijeras', nombre: 'Tijeras', emoji: '✂️', cajon: 5, consumible: false },
  { id: 'plasticola', nombre: 'Plasticola', emoji: '🧴', cajon: 5, consumible: true },
  { id: 'cartulina', nombre: 'Cartulina', emoji: '🟧', cajon: 1, consumible: true },
  { id: 'carton', nombre: 'Cartón', emoji: '📦', cajon: 1, consumible: true },
  { id: 'papeles', nombre: 'Papeles de colores', emoji: '🌈', cajon: 2, consumible: true },
  { id: 'hojas', nombre: 'Hojas blancas', emoji: '📄', cajon: 3, consumible: true },
  { id: 'afiches', nombre: 'Afiches', emoji: '📜', cajon: 4, consumible: true },
  { id: 'cintas', nombre: 'Cintas', emoji: '🎀', cajon: 6, consumible: true },
  { id: 'hilos', nombre: 'Hilos', emoji: '🧵', cajon: 6, consumible: true },
];
export const material = id => MATERIALES.find(m => m.id === id);

export const PLANTILLAS = [
  'Recordatorio: Mañana traer guardapolvo y taza.',
  'Aviso: Hoy salimos puntuales 17:00 hs.',
  'Hoy trabajamos con materiales de la estación.',
];

export const PLANTILLAS_DIRECCION = [
  'Hoy reunión de personal docente a las 18:30 hs en sala de maestros.',
  'Recordamos cargar las planificaciones de fin de mes.',
  'Mañana hay simulacro de evacuación a las 15:00 hs.',
];

export const PROBLEMAS_SALA = ['Mueble desordenado', 'Faltan elementos de trabajo'];

// ['a', 'b', 'c'] → 'a, b y c'
export function unir(lista) {
  if (lista.length <= 1) return lista.join('');
  return lista.slice(0, -1).join(', ') + ' y ' + lista[lista.length - 1];
}
export const nombresMateriales = ids => unir((ids || []).map(id => material(id)?.nombre || id));

export function fechaISO(fecha) {
  const d = new Date(fecha);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Lo que aparece cargado al empezar (y al tocar "Reiniciar demo").
// Los ids empiezan con "seed-" para que no disparen avisos de "nuevo".
export function datosIniciales() {
  const ahora = Date.now();
  const hora = 3600000;
  const dia = 24 * hora;
  const hoy = new Date();
  const finDeMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  const enDias = n => fechaISO(ahora + n * dia);
  const guardar = 'Al terminar, guardamos cada material en su cajón del mueble.';

  return {
    config: {
      estado: { horarioActivo: true, reinicio: ahora },
    },
    comunicados: {
      'seed-com-1': {
        tipo: 'general', alumno: null, vistoPor: [], vistosBase: 22, ts: ahora - 2 * dia,
        texto: '¡Hola familias! Esta semana estrenamos el mueble-estación de materiales en la sala 🎨. Los chicos están felices.',
      },
      'seed-com-2': {
        tipo: 'general', alumno: null, vistoPor: [], vistosBase: 18, ts: ahora - dia,
        texto: 'Recordatorio: el viernes traemos una foto familiar para armar el mural de la sala.',
      },
    },
    consultas: {
      'seed-con-1': {
        autor: 'familia', enEspera: false, leidoDocente: true, leidoFamilia: true, ts: ahora - dia + hora,
        texto: 'Hola seño, ¿para la actividad de mañana hay que mandar algún material?',
      },
      'seed-con-2': {
        autor: 'docente', enEspera: false, leidoDocente: true, leidoFamilia: true, ts: ahora - dia + 1.5 * hora,
        texto: '¡Hola! No hace falta, usamos todo lo del mueble de la sala 😊',
      },
    },
    actividades: {
      'seed-act-1': {
        titulo: 'Títeres de medias y papel',
        descripcion: 'Cada chico arma su propio títere con una media y papeles de colores. Ideal para jugar a contar cuentos.',
        materiales: ['tijeras', 'papeles', 'plasticola', 'cintas'],
        pasos: [
          'Cada chico elige una media (las pedimos de casa la semana anterior).',
          'Sacamos las tijeras del cajón 5 y los papeles de colores del cajón 2.',
          'Recortamos ojos, nariz y boca en los papeles de colores.',
          'Pegamos la carita en la media con plasticola (cajón 5) y dejamos secar unos minutos.',
          'Hacemos el pelo atando cintas de colores (cajón 6).',
          '¡A presentar los títeres! Cada uno cuenta cómo se llama el suyo.',
          guardar,
        ],
        ilustracion: 'titeres', foto: null, autor: 'Seño Belén', ts: ahora - 8 * dia,
      },
      'seed-act-2': {
        titulo: 'Collage de figuras geométricas',
        descripcion: 'Recortamos círculos, cuadrados y triángulos para armar dibujos combinando figuras.',
        materiales: ['cartulina', 'tijeras', 'plasticola'],
        pasos: [
          'Sacamos las cartulinas de colores del cajón 1.',
          'La seño dibuja círculos, cuadrados y triángulos para que los chicos recorten.',
          'Recortamos las figuras con las tijeras (cajón 5).',
          'Sobre una cartulina grande armamos un dibujo combinando figuras: una casa, un tren, un robot…',
          'Pegamos todo con plasticola (cajón 5).',
          'Charlamos: ¿qué figuras usó cada uno? ¿Cuántos lados tiene cada una?',
          guardar,
        ],
        ilustracion: 'collage', foto: null, autor: 'Seño Belén', ts: ahora - 9 * dia,
      },
      'seed-act-3': {
        titulo: 'Mural de estaciones del año',
        descripcion: 'Un afiche grande dividido en cuatro partes para mostrar qué pasa en cada estación.',
        materiales: ['afiches', 'papeles', 'hilos', 'cintas'],
        pasos: [
          'Pegamos un afiche grande (cajón 4) en la pared.',
          'Lo dividimos en cuatro partes con cinta (cajón 6): verano, otoño, invierno y primavera.',
          'Recortamos soles, hojas, nubes y flores en papeles de colores (cajón 2).',
          'Con hilos de colores (cajón 6) hacemos la lluvia y el viento.',
          'Pegamos cada cosa en la estación que corresponde.',
          'Entre todos contamos qué ropa usamos y qué pasa en cada estación.',
          guardar,
        ],
        ilustracion: 'mural', foto: null, autor: 'Seño Belén', ts: ahora - 10 * dia,
      },
    },
    stock: {},
    reportes: {},
    avisosDireccion: {
      'seed-av-1': {
        texto: 'Hoy reunión de personal docente a las 18:30 hs en sala de maestros.',
        leidoDocente: false, ts: ahora - 2 * hora,
      },
    },
    eventos: {
      'seed-ev-1': { titulo: 'Reunión de padres de Sala Roja (18:00 hs)', fecha: enDias(7), ts: ahora },
      'seed-ev-2': { titulo: 'Recordamos cargar las planificaciones de fin de mes', fecha: fechaISO(finDeMes), ts: ahora },
      'seed-ev-3': { titulo: 'Muestra de fin de año', fecha: enDias(24), ts: ahora },
    },
  };
}
