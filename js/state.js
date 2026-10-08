import { STORAGE_KEY } from './config.js';

/** Store mínimo e inmutable: getState / update / subscribe. */
let state = {};
const listeners = new Set();

export const getState = () => state;

export function init(defaults) {
  state = { ...defaults };
  try {
    Object.assign(state, JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
  } catch (err) {
    console.warn('No se pudo leer el almacenamiento local', err);
  }
}

export function update(patch) {
  state = { ...state, ...patch };
  persist();
  listeners.forEach((fn) => fn(state));
}

export const subscribe = (fn) => listeners.add(fn);

export function reset() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* sin almacenamiento */ }
  location.reload();
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Almacenamiento lleno: las imágenes/audio grandes no se guardan', err);
  }
}
