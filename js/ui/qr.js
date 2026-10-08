/** Dibuja un QR en cada elemento [data-qr] dentro de root (requiere qrcodejs). */
export function renderQRCodes(root, color) {
  root.querySelectorAll('[data-qr]').forEach((el) => {
    el.textContent = '';
    if (typeof QRCode === 'undefined') { el.textContent = '[QR]'; return; }
    // eslint-disable-next-line no-undef
    new QRCode(el, { text: el.dataset.qr, width: 120, height: 120, colorDark: color, colorLight: '#ffffff' });
  });
}
