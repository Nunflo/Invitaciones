import { EVENT_LABELS, PARENT_LABELS, STORE_COLORS } from '../config.js';
import { esc, formatDate } from '../utils.js';
import { googleCalendarUrl, icsUrl } from '../services/calendar.js';
import { footerCard } from './footer.js';

export const audioButton = () => '<button class="audio-btn" data-action="toggle-audio" aria-label="Música">♪</button>';

const link = (href, text, cls = 'btn-pill') =>
  href ? `<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener">${text}</a>` : '';

const place = (title, name, href, img) => `<section class="card"><h2 class="card__title">${title}</h2>${esc(name)}
  ${img ? `<img class="place-img" src="${esc(img)}" alt="${esc(name)}">` : ''}${href ? `<br>${link(href, 'Cómo llegar')}` : ''}</section>`;

function parentsBlock(s) {
  if (!s.padres && !s.padrinos) return '';
  const L = PARENT_LABELS[s.type];
  return `<section class="card"><span class="label">Con la bendición de</span>
    ${s.padres ? `<span class="label">${L.padres}</span>${esc(s.padres)}` : ''}
    ${s.padrinos ? `<span class="label">${L.padrinos}</span>${esc(s.padrinos)}` : ''}</section>`;
}

const gallery = (s) => !s.slides.length ? '' : `<section class="card"><h2 class="card__title">Galería</h2>
  <div class="carousel"><div class="track">${s.slides.map((src) => `<img src="${esc(src)}" alt="Foto de la galería">`).join('')}</div>
  <button class="nav nav--prev" data-action="slide" data-dir="-1" aria-label="Anterior">‹</button>
  <button class="nav nav--next" data-action="slide" data-dir="1" aria-label="Siguiente">›</button></div></section>`;

const gift = (s) => {
  const bg = s.gi ? `background-image:url('${esc(s.gi)}')` : '';
  return `<section class="card"><h2 class="card__title">Mesa de regalos</h2>
    <div class="gift" style="background-color:${STORE_COLORS[s.gs] || '#777'};${bg}">${s.gi ? '' : esc(s.gs)}</div>
    ${link(s.gu, 'Deja tu regalo aquí')}</section>`;
};

export function invitationView(s) {
  const names = s.type === 'boda' && s.n2 ? `${esc(s.n1)} &amp; ${esc(s.n2)}` : esc(s.n1);
  const countdown = [['d', 'Días'], ['h', 'Hrs'], ['m', 'Min'], ['s', 'Seg']]
    .map(([k, l]) => `<div><b data-cd="${k}">00</b>${l}</div>`).join('');
  return `${audioButton()}
  <p class="eyebrow">${EVENT_LABELS[s.type]}</p><h1 class="names">${names}</h1><p class="date-line">${formatDate(s.date)}</p>
  <div class="countdown">${countdown}</div>
  <section class="card card--quote">“${esc(s.msg)}”</section>
  <section class="card"><span class="label">Guarda la fecha</span><h2 class="card__title">${formatDate(s.date)}</h2>${esc(s.time)} hrs<br>
    ${link(googleCalendarUrl(s), 'Google Calendar')} <a class="btn-pill btn-pill--outline" href="${icsUrl(s)}">Apple / Outlook</a></section>
  ${parentsBlock(s)}${gallery(s)}
  ${s.tag ? `<section class="card"><h2 class="card__title">¡Comparte el evento!</h2><span class="hashtag">${esc(s.tag)}</span></section>` : ''}
  ${s.it.length ? `<section class="card"><h2 class="card__title">Itinerario</h2><div class="timeline">${s.it.map((i) => `<p>${esc(i.t)} hrs — ${esc(i.x)}</p>`).join('')}</div></section>` : ''}
  ${place('Ceremonia', s.tn, s.tl, s.ti)}${place('Recepción', s.sn, s.sl, s.si)}
  <section class="card"><h2 class="card__title">Código de vestimenta</h2>${esc(s.dress)}
    ${s.aviso ? `<div class="notice">⚠️ ${esc(s.aviso)}</div>` : ''}</section>
  ${gift(s)}
  <section class="card"><h2 class="card__title">Confirmación</h2><span class="small">Favor de confirmar antes del ${formatDate(s.rsvp)}</span><br>
    <button class="btn-pill" data-action="go-confirm">Confirmar asistencia</button></section>
  ${footerCard()}`;
}
