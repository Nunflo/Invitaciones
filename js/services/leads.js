import { FIREBASE } from '../firebase-config.js';

export const isConfigured = () =>
  Boolean(FIREBASE.apiKey && FIREBASE.projectId && !FIREBASE.apiKey.startsWith('TU_') && !FIREBASE.projectId.startsWith('TU_'));

/** Valida y normaliza los datos del formulario. Devuelve { ok, error?, lead? }. */
export function validateLead({ name = '', phone = '', consent = false }) {
  const cleanName = name.trim().replace(/\s+/g, ' ');
  const digits = phone.replace(/\D/g, '');
  if (cleanName.length < 2 || cleanName.length > 80) return { ok: false, error: 'Escribe tu nombre (2 a 80 caracteres).' };
  if (!/^\d{10}$/.test(digits)) return { ok: false, error: 'El teléfono debe tener 10 dígitos.' };
  if (!consent) return { ok: false, error: 'Debes aceptar el uso de tus datos para continuar.' };
  return { ok: true, lead: { name: cleanName, phone: digits } };
}

const str = (stringValue) => ({ stringValue: String(stringValue ?? '') });

/**
 * Guarda el lead en Firestore vía REST. El documento usa el teléfono como id (sin duplicados) y la petición
 * lleva el ID token de Firebase Auth: las reglas comprueban que el teléfono guardado es el verificado.
 * @returns {{saved: boolean, demo?: boolean, existing?: boolean}}
 */
export async function saveLead(lead, event, idToken = '') {
  if (!isConfigured()) return { saved: false, demo: true };
  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(FIREBASE.projectId)}/databases/(default)/documents/${FIREBASE.collection}?documentId=${encodeURIComponent(lead.phone)}&key=${encodeURIComponent(FIREBASE.apiKey)}`;
  const body = {
    fields: {
      name: str(lead.name), phone: str(lead.phone),
      eventType: str(event.type), eventName: str(String(event.n1 ?? '').slice(0, 120)), eventDate: str(event.date),
      consent: { booleanValue: true }, source: str('cliente-web'),
      createdAt: { timestampValue: new Date().toISOString() },
    },
  };
  const headers = { 'Content-Type': 'application/json', ...(idToken && { Authorization: `Bearer ${idToken}` }) };
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  if (res.status === 409) return { saved: true, existing: true }; // ya estaba registrado
  if (!res.ok) throw new Error(`Firebase respondió ${res.status}`);
  return { saved: true };
}
