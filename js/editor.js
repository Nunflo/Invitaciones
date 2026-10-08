import { NAME_LABELS, PALETTES, STATUS } from './config.js';
import { $, esc, readAsDataURL } from './utils.js';
import { getState, reset, subscribe, update } from './state.js';
import { createGuest, toTsv, whatsappUrl } from './services/guests.js';

const EMPTY_FOR = { slides: [] };
let lastSheet = null;

/** Conecta el panel de edición con el store. */
export function initEditor() {
  bindFields();
  bindUploads();
  bindPalette();
  bindItinerary();
  bindGuests();
  bindTabs();
  $('reset').addEventListener('click', (e) => { e.preventDefault(); if (confirm('¿Borrar todo y reiniciar?')) reset(); });
  subscribe(sync);
  sync(getState());
}

function bindFields() {
  document.querySelectorAll('[data-field]').forEach((el) =>
    el.addEventListener('input', () => update({ [el.dataset.field]: el.value })));
}

function bindUploads() {
  document.querySelectorAll('[data-upload]').forEach((el) =>
    el.addEventListener('change', async () => {
      const key = el.dataset.upload;
      const urls = await Promise.all([...el.files].map(readAsDataURL));
      update(el.multiple ? { [key]: [...getState()[key], ...urls] } : { [key]: urls[0] });
      el.value = '';
    }));
  document.querySelectorAll('[data-clear]').forEach((btn) =>
    btn.addEventListener('click', () => update({ [btn.dataset.clear]: EMPTY_FOR[btn.dataset.clear] ?? '' })));
}

function bindPalette() {
  const box = $('pal');
  box.innerHTML = PALETTES.map(([bg, ac], i) =>
    `<button type="button" class="swatch" data-i="${i}" aria-label="Paleta ${i + 1}" style="background:linear-gradient(135deg,${bg} 55%,${ac} 55%)"></button>`).join('');
  box.addEventListener('click', (e) => {
    const i = e.target.dataset.i;
    if (i === undefined) return;
    update({ bg: PALETTES[i][0], ac: PALETTES[i][1], bgImg: '' });
  });
}

function bindItinerary() {
  $('it_a').addEventListener('click', () => {
    const x = $('it_x').value.trim();
    if (!x) return;
    const it = [...getState().it, { t: $('it_t').value || '--:--', x }].sort((a, b) => a.t.localeCompare(b.t));
    $('it_x').value = '';
    update({ it });
  });
  $('itl').addEventListener('click', (e) => {
    const i = e.target.dataset.remove;
    if (i !== undefined) update({ it: getState().it.filter((_, n) => n !== Number(i)) });
  });
}

function bindGuests() {
  $('add').addEventListener('click', () => {
    const name = $('gn').value.trim();
    if (!name) return;
    const guest = createGuest({ name, family: $('gf').value, phone: $('gp').value, members: $('gm').value });
    ['gn', 'gf', 'gm', 'gp'].forEach((id) => { $(id).value = ''; });
    update({ guests: [...getState().guests, guest] });
  });
  $('gl').addEventListener('click', (e) => {
    const i = e.target.dataset.remove;
    if (i !== undefined) update({ guests: getState().guests.filter((_, n) => n !== Number(i)) });
  });
  $('cp').addEventListener('click', async () => {
    const text = toTsv(getState());
    try { await navigator.clipboard.writeText(text); alert('Copiado. Pégalo en tu Google Sheet.'); }
    catch { prompt('Copia este texto:', text); }
  });
}

function bindTabs() {
  document.querySelectorAll('.tabs button').forEach((btn) => btn.addEventListener('click', () => {
    document.querySelectorAll('.tabs button, .tab').forEach((x) => x.classList.remove('on'));
    btn.classList.add('on');
    $(btn.dataset.tab).classList.add('on');
  }));
}

/** Refleja el estado en el panel (sin pisar el campo que se está escribiendo). */
function sync(s) {
  document.querySelectorAll('[data-field]').forEach((el) => {
    if (el !== document.activeElement && el.value !== String(s[el.dataset.field] ?? '')) el.value = s[el.dataset.field] ?? '';
  });
  $('w2').hidden = s.type !== 'boda';
  $('l1').textContent = NAME_LABELS[s.type];
  $('th').innerHTML = s.slides.map((src) => `<img src="${esc(src)}" alt="">`).join('');
  $('itl').innerHTML = s.it.map((i, n) => `<div class="row"><span class="fixed">${esc(i.t)}</span><span>${esc(i.x)}</span><button class="btn btn--ghost" data-remove="${n}" aria-label="Quitar">✕</button></div>`).join('');
  $('gl').innerHTML = s.guests.map((g, n) => {
    const wa = whatsappUrl(s, g);
    const ok = g.members.filter((m) => m.status === STATUS.YES).length;
    return `<tr><td>${esc(g.name)}<br><small>${g.members.map((m) => esc(m.name)).join(', ')}</small></td><td>${ok}/${g.members.length}</td>
      <td>${wa ? `<a href="${wa}" target="_blank" rel="noopener">WhatsApp</a>` : '—'}</td>
      <td><button class="btn btn--ghost" data-remove="${n}" aria-label="Quitar">✕</button></td></tr>`;
  }).join('');
  renderSheet(s.sheet);
}

function renderSheet(url) {
  if (url === lastSheet) return;
  lastSheet = url;
  const id = (url || '').match(/\/d\/([\w-]+)/)?.[1];
  $('sh').innerHTML = id
    ? `<iframe title="Google Sheet" src="https://docs.google.com/spreadsheets/d/${id}/edit?rm=minimal"></iframe>
       <p class="note">Si no se muestra, <a href="${esc(url)}" target="_blank" rel="noopener">ábrela en otra pestaña</a>.</p>` : '';
}
