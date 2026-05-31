/* ============================================================
   POSSO FARLO IO — script.js
   Giunta Francesco | Artigiano edile Arco e Riva del Garda
   ============================================================ */

'use strict';

/* ================================================================
   1. HEADER SCROLL STATE
   ================================================================ */
const header = document.getElementById('header');

function handleHeaderScroll() {
  if (window.scrollY > 60) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleHeaderScroll, { passive: true });
handleHeaderScroll(); // run once on load


/* ================================================================
   2. HAMBURGER / MOBILE MENU
   ================================================================ */
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close menu when a nav link is clicked
navMenu.querySelectorAll('.nav__link, .nav__whatsapp').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// Close menu on outside click
document.addEventListener('click', e => {
  if (navMenu.classList.contains('open') &&
      !navMenu.contains(e.target) &&
      !hamburger.contains(e.target)) {
    navMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
});

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navMenu.classList.contains('open')) {
    navMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    hamburger.focus();
  }
});


/* ================================================================
   3. ACTIVE NAV LINK ON SCROLL (Intersection Observer)
   ================================================================ */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav__link');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle(
          'active',
          link.getAttribute('href') === `#${entry.target.id}`
        );
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));


/* ================================================================
   4. SCROLL REVEAL ANIMATION
   ================================================================ */
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger siblings in the same grid/list
      const delay = getSiblingIndex(entry.target) * 80;
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealElements.forEach(el => revealObserver.observe(el));

function getSiblingIndex(el) {
  const parent = el.parentElement;
  if (!parent) return 0;
  const siblings = [...parent.children].filter(c => c.classList.contains('reveal'));
  return siblings.indexOf(el);
}


/* ================================================================
   5. SMOOTH SCROLL (polyfill for anchor links)
   ================================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const headerH = header.offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ================================================================
   6. CONTACT FORM (placeholder — pronto per integrazione backend)
   ================================================================ */
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();

    const nome     = contactForm.querySelector('#nome').value.trim();
    const telefono = contactForm.querySelector('#telefono').value.trim();

    if (!nome || !telefono) {
      showFormFeedback('Inserisci nome e telefono per continuare.', 'error');
      return;
    }

    // --- Integrazione futura ---
    // Sostituire il blocco qui sotto con fetch a Formspree / Netlify / backend:
    //
    // fetch('/api/contact', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(Object.fromEntries(new FormData(contactForm)))
    // }).then(r => r.ok ? showFormFeedback('Messaggio inviato!', 'success') : showFormFeedback('Errore. Riprova.', 'error'));

    // Simulazione invio (rimuovere in produzione)
    const btn = contactForm.querySelector('.form-btn');
    btn.textContent = 'Invio in corso…';
    btn.disabled = true;

    setTimeout(() => {
      showFormFeedback('Richiesta inviata. Francesco ti contatterà a breve!', 'success');
      contactForm.reset();
      btn.textContent = 'Invia richiesta';
      btn.disabled = false;
    }, 1000);
  });
}

function showFormFeedback(message, type) {
  let existing = document.getElementById('form-feedback');
  if (existing) existing.remove();

  const el = document.createElement('p');
  el.id = 'form-feedback';
  el.textContent = message;
  el.style.cssText = `
    margin-top: .75rem;
    padding: .85rem 1.1rem;
    border-radius: 8px;
    font-size: .9rem;
    font-weight: 500;
    background: ${type === 'success' ? 'rgba(37,211,102,.15)' : 'rgba(220,50,50,.15)'};
    color: ${type === 'success' ? '#25D366' : '#ff6b6b'};
    border: 1px solid ${type === 'success' ? 'rgba(37,211,102,.3)' : 'rgba(220,50,50,.3)'};
  `;
  contactForm.appendChild(el);

  if (type === 'success') {
    setTimeout(() => el.remove(), 5000);
  }
}
