import { DESIGNER, EVENT_LABELS } from '../config.js';
import { $ } from '../utils.js';
import { getState } from '../state.js';
import { buildDesign, designFileName, saveFile, toCode, toFile } from '../services/design-pack.js';

const isTouch = () => Boolean(window.matchMedia?.('(pointer: coarse)').matches);

/** CLIENTE: entrega su diseño (datos, no código) y avisa al diseñador por WhatsApp. */
export function initSendDesign() {
  const dialog = $('done');
  const msg = $('dlgMsg');
  $('likeBtn').addEventListener('click', () => { msg.textContent = ''; dialog.showModal(); });
  $('dlgClose').addEventListener('click', () => dialog.close());

  // Paso 1: en celular abre "Compartir"; en computadora descarga el archivo.
  $('dlgSend').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.textContent = 'Preparando…';
    msg.textContent = 'Preparando tu diseño…';
    try {
      const s = getState();
      const file = toFile(await buildDesign(s), designFileName(s));
      if (isTouch() && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Mi diseño', text: `Mi diseño de ${s.n1}` });
        msg.textContent = '✅ Diseño compartido. Ahora avisa a tu diseñador por WhatsApp.';
      } else {
        saveFile(file);
        msg.textContent = `✅ Se descargó "${file.name}" (carpeta Descargas). Adjúntalo en el chat de WhatsApp con el clip 📎.`;
      }
    } catch (err) {
      console.error(err);
      msg.textContent = err.name === 'AbortError' ? 'Cancelaste el envío. Puedes intentarlo de nuevo.' : `No se pudo preparar tu diseño: ${err.message}`;
    } finally {
      btn.disabled = false;
      btn.textContent = '1. Preparar y compartir mi diseño';
    }
  });

  // Paso 2: siempre disponible; abre el chat con un mensaje y el código de diseño.
  $('dlgWa').addEventListener('click', () => {
    const s = getState();
    const text = `Hola ${DESIGNER.name}, me encantó mi diseño de ${EVENT_LABELS[s.type].toLowerCase()} (${s.n1}). Te comparto mi archivo de diseño.\n\nCódigo de diseño:\n${toCode(s)}`;
    const opened = window.open(`https://wa.me/52${DESIGNER.phone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    if (!opened) msg.textContent = 'Tu navegador bloqueó la ventana. Permite ventanas emergentes o usa "Copiar código" y pégalo en WhatsApp.';
  });

  // Alternativa: copiar el código para pegarlo manualmente.
  $('dlgCopy').addEventListener('click', async () => {
    const code = toCode(getState());
    try { await navigator.clipboard.writeText(code); msg.textContent = '✅ Código copiado. Pégalo en el chat de WhatsApp de tu diseñador.'; }
    catch { prompt('Copia este código:', code); }
  });
}
