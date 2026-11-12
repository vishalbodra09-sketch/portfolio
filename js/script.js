/* =====================================================
   Vishal Bodra - Portfolio behaviour
   You do NOT need to edit this file to change your text:
   all content lives in index.html.

   What this file does:
   1. Light/dark theme toggle (remembers your choice)
   2. Mobile hamburger menu
   3. Highlights the current section in the navbar
   4. Scroll-reveal animations
   5. Hides any section that has no content (and its navbar link)
   6. Shows a neutral placeholder when an image is missing
   7. Updates the year in the footer
   ===================================================== */

(function () {
  'use strict';

  var root = document.documentElement;
  var prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Tell the CSS that JavaScript is running (reveal animations depend on it)
  root.classList.add('js');


  /* ---------- 1. THEME TOGGLE ----------
     The very first choice (saved or system) is applied by a tiny script in
     <head> so the page never flashes. This code handles the button. */
  var THEME_KEY = 'portfolio-theme';
  var themeBtn = document.getElementById('theme-toggle');
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function readSavedTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeBtn) {
      var isDark = theme === 'dark';
      themeBtn.setAttribute('aria-pressed', String(isDark));
      themeBtn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    }
    if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#0e1318' : '#0f766e');
  }

  applyTheme(root.getAttribute('data-theme') || 'light');

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* storage blocked: ignore */ }
    });
  }

  // If the visitor never chose a theme, follow the system if it changes
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onSystemChange = function (e) {
      if (!readSavedTheme()) applyTheme(e.matches ? 'dark' : 'light');
    };
    if (mq.addEventListener) mq.addEventListener('change', onSystemChange);
    else if (mq.addListener) mq.addListener(onSystemChange);
  }


  /* ---------- 5. HIDE EMPTY SECTIONS ----------
     A section is "empty" when it has no element marked data-item.
     Delete all the data-item blocks from a section in index.html and the
     whole section plus its navbar link disappear. (Home and Contact are
     kept visible only if they have content too.) */
  var sections = document.querySelectorAll('section[data-section]');
  var hiddenIds = [];

  sections.forEach(function (section) {
    var isHome = section.id === 'home';
    var hasContent = isHome || section.querySelector('[data-item]');
    if (!hasContent) {
      section.hidden = true;
      hiddenIds.push(section.id);
    }
  });

  hiddenIds.forEach(function (id) {
    // Remove the navbar link
    var link = document.querySelector('.nav-links a[href="#' + id + '"]');
    if (link && link.parentElement) link.parentElement.remove();
    // Hide any button elsewhere that points to this section (e.g. "View Projects")
    document.querySelectorAll('[data-needs="' + id + '"]').forEach(function (el) {
      el.hidden = true;
      el.style.display = 'none';
    });
  });


  /* ---------- 2. MOBILE MENU ---------- */
  var navToggle = document.getElementById('nav-toggle');
  var navLinks = document.getElementById('nav-links');

  function setMenu(open) {
    if (!navToggle || !navLinks) return;
    navLinks.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
    });

    // Close after choosing a link
    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });

    // Close with the Escape key (and return focus to the button)
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        navToggle.focus();
      }
    });

    // Close when the screen becomes wide again
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) setMenu(false);
    });

    // Close when clicking outside the menu
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav') && navToggle.getAttribute('aria-expanded') === 'true') setMenu(false);
    });
  }


  /* ---------- 3. ACTIVE LINK HIGHLIGHT ---------- */
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));

  function setActive(id) {
    navAnchors.forEach(function (a) {
      var match = a.getAttribute('href') === '#' + id;
      a.classList.toggle('active', match);
      if (match) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }

  if ('IntersectionObserver' in window) {
    var visibleSections = Array.prototype.filter.call(sections, function (s) { return !s.hidden; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });   // a thin band in the middle of the screen
    visibleSections.forEach(function (s) { spy.observe(s); });
  }


  /* ---------- 4. SCROLL REVEAL ---------- */
  var revealEls = document.querySelectorAll('.reveal');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);   // animate only once
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el, i) {
      // Small stagger for items that appear together in a grid
      el.style.transitionDelay = (i % 3) * 80 + 'ms';
      revealObserver.observe(el);
    });
  }


  /* ---------- 6. IMAGE FALLBACKS ----------
     Any <img data-fallback="profile|project"> that fails to load is swapped
     for a neutral built-in picture, so you never see a broken-image icon. */
  var FALLBACKS = {
    profile:
      'data:image/svg+xml;utf8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
        '<rect width="200" height="200" fill="#e5e7eb"/>' +
        '<circle cx="100" cy="78" r="34" fill="#9ca3af"/>' +
        '<path d="M34 190c0-38 30-62 66-62s66 24 66 62z" fill="#9ca3af"/></svg>'),
    project:
      'data:image/svg+xml;utf8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 140">' +
        '<rect width="200" height="140" fill="#e5e7eb"/>' +
        '<rect x="40" y="28" width="120" height="76" rx="8" fill="none" stroke="#9ca3af" stroke-width="6"/>' +
        '<path d="M80 122h40M100 104v18" stroke="#9ca3af" stroke-width="6" stroke-linecap="round"/>' +
        '<path d="M62 84l22-22 16 16 12-12 26 18z" fill="#9ca3af"/></svg>')
  };

  function useFallback(img) {
    if (img.dataset.fallbackApplied) return;          // avoid an endless loop
    img.dataset.fallbackApplied = 'true';
    img.src = FALLBACKS[img.dataset.fallback] || FALLBACKS.project;
    img.classList.add('is-placeholder');
  }

  document.querySelectorAll('img[data-fallback]').forEach(function (img) {
    img.addEventListener('error', function () { useFallback(img); });
    // The image may have already failed before this script ran
    if (img.complete && img.naturalWidth === 0) useFallback(img);
  });


  /* ---------- 7. FOOTER YEAR ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
