/**
 * Configuración de Firebase (solo se usa en el sitio CLIENTE).
 * La apiKey web de Firebase es un identificador público, NO un secreto: la seguridad la dan
 * las reglas de Firestore (firebase/firestore.rules) y la restricción de la clave por dominio
 * (Google Cloud Console → APIs y servicios → Credenciales → Restricciones de sitios web).
 */
export const FIREBASE = Object.freeze({
  apiKey: 'TU_API_KEY',
  projectId: 'TU_PROJECT_ID',
  authDomain: '', // opcional; por defecto <projectId>.firebaseapp.com
  collection: 'leads',
});
