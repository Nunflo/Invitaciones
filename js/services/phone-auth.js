import { FIREBASE } from '../firebase-config.js';

/** Verificación del teléfono por SMS (Firebase Authentication). El SDK se carga solo cuando se necesita. */
const SDK = 'https://www.gstatic.com/firebasejs/10.12.2';
const COUNTRY_CODE = '+52';

let ctx = null;
let verifier = null;
let confirmation = null;

async function load() {
  if (ctx) return ctx;
  const [{ initializeApp }, auth] = await Promise.all([import(`${SDK}/firebase-app.js`), import(`${SDK}/firebase-auth.js`)]);
  const app = initializeApp({
    apiKey: FIREBASE.apiKey,
    authDomain: FIREBASE.authDomain || `${FIREBASE.projectId}.firebaseapp.com`,
    projectId: FIREBASE.projectId,
  });
  const instance = auth.getAuth(app);
  instance.languageCode = 'es';
  ctx = { auth: instance, RecaptchaVerifier: auth.RecaptchaVerifier, signInWithPhoneNumber: auth.signInWithPhoneNumber };
  return ctx;
}

export function resetVerifier() {
  try { verifier?.clear(); } catch { /* ya liberado */ }
  verifier = null;
}

/** Envía el SMS con el código. `containerId` es el id de un <div> vacío para reCAPTCHA invisible. */
export async function sendCode(phone10, containerId) {
  const c = await load();
  try {
    verifier ??= new c.RecaptchaVerifier(c.auth, containerId, { size: 'invisible' });
    confirmation = await c.signInWithPhoneNumber(c.auth, `${COUNTRY_CODE}${phone10}`, verifier);
  } catch (err) {
    resetVerifier();
    throw err;
  }
}

/** Confirma el código y devuelve el ID token (prueba de que el teléfono es suyo). */
export async function verifyCode(code) {
  if (!confirmation) throw Object.assign(new Error('Primero solicita el código.'), { code: 'app/no-confirmation' });
  const { user } = await confirmation.confirm(code);
  return user.getIdToken();
}

const MESSAGES = {
  'auth/invalid-phone-number': 'El número de teléfono no es válido.',
  'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
  'auth/invalid-verification-code': 'El código es incorrecto.',
  'auth/code-expired': 'El código expiró. Solicita uno nuevo.',
  'auth/captcha-check-failed': 'No pudimos validar que eres una persona. Recarga la página e inténtalo de nuevo.',
  'auth/invalid-app-credential': 'No pudimos validar que eres una persona. Recarga la página e inténtalo de nuevo.',
  'auth/network-request-failed': 'Sin conexión. Revisa tu internet.',
  'auth/quota-exceeded': 'Se agotó el límite de SMS por hoy. Inténtalo mañana.',
  'auth/unauthorized-domain': 'Dominio no autorizado: agrégalo en Firebase → Authentication → Settings → Authorized domains (para pruebas locales usa localhost o agrega 127.0.0.1).',
  'auth/operation-not-allowed': 'Activa el proveedor "Teléfono" en Firebase Authentication y permite la región México.',
  'auth/billing-not-enabled': 'Firebase necesita el plan Blaze para enviar SMS reales (para pruebas usa números de prueba).',
  'app/no-confirmation': 'Primero solicita el código.',
};
export const isAuthError = (err) => Boolean(err?.code && /^(auth|app)\//.test(err.code));
export const errorMessage = (err) => MESSAGES[err?.code] || `No se pudo completar la verificación (${err?.code || err?.message || 'error'}).`;
