/* Original interaction code retained; module guards and visibility fallback added. */
(() => {
'use strict';
function boot() {
  if (window.__languagesAppBooted) return;
  window.__languagesAppBooted = true;
  document.body.classList.add('show');
  const diagnostics = window.SiteDiagnostics = { initialized: [], errors: [] };
  function init(name, setup) {
    try {
      setup();
      diagnostics.initialized.push(name);
    } catch (error) {
      diagnostics.errors.push({ module: name, message: String(error.message || error) });
      console.error(`[site:${name}]`, error);
      if (name === 'reveal') document.documentElement.classList.remove('reveal-ready');
    }
  }
const SECTIONS = [
  { id: 'section-1',  en: 'About us',                         tc: '關於我們' },
  { id: 'section-2',  en: 'Workplace communication skills',   tc: '職場溝通技巧' },
  { id: 'section-3',  en: 'Learning experiences',             tc: '學習體驗' },
  { id: 'section-4',  en: 'Emerging skills',                  tc: '新興技能' },
  { id: 'section-5',  en: 'Fostering cultural appreciation',  tc: '培養文化欣賞' },
  { id: 'section-6',  en: 'Student achievements',             tc: '學生成就' },
  { id: 'section-7',  en: 'Promoting 1',                      tc: '推廣專區 1' },
  { id: 'section-8',  en: 'Promoting 2',                      tc: '推廣專區 2' },
  { id: 'section-9',  en: 'Privacy policy',                   tc: '隱私政策' },
  { id: 'section-10', en: 'Disclaimer',                       tc: '免責聲明' },
  { id: 'section-11', en: 'Accessibility',                    tc: '無障礙聲明' },
  { id: 'section-12', en: 'Sitemap',                          tc: '網站地圖' }
];
const toast = document.getElementById('toast');
let toastTimer;
function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}
function sectionHref(id) {
  if (document.body.dataset.page === 'home' || document.getElementById(id)) return `#${id}`;
  const file = id === 'section-1' ? 'index.html' : `${id}.html`;
  return `${file}#${id}`;
}


  init('language', () => {
if (!document.getElementById('langBtn') || !document.getElementById('langMenu')) return;
const langBtn  = document.getElementById('langBtn');
const langMenu = document.getElementById('langMenu');
const langInd  = document.getElementById('langIndicator');

function moveLangIndicator() {
  const active = langMenu.querySelector('button.active');
  if (!active) return;
  const y = active.offsetTop + active.offsetHeight - 6;
  // Use CSS custom property for smooth position transitions
  langInd.style.setProperty('--y', y + 'px');
}

langBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const open = langMenu.classList.toggle('open');
  langBtn.setAttribute('aria-expanded', open);
  if (open) {
    moveLangIndicator();
    // Trigger left-to-right animation after position is set
    requestAnimationFrame(() => {
      langInd.classList.add('entered');
    });
  } else {
    langInd.classList.remove('entered');
  }
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.lang-wrap')) {
    langMenu.classList.remove('open');
    langBtn.setAttribute('aria-expanded', 'false');
    langInd.classList.remove('entered');
  }
});

window.addEventListener('resize', () => {
  if (langMenu.classList.contains('open')) moveLangIndicator();
});

langMenu.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', () => {
    langMenu.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.documentElement.lang = btn.dataset.lang;
    moveLangIndicator(); // Smoothly slides to new position
    showToast('Language switched to ' + btn.dataset.label);
    setTimeout(() => {
      langMenu.classList.remove('open');
      langBtn.setAttribute('aria-expanded', 'false');
      langInd.classList.remove('entered');
    }, 260);
  });
});

