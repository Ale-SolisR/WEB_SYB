/**
 * S&B Solutions — JavaScript principal
 * Versión: 1.0.0
 */

'use strict';

/* ============================================================
   INICIALIZACIÓN
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavbar();
  initHeroCanvas();
  initScrollReveal();
  initCounters();
  initContactForm();
  initBackToTop();
  setCurrentYear();
  initLogoFallback();
});

/* ============================================================
   TEMA (3 opciones: blue / dark / orange)
   ============================================================ */
function initTheme() {
  const html        = document.documentElement;
  const themeBtns   = document.querySelectorAll('.theme-btn');
  const STORAGE_KEY = 'syb-theme';

  // Cargar tema guardado
  const saved = localStorage.getItem(STORAGE_KEY) || 'blue';
  applyTheme(saved);

  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.theme;
      applyTheme(theme);
      localStorage.setItem(STORAGE_KEY, theme);
    });
  });

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    themeBtns.forEach(b => {
      b.classList.toggle('active', b.dataset.theme === theme);
      b.setAttribute('aria-pressed', b.dataset.theme === theme);
    });
    // Re-dibujar canvas con nuevo color
    if (window._heroCtx) drawCanvas(window._heroCtx, theme);
  }
}

/* ============================================================
   NAVBAR — scroll + menú mobile
   ============================================================ */
function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('navMenu');
  const navLinks  = document.querySelectorAll('.nav-link');
  const sections  = document.querySelectorAll('section[id]');

  // Scroll: añadir clase .scrolled
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    highlightActiveLink();
    // Mostrar/ocultar back-to-top
    const btt = document.getElementById('backToTop');
    if (btt) btt.classList.toggle('visible', window.scrollY > 400);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Menú hamburguesa
  hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Cerrar menú al hacer clic en un link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Cerrar menú al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('open') &&
        !navMenu.contains(e.target) &&
        !hamburger.contains(e.target)) {
      navMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  // Resaltar link activo según sección visible
  function highlightActiveLink() {
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 100;
      if (window.scrollY >= top) current = sec.getAttribute('id');
    });
    navLinks.forEach(link => {
      const href = link.getAttribute('href').substring(1);
      link.classList.toggle('active', href === current);
    });
  }
}

/* ============================================================
   CANVAS HERO — partículas animadas
   ============================================================ */
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx    = canvas.getContext('2d');
  window._heroCtx = ctx;

  let particles = [];
  let animId;
  let W, H;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    buildParticles();
  }

  function getThemeColor() {
    const theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'dark')   return { r: 124, g: 109, b: 248 };
    if (theme === 'orange') return { r: 249, g: 115, b: 22 };
    return { r: 0, g: 112, b: 243 };
  }

  function buildParticles() {
    const count = Math.min(60, Math.floor((W * H) / 20000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2 + 1,
    }));
  }

  function drawCanvas(context, _theme) {
    if (!W || !H) return;
    const { r, g, b } = getThemeColor();
    context.clearRect(0, 0, W, H);

    // Conectar partículas cercanas
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          context.beginPath();
          context.strokeStyle = `rgba(${r},${g},${b},${0.12 * (1 - dist / 120)})`;
          context.lineWidth = 1;
          context.moveTo(particles[i].x, particles[i].y);
          context.lineTo(particles[j].x, particles[j].y);
          context.stroke();
        }
      }
    }

    // Dibujar partículas
    particles.forEach(p => {
      context.beginPath();
      context.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      context.fillStyle = `rgba(${r},${g},${b},0.5)`;
      context.fill();
    });
  }

  window.drawCanvas = drawCanvas;

  function animate() {
    const { r, g, b } = getThemeColor();
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${r},${g},${b},${0.15 * (1 - dist / 130)})`;
          ctx.lineWidth = 1;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},0.55)`;
      ctx.fill();
    });

    animId = requestAnimationFrame(animate);
  }

  // Observer para pausar cuando no es visible
  const heroSection = document.getElementById('inicio');
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          if (!animId) animate();
        } else {
          cancelAnimationFrame(animId);
          animId = null;
        }
      });
    }, { threshold: 0.1 });
    if (heroSection) obs.observe(heroSection);
  } else {
    animate();
  }

  window.addEventListener('resize', debounce(resize, 200));
  resize();
}

