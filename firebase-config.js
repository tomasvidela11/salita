// Configuración del proyecto de Firebase.
// Se obtiene en: Consola de Firebase → ⚙️ Configuración del proyecto → "Tus apps" → app web → "Configuración".
// Si se vuelve a poner en null, la app funciona en "modo prueba local" (los cambios NO viajan entre celulares).
// Estos datos no son secretos: identifican el proyecto. Lo que protege la base son las reglas (firestore.rules).
export const firebaseConfig = {
  apiKey: 'AIzaSyB5uQlQwLlxb6p4E7q85MWCPm-tqkeRhCU',
  authDomain: 'salita-demo.firebaseapp.com',
  projectId: 'salita-demo',
  storageBucket: 'salita-demo.firebasestorage.app',
  messagingSenderId: '1034087180752',
  appId: '1:1034087180752:web:02856f5a93a8a1157071d5',
};
