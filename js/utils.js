import { MONTHS } from './config.js';

export const $ = (id) => document.getElementById(id);

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
/** Escapa texto para insertarlo de forma segura en HTML. */
export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);

export const pad = (n) => String(n).padStart(2, '0');

/** '2026-08-15' -> '15 de agosto 2026' */
export function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${Number(d)} de ${MONTHS[Number(m) - 1]} ${y}`;
}

/** Fecha y hora del evento como objeto Date local. */
export const eventDate = (s) => new Date(`${s.date}T${s.time || '00:00'}`);

export const readAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
