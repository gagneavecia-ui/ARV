// ================================================================
// ARVEXA UI — Toast, confirm modal, helpers
// Usage : import { toast, confirm } from './assets/arvexa-ui.js';
// ================================================================

// ================================================================
// TOAST
// ================================================================
let toastContainer = null;

function ensureToastContainer() {
  if (toastContainer) return toastContainer;
  toastContainer = document.getElementById('arvToastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'arvToastContainer';
    toastContainer.className = 'arv-toast-container';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

export function toast(message, type = 'info', duration = 3000) {
  const container = ensureToastContainer();
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    info: 'fa-info-circle'
  };
  const el = document.createElement('div');
  el.className = `arv-toast ${type}`;
  el.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${escapeHtml(message)}</span>`;
  container.appendChild(el);

  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(-10px)';
    el.style.transition = 'all 0.3s ease';
    setTimeout(() => el.remove(), 300);
  }, duration);
}

// ================================================================
// ESCAPE HTML
// ================================================================
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = String(text ?? '');
  return div.innerHTML;
}

// ================================================================
// CONFIRM MODAL (bottom-sheet style)
// ================================================================
let confirmEl = null;
let confirmCallback = null;

function ensureConfirmModal() {
  if (confirmEl) return confirmEl;

  confirmEl = document.createElement('div');
  confirmEl.id = 'arvConfirmModal';
  confirmEl.innerHTML = `
    <div class="arv-confirm-overlay">
      <div class="arv-confirm-sheet">
        <div class="arv-confirm-handle"></div>
        <div class="arv-confirm-icon"><i class="fas fa-question-circle"></i></div>
        <h3 class="arv-confirm-title">Confirmation</h3>
        <p class="arv-confirm-message">Es-tu sûr ?</p>
        <div class="arv-confirm-actions">
          <button class="arv-btn arv-btn-secondary" data-action="cancel">Annuler</button>
          <button class="arv-btn arv-btn-primary" data-action="confirm">Confirmer</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(confirmEl);

  const overlay = confirmEl.querySelector('.arv-confirm-overlay');
  const btnCancel = confirmEl.querySelector('[data-action="cancel"]');
  const btnConfirm = confirmEl.querySelector('[data-action="confirm"]');

  const close = () => {
    confirmEl.classList.remove('show');
    document.body.style.overflow = '';
  };

  btnCancel.addEventListener('click', close);
  btnConfirm.addEventListener('click', () => {
    const cb = confirmCallback;
    close();
    if (typeof cb === 'function') cb();
  });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && confirmEl.classList.contains('show')) close();
  });

  return confirmEl;
}

export function confirm({ title, message, confirmText = 'Confirmer', cancelText = 'Annuler', onConfirm }) {
  const el = ensureConfirmModal();
  el.querySelector('.arv-confirm-title').textContent = title || 'Confirmation';
  el.querySelector('.arv-confirm-message').innerHTML = message || '';
  el.querySelector('[data-action="confirm"]').textContent = confirmText;
  el.querySelector('[data-action="cancel"]').textContent = cancelText;
  confirmCallback = onConfirm;
  el.classList.add('show');
  document.body.style.overflow = 'hidden';
}

// ================================================================
// INJECTION STYLES (au premier import)
// ================================================================
if (!document.getElementById('arvUIConfirmStyles')) {
  const style = document.createElement('style');
  style.id = 'arvUIConfirmStyles';
  style.textContent = `
    #arvConfirmModal { display: none; }
    #arvConfirmModal.show { display: block; }
    #arvConfirmModal .arv-confirm-overlay {
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      display: flex; align-items: flex-end; justify-content: center;
      padding: 0;
      animation: arvFade 0.25s ease;
    }
    @media (min-width: 640px) {
      #arvConfirmModal .arv-confirm-overlay {
        align-items: center; padding: 20px;
      }
    }
    #arvConfirmModal .arv-confirm-sheet {
      background: var(--bg-surface, #141414);
      border: 1px solid var(--card-border, rgba(184,134,11,0.15));
      border-radius: 24px 24px 0 0;
      padding: 28px 22px calc(24px + var(--safe-bottom, 0px));
      width: 100%; max-width: 440px;
      animation: arvSlideUp 0.3s cubic-bezier(0.25, 1, 0.5, 1);
      position: relative;
    }
    @media (min-width: 640px) {
      #arvConfirmModal .arv-confirm-sheet {
        border-radius: 20px;
        padding: 28px 24px;
        animation: arvPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
    }
    #arvConfirmModal .arv-confirm-handle {
      position: absolute; top: 8px; left: 50%;
      transform: translateX(-50%);
      width: 40px; height: 4px; border-radius: 2px;
      background: rgba(255, 255, 255, 0.15);
    }
    @media (min-width: 640px) {
      #arvConfirmModal .arv-confirm-handle { display: none; }
    }
    #arvConfirmModal .arv-confirm-icon {
      width: 56px; height: 56px; border-radius: 16px;
      background: rgba(184, 134, 11, 0.12);
      color: var(--accent-bright, #E0B84A);
      display: flex; align-items: center; justify-content: center;
      font-size: 24px; margin: 8px auto 14px;
    }
    #arvConfirmModal .arv-confirm-title {
      text-align: center; font-size: 18px;
      font-family: var(--font-serif, 'Playfair Display', serif);
      color: var(--text-light, #F5F0E8);
      margin-bottom: 8px;
    }
    #arvConfirmModal .arv-confirm-message {
      text-align: center; font-size: 13.5px; line-height: 1.6;
      color: var(--text-dim, #8A8A7A);
      margin-bottom: 20px;
    }
    #arvConfirmModal .arv-confirm-actions {
      display: flex; gap: 10px;
    }
    #arvConfirmModal .arv-confirm-actions button { flex: 1; }
    @keyframes arvFade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes arvSlideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    @keyframes arvPop {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

console.log('[ARVEXA] UI ready');