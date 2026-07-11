/* ============================================================
   POSSO FARLO IO — script.js
   ============================================================ */
'use strict';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================================================================
   1. HERO ANIMATION SEQUENCE
   ================================================================ */
function initHeroAnimation() {
  requestAnimationFrame(() => {
    document.body.classList.add('hero-ready');
  });
}

/* ================================================================
   2. HEADER SCROLL STATE
   ================================================================ */
const header = document.getElementById('header');

function handleHeaderScroll() {
  header.classList.toggle('scrolled', window.scrollY > 60);
}
window.addEventListener('scroll', handleHeaderScroll, { passive: true });
handleHeaderScroll();

/* ================================================================
   3. HAMBURGER / MOBILE MENU
   ================================================================ */
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('navMenu');

function closeMenu() {
  navMenu.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

navMenu.querySelectorAll('.nav__link, .nav__whatsapp').forEach(link => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('click', e => {
  if (navMenu.classList.contains('open') &&
      !navMenu.contains(e.target) &&
      !hamburger.contains(e.target)) {
    closeMenu();
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navMenu.classList.contains('open')) {
    closeMenu();
    hamburger.focus();
  }
});

/* ================================================================
   4. ACTIVE NAV LINK ON SCROLL
   ================================================================ */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav__link');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));

/* ================================================================
   5. SCROLL REVEAL — data-reveal system
   ================================================================ */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const parent = el.closest('[data-stagger-group]');
    if (parent) {
      const siblings = [...parent.querySelectorAll('[data-reveal]')];
      const index = siblings.indexOf(el);
      setTimeout(() => el.classList.add('in-view'), index * 90);
    } else {
      el.classList.add('in-view');
    }
    revealObserver.unobserve(el);
  });
}, { threshold: 0.1 });

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

/* ================================================================
   6. LEGACY .reveal SUPPORT
   ================================================================ */
const legacyRevealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const delay = getSiblingIndex(entry.target) * 80;
    setTimeout(() => entry.target.classList.add('visible'), delay);
    legacyRevealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => legacyRevealObserver.observe(el));

function getSiblingIndex(el) {
  const parent = el.parentElement;
  if (!parent) return 0;
  return [...parent.children].filter(c => c.classList.contains('reveal')).indexOf(el);
}

/* ================================================================
   7. HERO PARALLAX
   ================================================================ */
if (!prefersReducedMotion) {
  const heroBg = document.querySelector('.hero__bg');
  const heroSection = document.querySelector('.hero');
  let ticking = false;

  function updateParallax() {
    ticking = false; // always reset so the next scroll event can schedule RAF
    if (!heroBg || !heroSection) return;
    const scrolled = window.scrollY;
    if (scrolled > heroSection.offsetHeight) {
      heroBg.style.transform = '';
      return;
    }
    heroBg.style.transform = `translateY(${scrolled * 0.18}px)`;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
}

/* ================================================================
   8. METODO — step activation + progress track
   ================================================================ */
const metodoSection = document.querySelector('.metodo');
const metodoSteps   = document.querySelectorAll('.metodo__step');
const trackFill     = document.getElementById('metodoTrackFill');

if (metodoSection && metodoSteps.length) {
  const stepObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('is-active');
    });
  }, { threshold: 0.5 });

  metodoSteps.forEach(step => stepObserver.observe(step));

  if (trackFill && !prefersReducedMotion) {
    const trackObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        let progress = 0;
        const interval = setInterval(() => {
          progress = Math.min(progress + 1.5, 100);
          trackFill.style.width = `${progress}%`;
          if (progress >= 100) clearInterval(interval);
        }, 12);
        trackObserver.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    trackObserver.observe(metodoSection);
  }
}

/* ================================================================
   9. SMOOTH SCROLL
   ================================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 8;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ================================================================
   10. FORM → WHATSAPP
   ================================================================ */
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const nome      = contactForm.querySelector('#nome').value.trim();
    const zona      = contactForm.querySelector('#zona').value.trim();
    const lavoro    = contactForm.querySelector('#lavoro').value.trim();
    const messaggio = contactForm.querySelector('#messaggio').value.trim();

    let testo = 'Ciao Francesco, ti contatto dal sito web.';
    if (nome)      testo += `\n\nNome: ${nome}`;
    if (zona)      testo += `\nComune: ${zona}`;
    if (lavoro)    testo += `\nTipo di lavoro: ${lavoro}`;
    if (messaggio) testo += `\n\n${messaggio}`;
    testo += '\n\nVorrei ricevere informazioni / un preventivo.';

    window.open(`https://wa.me/393381102400?text=${encodeURIComponent(testo)}`, '_blank', 'noopener');
  });
}

