/** Constantes y catálogos de la aplicación. Sin lógica. */
export const STORAGE_KEY = 'seroll:v3';
export const DATA_URL = 'data/event.json';
export const DEFAULT_BASE_URL = 'https://tu-invitacion.vercel.app/';
export const EVENT_DURATION_HOURS = 4;
export const AUTOPLAY_MS = 3500;

export const STATUS = Object.freeze({ PENDING: 'pend', YES: 'si', NO: 'no' });
export const STATUS_LABEL = Object.freeze({ pend: 'Pendiente', si: 'Asistirá', no: 'No asistirá' });

export const EVENT_LABELS = Object.freeze({ boda: 'Nuestra boda', xv: 'Mis XV años', baby: 'Baby shower' });
export const NAME_LABELS = Object.freeze({
  boda: 'Nombre de el/la novio(a)',
  xv: 'Nombre de la quinceañera',
  baby: 'Nombre del bebé / mamá',
});
const PLURAL = { padres: 'Nuestros padres', padrinos: 'Nuestros padrinos' };
export const PARENT_LABELS = Object.freeze({
  xv: { padres: 'Mis padres', padrinos: 'Mis padrinos' },
  boda: PLURAL,
  baby: PLURAL,
});

/** [fondo, acento] */
export const PALETTES = [
  ['#7a0f26', '#e6c987'], ['#1f3a5f', '#e9c98b'], ['#2f5d50', '#efd9a0'],
  ['#a8456a', '#ffe9c7'], ['#3b2a4a', '#ecd0ae'], ['#222222', '#e5c07b'],
];

export const STORE_COLORS = Object.freeze({
  Liverpool: '#e10098', Sears: '#0b3d91', 'Palacio de Hierro': '#111111', Amazon: '#232f3e', Otra: '#7a7a7a',
});

export const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** Datos del diseñador: fijos, NO editables por el cliente. */
export const DESIGNER = Object.freeze({ brand: 'Seroll', name: 'Jonathan Flores', phone: '4492734828' });
