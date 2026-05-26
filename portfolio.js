/* ══════════════════════════════
   RITESH KUMAAR PORTFOLIO — JS
   ══════════════════════════════ */

/* ── PAGE SWITCHER ── */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('visible'));
  document.querySelectorAll('.nav-drawer').forEach(d => d.classList.remove('open'));
  document.querySelectorAll('.nav-hamburger').forEach(b => b.classList.remove('open'));
  const target = document.getElementById('pg-' + id);
  if (target) target.classList.add('visible');

  // Sync dev-nav button
  document.querySelectorAll('.pg-btn').forEach(b => b.classList.remove('active'));
  const pgMap = {
    'home': 0, 'case-studies': 1, 'work-gallery': 2,
    'creative-leadership': 3, 'experience': 4, 'about': 5,
    'contact': 6, 'subscription': 7
  };
  const idx = pgMap[id];
  const btns = document.querySelectorAll('.pg-btn');
  if (btns[idx]) btns[idx].classList.add('active');

  window.scrollTo({ top: 0, behavior: 'instant' });

  // Reset and re-observe reveals on the new page
  setTimeout(() => {
    initReveal();
    initCounters();
  }, 50);
}

/* ── SCROLL REVEAL ── */
function initReveal() {
  const visiblePage = document.querySelector('.page.visible');
  if (!visiblePage) return;

  const els = visiblePage.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => {
    // Reset before observing (handles page re-visits)
    el.classList.remove('visible');
    io.observe(el);
  });
}

/* ── COUNTER ANIMATIONS ── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1400;
  const start = performance.now();
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    el.textContent = Math.round(easeOut(progress) * target);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function initCounters() {
  const visiblePage = document.querySelector('.page.visible');
  if (!visiblePage) return;

  const nums = visiblePage.querySelectorAll('.metric-num[data-target]');
  if (!nums.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !e.target.dataset.counted) {
        e.target.dataset.counted = '1';
        animateCounter(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });

  nums.forEach(n => {
    n.dataset.counted = '';
    n.textContent = '0';
    io.observe(n);
  });
}

/* ── NAV SCROLL BLUR ── */
function initNavScroll() {
  const nav = document.querySelector('.page.visible .site-nav');
  if (!nav) return;

  const onScroll = () => {
    if (window.scrollY > 20) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };

  window.removeEventListener('scroll', window._navScrollHandler);
  window._navScrollHandler = onScroll;
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ── HAMBURGER DRAWER ── */
function closeDrawer(pageId) {
  const drawer = document.getElementById('nav-drawer-' + pageId);
  const btn = document.getElementById('nav-hamburger-' + pageId);
  if (drawer) drawer.classList.remove('open');
  if (btn) btn.classList.remove('open');
}

function initHamburgers() {
  document.querySelectorAll('.nav-hamburger').forEach(btn => {
    btn.addEventListener('click', () => {
      const drawerId = btn.id.replace('hamburger', 'drawer');
      const drawer = document.getElementById(drawerId);
      if (!drawer) return;
      btn.classList.toggle('open');
      drawer.classList.toggle('open');
    });
  });
}

/* ── FILTER TABS ── */
function initFilterTabs() {
  document.querySelectorAll('.filter-tabs').forEach(group => {
    group.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        group.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.textContent.trim().toLowerCase();
        const container = group.closest('.container') || group.parentElement;
        if (!container) return;

        const items = container.querySelectorAll('.gallery-item[data-category]');
        if (!items.length) return;

        items.forEach(item => {
          const cat = (item.dataset.category || '').toLowerCase();
          const show = filter === 'all' || cat === filter;
          item.style.display = show ? '' : 'none';
        });

        /* Hide gallery sections whose every item is hidden */
        container.querySelectorAll('.gallery-section').forEach(section => {
          const sectionItems = section.querySelectorAll('.gallery-item[data-category]');
          if (!sectionItems.length) return;
          const hasVisible = Array.from(sectionItems).some(i => i.style.display !== 'none');
          section.style.display = hasVisible ? '' : 'none';
        });
      });
    });
  });
}

