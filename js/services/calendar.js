import { EVENT_DURATION_HOURS, EVENT_LABELS } from '../config.js';
import { eventDate, pad } from '../utils.js';

const stamp = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

function range(s) {
  const start = eventDate(s);
  return [start, new Date(start.getTime() + EVENT_DURATION_HOURS * 36e5)];
}
const title = (s) => `${EVENT_LABELS[s.type]} · ${s.n1}`;

export function googleCalendarUrl(s) {
  const [start, end] = range(s);
  const q = new URLSearchParams({ action: 'TEMPLATE', text: title(s), dates: `${stamp(start)}/${stamp(end)}`, location: s.sn });
  return `https://calendar.google.com/calendar/render?${q}`;
}

/** Enlace .ics para Apple Calendar y Outlook. */
export function icsUrl(s) {
  const [start, end] = range(s);
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT', `SUMMARY:${title(s)}`,
    `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`, `LOCATION:${s.sn}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}
