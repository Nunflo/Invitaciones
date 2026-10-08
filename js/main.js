import { DATA_URL } from './config.js';
import { $ } from './utils.js';
import { getState, init, subscribe, update } from './state.js';
import { createGuest, withStatus } from './services/guests.js';
import { initEditor } from './editor.js';
import { invitationView } from './views/invitation.js';
import { confirmationView } from './views/confirmation.js';
import { startCountdown } from './ui/countdown.js';
import { slide, startAutoplay } from './ui/carousel.js';
import { setSource, toggle } from './ui/audio.js';
import { renderQRCodes } from './ui/qr.js';
import { initMode } from './mode.js';

/** Estado de interfaz (no se persiste). */
const ui = {
  view: 'inv',
  guest: 0,
  demo: [createGuest({ name: 'Invitado demo', family: 'Familia Demo', members: 'Invitado demo, Acompañante' })],
};
const previewGuests = () => (getState().guests.length ? getState().guests : ui.demo);

function render(s) {
  const root = $('inv');
  root.style.setProperty('--a', s.ac);
  root.style.setProperty('--b', s.bg);
  root.style.background = s.bgImg ? `url("${s.bgImg}") center/cover` : s.bg;
  const guests = previewGuests();
  if (ui.guest >= guests.length) ui.guest = 0;
  $('ov').innerHTML = ui.view === 'inv' ? invitationView(s) : confirmationView(s, guests, ui.guest);
  renderQRCodes(root, s.bg);
  setSource(s.song);
}

function setView(view) {
  ui.view = view;
  document.querySelectorAll('.vt button').forEach((b) => b.classList.toggle('on', b.dataset.view === view));
  $('inv').scrollTop = 0;
  render(getState());
}

function setStatus(gi, mi, status) {
  if (getState().guests.length) update({ guests: withStatus(getState().guests, gi, mi, status) });
  else { ui.demo = withStatus(ui.demo, gi, mi, status); render(getState()); }
}

function bindPreview() {
  document.querySelectorAll('.vt button').forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));
  const root = $('inv');
  root.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const { action, dir, guest, member, status } = el.dataset;
    if (action === 'toggle-audio') toggle();
    else if (action === 'slide') slide(Number(dir), el.closest('.preview'));
    else if (action === 'go-confirm') setView('conf');
    else if (action === 'status') setStatus(Number(guest), Number(member), status);
  });
  root.addEventListener('change', (e) => {
    if (e.target.dataset.action === 'pick-guest') { ui.guest = Number(e.target.value); render(getState()); }
  });
}

async function boot() {
  const defaults = await fetch(DATA_URL).then((r) => r.json());
  init(defaults);
  initEditor();
  bindPreview();
  initMode();
  subscribe(render);
  render(getState());
  startCountdown(getState);
  startAutoplay();
}

boot().catch((err) => {
  console.error(err);
  document.body.insertAdjacentHTML('afterbegin', '<p style="padding:20px">No se pudo iniciar. Abre el proyecto con un servidor local (npm run dev), no con doble clic.</p>');
});
