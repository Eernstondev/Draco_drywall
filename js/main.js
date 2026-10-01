/* ==========================================================================
   Draco Prestige Drywall — main.js
   Shared behaviour (navigation, header, hero) and small helpers used by the
   other scripts through the window.Draco namespace.
   ========================================================================== */
window.Draco = window.Draco || {};

(function (Draco) {
  'use strict';

  /* ---------- Site settings ---------- */
  Draco.config = {
    locale: 'en-US',
    currency: 'USD', // Change to 'CAD', 'EUR', etc. Used for all prices.
  };

  /* ---------- Helpers ---------- */
  const ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

  Draco.escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ESCAPE_MAP[c]);

  Draco.formatPrice = (amount) => {
    if (typeof amount !== 'number') return '[PRICE]';
    return new Intl.NumberFormat(Draco.config.locale, {
      style: 'currency',
      currency: Draco.config.currency,
      maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);
  };

  // Parses "YYYY-MM-DD" as a local date (avoids the UTC shift of new Date("YYYY-MM-DD"))
  Draco.parseDate = (iso) => {
    const [y, m, d] = String(iso).split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  Draco.formatDateRange = (startISO, endISO) => {
    const fmt = new Intl.DateTimeFormat(Draco.config.locale, {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });
    const start = Draco.parseDate(startISO);
    if (!endISO || endISO === startISO) return fmt.format(start);
    const end = Draco.parseDate(endISO);
    return typeof fmt.formatRange === 'function'
      ? fmt.formatRange(start, end)
      : `${fmt.format(start)} to ${fmt.format(end)}`;
  };

  /* ---------- Mobile navigation ---------- */
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.getElementById('site-nav');
  const toggleLabel = toggle?.querySelector('.visually-hidden');
  const desktop = window.matchMedia('(min-width: 960px)');

  function setNav(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    if (toggleLabel) toggleLabel.textContent = open ? 'Close menu' : 'Open menu';
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
  }

  if (toggle && nav) {
    toggle.addEventListener('click', () => setNav(toggle.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setNav(false);
        toggle.focus();
      }
    });
    desktop.addEventListener('change', (e) => { if (e.matches) setNav(false); });
  }

  /* ---------- Current page in navigation ---------- */
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-list a').forEach((link) => {
    if (link.getAttribute('href') === currentPage) link.setAttribute('aria-current', 'page');
  });

  /* ---------- Header border once the page scrolls ---------- */
  const header = document.querySelector('[data-header]');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Home hero load sequence ---------- */
  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const img = hero.querySelector('img');
    const reveal = () => requestAnimationFrame(() => hero.classList.add('is-loaded'));
    if (!img || img.complete) {
      reveal();
    } else {
      img.addEventListener('load', reveal, { once: true });
      img.addEventListener('error', reveal, { once: true });
      setTimeout(reveal, 2500); // never keep the headline hidden on slow networks
    }
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
})(window.Draco);