/* ============================================================
   SCROLL REVEAL — elementos aparecen al hacer scroll
   ============================================================ */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Escalonar animaciones en grupos
          const siblings = [...entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')];
          const delay    = siblings.indexOf(entry.target) * 80;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, Math.min(delay, 400));
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => obs.observe(el));
  } else {
    elements.forEach(el => el.classList.add('visible'));
  }
}

/* ============================================================
   CONTADORES ANIMADOS
   ============================================================ */
function initCounters() {
  const counters = document.querySelectorAll('.count');
  if (!counters.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => obs.observe(el));

  function animateCount(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1500;
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutQuart(progress);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }

    requestAnimationFrame(step);
  }

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }
}

/* ============================================================
   FORMULARIO DE CONTACTO
   Envía el mensaje vía WhatsApp (sin backend necesario)
   ============================================================ */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name    = form.querySelector('#contactName');
    const email   = form.querySelector('#contactEmail');
    const subject = form.querySelector('#contactSubject');
    const message = form.querySelector('#contactMessage');
    const btn     = form.querySelector('#submitBtn');

    // Validación simple
    let valid = true;
    [name, email, message].forEach(field => {
      field.classList.remove('error');
      if (!field.value.trim()) {
        field.classList.add('error');
        valid = false;
      }
    });

    if (email && email.value && !isValidEmail(email.value)) {
      email.classList.add('error');
      valid = false;
    }

    if (!valid) {
      shakeForm(form);
      return;
    }

    // Construir mensaje para WhatsApp
    const text = encodeURIComponent(
      `Hola S&B Solutions! 👋\n\n` +
      `*Nombre:* ${name.value.trim()}\n` +
      `*Correo:* ${email.value.trim()}\n` +
      `*Asunto:* ${subject.value.trim() || 'Sin asunto'}\n\n` +
      `*Mensaje:*\n${message.value.trim()}`
    );

    const waUrl = `https://wa.me/50687457877?text=${text}`;

    // Feedback visual
    btn.disabled = true;
    btn.textContent = '¡Enviando...';

    setTimeout(() => {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      form.reset();
      btn.disabled = false;
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        Enviar Mensaje`;
    }, 600);
  });

  // Limpiar error al escribir
  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', () => field.classList.remove('error'));
  });

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function shakeForm(el) {
    el.style.animation = 'shake 0.4s ease';
    el.addEventListener('animationend', () => {
      el.style.animation = '';
    }, { once: true });
  }
}

/* ============================================================
   VOLVER ARRIBA
   ============================================================ */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   AÑO ACTUAL EN FOOTER
   ============================================================ */
function setCurrentYear() {
  const el = document.getElementById('currentYear');
  if (el) el.textContent = new Date().getFullYear();
}

/* ============================================================
   FALLBACK DE LOGOS — si las imágenes no cargan
   ============================================================ */
function initLogoFallback() {
  const logos = document.querySelectorAll('.nav-logo img, .footer-logo img, .logo-full, .logo-icon');

  logos.forEach(img => {
    img.addEventListener('error', () => {
      // Ocultar la imagen rota
      img.style.display = 'none';

      // Si es el logo completo, mostrar texto alternativo
      if (img.classList.contains('logo-full') || img.id === 'logoFull' || img.id === 'footerLogoFull') {
        const parent = img.closest('.nav-logo, .footer-logo');
        if (parent && !parent.querySelector('.text-logo')) {
          const text = document.createElement('span');
          text.className = 'text-logo';
          text.textContent = 'S&B Solutions';
          parent.appendChild(text);
        }
      }
    });
  });
}

/* ============================================================
   SMOOTH SCROLL para links internos (complementa CSS)
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH   = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72;
    const top    = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ============================================================
   UTILIDADES
   ============================================================ */
function debounce(fn, wait) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

/* ============================================================
   ANIMACIÓN DE SHAKE (para validación del form)
   Inyectada vía JS para no contaminar el CSS
   ============================================================ */
(function injectShakeKeyframe() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%  { transform: translateX(-8px); }
      40%  { transform: translateX(8px); }
      60%  { transform: translateX(-5px); }
      80%  { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(style);
})();
