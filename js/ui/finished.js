import { $ } from '../utils.js';
import { getState } from '../state.js';
import { isConfigured, saveLead, validateLead } from '../services/leads.js';
import { errorMessage, isAuthError, resetVerifier, sendCode, verifyCode } from '../services/phone-auth.js';
import { openFullscreen } from './fullscreen.js';

const LEAD_KEY = 'seroll:lead';
const RESEND_SECONDS = 30;
const hasLead = () => { try { return localStorage.getItem(LEAD_KEY) === '1'; } catch { return false; } };
const rememberLead = () => { try { localStorage.setItem(LEAD_KEY, '1'); } catch { /* sin almacenamiento */ } };

/**
 * CLIENTE: para ver su invitación terminada deja nombre y teléfono.
 * Paso 1: datos + envío de código SMS. Paso 2: verifica el código, guarda el lead en Firebase y abre la vista.
 */
export function initFinished() {
  const dialog = $('lead');
  const form = $('leadForm');
  const msg = $('leadMsg');
  const submit = $('leadSubmit');
  const resend = $('leadResend');
  let step = 1;
  let lead = null;
  let timer = null;

  const submitLabel = () => (step === 2 ? 'Verificar y ver mi invitación' : isConfigured() ? 'Enviar código' : 'Ver mi invitación');
  const setStep = (n) => {
    step = n;
    $('leadStep1').hidden = n !== 1;
    $('leadStep2').hidden = n !== 2;
    submit.textContent = submitLabel();
    if (n === 2) form.elements.leadCode.focus();
  };
  const busy = (label) => { submit.disabled = Boolean(label); submit.textContent = label || submitLabel(); };
  const cooldown = () => {
    let left = RESEND_SECONDS;
    clearInterval(timer);
    resend.disabled = true;
    resend.textContent = `Reenviar código (${left})`;
    timer = setInterval(() => {
      left -= 1;
      resend.textContent = left > 0 ? `Reenviar código (${left})` : 'Reenviar código';
      if (left <= 0) { clearInterval(timer); resend.disabled = false; }
    }, 1000);
  };
  const reset = () => { clearInterval(timer); msg.textContent = ''; form.reset(); lead = null; resetVerifier(); setStep(1); };
  const finish = () => { reset(); dialog.close(); openFullscreen(getState()); };

  async function requestCode() {
    busy('Enviando código…');
    try {
      await sendCode(lead.phone, 'recaptcha');
      setStep(2);
      msg.textContent = `Enviamos un código por SMS al número terminado en ${lead.phone.slice(-4)}.`;
      cooldown();
    } catch (err) {
      console.error(err);
      msg.textContent = errorMessage(err);
    } finally {
      busy();
    }
  }

  async function confirmCode() {
    const code = form.elements.leadCode.value.trim();
    if (!/^\d{6}$/.test(code)) { msg.textContent = 'Escribe el código de 6 dígitos.'; return; }
    busy('Verificando…');
    try {
      const token = await verifyCode(code);
      await saveLead(lead, getState(), token);
      rememberLead();
      finish();
    } catch (err) {
      console.error(err);
      msg.textContent = isAuthError(err) ? errorMessage(err) : 'Tu número se verificó, pero no pudimos guardar tus datos. Inténtalo de nuevo.';
    } finally {
      busy();
    }
  }

  $('finBtn').addEventListener('click', () => {
    if (hasLead()) { openFullscreen(getState()); return; }
    reset();
    msg.textContent = isConfigured() ? '' : '⚠️ Firebase sin configurar (modo demostración): no se envía código ni se guardan los datos.';
    dialog.showModal();
  });
  $('leadCancel').addEventListener('click', () => { reset(); dialog.close(); });
  $('leadBack').addEventListener('click', () => { clearInterval(timer); resetVerifier(); setStep(1); msg.textContent = ''; });
  resend.addEventListener('click', requestCode);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (step === 2) { confirmCode(); return; }
    const f = form.elements;
    const check = validateLead({ name: f.leadName.value, phone: f.leadPhone.value, consent: f.leadConsent.checked });
    if (!check.ok) { msg.textContent = check.error; return; }
    if (f.website.value) { finish(); return; } // honeypot: un bot rellenó el campo oculto
    lead = check.lead;
    msg.textContent = '';
    if (!isConfigured()) { finish(); return; } // modo demostración
    requestCode();
  });
}
