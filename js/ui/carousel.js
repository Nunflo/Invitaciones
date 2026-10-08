import { AUTOPLAY_MS } from '../config.js';

function step(track, dir) {
  const width = track.clientWidth;
  if (!width) return; // oculto
  const max = track.scrollWidth - width;
  let x = track.scrollLeft + dir * width;
  if (x > max + 5) x = 0;
  if (x < 0) x = max;
  track.scrollTo({ left: x });
}

/** Desplaza el carrusel dentro de `scope` (dir = 1 | -1). */
export function slide(dir, scope = document) {
  const track = scope.querySelector('.track');
  if (track) step(track, dir);
}

export const startAutoplay = () =>
  setInterval(() => document.querySelectorAll('.track').forEach((t) => step(t, 1)), AUTOPLAY_MS);
