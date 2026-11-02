/* ==========================================================================
   UNIVERSO Q51 — FUNIL DE VENDAS & RITUAL DA CHAVE (FUNNEL.JS)
   Desenvolvido para executar o fluxo do esboço de Fábio Mesquita
   ========================================================================== */

(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => document.querySelectorAll(selector);

  // --- 1. SÍNTESE DE ÁUDIO SCI-FI (WEB AUDIO API - ZERO ARQUIVOS EXTERNOS) ---
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function playSciFiThud() {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(32, ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.7, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.7);
    } catch (e) { console.debug(e); }
  }

  function playChime() {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + (idx * 0.08));
        gain.gain.setValueAtTime(0.3, ctx.currentTime + (idx * 0.08));
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (idx * 0.08) + 0.9);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + (idx * 0.08));
        osc.stop(ctx.currentTime + (idx * 0.08) + 0.9);
      });
    } catch (e) { console.debug(e); }
  }

  // --- 2. PARTÍCULAS ORBITAIS EM TORNO DA CHAVE (ESTILO AI STUDIO) ---
  const host = $('#ritual-particles-host');
  if (host) {
    for (let i = 0; i < 12; i++) {
      const p = document.createElement('div');
      p.className = 'orbital-particle';
      const size = 3 + Math.random() * 4;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.setProperty('--orbit-radius', (65 + Math.random() * 35) + 'px');
      p.style.animation = `orbitalSpin ${3 + Math.random() * 2}s linear infinite`;
      p.style.animationDelay = `-${i * 0.25}s`;
      host.appendChild(p);
    }
  }

  // --- 3. CLIQUE NA CHAVE -> LOOT BOX EFFECT (ESBOÇO 1) ---
  const keyBtn = $('#ritual-activate-key');
  const shockwave = $('#lootbox-shockwave');
  const stageInitial = $('#stage-initial-key');
  const stageReward = $('#stage-reward-unlocked');

  if (keyBtn) {
    keyBtn.addEventListener('click', () => {
      // Áudio e feedback tátil
      playSciFiThud();
      setTimeout(playChime, 300);
      if (navigator.vibrate) navigator.vibrate([40, 60, 120]);

      // Explosão Shockwave
      if (shockwave) {
        shockwave.classList.add('active');
        setTimeout(() => shockwave.classList.remove('active'), 900);
      }

      // Transição para o Card de Parabéns
      if (stageInitial && stageReward) {
        stageInitial.style.display = 'none';
        stageReward.hidden = false;
        stageReward.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // --- 4. COLETA DO FRAGMENTO E TRANSIÇÃO PARA O PASSE FUNDADOR (ESBOÇO 2) ---
  const rewardForm = $('#reward-collect-form');
  const skipLink = $('#skip-to-fundador');
  const salesStage = $('#fundador-sales-stage');

  function transitionToSales() {
    if (salesStage) {
      salesStage.hidden = false;
      salesStage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  if (rewardForm) {
    rewardForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = rewardForm.querySelector('input[name="reward_email"]')?.value;
      const phone = rewardForm.querySelector('input[name="reward_phone"]')?.value;
      
      // Salva no formulário de fundadores para auto-preencher checkout
      const fEmail = $('#founder-email');
      const fPhone = $('#founder-phone');
      if (fEmail && email) fEmail.value = email;
      if (fPhone && phone) fPhone.value = phone;

      playChime();
      const submitBtn = rewardForm.querySelector('.reward-collect-btn');
      if (submitBtn) {
        submitBtn.textContent = '✓ Fragmento Salvo no Seu Acervo!';
        submitBtn.style.background = '#10B981';
        submitBtn.style.color = '#FFF';
      }

      setTimeout(transitionToSales, 700);
    });
  }

  if (skipLink) {
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      transitionToSales();
    });
  }

  // --- 5. INTERAÇÃO DO CARTÃO DOURADO (CLIQUE -> MODAL DE PRÊMIOS) ---
  const goldenCardTrigger = $('#golden-card-trigger');
  const prizesDialog = $('#golden-prizes-dialog');
  const closePrizesBtn = $('#close-prizes-btn');
  const buyFromPrizesBtn = $('#buy-from-prizes-btn');

  if (goldenCardTrigger && prizesDialog) {
    goldenCardTrigger.addEventListener('click', () => {
      playChime();
      prizesDialog.showModal();
    });
  }
  if (closePrizesBtn && prizesDialog) {
    closePrizesBtn.addEventListener('click', () => prizesDialog.close());
  }
  if (buyFromPrizesBtn && prizesDialog) {
    buyFromPrizesBtn.addEventListener('click', () => {
      prizesDialog.close();
      openCartDrawer();
    });
  }

  // --- 6. GAVETA LATERAL DO CARRINHO (DRAWER) & CHECKOUT 1-CLIQUE ---
  const cartDrawer = $('#cart-drawer');
  const cartOverlay = $('#cart-drawer-overlay');
  const openCartBtns = $$('.open-cart-trigger');
  const closeCartBtn = $('#close-cart-btn');

  function openCartDrawer() {
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

  openCartBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openCartDrawer();
  }));

  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);

  // --- 7. ABAS DE PAGAMENTO (PIX VS CARTÃO) ---
  const tabPixBtn = $('#tab-pay-pix');
  const tabCardBtn = $('#tab-pay-card');
  const panePix = $('#pane-pay-pix');
  const paneCard = $('#pane-pay-card');

  if (tabPixBtn && tabCardBtn) {
    tabPixBtn.addEventListener('click', () => {
      tabPixBtn.classList.add('active');
      tabCardBtn.classList.remove('active');
      if (panePix) panePix.hidden = false;
      if (paneCard) paneCard.hidden = true;
    });
    tabCardBtn.addEventListener('click', () => {
      tabCardBtn.classList.add('active');
      tabPixBtn.classList.remove('active');
      if (paneCard) paneCard.hidden = false;
      if (panePix) panePix.hidden = true;
    });
  }

  // Copiar código Pix
  const copyPixBtn = $('#copy-pix-btn');
  const pixCodeInput = $('#pix-copia-cola');
  if (copyPixBtn && pixCodeInput) {
    copyPixBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(pixCodeInput.value || pixCodeInput.innerText).then(() => {
        copyPixBtn.textContent = '✓ Código Pix Copiado com Sucesso!';
        copyPixBtn.style.borderColor = '#10B981';
        copyPixBtn.style.color = '#10B981';
        setTimeout(() => {
          copyPixBtn.textContent = '📋 Copiar Código Pix Copia e Cola';
          copyPixBtn.style.borderColor = '';
          copyPixBtn.style.color = '';
        }, 3000);
      });
    });
  }

  // Finalizar Pagamento
  const finalizePayBtns = $$('.trigger-finalize-payment');
  finalizePayBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      btn.disabled = true;
      btn.textContent = 'Processando Transmissão…';
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = '✓ Pedido Confirmado!';
        closeCartDrawer();
        
        // Dispara a emissão da credencial se a função confirm existir
        const credentialModal = $('#credential-dialog');
        if (credentialModal) {
          const fakeCode = '#U51-FND-' + Math.floor(1000 + Math.random() * 9000);
          const cName = $('#credential-name');
          const cId = $('#credential-id');
          const cStatus = $('#priority-status');
          if (cName) cName.textContent = $('#cart-cust-name')?.value || 'Membro Fundador Q51';
          if (cId) cId.textContent = fakeCode;
          if (cStatus) cStatus.textContent = 'Passe Fundador Confirmado: 2 Livros Físicos + 2 Chances Chave Dourada.';
          credentialModal.showModal();
        }
      }, 1200);
    });
  });

  // --- 8. 3D TILT EFFECT NOS CARDS DOS LIVROS (ESTILO AI STUDIO) ---
  $$('.tilt-card-wrap').forEach(card => {
    const inner = card.querySelector('.tilt-card-inner');
    if (!inner) return;
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (centerY - y) / 12;
      const rotateY = (x - centerX) / 15;
      inner.style.setProperty('--rotate-x', `${rotateX}deg`);
      inner.style.setProperty('--rotate-y', `${rotateY}deg`);
    });
    card.addEventListener('mouseleave', () => {
      inner.style.setProperty('--rotate-x', '0deg');
      inner.style.setProperty('--rotate-y', '0deg');
    });
  });

})();
