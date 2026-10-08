import { EVENT_LABELS, STATUS, STATUS_LABEL } from '../config.js';
import { esc, formatDate } from '../utils.js';
import { accessLink, confirmedMembers } from '../services/guests.js';
import { audioButton } from './invitation.js';
import { footerCard } from './footer.js';

const memberRow = (m, gi, mi) => `<div class="member">
  <span>${esc(m.name)}${m.status === STATUS.PENDING ? '' : ` · ${STATUS_LABEL[m.status]}`}</span>
  <span>${[[STATUS.YES, 'Asistiré', ''], [STATUS.NO, 'No asistiré', ' btn-pill--outline']]
    .map(([st, txt, cls]) => `<button class="btn-pill${cls}" data-action="status" data-guest="${gi}" data-member="${mi}" data-status="${st}">${txt}</button>`).join(' ')}</span></div>`;

const pass = (s, g, m) => `<div class="pass"><div class="pass__head">${esc(s.n1)}</div>
  <div class="pass__name">${esc(m.name)}</div><div class="qr" data-qr="${esc(accessLink(s, g, m))}"></div>
  <div class="pass__foot">PASE PERSONAL · NO TRANSFERIBLE</div></div>`;

/** Los QR solo se generan para los integrantes con estado "si". */
export function confirmationView(s, guests, index, { picker = true } = {}) {
  const g = guests[index];
  const ok = confirmedMembers(g);
  return `${audioButton()}
  <section class="card"><div class="brand">${esc(g.family || `Familia ${g.name}`)}</div>
    <span class="label">${EVENT_LABELS[s.type]} · ${esc(s.n1)} · ${formatDate(s.date)}</span>
    ${picker ? `<select data-action="pick-guest" aria-label="Invitado">${guests.map((x, i) => `<option value="${i}" ${i === index ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select>` : ''}
    ${ok.length ? '<div class="success">✅ ¡Asistencia confirmada! Te esperamos con gusto.</div>' : ''}
    ${g.members.map((m, i) => memberRow(m, index, i)).join('')}</section>
  ${ok.length
    ? `<section class="card"><span class="label">Tus pases de acceso</span><span class="small">Guarda la imagen de cada pase y preséntalo en la entrada.</span>${ok.map((m) => pass(s, g, m)).join('')}</section>`
    : '<section class="card small">Los pases con QR aparecen aquí solo para quienes confirman asistencia.</section>'}
  ${footerCard()}`;
}
