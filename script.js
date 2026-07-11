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
   11. INNER PARALLAX — card image effect
   ================================================================ */
function initInnerParallax() {
  if (prefersReducedMotion) return;

  document.querySelectorAll('.lavori__img-wrap').forEach(wrap => {
    const bg = wrap.querySelector('.lavori__placeholder');
    if (!bg) return;

    let raf = null;
    let tx = 0, ty = 0;   // lerp target
    let cx = 0, cy = 0;   // current (lerped) value
    let active = false;

    function tick() {
      cx += (tx - cx) * 0.1;
      cy += (ty - cy) * 0.1;
      bg.style.transform = `scale(1.12) translate(${cx}px, ${cy}px)`;

      const settled = !active && Math.abs(tx - cx) < 0.05 && Math.abs(ty - cy) < 0.05;
      if (settled) {
        bg.style.transform = 'scale(1.12)';
        raf = null;
      } else {
        raf = requestAnimationFrame(tick);
      }
    }

    wrap.addEventListener('mouseenter', () => {
      active = true;
      if (!raf) raf = requestAnimationFrame(tick);
    });

    wrap.addEventListener('mousemove', e => {
      const r = wrap.getBoundingClientRect();
      const nx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2); // -1..1
      const ny = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2); // -1..1
      tx = nx * 10;   // max ±10px orizzontale
      ty = ny * 7;    // max ±7px verticale
    });

    wrap.addEventListener('mouseleave', () => {
      active = false;
      tx = 0;
      ty = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    });
  });
}

/* ================================================================
   12. LOGO CARD — 3D magnetic tilt + shine
   ================================================================ */
function initLogoCardTilt() {
  if (prefersReducedMotion) return;

  const card = document.querySelector('.hero__logo-col');
  const logo = card?.querySelector('.hero__logo');
  if (!card) return;

  let raf = null;
  let tx = 0, ty = 0;   // target rotation (degrees)
  let cx = 0, cy = 0;   // current rotation (lerped)
  let active = false;

  function tick() {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;

    card.style.transform = `perspective(900px) rotateY(${cx.toFixed(3)}deg) rotateX(${cy.toFixed(3)}deg) scale(1.016)`;
    if (logo) logo.style.transform = `translate(${(-cx * 1.8).toFixed(2)}px, ${(-cy * 1.8).toFixed(2)}px)`;

    const done = !active && Math.abs(tx - cx) < 0.015 && Math.abs(ty - cy) < 0.015;
    if (done) {
      card.style.transform = '';
      if (logo) logo.style.transform = '';
      raf = null;
    } else {
      raf = requestAnimationFrame(tick);
    }
  }

  card.addEventListener('mouseenter', () => {
    active = true;
    if (!raf) raf = requestAnimationFrame(tick);
  });

  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const nx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
    const ny = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
    tx =  nx * 13;   // rotateY: max ±13°
    ty = -ny *  9;   // rotateX: max ±9° (inverted — mouse su = card si inclina in avanti)
    card.style.setProperty('--shine-x', `${((e.clientX - r.left) / r.width  * 100).toFixed(1)}%`);
    card.style.setProperty('--shine-y', `${((e.clientY - r.top)  / r.height * 100).toFixed(1)}%`);
  });

  card.addEventListener('mouseleave', () => {
    active = false;
    tx = 0;
    ty = 0;
    if (!raf) raf = requestAnimationFrame(tick);
  });
}

/* ================================================================
   13. INIT
   ================================================================ */
initHeroAnimation();
initInnerParallax();
initLogoCardTilt();