/* ================================================================
   11. LAVORI CARD — paint-drip reveal (top → bottom, polygon clip-path)
   ================================================================ */
function initLavoriReveal() {
  if (prefersReducedMotion) return;

  document.querySelectorAll('.lavori__img-wrap').forEach(wrap => {
    const hoverWrap = wrap.querySelector('.lavori__img-hover-wrap');
    if (!hoverWrap) return;

    // JS takes over clip-path on the hover wrapper
    hoverWrap.style.transition = 'none';
    hoverWrap.style.clipPath   = 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)';

    let progress = 0; // 0 = hidden, 1 = fully revealed
    let target   = 0;
    let phase    = 0; // wave phase — advances each RAF frame
    let raf      = null;

    function polygon(p) {
      const N   = 28;
      const amp = 72 * p * (1 - p); // max 18% at p=0.5, zero at start/end
      const pts = ['0% 0%', '100% 0%'];
      for (let i = N; i >= 0; i--) {
        const x    = (i / N) * 100;
        const wave = amp * Math.max(0, Math.sin((x / 100) * 6 * Math.PI + phase));
        const y    = Math.min(100, p * 100 + wave);
        pts.push(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
      }
      return `polygon(${pts.join(', ')})`;
    }

    function tick() {
      phase    += 0.04;                         // wave flows as it descends
      progress += (target - progress) * 0.035;  // lerp dimezzato → ~2× più lento

      hoverWrap.style.clipPath = polygon(progress);

      if (Math.abs(target - progress) < 0.004) {
        progress                 = target;
        hoverWrap.style.clipPath = target === 1
          ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
          : 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)';
        raf = null;
      } else {
        raf = requestAnimationFrame(tick);
      }
    }

    wrap.addEventListener('mouseenter', () => {
      target = 1;
      if (!raf) raf = requestAnimationFrame(tick);
    });

    wrap.addEventListener('mouseleave', () => {
      target = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    });
  });
}

/* ================================================================
   12. LOGO CARD — tilt 3D che segue il mouse su tutto il viewport
   ================================================================ */
function initLogoCardTilt() {
  if (prefersReducedMotion) return;

  const card = document.querySelector('.hero__logo-col');
  if (!card) return;

  let raf = null;
  let cx = 0, cy = 0;
  let tx = 0, ty = 0;
  let ready = false; // diventa true solo dopo che l'animazione entrance è finita

  // L'animazione CSS `anim-from-left` usa fill-mode:forwards, che nella cascade
  // vince sui transform inline del JS. La cancelliamo appena finisce.
  card.addEventListener('animationend', () => {
    card.style.animation = 'none'; // rimuove fill-mode, sblocca transform JS
    card.style.opacity   = '1';    // mantiene l'opacità finale
    ready = true;
  }, { once: true });

  function tick() {
    if (!ready) { raf = null; return; }

    cx += (tx - cx) * 0.05;
    cy += (ty - cy) * 0.05;

    card.style.transform = `perspective(800px) rotateY(${cx.toFixed(2)}deg) rotateX(${cy.toFixed(2)}deg) scale(1.008)`;

    // Shadow leggera nella direzione opposta all'inclinazione
    const sx = (cx * 0.4).toFixed(1);
    const sy = (cy * -0.4).toFixed(1);
    card.style.boxShadow = `${sx}px ${sy}px 40px rgba(0,0,0,.45), 0 0 0 1px rgba(255,255,255,.06)`;

    // Shine segue il mouse
    const px = ((tx / 6 + 1) / 2 * 100).toFixed(1);
    const py = ((-ty / 4 + 1) / 2 * 100).toFixed(1);
    card.style.setProperty('--shine-x', `${px}%`);
    card.style.setProperty('--shine-y', `${py}%`);

    if (Math.abs(tx - cx) < 0.01 && Math.abs(ty - cy) < 0.01) {
      raf = null;
    } else {
      raf = requestAnimationFrame(tick);
    }
  }

  // Tracking globale: il mouse dovunque sul viewport muove la card
  window.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const nx = (e.clientX - (r.left + r.width  / 2)) / (window.innerWidth  / 2);
    const ny = (e.clientY - (r.top  + r.height / 2)) / (window.innerHeight / 2);
    tx =  nx * 6;
    ty = -ny * 4;
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });
}

/* ================================================================
   13. INIT
   ================================================================ */
initHeroAnimation();
initLavoriReveal();
initLogoCardTilt();
