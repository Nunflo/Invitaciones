/** Empaquetado del DISEÑO del cliente (datos, no código): archivo .json y código corto. */
const APP = 'seroll';
const VERSION = 1;
const CODE_PREFIX = 'SEROLL1:';
const BINARY_KEYS = ['bgImg', 'ti', 'si', 'gi', 'song'];

/** Reduce una imagen (data URL) a un JPEG de máx. `max` px para que el archivo sea ligero. */
export function shrinkImage(dataUrl, max = 1280, quality = 0.8) {
  if (!dataUrl || !dataUrl.startsWith('data:image') || dataUrl.startsWith('data:image/svg')) return Promise.resolve(dataUrl);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const r = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * r);
      canvas.height = Math.round(img.height * r);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/** Diseño completo (con fotos comprimidas y música). */
export async function buildDesign(state) {
  const design = { ...state };
  for (const k of ['bgImg', 'ti', 'si', 'gi']) design[k] = await shrinkImage(state[k]);
  design.slides = await Promise.all(state.slides.map((s) => shrinkImage(s)));
  return { app: APP, v: VERSION, created: new Date().toISOString(), design };
}

const b64encode = (text) => btoa(Array.from(new TextEncoder().encode(text), (b) => String.fromCharCode(b)).join(''));
const b64decode = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));

/** Código corto: solo textos, colores e itinerario (sin fotos, música ni invitados). */
export function toCode(state) {
  const light = { ...state, slides: [], guests: [] };
  BINARY_KEYS.forEach((k) => { light[k] = ''; });
  return CODE_PREFIX + b64encode(JSON.stringify(light));
}

/** Acepta el contenido de un archivo de diseño o un código corto. Devuelve solo claves válidas. */
export function parseDesign(text, reference) {
  const raw = text.trim();
  let design;
  try {
    if (raw.startsWith(CODE_PREFIX)) design = JSON.parse(b64decode(raw.slice(CODE_PREFIX.length)));
    else {
      const pack = JSON.parse(raw);
      if (pack.app !== APP) throw new Error('no es un diseño de Seroll');
      design = pack.design;
    }
  } catch (err) {
    throw new Error(`Formato inválido (${err.message})`);
  }
  const clean = {};
  for (const [key, ref] of Object.entries(reference)) {
    const v = design?.[key];
    if (v !== undefined && Array.isArray(v) === Array.isArray(ref) && typeof v === typeof ref) clean[key] = v;
  }
  if (!Object.keys(clean).length) throw new Error('el diseño está vacío');
  return clean;
}

export const toFile = (pack, name) => new File([JSON.stringify(pack)], name, { type: 'application/json' });
export const designFileName = (state) =>
  `diseno-${(state.n1 || 'invitacion').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'invitacion'}.json`;

export function saveFile(file) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file);
  a.download = file.name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