moveLangIndicator();
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  langMenu.classList.remove('open');
  langInd.classList.remove('entered');
  langBtn.setAttribute('aria-expanded', 'false');
});

  });

  init('search', () => {
if (!document.getElementById('searchOverlay')) return;
const searchOverlay  = document.getElementById('searchOverlay');
const searchBtn      = document.getElementById('searchBtn');
const searchClose    = document.getElementById('searchClose');
const searchInput    = document.getElementById('searchInput');
const searchResults  = document.getElementById('searchResults');

function renderResults(q = '') {
  const query = q.trim();
  // FIX #2: Don't show any results if query is empty
  if (!query) {
    searchResults.innerHTML = '';
    return;
  }
  const lowerQuery = query.toLowerCase();
  const list = SECTIONS.filter(s =>
    s.en.toLowerCase().includes(lowerQuery) || s.tc.includes(query)
  );
  searchResults.innerHTML = list.length
    ? list.map(s => `<a href="${sectionHref(s.id)}">${s.en}<span>${s.tc}</span></a>`).join('')
    : '<div class="search-empty">No results found · 沒有符合的結果</div>';
}

function openSearch() {
  searchOverlay.classList.add('open');
  // FIX #2: Clear results on open (don't show pre-populated list)
  searchResults.innerHTML = '';
  searchInput.value = '';
  setTimeout(() => searchInput.focus(), 120);
}

function closeSearch() {
  searchOverlay.classList.remove('open');
}

searchBtn.addEventListener('click', openSearch);
searchClose.addEventListener('click', closeSearch);
searchOverlay.addEventListener('click', (e) => { if (e.target === searchOverlay) closeSearch(); });
searchInput.addEventListener('input', () => renderResults(searchInput.value));
searchResults.addEventListener('click', (e) => { if (e.target.closest('a')) closeSearch(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch(); });

  });

  init('drawer', () => {
    const hamburger = document.getElementById('hamburgerBtn');
    const drawer = document.getElementById('drawer');
    const overlay = document.getElementById('drawerOverlay');
    const closeBtn = document.getElementById('drawerClose');
    if (!hamburger || !drawer || !overlay || !closeBtn) return;
    if (drawer.dataset.navigationReady === 'true') return;

    const root = document.documentElement;
    const body = document.body;
    if (drawer.parentElement !== body) body.appendChild(drawer);
    if (overlay.parentElement !== body) body.appendChild(overlay);

    // Reuse the original nodes and hrefs, including an already-wrapped menu.
    let menuHead = Array.from(drawer.children).find(el => el.classList.contains('drawer-head'));
    let menuBody = Array.from(drawer.children).find(el => el.classList.contains('drawer-body'));
    if (!menuHead) {
      menuHead = document.createElement('div');
      menuHead.className = 'drawer-head';
    }
    if (!menuBody) {
      menuBody = document.createElement('div');
      menuBody.className = 'drawer-body';
    }
    const title = drawer.querySelector('h3');
    menuHead.appendChild(closeBtn);
    if (title) menuHead.appendChild(title);
    Array.from(drawer.childNodes).forEach(node => {
      if (node !== menuHead && node !== menuBody) menuBody.appendChild(node);
    });
    drawer.appendChild(menuHead);
    drawer.appendChild(menuBody);

    let isOpen = false;
    let previousRootOverflow = '';
    let previousBodyOverflow = '';
    const focusWithoutScroll = element => {
      try { element.focus({ preventScroll: true }); }
      catch (_) { element.focus(); }
    };
    const setClosedState = () => {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      hamburger.setAttribute('aria-expanded', 'false');
      drawer.inert = true;
    };
    setClosedState();
    hamburger.setAttribute('aria-controls', drawer.id);

    // Older viewport-unit implementations use a measured pixel fallback.
    if (!window.CSS || !window.CSS.supports('height', '100dvh')) {
      const syncDrawerHeight = () => {
        const height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        drawer.style.setProperty('--drawer-height', `${height}px`);
      };
      syncDrawerHeight();
      window.addEventListener('resize', syncDrawerHeight, { passive: true });
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', syncDrawerHeight, { passive: true });
      }
    }

    function openDrawer() {
      if (isOpen) return;
      isOpen = true;
      previousRootOverflow = root.style.overflow;
      previousBodyOverflow = body.style.overflow;
      root.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
      drawer.inert = false;
      drawer.setAttribute('aria-hidden', 'false');
      hamburger.setAttribute('aria-expanded', 'true');
      drawer.classList.add('open');
      overlay.classList.add('open');
      drawer.scrollTop = 0;
      menuBody.scrollTop = 0;
      focusWithoutScroll(closeBtn);
    }

    function closeDrawer() {
      if (!isOpen) return;
      isOpen = false;
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      focusWithoutScroll(hamburger);
      setClosedState();
    }

    hamburger.addEventListener('click', () => {
      if (isOpen) closeDrawer(); else openDrawer();
    });
    closeBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);
    menuBody.addEventListener('click', event => {
      const target = event.target instanceof Element ? event.target : event.target.parentElement;
      if (target && target.closest('a[href]')) closeDrawer();
    });
    document.addEventListener('keydown', event => {
      if (!isOpen) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDrawer();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(drawer.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )).filter(el => el.getClientRects().length > 0 && !el.closest('[inert]'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !drawer.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !drawer.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    });
    window.addEventListener('pagehide', closeDrawer);
    drawer.dataset.navigationReady = 'true';
  });

  init('hero', () => {
if (!document.getElementById('heroSlides')) return;
const heroSlides = document.getElementById('heroSlides');
const heroDots = document.getElementById('heroDots');
const heroPrev = document.getElementById('heroPrev');
const heroNext = document.getElementById('heroNext');
const heroLabel = document.getElementById('heroLabel');
const heroAutoplayBtn = document.getElementById('heroAutoplayBtn');
const slides = heroSlides.querySelectorAll('.hero-slide');
const dots = heroDots.querySelectorAll('.hero-dot');
let currentSlide = 0;
const totalSlides = slides.length;

// Autoplay state
let heroInterval = null;
let isAutoplay = true;
const AUTOPLAY_DELAY = 5000; // 5 seconds

function goToSlide(index) {
  if (index < 0) index = totalSlides - 1;
  if (index >= totalSlides) index = 0;
  
  slides.forEach((s, i) => s.classList.toggle('active', i === index));
  dots.forEach((d, i) => d.classList.toggle('active', i === index));
  heroLabel.textContent = `Hero Banner ${index + 1} / ${totalSlides}`;
  currentSlide = index;
}

function startAutoplay() {
  if (heroInterval) clearInterval(heroInterval);
  heroInterval = setInterval(() => goToSlide(currentSlide + 1), AUTOPLAY_DELAY);
  isAutoplay = true;
  heroAutoplayBtn.classList.add('is-playing');
  heroAutoplayBtn.setAttribute('aria-label', 'Pause autoplay');
  heroAutoplayBtn.setAttribute('title', 'Pause autoplay');
}

function stopAutoplay() {
  if (heroInterval) {
    clearInterval(heroInterval);
    heroInterval = null;
  }
  isAutoplay = false;
  heroAutoplayBtn.classList.remove('is-playing');
  heroAutoplayBtn.setAttribute('aria-label', 'Start autoplay');
  heroAutoplayBtn.setAttribute('title', 'Start autoplay');
}

function toggleAutoplay() {
  if (isAutoplay) {
    stopAutoplay();
    showToast('Autoplay paused · 自動播放已暫停');
  } else {
    startAutoplay();
    showToast('Autoplay resumed · 自動播放已恢復');
  }
}

heroPrev.addEventListener('click', () => {
  goToSlide(currentSlide - 1);
  // Reset autoplay timer on manual navigation
  if (isAutoplay) startAutoplay();
});

heroNext.addEventListener('click', () => {
  goToSlide(currentSlide + 1);
  if (isAutoplay) startAutoplay();
});

dots.forEach(dot => {
  dot.addEventListener('click', () => {
    goToSlide(parseInt(dot.dataset.dot));
    if (isAutoplay) startAutoplay();
  });
});

heroAutoplayBtn.addEventListener('click', toggleAutoplay);

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (e.target.closest('.hero-banner') || e.target === heroPrev || e.target === heroNext) {
    if (e.key === 'ArrowLeft') { goToSlide(currentSlide - 1); if (isAutoplay) startAutoplay(); }
    if (e.key === 'ArrowRight') { goToSlide(currentSlide + 1); if (isAutoplay) startAutoplay(); }
  }
});