/* ── GALLERY MODAL DATA ── */
var workSnapshotItems = {
  'ws-1': { title: 'Product Campaign Video', tag: 'Motion',   visual: 'visual-motion', label: 'Motion Video' },
  'ws-2': { title: 'B2B Social Campaign',    tag: 'Social',   visual: 'visual-social', label: 'Social Post' },
  'ws-3': { title: 'Landing Page Design',    tag: 'Web',      visual: 'visual-web',    label: 'Landing Page' },
  'ws-4': { title: 'Brand Identity System',  tag: 'Branding', visual: 'visual-brand',  label: 'Logo System' },
  'ws-5': { title: 'Animated Campaign GIF',  tag: 'GIF',      visual: 'visual-gif',    label: 'GIF Animation' },
  'ws-6': { title: 'Digital Campaign System',tag: 'Motion',   visual: 'visual-motion', label: 'Campaign Visual' }
};

var workGalleryItems = {
  'wg-v1': { title: 'Product Launch Campaign Video', tag: 'Motion · 2024', visual: 'visual-motion', label: 'Video Thumbnail 1 ▶' },
  'wg-v2': { title: 'Social Media Reel',             tag: 'Motion · 2024', visual: 'visual-motion', label: 'Video Thumbnail 2 ▶' },
  'wg-v3': { title: 'Brand Explainer',               tag: 'Motion · 2023', visual: 'visual-motion', label: 'Video Thumbnail 3 ▶' },
  'wg-s1': { title: 'Campaign Post',    tag: 'Social · Instagram', visual: 'visual-social', label: 'Static Post 1' },
  'wg-s2': { title: 'B2B Campaign',     tag: 'Social · LinkedIn',  visual: 'visual-social', label: 'Static Post 2' },
  'wg-s3': { title: 'Product Feature',  tag: 'Social · Instagram', visual: 'visual-social', label: 'Static Post 3' },
  'wg-s4': { title: 'Promotional',      tag: 'Social · Twitter',   visual: 'visual-social', label: 'Static Post 4' },
  'wg-g1': { title: 'Campaign Animation', tag: 'GIF · Loop', visual: 'visual-gif', label: 'GIF 1 — Animated' },
  'wg-g2': { title: 'Feature Highlight',  tag: 'GIF · Loop', visual: 'visual-gif', label: 'GIF 2 — Animated' },
  'wg-g3': { title: 'Social Asset',       tag: 'GIF · Loop', visual: 'visual-gif', label: 'GIF 3 — Animated' },
  'wg-l1': { title: 'Brand Identity',  tag: 'Logo', visual: 'visual-brand', label: 'Logo 1' },
  'wg-l2': { title: 'Brand System',    tag: 'Logo', visual: 'visual-brand', label: 'Logo 2' },
  'wg-l3': { title: 'Visual Identity', tag: 'Logo', visual: 'visual-brand', label: 'Logo 3' },
  'wg-l4': { title: 'Mark Design',     tag: 'Logo', visual: 'visual-brand', label: 'Logo 4' }
};

function openGalleryModal(item) {
  var modal    = document.getElementById('wg-modal');
  var visualEl = document.getElementById('wg-modal-visual');
  var labelEl  = document.getElementById('wg-modal-label');
  var tagEl    = document.getElementById('wg-modal-tag');
  var titleEl  = document.getElementById('wg-modal-title');
  if (!modal || !visualEl || !labelEl || !tagEl || !titleEl) return;

  visualEl.className = 'visual-block wg-modal-visual ' + item.visual;
  labelEl.textContent = item.label;
  tagEl.textContent   = item.tag;
  titleEl.textContent = item.title;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function openWorkSnapshotItem(itemId) {
  var item = workSnapshotItems[itemId];
  if (!item) return;
  showPage('work-gallery');
  setTimeout(function () { openGalleryModal(item); }, 160);
}

function openWorkGalleryItem(itemId) {
  var item = workGalleryItems[itemId];
  if (!item) return;
  openGalleryModal(item);
}

function closeWorkGalleryModal() {
  var modal = document.getElementById('wg-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

/* Close modal on Escape */
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeWorkGalleryModal();
});

/* ── ENQUIRY TOGGLE ── */
function initEnquiryToggle() {
  document.querySelectorAll('.enquiry-toggle').forEach(group => {
    group.querySelectorAll('.enquiry-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.enquiry-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  });
}

/* ══ HERO V2 — LOADER, CURSOR & ENTRANCE ANIMATIONS ══ */

function initRkLoader() {
  const loader = document.getElementById('rk-loader');
  if (!loader) return;
  setTimeout(() => loader.classList.add('done'), 800);
}

function initRkCursor() {
  const cursor = document.getElementById('rk-cursor');
  const outer = document.getElementById('rk-cursor-outer');
  if (!cursor || !outer) return;
  let mx = 0, my = 0, ox = 0, oy = 0;
  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  });
  (function follow() {
    ox += (mx - ox) * 0.14; oy += (my - oy) * 0.14;
    outer.style.left = ox + 'px'; outer.style.top = oy + 'px';
    requestAnimationFrame(follow);
  })();
  document.querySelectorAll('a, button, input, textarea, [role=button]').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('hov'); outer.classList.add('hov'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('hov'); outer.classList.remove('hov'); });
  });
}

