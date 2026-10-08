const player = new Audio();
player.loop = true;
let current = '';

export function setSource(src) {
  if (src === current) return;
  current = src;
  if (src) player.src = src; else player.removeAttribute('src');
}

export function toggle() {
  if (!current) {
    alert('Sube una canción en la pestaña Diseño (o coloca un archivo en assets/audio/).');
    return;
  }
  if (player.paused) player.play().catch((err) => console.warn('Reproducción bloqueada', err));
  else player.pause();
}
