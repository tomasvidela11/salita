// Acceso a la base de datos.
// - Con firebaseConfig cargado: Firestore en la nube, con actualización en tiempo real entre dispositivos.
// - Sin config: "modo prueba local" en el navegador (sincroniza solo entre pestañas del mismo navegador).
import { firebaseConfig } from './firebase-config.js';

export const COLECCIONES = ['config', 'comunicados', 'consultas', 'actividades', 'stock', 'reportes', 'avisosDireccion', 'eventos'];
const FIREBASE = 'https://www.gstatic.com/firebasejs/10.14.1';

export async function conectar() {
  if (firebaseConfig && firebaseConfig.projectId) return crearFirebase(firebaseConfig);
  return crearLocal();
}

async function crearFirebase(config) {
  const { initializeApp } = await import(`${FIREBASE}/firebase-app.js`);
  const fs = await import(`${FIREBASE}/firebase-firestore.js`);
  const db = fs.getFirestore(initializeApp(config));
  const ref = (col, id) => fs.doc(db, col, id);

  // Borra todo y deja solo `datos` (los documentos de `datos` se pisan en vez de borrarse).
  async function reemplazarTodo(datos) {
    const lote = fs.writeBatch(db);
    for (const col of COLECCIONES) {
      const snap = await fs.getDocs(fs.collection(db, col));
      snap.forEach(d => { if (!datos[col]?.[d.id]) lote.delete(d.ref); });
    }
    for (const [col, docs] of Object.entries(datos)) {
      for (const [id, dato] of Object.entries(docs)) lote.set(ref(col, id), dato);
    }
    await lote.commit();
  }

  return {
    modo: 'firebase',
    escuchar(col, alCambiar, alFallar) {
      return fs.onSnapshot(fs.collection(db, col), snap => alCambiar(snap.docs.map(d => ({ id: d.id, ...d.data() }))), alFallar);
    },
    async agregar(col, dato) {
      const nuevo = fs.doc(fs.collection(db, col));
      await fs.setDoc(nuevo, dato);
      return nuevo.id;
    },
    actualizar: (col, id, cambios) => fs.updateDoc(ref(col, id), cambios),
    combinar: (col, id, cambios) => fs.setDoc(ref(col, id), cambios, { merge: true }),
    borrar: (col, id) => fs.deleteDoc(ref(col, id)),
    sumarALista: (col, id, campo, valor) => fs.updateDoc(ref(col, id), { [campo]: fs.arrayUnion(valor) }),
    async asegurarDatos(crearDatos) {
      const estado = await fs.getDoc(ref('config', 'estado'));
      if (!estado.exists()) await reemplazarTodo(crearDatos());
    },
    reemplazarTodo,
  };
}

function crearLocal() {
  const CLAVE = 'salita-datos-locales';
  const oyentes = new Map();
  const leer = () => {
    try { return JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch { return {}; }
  };
  let datos = leer();
  const tabla = col => (datos[col] ||= {});
  const lista = col => Object.entries(datos[col] || {}).map(([id, d]) => ({ id, ...JSON.parse(JSON.stringify(d)) }));
  const avisar = cols => cols.forEach(col => oyentes.get(col)?.forEach(f => f(lista(col))));
  const guardar = cols => {
    localStorage.setItem(CLAVE, JSON.stringify(datos));
    setTimeout(() => avisar(cols), 0);
  };
  const nuevoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  // Otra pestaña cambió los datos
  window.addEventListener('storage', e => {
    if (e.key === CLAVE) { datos = leer(); avisar(COLECCIONES); }
  });

  async function reemplazarTodo(nuevos) {
    datos = JSON.parse(JSON.stringify(nuevos));
    guardar(COLECCIONES);
  }

  return {
    modo: 'local',
    escuchar(col, alCambiar) {
      if (!oyentes.has(col)) oyentes.set(col, new Set());
      oyentes.get(col).add(alCambiar);
      setTimeout(() => alCambiar(lista(col)), 0);
      return () => oyentes.get(col).delete(alCambiar);
    },
    async agregar(col, dato) {
      const id = nuevoId();
      tabla(col)[id] = JSON.parse(JSON.stringify(dato));
      guardar([col]);
      return id;
    },
    async actualizar(col, id, cambios) {
      if (!tabla(col)[id]) throw new Error(`No existe ${col}/${id}`);
      Object.assign(tabla(col)[id], cambios);
      guardar([col]);
    },
    async combinar(col, id, cambios) {
      tabla(col)[id] = { ...(tabla(col)[id] || {}), ...cambios };
      guardar([col]);
    },
    async borrar(col, id) {
      delete tabla(col)[id];
      guardar([col]);
    },
    async sumarALista(col, id, campo, valor) {
      const d = tabla(col)[id];
      if (!d) return;
      d[campo] = [...new Set([...(d[campo] || []), valor])];
      guardar([col]);
    },
    async asegurarDatos(crearDatos) {
      if (!datos.config?.estado) await reemplazarTodo(crearDatos());
    },
    reemplazarTodo,
  };
}
