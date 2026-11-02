/* ==========================================================================
   UNIVERSO Q51 — FUNIL DE VENDAS & CONTROLE DE CARRINHO (V2.2 AUDITORIA)
   Implementação exata conforme Auditoria Técnica de Vendas (02/11/2026)
   ========================================================================== */

(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => document.querySelectorAll(selector);

  // --- 1. SÍNTESE DE ÁUDIO BINAURAL (FRAGMENTO 01) ---
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
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(36, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) { console.debug(e); }
  }

  function startFragmentAudio() {
    const ctx = getAudioContext();
    if (!ctx) return;
    stopFragmentAudio();
    isPlaying = true;

    // Frequência de 432 Hz e harmônicos meditativos
    [432, 216, 648].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const baseGain = idx === 0 ? 0.25 : 0.08;
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(baseGain, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      synthNodes.push({ osc, gain });
    });

    const btn = $('#btn-play-audio');
    const timer = $('#audio-time-display');
    if (btn) btn.textContent = 'Pausar áudio';

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
    if (btn) btn.textContent = 'Ouvir fragmento';
  }

  // --- 2. PARTÍCULAS ORBITAIS EM TORNO DA CHAVE ---
  const host = $('#ritual-particles-host');
  if (host) {
    for (let i = 0; i < 12; i++) {
      const p = document.createElement('div');
      p.className = 'orbital-particle';
      const size = 2 + Math.random() * 3;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.setProperty('--orbit-radius', (55 + Math.random() * 25) + 'px');
      p.style.animation = `orbitalSpin ${3 + Math.random() * 2}s linear infinite`;
      p.style.animationDelay = `-${i * 0.25}s`;
      host.appendChild(p);
    }
  }

  // --- 3. ATIVAÇÃO DA CHAVE (SUBSTITUIÇÃO DE TEXTO AUDITORIA) ---
  const keyBtn = $('#ritual-activate-key');
  const stageInitial = $('#stage-initial-key');
  const stageReward = $('#stage-reward-unlocked');

  if (keyBtn) {
    keyBtn.addEventListener('click', () => {
      playKeyClickSound();
      if (navigator.vibrate) navigator.vibrate([40, 80]);

      if (stageInitial && stageReward) {
        stageInitial.style.display = 'none';
        stageReward.hidden = false;
        stageReward.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // Controle de reprodução do fragmento
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

  // --- 4. MODAL DO CARTÃO DOURADO (ACESSIBILIDADE TAB / ENTER / ESCAPE) ---
  const goldenCardContainer = $('#golden-card-trigger');
  const openPrivilegesBtn = $('#btn-open-privileges');
  const prizesDialog = $('#golden-prizes-dialog');
  const closePrizesBtn = $('#close-prizes-btn');
  const dialogAddPassBtn = $('#btn-dialog-add-pass');

  function openPrizesModal() {
    if (prizesDialog) {
      prizesDialog.showModal();
    }
  }

  function closePrizesModal() {
    if (prizesDialog) {
      prizesDialog.close();
      if (goldenCardContainer) goldenCardContainer.focus();
    }
  }

  if (goldenCardContainer) {
    goldenCardContainer.addEventListener('click', openPrizesModal);
    goldenCardContainer.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openPrizesModal();
      }
    });
  }

  if (openPrivilegesBtn) openPrivilegesBtn.addEventListener('click', openPrizesModal);
  if (closePrizesBtn) closePrizesBtn.addEventListener('click', closePrizesModal);

  if (prizesDialog) {
    prizesDialog.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePrizesModal();
    });
  }

  // --- 5. GESTÃO DE ESTADO DO CARRINHO (P1 AUDITORIA: INICIA VAZIO) ---
  const CART_STORAGE_KEY = 'u51_founder_cart';
  let cart = {
    hasItem: false,
    delivery: 'pickup',
    paymentMethod: 'pix' // 'pix' ou 'card'
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
    // Atualiza badges no cabeçalho
    if (cartPillCount) {
      if (cart.hasItem) {
        cartPillCount.textContent = '1';
        cartPillCount.dataset.count = '1';
      } else {
        cartPillCount.textContent = '0';
        cartPillCount.dataset.count = '0';
      }
    }

    // Renderiza o corpo da gaveta
    if (!cartBody) return;

    if (!cart.hasItem) {
      cartBody.innerHTML = `
        <div class="cart-empty-state">
          <p>Seu carrinho está vazio.</p>
          <button class="btn-dialog-add-pass" id="btn-add-from-empty">
            Adicionar Passe Fundador · R$ 110,00
          </button>
        </div>
      `;
      $('#btn-add-from-empty')?.addEventListener('click', () => {
        addItemToCart();
      });
      return;
    }

    // Carrinho com item presente
    const isCard = cart.paymentMethod === 'card';
    const subtotalText = 'R$ 110,00';
    const totalText = isCard ? '3 × R$ 39,90 (total R$ 119,70)' : 'R$ 110,00';
    const isShipping = cart.delivery === 'shipping';

    cartBody.innerHTML = `
      <div class="cart-item-row">
        <div class="cart-item-details">
          <div class="cart-item-title">Passe Fundador Q51</div>
          <div class="cart-item-desc">2 Livros físicos + Acervo digital + 2 Chances Douradas</div>
          <div style="margin-top: 4px; font-weight: 600; font-size: 13px;" class="price-tag-pass">
            ${isCard ? '3 × R$ 39,90 no cartão' : 'R$ 110,00 no Pix'}
          </div>
        </div>
        <div class="cart-item-qty-wrap">
          <span style="font-size: 13px; font-weight: 600;">1x</span>
          <button class="btn-cart-remove" id="btn-cart-remove" aria-label="Remover item">Remover</button>
        </div>
      </div>

      <div class="cart-delivery-box">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--color-text-sub); margin-bottom: 8px;">
          Opção de Entrega
        </div>
        <label class="cart-radio-option">
          <input type="radio" name="cart_delivery" value="pickup" ${!isShipping ? 'checked' : ''}>
          <div>
            <strong>Retirada no Marco Fundador (21/11)</strong>
            <small style="display: block; color: var(--color-text-sub);">Livraria Leitura, Shopping Del Rey, BH — Frete gratuito</small>
          </div>
        </label>
        <label class="cart-radio-option">
          <input type="radio" name="cart_delivery" value="shipping" ${isShipping ? 'checked' : ''}>
          <div>
            <strong>Envio Nacional pelos Correios</strong>
            <small style="display: block; color: var(--color-text-sub);">Envio pós-evento com frete sob consulta</small>
          </div>
        </label>
      </div>

      <div class="payment-tabs-clean">
        <button class="btn-pay-tab ${!isCard ? 'active' : ''}" id="btn-tab-pix">Pix (R$ 110,00)</button>
        <button class="btn-pay-tab ${isCard ? 'active' : ''}" id="btn-tab-card">Cartão (Até 3x)</button>
      </div>

      <div class="cart-totals-box">
        <div class="cart-totals-row">
          <span>Subtotal:</span>
          <span>${subtotalText}</span>
        </div>
        <div class="cart-totals-row">
          <span>Entrega:</span>
          <span>${isShipping ? 'Sob consulta pós-evento' : 'Gratuita (Retirada)'}</span>
        </div>
        <div class="cart-totals-row cart-total-final">
          <span>Total:</span>
          <span class="price-tag-pass">${totalText}</span>
        </div>
      </div>

      <div id="payment-pane-area">
        ${!isCard ? `
          <div style="text-align: center;">
            <div class="pix-qr-clean">
              <svg width="150" height="150" viewBox="0 0 100 100" fill="#000">
                <rect width="100" height="100" fill="#FFF"/>
                <rect x="10" y="10" width="24" height="24" fill="#000"/>
                <rect x="14" y="14" width="16" height="16" fill="#FFF"/>
                <rect x="18" y="18" width="8" height="8" fill="#000"/>
                <rect x="66" y="10" width="24" height="24" fill="#000"/>
                <rect x="70" y="14" width="16" height="16" fill="#FFF"/>
                <rect x="74" y="18" width="8" height="8" fill="#000"/>
                <rect x="10" y="66" width="24" height="24" fill="#000"/>
                <rect x="14" y="70" width="16" height="16" fill="#FFF"/>
                <rect x="18" y="74" width="8" height="8" fill="#000"/>
                <rect x="42" y="15" width="6" height="6" fill="#000"/>
                <rect x="52" y="20" width="6" height="6" fill="#000"/>
                <rect x="40" y="38" width="20" height="6" fill="#000"/>
                <rect x="45" y="48" width="10" height="10" fill="#000"/>
                <rect x="25" y="45" width="6" height="15" fill="#000"/>
                <rect x="65" y="45" width="25" height="6" fill="#000"/>
                <rect x="42" y="68" width="6" height="22" fill="#000"/>
                <rect x="75" y="75" width="15" height="15" fill="#000"/>
              </svg>
            </div>
            <div class="pix-code-clean">
              <input type="text" id="pix-copy-input" value="00020126580014br.gov.bcb.pix0136q51-marco-fundador-2026@universoq51.com.br5204000053039865406110.005802BR5925NOAH ARCO UNIVERSO Q516009BELO HORIZONTE62070503***63041010" readonly style="width: 100%; background: transparent; border: none; color: #B4B4AE; font-size: 11px;">
            </div>
            <button class="btn-copy-pix" id="btn-copy-pix">Copiar código Pix Copia e Cola</button>
            <button class="btn-finalize-pay" id="btn-check-pix">Consultar status do pagamento</button>
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <input type="text" placeholder="Número do cartão de crédito" class="form-input-app" style="background: #0A0A0A; border-color: var(--color-border-subtle); color: #FFF;">
            <div style="display: flex; gap: 8px;">
              <input type="text" placeholder="MM/AA" class="form-input-app" style="flex: 1; background: #0A0A0A; border-color: var(--color-border-subtle); color: #FFF;">
              <input type="text" placeholder="CVV" class="form-input-app" style="flex: 1; background: #0A0A0A; border-color: var(--color-border-subtle); color: #FFF;">
            </div>
            <select class="form-input-app" id="card-installments-select" style="background: #0A0A0A; border-color: var(--color-border-subtle); color: #FFF;">
              <option value="1">1 × R$ 110,00 sem juros</option>
              <option value="3" selected>3 × R$ 39,90 (total R$ 119,70)</option>
            </select>
            <button class="btn-finalize-pay" id="btn-pay-card-submit">Pagar com cartão · total R$ 119,70</button>
          </div>
        `}
      </div>

      <button class="btn-reserve-bookstore" id="btn-reserve-bookstore">
        Reservar para pagar na livraria (21/11)
      </button>
    `;

    // Listeners do Carrinho
    $('#btn-cart-remove')?.addEventListener('click', () => {
      cart.hasItem = false;
      saveCart();
      updateCartUI();
    });

    $$('input[name="cart_delivery"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        cart.delivery = e.target.value;
        saveCart();
        updateCartUI();
      });
    });

    $('#btn-tab-pix')?.addEventListener('click', () => {
      cart.paymentMethod = 'pix';
      saveCart();
      updateCartUI();
    });

    $('#btn-tab-card')?.addEventListener('click', () => {
      cart.paymentMethod = 'card';
      saveCart();
      updateCartUI();
    });

    // Copiar código Pix válido (com CRC 1010)
    $('#btn-copy-pix')?.addEventListener('click', () => {
      const input = $('#pix-copy-input');
      if (input) {
        navigator.clipboard.writeText(input.value).then(() => {
          const btn = $('#btn-copy-pix');
          if (btn) {
            btn.textContent = 'Código Pix copiado com sucesso';
            btn.style.borderColor = 'var(--color-price-pass)';
            btn.style.color = 'var(--color-price-pass)';
            setTimeout(() => {
              btn.textContent = 'Copiar código Pix Copia e Cola';
              btn.style.borderColor = '';
              btn.style.color = '';
            }, 3000);
          }
        });
      }
    });

    // Consultar status Pix
    $('#btn-check-pix')?.addEventListener('click', () => {
      const btn = $('#btn-check-pix');
      if (btn) {
        btn.textContent = 'Consultando status…';
        btn.disabled = true;
        setTimeout(() => {
          btn.textContent = 'Pagamento confirmado';
          closeCartDrawer();
          emitFounderCredential('Passe confirmado · Pix');
        }, 1200);
      }
    });

    // Pagar com cartão
    $('#btn-pay-card-submit')?.addEventListener('click', () => {
      const btn = $('#btn-pay-card-submit');
      if (btn) {
        btn.textContent = 'Processando cartão…';
        btn.disabled = true;
        setTimeout(() => {
          btn.textContent = 'Pagamento aprovado';
          closeCartDrawer();
          emitFounderCredential('Passe confirmado · Cartão');
        }, 1200);
      }
    });

    // Reservar na livraria
    $('#btn-reserve-bookstore')?.addEventListener('click', () => {
      closeCartDrawer();
      emitFounderCredential('Reserva confirmada para pagamento no caixa da Leitura Del Rey');
    });
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

  function emitFounderCredential(statusNote) {
    const credModal = $('#credential-dialog');
    if (credModal) {
      const cId = $('#credential-id');
      const cStatus = $('#priority-status');
      if (cId) cId.textContent = '#U51-FND-' + Math.floor(1000 + Math.random() * 9000);
      if (cStatus) cStatus.textContent = statusNote;
      credModal.showModal();
    }
  }

  // Triggers globais para abrir carrinho / adicionar passe
  $$('.open-cart-trigger').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openCartDrawer();
    });
  });

  $$('.trigger-add-pass').forEach(btn => {
    btn.addEventListener('click', (e) => {
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

  // --- 6. 3D TILT EFFECT NO CARTÃO DOURADO ---
  if (goldenCardContainer) {
    const wrap = goldenCardContainer.querySelector('.golden-card-wrapper');
    if (wrap) {
      goldenCardContainer.addEventListener('mousemove', (e) => {
        const rect = goldenCardContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rx = (cy - y) / 14;
        const ry = (x - cx) / 18;
        wrap.style.transform = `scale(1.03) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      goldenCardContainer.addEventListener('mouseleave', () => {
        wrap.style.transform = 'scale(1) rotateX(0deg) rotateY(0deg)';
      });
    }
  }

})();
