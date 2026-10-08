import { $ } from '../utils.js';
import { createGuest, withStatus } from '../services/guests.js';
import { invitationView } from '../views/invitation.js';
import { confirmationView } from '../views/confirmation.js';
import { slide } from './carousel.js';
import { toggle } from './audio.js';
import { renderQRCodes } from './qr.js';

let state = null;
let view = 'inv';
let demo = [createGuest({ name: 'Invitado demo', family: 'Familia Demo', members: 'Invitado demo, Acompañante' })];
let bound = false;

const overlay = () => $('fs');
const surface = () => overlay().querySelector('.preview');

function draw() {
  const box = surface();
  box.querySelector('.ov').innerHTML = view === 'inv'
    ? invitationView(state)
    : `${confirmationView(state, demo, 0, { picker: false })}<section class="card"><button class="btn-pill" data-action="fs-back">← Volver a la invitación</button></section>`;
  renderQRCodes(box, state.bg);
}

export function closeFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  overlay().hidden = true;
  document.body.style.overflow = '';
}

function bind() {
  if (bound) return;
  bound = true;
  overlay().addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const { action, dir, guest, member, status } = el.dataset;
    if (action === 'fs-close') closeFullscreen();
    else if (action === 'fs-back') { view = 'inv'; draw(); overlay().scrollTop = 0; }
    else if (action === 'go-confirm') { view = 'conf'; draw(); overlay().scrollTop = 0; }
    else if (action === 'toggle-audio') toggle();
    else if (action === 'slide') slide(Number(dir), el.closest('.preview'));
    else if (action === 'status') { demo = withStatus(demo, Number(guest), Number(member), status); draw(); }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !overlay().hidden) closeFullscreen(); });
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && !overlay().hidden) closeFullscreen(); });
}

/** Muestra la invitación terminada a pantalla completa (instantánea del diseño actual). */
export function openFullscreen(s) {
  bind();
  state = s;
  view = 'inv';
  const box = surface();
  box.style.setProperty('--a', s.ac);
  box.style.setProperty('--b', s.bg);
  box.style.background = s.bgImg ? `url("${s.bgImg}") center/cover` : s.bg;
  overlay().hidden = false;
  document.body.style.overflow = 'hidden';
  draw();
  overlay().scrollTop = 0;
  overlay().requestFullscreen?.().catch(() => { /* el overlay ya cubre la pantalla */ });
}
