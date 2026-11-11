/**
 * Universo Q51 — Cosmic Starfield & Shooting Stars Engine
 * Efeito visual de alta performance: cosmos + estrelas cadentes coloridas
 */
(function() {
  const canvas = document.getElementById('starfield-canvas') || document.getElementById('cosmic-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let stars = [];
  let shootingStars = [];

  const SHOOTING_COLORS = ['#e5c77a', '#c5a059', '#ffffff', '#d4d4d8'];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initStars();
  }

  function initStars() {
    stars = [];
    const count = Math.min(300, Math.floor((width * height) / 5000));
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.3,
        opacity: Math.random() * 0.7 + 0.2,
        blinkSpeed: 0.005 + Math.random() * 0.015,
        isGold: Math.random() > 0.82
      });
    }
  }

  function createShootingStar() {
    const color = SHOOTING_COLORS[Math.floor(Math.random() * SHOOTING_COLORS.length)];
    shootingStars.push({
      x: Math.random() * width,
      y: Math.random() * (height * 0.4),
      length: 70 + Math.random() * 100,
      speed: 10 + Math.random() * 12,
      opacity: 1,
      color: color,
      angle: (Math.PI / 4) + (Math.random() * 0.2 - 0.1)
    });
  }

  let animationFrameId;let paused=matchMedia('(prefers-reduced-motion:reduce)').matches;document.addEventListener('q51:motion',e=>{paused=e.detail.paused;cancelAnimationFrame(animationFrameId);if(!document.hidden)draw()});

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // 1. Estrelas de fundo
    for (let s of stars) {
      s.opacity += s.blinkSpeed;
      if (s.opacity > 1 || s.opacity < 0.2) s.blinkSpeed *= -1;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = s.isGold ? `rgba(229, 199, 122, ${s.opacity})` : `rgba(255, 255, 255, ${s.opacity})`;
      ctx.fill();
    }

    // 2. Estrelas cadentes
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];
      s.x += Math.cos(s.angle) * s.speed;
      s.y += Math.sin(s.angle) * s.speed;
      s.opacity -= 0.015;

      if (s.opacity <= 0) {
        shootingStars.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = s.opacity;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - Math.cos(s.angle) * s.length, s.y - Math.sin(s.angle) * s.length);
      ctx.stroke();

      // Ponto de luz na ponta
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (Math.random() < 0.012) {
      createShootingStar();
    }

    if(!paused)animationFrameId = requestAnimationFrame(draw);
  }

  // Pausar se a aba ficar oculta
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrameId);
    } else {
      if(!paused)animationFrameId = requestAnimationFrame(draw);
    }
  });

  window.addEventListener('resize', resize);
  resize();
  draw();
})();
