import { DEFAULT_BASE_URL, EVENT_LABELS, STATUS, STATUS_LABEL } from '../config.js';

export const baseUrl = (s) => (s.base || DEFAULT_BASE_URL).replace(/\/?$/, '/');
export const inviteLink = (s, g) => `${baseUrl(s)}?id=${encodeURIComponent(g.name)}`;
/** Contenido del QR de acceso de un integrante. */
export const accessLink = (s, g, m) => `${baseUrl(s)}acceso?id=${encodeURIComponent(`${g.name}|${m.name}`)}`;

export function createGuest({ name, family = '', phone = '', members = '' }) {
  const list = (members || name).split(',').map((x) => x.trim()).filter(Boolean)
    .map((n) => ({ name: n, status: STATUS.PENDING }));
  return { name: name.trim(), family: family.trim(), phone: phone.replace(/\D/g, ''), members: list };
}

/** Devuelve una nueva lista con el estado del integrante cambiado (sin mutar). */
export const withStatus = (guests, gi, mi, status) =>
  guests.map((g, i) => (i !== gi ? g : { ...g, members: g.members.map((m, j) => (j === mi ? { ...m, status } : m)) }));

export const confirmedMembers = (g) => g.members.filter((m) => m.status === STATUS.YES);

export function whatsappUrl(s, g) {
  if (!g.phone) return '';
  const text = `Hola ${g.name}, te invitamos a ${EVENT_LABELS[s.type].toLowerCase()} de ${s.n1}: ${inviteLink(s, g)}`;
  return `https://wa.me/52${g.phone}?text=${encodeURIComponent(text)}`;
}

/** Tabla separada por tabs, lista para pegar en Google Sheets. */
export function toTsv(s) {
  const head = ['idInvitado', 'Familia', 'Teléfono', 'Integrantes', 'confirmacion', 'link de envio invitacion'];
  const rows = s.guests.map((g) => [
    g.name, g.family, g.phone,
    g.members.map((m) => m.name).join(', '),
    g.members.map((m) => `${m.name}: ${STATUS_LABEL[m.status]}`).join(' | '),
    inviteLink(s, g),
  ]);
  return [head, ...rows].map((r) => r.join('\t')).join('\n');
}
