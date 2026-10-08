import { eventDate, pad } from '../utils.js';

/** Actualiza cada segundo los elementos [data-cd="d|h|m|s"] presentes en la página. */
export function startCountdown(getState) {
  const tick = () => {
    const ms = Math.max(0, eventDate(getState()) - new Date());
    const parts = { d: ms / 864e5, h: (ms / 36e5) % 24, m: (ms / 6e4) % 60, s: (ms / 1e3) % 60 };
    document.querySelectorAll('[data-cd]').forEach((el) => {
      el.textContent = pad(Math.floor(parts[el.dataset.cd] || 0));
    });
  };
  tick();
  return setInterval(tick, 1000);
}