// Pause autoplay when hero is not visible (optional optimization)
if ('IntersectionObserver' in window) {
const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting && isAutoplay) {
      clearInterval(heroInterval);
      heroInterval = null;
    } else if (entry.isIntersecting && isAutoplay && !heroInterval) {
      startAutoplay();
    }
  });
}, { threshold: 0.3 });
heroObserver.observe(document.getElementById('heroBanner'));
}

// Start autoplay on load
startAutoplay();
  });

  init('header', () => {
const header   = document.getElementById('siteHeader');
if (!header) return;
const dock     = document.getElementById('quickDock');
const section1 = document.getElementById('section-1');

// v16: measure the real header instead of relying on breakpoint estimates.
function syncHeroHeaderHeight() {
  document.documentElement.style.setProperty('--header-h', `${header.getBoundingClientRect().height}px`);
}
syncHeroHeaderHeight();
if ('ResizeObserver' in window) {
  const heroHeaderObserver = new ResizeObserver(syncHeroHeaderHeight);
  heroHeaderObserver.observe(header);
}
window.addEventListener('resize', syncHeroHeaderHeight, { passive: true });

let ticking = false;

function updateCondensed() {
  if (document.body.dataset.page !== 'home' || !dock || !section1) {
    header.classList.add('condensed');
    ticking = false;
    return;
  }
  const trigger = header.offsetHeight + 150;
  const condensed = window.scrollY > 0 && section1.getBoundingClientRect().top <= trigger;
  header.classList.toggle('condensed', condensed);
  dock.classList.toggle('dock-hidden', condensed);
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) { requestAnimationFrame(updateCondensed); ticking = true; }
}, { passive: true });
window.addEventListener('resize', updateCondensed);
updateCondensed();
  });

  init('filter', () => {
if (!document.getElementById('filterGrid')) return;
const filterBtns  = document.querySelectorAll('.filter-btn');
const filterCards = Array.from(document.querySelectorAll('#filterGrid .card'));
let filterToken = 0;

function flip(mutate) {
  const first = new Map(filterCards.map(c => [c, c.getBoundingClientRect()]));
  mutate();
  const last = new Map(filterCards.map(c => [c, c.getBoundingClientRect()]));
  filterCards.forEach(c => {
    const f = first.get(c), l = last.get(c);
    if (!f.width || !l.width) return;
    const dx = f.left - l.left;
    const dy = f.top - l.top;
    const sx = f.width / l.width;
    const sy = f.height / l.height;
    if (dx || dy || sx !== 1 || sy !== 1) {
      c.style.transition = 'none';
      c.style.transformOrigin = 'top left';
      c.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
    }
  });
  requestAnimationFrame(() => {
    filterCards.forEach(c => {
      c.style.transition = '';
      c.style.transform = '';
    });
    setTimeout(() => filterCards.forEach(c => { c.style.transformOrigin = ''; }), 450);
  });
}

function applyFilter(cat) {
  const token = ++filterToken;
  filterCards.forEach(c => {
    if ((cat === 'all' || c.dataset.cat === cat) && c.style.display !== 'none') {
      c.classList.remove('is-hidden');
    }
  });
  const exiting  = filterCards.filter(c => c.style.display !== 'none' && !(cat === 'all' || c.dataset.cat === cat));
  const entering = filterCards.filter(c => c.style.display === 'none' &&  (cat === 'all' || c.dataset.cat === cat));

  exiting.forEach(c => c.classList.add('is-hidden'));
  const wait = exiting.length ? 200 : 0;

  setTimeout(() => {
    if (token !== filterToken) return;
    flip(() => {
      exiting.forEach(c => { c.style.display = 'none'; });
      entering.forEach(c => { c.style.display = ''; c.classList.add('visible', 'is-hidden'); });
    });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      entering.forEach(c => c.classList.remove('is-hidden'));
    }));
  }, wait);
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilter(btn.dataset.filter);
  });
});
  });

  init('smooth-scroll', () => {
document.addEventListener('click', e => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const id = link.getAttribute('href');
  if (!id || id.length <= 1) return;
  let target;
  try { target = document.getElementById(decodeURIComponent(id.slice(1))); }
  catch (_) { return; }
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

  });

  init('reveal', () => {
const elements = Array.from(document.querySelectorAll('.reveal'));
if (!elements.length) return;
if (!('IntersectionObserver' in window)) {
  elements.forEach(el => el.classList.add('visible'));
  return;
}
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const el = entry.target;
    const tall = entry.isIntersecting && entry.boundingClientRect &&
      entry.boundingClientRect.height > window.innerHeight;
    if (entry.intersectionRatio >= 0.15 || tall) {
      el.classList.add('visible');
      if (el.dataset.cat !== undefined) {
        revealObserver.unobserve(el);
        el.classList.remove('delay-1', 'delay-2', 'delay-3', 'delay-4', 'delay-5');
      }
    } else if (entry.intersectionRatio <= 0.01) {
      el.classList.remove('visible');
    }
  });
}, { threshold: [0, 0.15] });
elements.forEach(el => revealObserver.observe(el));
document.documentElement.classList.add('reveal-ready');

  });

}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
})();

// 動畫結束後顯示網頁
setTimeout(() => {
      document.getElementById('intro').classList.add('hide');
      document.getElementById('main').classList.add('show');
      document.body.style.overflow = 'auto';
    }, 2000);