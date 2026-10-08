import { DESIGNER } from '../config.js';
import { esc } from '../utils.js';

/** Footer del diseñador. Los datos vienen de config.js y no se pueden editar desde la interfaz. */
export function footerCard() {
  const { brand, name, phone } = DESIGNER;
  return `<div class="card card--white">
    <div class="brand">${esc(brand)}</div><span class="label label--gold">Invitaciones digitales</span>
    <i>${esc(name)}</i><br>
    <a class="btn-pill" href="https://wa.me/52${phone}" target="_blank" rel="noopener">WhatsApp · Contacto</a>
    <div class="copy">© ${new Date().getFullYear()} · Design by ${esc(name)}</div></div>`;
}