function resetHeroV2() {
  const page = document.getElementById('pg-home');
  if (!page) return;
  page.querySelectorAll('.hero-v2__word').forEach(el => el.classList.remove('in'));
  ['hero-v2-status', 'hero-v2-nav', 'hero-v2-social', 'hero-v2-portrait'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('in');
  });
  // New structure targets
  const left = document.querySelector('.hero-v2__left');
  const sub = document.querySelector('.hero-v2__sub');
  const stats = document.querySelector('.hero-v2__stats');
  const ctaRow = document.querySelector('.hero-v2__cta-row');
  const plans = document.querySelector('.hero-v2__plans-label');
  const nav = document.querySelector('.hero-v2__nav-col');
  [left, sub, stats, ctaRow, plans, nav].forEach(el => { if (el) el.classList.remove('in'); });
}

function initHeroV2() {
  const page = document.getElementById('pg-home');
  if (!page || !page.classList.contains('visible')) return;

  // Word slide-up
  setTimeout(() => {
    const w1 = document.getElementById('hero-word-1');
    const w2 = document.getElementById('hero-word-2');
    if (w1) w1.classList.add('in');
    setTimeout(() => { if (w2) w2.classList.add('in'); }, 130);
  }, 60);

  // Sub + stats + CTA + plans
  setTimeout(() => {
    const sub = document.querySelector('.hero-v2__sub');
    if (sub) sub.classList.add('in');
  }, 320);
  setTimeout(() => {
    const stats = document.querySelector('.hero-v2__stats');
    if (stats) stats.classList.add('in');
  }, 440);
  setTimeout(() => {
    const ctaRow = document.querySelector('.hero-v2__cta-row');
    if (ctaRow) ctaRow.classList.add('in');
  }, 540);
  setTimeout(() => {
    const plans = document.querySelector('.hero-v2__plans-label');
    if (plans) plans.classList.add('in');
  }, 620);

  // Nav col + portrait left column
  setTimeout(() => {
    const nav = document.querySelector('.hero-v2__nav-col');
    if (nav) nav.classList.add('in');
  }, 480);
  setTimeout(() => {
    const left = document.querySelector('.hero-v2__left');
    if (left) left.classList.add('in');
    const social = document.getElementById('hero-v2-social');
    if (social) social.classList.add('in');
  }, 200);
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  // Mark first page button active
  const btns = document.querySelectorAll('.pg-btn');
  if (btns[0]) btns[0].classList.add('active');

  initRkLoader();
  initRkCursor();
  initHeroV2();
  initReveal();
  initCounters();
  initNavScroll();
  initFilterTabs();
  initEnquiryToggle();
  initHamburgers();
});

// Re-init nav scroll + hero after each page switch
const _origShowPage = showPage;
window.showPage = function(id) {
  const wasHome = document.getElementById('pg-home')?.classList.contains('visible');
  _origShowPage(id);
  setTimeout(initNavScroll, 100);
  if (id === 'home') {
    resetHeroV2();
    setTimeout(initHeroV2, 80);
  } else if (wasHome) {
    resetHeroV2();
  }
};
