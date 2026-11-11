/* ==========================================================================
   UNIVERSO Q51 — FUNIL DE VENDAS & CONTROLE DO PASSE FUNDADOR (V3.0 AUDITORIA)
   Execução de Alta Fidelidade conforme Auditoria EIDON (11/11/2026)
   Sem simulações falsas: Reservas reais via /api/register e Compra via Canal Oficial
   ========================================================================== */

(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => document.querySelectorAll(selector);

  // --- 1. SÍNTESE DE ÁUDIO BINAURAL (FRAGMENTO 01 · 432 Hz) ---
  let audioCtx = null;
  let isPlaying = false;
  let audioTimerInterval = null;
  let audioSecondsLeft = 84; // 01:24
  let synthNodes = [];

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function playKeyClickSound() {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.45);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.debug(e);
    }
  }

  function startFragmentAudio() {
    const ctx = getAudioContext();
    if (!ctx) return;
    stopFragmentAudio();
    isPlaying = true;

    // Frequência harmônica áurea (432 Hz, 216 Hz e 648 Hz)
    [432, 216, 648].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const baseGain = idx === 0 ? 0.22 : 0.07;
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(baseGain, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      synthNodes.push({ osc, gain });
    });

    const btn = $('#btn-play-audio');
    const timer = $('#audio-time-display');
    if (btn) btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> <span>Pausar áudio</span>';

    audioTimerInterval = setInterval(() => {
      if (audioSecondsLeft > 0) {
        audioSecondsLeft--;
        const m = Math.floor(audioSecondsLeft / 60);
        const s = audioSecondsLeft % 60;
        if (timer) timer.textContent = `Duração restante: ${m}:${String(s).padStart(2, '0')}`;
      } else {
        stopFragmentAudio();
      }
    }, 1000);
  }

  function stopFragmentAudio() {
    isPlaying = false;
    if (audioTimerInterval) {
      clearInterval(audioTimerInterval);
      audioTimerInterval = null;
    }
    synthNodes.forEach(({ osc, gain }) => {
      try {
        if (audioCtx) {
          gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
          osc.stop(audioCtx.currentTime + 0.35);
        }
      } catch (e) {}
    });
    synthNodes = [];
    const btn = $('#btn-play-audio');
    if (btn) btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><polygon points="5 3 19 12 5 21 5 3"/></svg> <span>Ouvir fragmento</span>';
  }

  // --- 2. ATIVAÇÃO DA CHAVE DO MARCO FUNDADOR ---
  const keyBtn = $('#ritual-activate-key');
  const stageInitial = $('#stage-initial-key');
  const stageReward = $('#stage-reward-unlocked');

  if (keyBtn) {
    keyBtn.addEventListener('click', () => {
      playKeyClickSound();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate([40, 60]); } catch (e) {}
      }

      if (stageInitial && stageReward) {
        stageInitial.style.opacity = '0';
        stageInitial.style.transform = 'scale(0.96)';
        stageInitial.style.transition = 'all 0.3s ease';

        setTimeout(() => {
          stageInitial.style.display = 'none';
          stageReward.hidden = false;
          stageReward.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    });
  }

  const audioPlayBtn = $('#btn-play-audio');
  if (audioPlayBtn) {
    audioPlayBtn.addEventListener('click', () => {
      if (isPlaying) {
        stopFragmentAudio();
      } else {
        startFragmentAudio();
      }
    });
  }

  // --- 3. MODAL DOS PRIVILÉGIOS DO CARTÃO DOURADO ---
  const goldenCardContainer = $('#golden-card-trigger');
  const openPrivilegesBtn = $('#btn-open-privileges');
  const prizesDialog = $('#golden-prizes-dialog');
  const closePrizesBtn = $('#close-prizes-btn');
  const dialogAddPassBtn = $('#btn-dialog-add-pass');

  function openPrizesModal() {
    if (prizesDialog) prizesDialog.showModal();
  }

  function closePrizesModal() {
    if (prizesDialog) {
      prizesDialog.close();
      if (goldenCardContainer) goldenCardContainer.focus();
    }
  }

  if (goldenCardContainer) {
    goldenCardContainer.addEventListener('click', openPrizesModal);
    goldenCardContainer.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openPrizesModal();
      }
    });
  }

  if (openPrivilegesBtn) openPrivilegesBtn.addEventListener('click', openPrizesModal);
  if (closePrizesBtn) closePrizesBtn.addEventListener('click', closePrizesModal);

  if (prizesDialog) {
    prizesDialog.addEventListener('keydown', e => {
      if (e.key === 'Escape') closePrizesModal();
    });
  }

  // --- 4. GESTÃO DO CARRINHO (CHECKOUT REAL E LIMPO) ---
  const CART_STORAGE_KEY = 'u51_founder_cart';
  let cart = {
    hasItem: false,
    delivery: 'pickup', // 'pickup' ou 'shipping'
  };

  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed.hasItem === 'boolean') {
        cart = parsed;
      }
    }
  } catch (e) {}

  function saveCart() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {}
  }

  const cartDrawer = $('#cart-drawer');
  const cartOverlay = $('#cart-drawer-overlay');
  const closeCartBtn = $('#close-cart-btn');
  const cartPillCount = $('.cart-pill-count');
  const cartBody = $('#cart-drawer-content');

  function updateCartUI() {
    if (cartPillCount) {
      cartPillCount.textContent = cart.hasItem ? '1' : '0';
      cartPillCount.dataset.count = cart.hasItem ? '1' : '0';
    }

    if (!cartBody) return;

    if (!cart.hasItem) {
      cartBody.innerHTML = `
        <div class="cart-empty-state">
          <p style="color: var(--color-text-sub); margin-bottom: 20px;">Seu carrinho está vazio.</p>
          <button class="btn-dialog-add-pass" id="btn-add-from-empty">
            Garantir Passe Fundador · R$ 110,00
          </button>
        </div>
      `;
      $('#btn-add-from-empty')?.addEventListener('click', () => {
        addItemToCart();
      });
      return;
    }

    const isShipping = cart.delivery === 'shipping';
    const deliverySummary = isShipping ? 'Envio pelos Correios (sob consulta)' : 'Retirada gratuita no Marco Fundador (21/11)';
    const waText = encodeURIComponent(
      `Olá! Tenho interesse em garantir meu Passe Fundador do Universo Q51 (R$ 110,00).\nEntrega: ${deliverySummary}.\nPor favor, me envie as instruções oficiais de pagamento.`
    );

    cartBody.innerHTML = `
      <div class="cart-item-row">
        <div class="cart-item-details">
          <div class="cart-item-title">Passe Fundador Q51</div>
          <div class="cart-item-desc">2 Livros Físicos + Acervo Digital + 2 Chances Douradas</div>
          <div style="margin-top: 6px; font-weight: 700; font-size: 14px;" class="price-tag-pass">
            R$ 110,00 <span style="font-size: 11.5px; font-weight: normal; color: var(--color-text-sub);">(ou até 3× de R$ 39,90)</span>
          </div>
        </div>
        <div class="cart-item-qty-wrap">
          <button class="btn-cart-remove" id="btn-cart-remove" aria-label="Remover item do carrinho">Remover</button>
        </div>
      </div>

      <div class="cart-delivery-box">
        <div class="cart-section-title">Modo de Recebimento</div>
        <label class="cart-radio-option">
          <input type="radio" name="cart_delivery" value="pickup" ${!isShipping ? 'checked' : ''}>
          <div>
            <strong>Retirada no Marco Fundador (21/11)</strong>
            <small>Livraria Leitura, Shopping Del Rey (2º Andar), BH — Gratuito</small>
          </div>
        </label>
        <label class="cart-radio-option">
          <input type="radio" name="cart_delivery" value="shipping" ${isShipping ? 'checked' : ''}>
          <div>
            <strong>Envio Nacional via Correios</strong>
            <small>Disponível pós-evento para todo o Brasil (frete sob consulta)</small>
          </div>
        </label>
      </div>

      <div class="cart-totals-box">
        <div class="cart-totals-row">
          <span>Subtotal:</span>
          <span>R$ 110,00</span>
        </div>
        <div class="cart-totals-row">
          <span>Entrega:</span>
          <span>${isShipping ? 'Sob consulta pós-evento' : 'Gratuita (Retirada 21/11)'}</span>
        </div>
        <div class="cart-totals-row cart-total-final">
          <span>Total à vista:</span>
          <span class="price-tag-pass">R$ 110,00</span>
        </div>
      </div>

      <div class="checkout-actions-block">
        <!-- Opção 1: Compra direta com a Agência / Pix ou Cartão -->
        <a 
          href="https://wa.me/5531983040444?text=${waText}" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="btn-checkout-primary-wa"
          id="btn-whatsapp-checkout"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/></svg>
          <span>Pagar Online via WhatsApp Oficial ↗</span>
        </a>

        <!-- Opção 2: Reserva Oficial para pagar na Livraria -->
        <button type="button" class="btn-checkout-reserve" id="btn-toggle-quick-reserve">
          Reservar para pagar na Livraria Leitura (21/11) ↓
        </button>

        <!-- Formulário de Reserva Oficial Embutido (Persistência real no SQLite) -->
        <div id="drawer-quick-reserve-box" class="quick-reserve-form-drawer" hidden>
          <h4>Reserva Oficial do Marco Fundador</h4>
          <p>Garante seu exemplar físico nos caixas da Livraria Leitura Del Rey no dia 21/11.</p>
          <form id="drawer-reserve-form" data-kind="founder">
            <input type="hidden" name="priority" value="on">
            <div class="form-group-mini">
              <input type="text" name="name" class="form-input-mini" placeholder="Seu Nome Completo *" required maxlength="100">
            </div>
            <div class="form-group-mini">
              <input type="email" name="email" class="form-input-mini" placeholder="Seu E-mail *" required maxlength="180">
            </div>
            <div class="form-group-mini">
              <input type="tel" name="phone" class="form-input-mini" placeholder="WhatsApp com DDD *" required maxlength="30">
            </div>
            <div class="form-group-mini">
              <input type="text" name="instagram" class="form-input-mini" placeholder="Instagram (@seuusuario)" required maxlength="30">
            </div>
            <label class="consent" style="margin: 8px 0; font-size: 10px;">
              <input name="consent" required type="checkbox">
              <span>Autorizo o uso dos dados para esta reserva oficial.</span>
            </label>
            <button type="submit" class="btn-submit-quick-reserve" id="btn-submit-drawer-reserve">
              Confirmar Reserva do Passe Fundador
            </button>
            <p class="form-status" style="font-size: 11px; margin-top: 8px;" role="status"></p>
          </form>
        </div>
      </div>
    `;

    // Listeners do Carrinho
    $('#btn-cart-remove')?.addEventListener('click', () => {
      cart.hasItem = false;
      saveCart();
      updateCartUI();
    });

    $$('input[name="cart_delivery"]').forEach(radio => {
      radio.addEventListener('change', e => {
        cart.delivery = e.target.value;
        saveCart();
        updateCartUI();
      });
    });

    // Toggle da Reserva no Carrinho
    const toggleReserveBtn = $('#btn-toggle-quick-reserve');
    const reserveBox = $('#drawer-quick-reserve-box');
    if (toggleReserveBtn && reserveBox) {
      toggleReserveBtn.addEventListener('click', () => {
        const isHidden = reserveBox.hidden;
        reserveBox.hidden = !isHidden;
        toggleReserveBtn.textContent = isHidden
          ? 'Fechar formulário de reserva ↑'
          : 'Reservar para pagar na Livraria Leitura (21/11) ↓';
      });
    }

    // Submissão da Reserva Rápida (Dispara o fluxo real de /api/register)
    const reserveForm = $('#drawer-reserve-form');
    if (reserveForm) {
      reserveForm.addEventListener('submit', async e => {
        e.preventDefault();
        const status = reserveForm.querySelector('.form-status');
        const submitBtn = $('#btn-submit-drawer-reserve');

        if (!reserveForm.reportValidity()) return;

        const formData = new FormData(reserveForm);
        const data = {
          kind: 'founder',
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          instagram: formData.get('instagram'),
          priority: true,
          consent: formData.get('consent') === 'on',
        };

        submitBtn.disabled = true;
        status.textContent = 'Gravando sua reserva oficial no Marco Fundador…';

        try {
          const res = await fetch('/api/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Idempotency-Key': crypto.randomUUID ? crypto.randomUUID() : 'idemp-' + Date.now(),
            },
            body: JSON.stringify(data),
          });

          const r = await res.json();
          if (!res.ok) throw new Error(r.error || 'Falha ao registrar reserva.');

          status.textContent = 'Reserva confirmada com sucesso!';
          closeCartDrawer();

          // Abre a credencial oficial gerada e salva
          const credModal = $('#credential-dialog');
          if (credModal) {
            $('#credential-name').textContent = r.name || data.name;
            $('#credential-id').textContent = r.credential || '#U51-FND';
            $('#priority-status').textContent =
              'Reserva com prioridade do Passe Fundador registrada nos caixas da Leitura Del Rey.';
            credModal.showModal();
          }
        } catch (err) {
          status.textContent = err.message || 'Erro ao registrar reserva. Tente novamente.';
        } finally {
          submitBtn.disabled = false;
        }
      });
    }
  }

  function addItemToCart() {
    cart.hasItem = true;
    saveCart();
    updateCartUI();
    openCartDrawer();
  }

  function openCartDrawer() {
    updateCartUI();
    if (cartDrawer && cartOverlay) {
      cartDrawer.classList.add('open');
      cartOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeCartDrawer() {
    if (cartDrawer && cartOverlay) {
      cartDrawer.classList.remove('open');
      cartOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  // Triggers globais para abrir carrinho / adicionar passe
  $$('.open-cart-trigger').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      openCartDrawer();
    });
  });

  $$('.trigger-add-pass').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      addItemToCart();
    });
  });

  if (dialogAddPassBtn) {
    dialogAddPassBtn.addEventListener('click', () => {
      closePrizesModal();
      addItemToCart();
    });
  }

  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);

  // Inicializa UI do carrinho
  updateCartUI();

  // --- 5. 3D TILT EFFECT NO CARTÃO DOURADO ---
  if (goldenCardContainer) {
    const wrap = goldenCardContainer.querySelector('.golden-card-wrapper');
    if (wrap) {
      goldenCardContainer.addEventListener('mousemove', e => {
        const rect = goldenCardContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rx = (cy - y) / 14;
        const ry = (x - cx) / 16;
        wrap.style.transform = `scale(1.025) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      goldenCardContainer.addEventListener('mouseleave', () => {
        wrap.style.transform = 'scale(1) rotateX(0deg) rotateY(0deg)';
      });
    }
  }
})();
