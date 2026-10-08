/** MODO CLIENTE (generado por scripts/build-client.mjs). */
export const MODE = 'client';

export async function initMode() {
  const [send, finished] = await Promise.all([import('./ui/send-design.js'), import('./ui/finished.js')]);
  send.initSendDesign();
  finished.initFinished();
}
