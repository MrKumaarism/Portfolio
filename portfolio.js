/* ══════════════════════════════
   RITESH KUMAAR PORTFOLIO — JS
   ══════════════════════════════ */

/* ── PAGE SWITCHER — multi-page navigation ── */
function showPage(id) {
  var isPages = window.location.pathname.indexOf('/pages/') !== -1;
  var pageFiles = {
    'home': isPages ? '../index.html' : './index.html',
    'case-studies': isPages ? './case-studies.html' : './pages/case-studies.html',
    'work-gallery': isPages ? './work-gallery.html' : './pages/work-gallery.html',
    'creative-leadership': isPages ? './creative-leadership.html' : './pages/creative-leadership.html',
    'experience': isPages ? './experience.html' : './pages/experience.html',
    'about': isPages ? './about.html' : './pages/about.html',
    'contact': isPages ? './contact.html' : './pages/contact.html',
    'subscription': isPages ? './subscription.html' : './pages/subscription.html'
  };
  var url = pageFiles[id];
  if (url) window.location.href = url;
}

/* ── SCROLL REVEAL ── */
function initReveal() {
  var scope = document.querySelector('.page') || document.body;
  var els = scope.querySelectorAll('.reveal');
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(function(el) {
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

        /* Featured-8 limit: re-apply on 'all', remove on specific filter */
        if (filter === 'all') {
          applyFeaturedLimitAll();
        } else {
          /* Show all category-matching items, hide "View All" buttons */
          container.querySelectorAll('.wg-viewall-btn').forEach(btn => { btn.style.display = 'none'; });
        }
      });
    });
  });
}

/* ── GALLERY SNAPSHOT LABELS (home page cards) ── */
var workSnapshotItems = {
  'ws-1': { title: 'Product Campaign Video', tag: 'Motion',   visual: 'visual-motion', label: 'Motion Video' },
  'ws-2': { title: 'B2B Social Campaign',    tag: 'Social',   visual: 'visual-social', label: 'Social Post' },
  'ws-3': { title: 'Landing Page Design',    tag: 'Web',      visual: 'visual-web',    label: 'Landing Page' },
  'ws-4': { title: 'Brand Identity System',  tag: 'Branding', visual: 'visual-brand',  label: 'Logo System' },
  'ws-5': { title: 'Animated Campaign GIF',  tag: 'GIF',      visual: 'visual-gif',    label: 'GIF Animation' },
  'ws-6': { title: 'Digital Campaign System',tag: 'Motion',   visual: 'visual-motion', label: 'Campaign Visual' }
};

var workGalleryItems = {
  'wg-v1': {
    title: 'Product Launch Campaign Video',
    tag: 'Motion · 2024', type: 'video', src: 'Video%201.mp4',
    desc: 'Short-form product launch video built to communicate B2B software value clearly and fast. Covers concept, storyboard, motion design, and final delivery — engineered for LinkedIn and YouTube Shorts.',
    tools: 'After Effects · Illustrator · Premiere Pro', platform: 'LinkedIn · YouTube Shorts'
  },
  'wg-v2': {
    title: 'Social Media Reel',
    tag: 'Motion · 2024', type: 'video', src: 'video%202.mp4',
    desc: 'Social reel crafted for maximum scroll-stop performance. Vertical-first format optimised for Instagram Reels and LinkedIn Video with kinetic typography and bold transitions.',
    tools: 'After Effects · Premiere Pro', platform: 'Instagram Reels · LinkedIn'
  },
  'wg-v3': {
    title: 'Brand Explainer',
    tag: 'Motion · 2023', type: 'video', src: 'image2.mp4',
    desc: 'Brand explainer video distilling complex product messaging into a concise, visually compelling narrative. Built to educate and convert cold traffic on landing pages and email campaigns.',
    tools: 'After Effects · Illustrator · ElevenLabs AI', platform: 'Landing Page · Email'
  },
  'wg-s1': {
    title: 'Campaign Post',
    tag: 'Social · Instagram', type: 'image', src: 'image1.jpg',
    desc: 'High-impact static social post designed for Instagram. Part of a broader B2B campaign system built for consistent multi-platform publishing with a unified visual language.',
    tools: 'Illustrator · Photoshop', platform: 'Instagram · LinkedIn'
  },
  'wg-s2': {
    title: 'B2B Campaign',
    tag: 'Social · LinkedIn', type: 'placeholder', visual: 'visual-social',
    desc: 'LinkedIn B2B campaign visual designed for lead generation in the SaaS space. Focused on clean hierarchy and direct CTAs. Full creative coming soon.',
    tools: 'Illustrator · Figma', platform: 'LinkedIn'
  },
  'wg-s3': {
    title: 'Product Feature',
    tag: 'Social · Instagram', type: 'placeholder', visual: 'visual-social',
    desc: 'Product feature highlight post designed to showcase a single capability clearly. Optimised for Instagram feed engagement. Full creative coming soon.',
    tools: 'Illustrator · Photoshop', platform: 'Instagram'
  },
  'wg-s4': {
    title: 'Promotional',
    tag: 'Social · Twitter', type: 'placeholder', visual: 'visual-social',
    desc: 'Promotional campaign visual for Twitter/X with high-contrast design built for fast consumption. Full creative coming soon.',
    tools: 'Illustrator', platform: 'Twitter / X'
  },
  'wg-g1': {
    title: 'Campaign Animation',
    tag: 'GIF · Loop', type: 'placeholder', visual: 'visual-gif',
    desc: 'Looping GIF animation built for campaign use — designed to work seamlessly in email newsletters and social feeds. Lightweight and attention-grabbing. Full file coming soon.',
    tools: 'After Effects · Photoshop', platform: 'Email · Social'
  },
  'wg-g2': {
    title: 'Feature Highlight GIF',
    tag: 'GIF · Loop', type: 'placeholder', visual: 'visual-gif',
    desc: 'Product feature highlight GIF capturing key interactions in a clean loopable format. Ideal for onboarding emails and social announcements. Full file coming soon.',
    tools: 'After Effects · Photoshop', platform: 'Email · LinkedIn'
  },
  'wg-g3': {
    title: 'Social Asset GIF',
    tag: 'GIF · Loop', type: 'placeholder', visual: 'visual-gif',
    desc: 'Animated social media asset optimised for attention retention in the feed. Designed for brand recall and consistent visual identity. Full file coming soon.',
    tools: 'After Effects', platform: 'Instagram · Twitter'
  },
  'wg-l1': {
    title: 'Brand Identity System',
    tag: 'Logo · Branding', type: 'placeholder', visual: 'visual-brand',
    desc: 'Complete brand identity system including primary logo, color palette, typography system, and usage guidelines — built for digital and print applications. Full showcase coming soon.',
    tools: 'Illustrator · Figma', platform: 'Digital · Print'
  },
  'wg-l2': {
    title: 'Brand System',
    tag: 'Logo · Branding', type: 'placeholder', visual: 'visual-brand',
    desc: 'Scalable brand system covering logo variations, secondary marks, icon set, and brand pattern applications. Built for a B2B SaaS product. Full case study coming soon.',
    tools: 'Illustrator · Figma', platform: 'Digital · Marketing'
  },
  'wg-l3': {
    title: 'Visual Identity',
    tag: 'Logo · Branding', type: 'placeholder', visual: 'visual-brand',
    desc: 'Visual identity system developed for a tech brand — covering logo, iconography, color strategy, and campaign visual language. Full breakdown coming soon.',
    tools: 'Illustrator · Photoshop · Figma', platform: 'Digital · Social'
  },
  'wg-l4': {
    title: 'Logo Mark Design',
    tag: 'Logo · Branding', type: 'placeholder', visual: 'visual-brand',
    desc: 'Custom logo mark with detailed grid construction, weight variations, and usage rules for light and dark contexts. Full case study coming soon.',
    tools: 'Illustrator', platform: 'Brand Identity'
  }
};

/* ══════════════════════════════════════════
   PROCESS MODAL — Creative Walkthrough
   ══════════════════════════════════════════ */

/* Map home snapshot IDs → work gallery IDs */
var snapshotToGallery = {
  'ws-1': 'wg-v1',
  'ws-2': 'wg-s1',
  'ws-3': 'wg-s2',
  'ws-4': 'wg-l1',
  'ws-5': 'wg-g1',
  'ws-6': 'wg-v2'
};

/* ── Full process data for detailed projects ── */
var processProjects = {

  'wg-v1': {
    title: 'Product Launch Campaign Video',
    category: 'Motion',
    year: '2024',
    role: 'Concept · Visual Design · Motion Direction · Final Edit',
    tools: 'Adobe Illustrator · After Effects · Premiere Pro',
    platform: 'LinkedIn · YouTube Shorts',
    steps: [
      {
        num: '01', title: 'Concept Planning', frame: 'concept',
        caption: 'Message architecture and content brief',
        stepTools: ['Notes', 'Reference Collection'],
        objective: 'Define the core message and decide how the product value should be communicated.',
        thinking: 'I wanted the video to explain the product quickly without making the viewer read too much text.',
        decision: 'Kept the message short, direct, and benefit-focused — one idea per scene.',
        outcome: 'Clear direction for the video structure and a one-page creative brief.'
      },
      {
        num: '02', title: 'Visual Structure', frame: 'structure',
        caption: 'Frame-by-frame sequence planning',
        stepTools: ['Adobe Illustrator'],
        objective: 'Plan how each screen would appear in sequence.',
        thinking: 'I broke the message into small visual moments so each frame could support one idea.',
        decision: 'Used simple layouts with enough negative space for readability at speed.',
        outcome: 'A frame-by-frame visual structure for the full video.'
      },
      {
        num: '03', title: 'Illustrator Frame Design', frame: 'illustrator',
        caption: 'Static frame artboards built in Illustrator',
        stepTools: ['Adobe Illustrator'],
        objective: 'Create the main design frames for every scene.',
        thinking: 'I designed each frame as a separate artboard so the animation workflow would be clean later.',
        decision: 'Used brand colors, precise icons, typographic hierarchy, and tight spacing.',
        outcome: 'Complete set of static frames ready for animation.'
      },
      {
        num: '04', title: 'Asset Preparation', frame: 'asset',
        caption: 'Layered assets organised for motion',
        stepTools: ['Adobe Illustrator', 'After Effects'],
        objective: 'Organize design elements for independent animation.',
        thinking: 'I separated icons, text blocks, backgrounds, and visual layers so each could move independently.',
        decision: 'Named every layer logically and grouped related elements to keep the AE timeline clean.',
        outcome: 'Animation-ready file with a clean, organised layer structure.'
      },
      {
        num: '05', title: 'Motion Build', frame: 'motion',
        caption: 'After Effects — timeline, keyframes, and easing',
        stepTools: ['After Effects'],
        objective: 'Bring the static frames to life with motion.',
        thinking: 'I focused on smooth transitions and subtle text reveals to keep the message clear without visual noise.',
        decision: 'Used ease-in-out curves and staggered reveals instead of heavy effects.',
        outcome: 'A polished motion sequence across all scenes.'
      },
      {
        num: '06', title: 'Final Edit', frame: 'edit',
        caption: 'Timing polish and export prep in Premiere Pro',
        stepTools: ['Premiere Pro'],
        objective: 'Refine the timing and prepare final platform exports.',
        thinking: 'I adjusted pacing scene by scene so every message had enough time to land.',
        decision: 'Added final cut transitions, sound level polish, and platform-specific export presets.',
        outcome: 'Platform-ready export files with correct specs for LinkedIn and YouTube Shorts.'
      },
      {
        num: '07', title: 'Final Output', frame: 'output',
        caption: 'Completed product launch campaign video',
        stepTools: ['Premiere Pro'],
        objective: 'Present the completed work ready for publishing.',
        thinking: 'The final output should feel clean, professional, and instantly readable on mobile.',
        decision: 'Delivered in a short-form format optimised for LinkedIn and YouTube Shorts.',
        outcome: 'Completed product launch campaign video — published and live on both platforms.',
        isFinal: true, mediaType: 'video', mediaSrc: 'Video%201.mp4'
      }
    ]
  },

  'wg-v2': {
    title: 'Social Media Reel',
    category: 'Motion',
    year: '2024',
    role: 'Concept · Motion Design · Edit',
    tools: 'After Effects · Premiere Pro',
    platform: 'Instagram Reels · LinkedIn',
    steps: [
      {
        num: '01', title: 'Format & Concept', frame: 'concept',
        caption: 'Vertical-first content brief',
        stepTools: ['Notes', 'Reference Collection'],
        objective: 'Define the reel format and nail the first-frame hook for scroll-stop impact.',
        thinking: 'Vertical content needs to earn attention in the first 0.5 seconds — the hook is everything.',
        decision: 'Led with bold kinetic typography and a single clear benefit statement per scene.',
        outcome: 'Clear vertical-first content structure with a strong opening hook.'
      },
      {
        num: '02', title: 'Motion Build', frame: 'motion',
        caption: 'Kinetic typography and bold transitions',
        stepTools: ['After Effects'],
        objective: 'Build the motion sequence with kinetic text and sharp transitions.',
        thinking: 'Each transition needed energy without distracting from the message.',
        decision: 'Used snap-cuts with text-reveal timing matched to beat points.',
        outcome: 'A high-energy motion reel ready for final edit.'
      },
      {
        num: '03', title: 'Final Output', frame: 'output',
        caption: 'Completed social reel — live on Instagram and LinkedIn',
        stepTools: ['Premiere Pro'],
        objective: 'Export at platform-correct specs and deliver.',
        thinking: 'Instagram Reels and LinkedIn each have different optimal dimensions and file limits.',
        decision: 'Delivered at 9:16 for Reels and 1:1 square crop for LinkedIn native video.',
        outcome: 'Final reel published across both platforms with format-specific exports.',
        isFinal: true, mediaType: 'video', mediaSrc: 'video%202.mp4'
      }
    ]
  },

  'wg-v3': {
    title: 'Brand Explainer',
    category: 'Motion',
    year: '2023',
    role: 'Concept · Visual Design · Motion · Voiceover Direction',
    tools: 'After Effects · Illustrator · ElevenLabs AI',
    platform: 'Landing Page · Email',
    steps: [
      {
        num: '01', title: 'Script & Storyboard', frame: 'concept',
        caption: 'Message architecture for a complex product',
        stepTools: ['Notes', 'ElevenLabs AI'],
        objective: 'Write the explainer script and plan the visual storyboard.',
        thinking: 'Complex B2B product messaging had to be distilled into simple, sequential ideas without losing nuance.',
        decision: 'Used a problem → solution → benefit structure to guide the viewer logically through the product story.',
        outcome: 'Approved script with AI-assisted voiceover and a full visual storyboard.'
      },
      {
        num: '02', title: 'Frame Design & Motion', frame: 'illustrator',
        caption: 'Illustrator artboards animated in After Effects',
        stepTools: ['Adobe Illustrator', 'After Effects'],
        objective: 'Design all frames and animate the full explainer with voiceover sync.',
        thinking: 'Each visual moment had to match the voiceover timing exactly for the narrative to feel seamless.',
        decision: 'Built animations keyframe-by-keyframe with AI voiceover as the timing guide.',
        outcome: 'Fully animated explainer with precise voiceover sync.'
      },
      {
        num: '03', title: 'Final Output', frame: 'output',
        caption: 'Completed brand explainer — deployed on landing page',
        stepTools: ['After Effects', 'Premiere Pro'],
        objective: 'Deliver the final explainer optimised for web and email.',
        thinking: 'Landing page videos need fast load — exported with H.264 compression at optimal bitrate.',
        decision: 'Delivered as MP4 with two cuts: full-length for landing page, shorter version for email.',
        outcome: 'Completed brand explainer, deployed across landing page and email sequences.',
        isFinal: true, mediaType: 'video', mediaSrc: 'image2.mp4'
      }
    ]
  },

  'wg-s1': {
    title: 'Campaign Post',
    category: 'Social',
    year: '2024',
    role: 'Art Direction · Visual Design',
    tools: 'Adobe Illustrator · Photoshop',
    platform: 'Instagram · LinkedIn',
    steps: [
      {
        num: '01', title: 'Art Direction', frame: 'concept',
        caption: 'Visual language and composition planning',
        stepTools: ['Notes', 'Reference Collection'],
        objective: 'Define the visual language and composition for maximum feed impact.',
        thinking: 'The post needed to stop the scroll and communicate the message in under two seconds.',
        decision: 'High contrast, bold typography, single focal element — nothing competing for attention.',
        outcome: 'Clear visual direction and a rough layout sketch.'
      },
      {
        num: '02', title: 'Design Execution', frame: 'illustrator',
        caption: 'Illustrator artboard — final static design',
        stepTools: ['Adobe Illustrator', 'Photoshop'],
        objective: 'Build the final static post design with precise craft.',
        thinking: 'Every element serves the message — nothing decorative without purpose.',
        decision: 'Used brand color palette, strict grid system, and tight typographic hierarchy.',
        outcome: 'Final campaign post artwork ready for export.'
      },
      {
        num: '03', title: 'Final Output', frame: 'output',
        caption: 'Completed campaign post',
        stepTools: ['Adobe Illustrator'],
        objective: 'Export at platform-correct dimensions and deliver.',
        thinking: 'Instagram feed and LinkedIn each require different crops and file formats.',
        decision: 'Exported as multiple asset sizes to cover both platform requirements.',
        outcome: 'Completed campaign post, published across Instagram and LinkedIn.',
        isFinal: true, mediaType: 'image', mediaSrc: 'image1.jpg'
      }
    ]
  }
};

/* ── Default step structure for items without full process data ── */
function buildDefaultSteps(item) {
  var toolList = (item.tools || 'Adobe Illustrator').split('·').map(function(t){ return t.trim(); });
  return [
    {
      num: '01', title: 'Brief & Concept', frame: 'concept',
      caption: 'Project brief and initial concept development',
      stepTools: ['Notes', 'Reference Collection'],
      objective: 'Understand the brief and develop the initial concept direction.',
      thinking: 'Every strong piece of work starts with clarity on what it needs to communicate and to whom.',
      decision: 'Aligned on the core message, target audience, visual direction, and platform requirements.',
      outcome: 'Approved concept direction and creative brief.'
    },
    {
      num: '02', title: 'Design Execution', frame: 'illustrator',
      caption: 'Visual design and asset creation',
      stepTools: toolList,
      objective: 'Create the final visual assets for this project.',
      thinking: 'Focused on clean hierarchy, brand alignment, and platform-specific requirements.',
      decision: 'Used a structured grid, intentional typography, and purposeful color decisions.',
      outcome: 'Complete design assets ready for delivery.'
    },
    {
      num: '03', title: 'Final Output', frame: 'output',
      caption: 'Completed work — full creative case study coming soon',
      stepTools: toolList.slice(0, 2),
      objective: 'Deliver the final work at platform-correct specifications.',
      thinking: 'Each asset is crafted for the specific platform, format, and audience context.',
      decision: 'Delivered at correct dimensions and file format for each platform.',
      outcome: item.desc || 'Completed project ready for publishing.',
      isFinal: true,
      mediaType: item.type, mediaSrc: item.src, visual: item.visual
    }
  ];
}

/* ── Process modal state ── */
var pmCurrentId = null;
var pmProjectIds = [];
var pmCurrentStepIndex = 0;
var pmStepObserver = null;
var pmCurrentProject = null;

/* ── Open process modal ── */
function openProcessModal(itemId) {
  var galleryItem = workGalleryItems[itemId];
  var processData = processProjects[itemId];

  if (!galleryItem && !processData) return;

  /* Build project object */
  var project;
  if (processData) {
    project = processData;
  } else {
    var tagParts = (galleryItem.tag || '').split('·');
    project = {
      title:    galleryItem.title,
      category: (tagParts[0] || '').trim(),
      year:     (tagParts[1] || '').trim(),
      role:     'Creative Direction · Visual Design',
      tools:    galleryItem.tools    || '',
      platform: galleryItem.platform || '',
      steps:    buildDefaultSteps(galleryItem)
    };
  }

  pmCurrentId      = itemId;
  pmProjectIds     = Object.keys(workGalleryItems);
  pmCurrentProject = project;
  pmCurrentStepIndex = 0;

  renderProcessModal(project);

  var modal = document.getElementById('process-modal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  updatePmNav();

  setTimeout(function() {
    var closeBtn = document.getElementById('pm-close');
    if (closeBtn) closeBtn.focus();
  }, 340);
}

/* ── Render project into modal ── */
function renderProcessModal(project) {
  var el = function(id){ return document.getElementById(id); };

  /* Header */
  var catEl = el('pm-category'); if (catEl) catEl.textContent = project.category || '';
  var yrEl  = el('pm-year');     if (yrEl)  yrEl.textContent  = project.year     || '';
  var ttEl  = el('pm-project-title'); if (ttEl) ttEl.textContent = project.title || '';

  /* Project meta */
  var roleEl = el('pm-meta-role');     if (roleEl)   roleEl.textContent   = project.role     || '—';
  var toolEl = el('pm-meta-tools');    if (toolEl)   toolEl.textContent   = project.tools    || '—';
  var platEl = el('pm-meta-platform'); if (platEl)   platEl.textContent   = project.platform || '—';

  /* Progress dots */
  var progressEl = el('pm-progress');
  if (progressEl) {
    progressEl.innerHTML = '';
    project.steps.forEach(function(step, i) {
      var dot = document.createElement('div');
      dot.className = 'pm__progress-dot' + (i === 0 ? ' is-active' : '');
      dot.dataset.index = i;
      dot.title = 'Step ' + (step.num || step.step || i + 1) + ': ' + step.title;
      progressEl.appendChild(dot);
    });
  }

  /* Step cards */
  var stepsEl = el('pm-steps');
  if (stepsEl) {
    stepsEl.innerHTML = '';
    project.steps.forEach(function(step, i) {
      stepsEl.appendChild(buildStepCard(step, i));
    });
  }

  /* Populate right panel with step 0 */
  updateRightPanel(project.steps[0], 0, project.steps.length, false);

  /* Scroll left to top */
  var leftCol = el('pm-left');
  if (leftCol) leftCol.scrollTop = 0;

  /* Setup scroll observer */
  setupStepObserver(project);

  /* Final output shortcut */
  var finalBtn = el('pm-final-btn');
  if (finalBtn) {
    finalBtn.onclick = function() {
      var lastCard = document.querySelector('.pm__step-card--final');
      if (lastCard) lastCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
  }
}

/* ── Build one step card (left column) ── */
function buildStepCard(step, index) {
  var card = document.createElement('div');
  card.className = 'pm__step-card'
    + (step.isFinal  ? ' pm__step-card--final' : '')
    + (index === 0   ? ' is-active'            : '');
  card.dataset.index = index;

  /* ── Frame visual ── */
  var frame = document.createElement('div');
  frame.className = 'pm__frame pm__frame--' + (step.frame || 'concept');

  /* Real video player for final step — with controls, sound on */
  if (step.isFinal && step.mediaType === 'video' && step.mediaSrc) {
    var vid = document.createElement('video');
    vid.className = 'pm__frame-video pm__frame-video--player';
    vid.setAttribute('controls', '');
    vid.setAttribute('playsinline', '');
    vid.setAttribute('preload', 'metadata');
    vid.innerHTML = '<source src="' + step.mediaSrc + '" type="video/mp4">';
    frame.appendChild(vid);
  }

  /* Real image for final step — natural dimensions, full width, scrollable */
  if (step.isFinal && step.mediaType === 'image' && step.mediaSrc) {
    var img = document.createElement('img');
    img.className = 'pm__frame-img';
    img.src = step.mediaSrc;
    img.alt = step.title;
    img.loading = 'lazy';
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', function(e) {
      e.stopPropagation();
      openFrameLightbox(step.mediaSrc, step.title);
    });
    frame.classList.add('pm__frame--natural');
    frame.appendChild(img);
  }

  /* Ambient icon for non-output frames */
  if (!step.isFinal || !step.mediaSrc) {
    var icons = { concept:'💡', structure:'▦', illustrator:'✏', asset:'⧉', motion:'▶', edit:'✂', output:'✓' };
    var icon = document.createElement('div');
    icon.className = 'pm__frame-icon';
    icon.textContent = icons[step.frame] || '●';
    frame.appendChild(icon);
  }

  /* Step badge */
  var badge = document.createElement('div');
  badge.className = 'pm__step-num-badge';
  badge.textContent = 'Step ' + (step.num || step.step || index + 1);
  frame.appendChild(badge);

  /* Zoom button — only for image finals */
  if (step.isFinal && step.mediaType === 'image' && step.mediaSrc) {
    var zoom = document.createElement('div');
    zoom.className = 'pm__frame-zoom';
    zoom.innerHTML = '&#10722;';
    zoom.title = 'View full size';
    zoom.addEventListener('click', function(e) {
      e.stopPropagation();
      openFrameLightbox(step.mediaSrc, step.title);
    });
    frame.appendChild(zoom);
  }

  /* Frame label */
  var fLabel = document.createElement('div');
  fLabel.className = 'pm__frame-label';
  fLabel.textContent = step.isFinal
    ? '✓ Final Output'
    : (step.frame.charAt(0).toUpperCase() + step.frame.slice(1));
  frame.appendChild(fLabel);

  card.appendChild(frame);

  /* ── Card bottom info ── */
  var bottom = document.createElement('div');
  bottom.className = 'pm__step-bottom';

  var cardTitle = document.createElement('div');
  cardTitle.className = 'pm__step-card-title';
  cardTitle.textContent = step.title;
  bottom.appendChild(cardTitle);

  var caption = document.createElement('div');
  caption.className = 'pm__step-caption';
  caption.textContent = step.caption;
  bottom.appendChild(caption);

  if (step.stepTools && step.stepTools.length) {
    var tagsRow = document.createElement('div');
    tagsRow.className = 'pm__step-tags';
    step.stepTools.forEach(function(tool) {
      var tag = document.createElement('span');
      tag.className = 'pm__step-tag';
      tag.textContent = tool;
      tagsRow.appendChild(tag);
    });
    bottom.appendChild(tagsRow);
  }

  card.appendChild(bottom);
  return card;
}

/* ── Scroll-based step detection (reliable across all browsers) ── */
function setupStepObserver(project) {
  if (pmStepObserver) { pmStepObserver.disconnect(); pmStepObserver = null; }

  var leftCol  = document.getElementById('pm-left');
  var bodyCol  = document.querySelector('.pm__body');   /* mobile scroll root */
  if (!leftCol) return;

  function onScroll() {
    var cards = leftCol.querySelectorAll('.pm__step-card');
    if (!cards.length) return;

    /* getBoundingClientRect is always in viewport coords — works regardless
       of which ancestor is scrolling (desktop: pm-left, mobile: pm__body). */
    var colRect  = leftCol.getBoundingClientRect();
    var triggerY = colRect.top + colRect.height * 0.35;

    var activeIdx = 0;
    cards.forEach(function(card, i) {
      if (card.getBoundingClientRect().top <= triggerY) activeIdx = i;
    });

    if (activeIdx !== pmCurrentStepIndex) {
      pmCurrentStepIndex = activeIdx;
      updateActiveStep(activeIdx, project);
    }
  }

  /* Desktop: pm__left scrolls. Mobile: pm__body scrolls. Attach to both. */
  leftCol.addEventListener('scroll', onScroll, { passive: true });
  if (bodyCol) bodyCol.addEventListener('scroll', onScroll, { passive: true });

  /* Fire immediately so step 0 is highlighted on open */
  onScroll();

  pmStepObserver = {
    disconnect: function() {
      leftCol.removeEventListener('scroll', onScroll);
      if (bodyCol) bodyCol.removeEventListener('scroll', onScroll);
    }
  };
}

/* ── Update active step highlighting ── */
function updateActiveStep(index, project) {
  var step = project.steps[index];
  if (!step) return;

  /* Active card border */
  document.querySelectorAll('.pm__step-card').forEach(function(card, i) {
    card.classList.toggle('is-active', i === index);
  });

  /* Progress dots */
  document.querySelectorAll('.pm__progress-dot').forEach(function(dot, i) {
    dot.classList.toggle('is-active', i === index);
    dot.classList.toggle('is-done',   i < index);
    dot.classList.remove(i > index ? 'is-done' : '');
  });

  updateRightPanel(step, index, project.steps.length, true);
}

/* ── Update right panel description — with fade transition ── */
function updateRightPanel(step, index, total, animate) {
  var infoEl = document.getElementById('pm-step-info');
  if (!infoEl) return;

  function applyContent() {
    var pad = function(n){ return String(n).padStart(2,'0'); };
    var ctr = document.getElementById('pm-step-counter');
    var ttl = document.getElementById('pm-step-title');
    var obj = document.getElementById('pm-step-objective');
    var thk = document.getElementById('pm-step-thinking');
    var dec = document.getElementById('pm-step-decision');
    var out = document.getElementById('pm-step-outcome');
    var tls = document.getElementById('pm-step-tools');

    if (ctr) ctr.textContent = 'Step ' + (step.num || step.step || (activeIdx + 1)) + ' / ' + pad(total);
    if (ttl) ttl.textContent = step.title     || '';
    if (obj) obj.textContent = step.objective || '';
    if (thk) thk.textContent = step.thinking  || '';
    if (dec) dec.textContent = step.decision  || '';
    if (out) out.textContent = step.outcome   || '';

    if (tls) {
      tls.innerHTML = '';
      (step.stepTools || []).forEach(function(tool) {
        var tag = document.createElement('span');
        tag.className = 'pm__step-tool-tag';
        tag.textContent = tool;
        tls.appendChild(tag);
      });
    }
    /* Scroll right panel description to top after update */
    infoEl.scrollTop = 0;
  }

  if (animate) {
    infoEl.classList.add('transitioning');
    setTimeout(function() {
      applyContent();
      infoEl.classList.remove('transitioning');
    }, 210);
  } else {
    applyContent();
  }
}

/* ── Prev / Next project navigation ── */
function updatePmNav() {
  var prev = document.getElementById('pm-prev');
  var next = document.getElementById('pm-next');
  if (!prev || !next) return;
  var idx = pmProjectIds.indexOf(pmCurrentId);
  prev.disabled = idx <= 0;
  next.disabled = idx >= pmProjectIds.length - 1;
}

function navigateProject(dir) {
  var idx = pmProjectIds.indexOf(pmCurrentId);
  var newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= pmProjectIds.length) return;

  pmCurrentId = pmProjectIds[newIdx];
  pmCurrentStepIndex = 0;
  updatePmNav();

  var galleryItem = workGalleryItems[pmCurrentId];
  var processData = processProjects[pmCurrentId];
  var project;
  if (processData) {
    project = processData;
  } else if (galleryItem) {
    var tagParts = (galleryItem.tag || '').split('·');
    project = {
      title:    galleryItem.title,
      category: (tagParts[0] || '').trim(),
      year:     (tagParts[1] || '').trim(),
      role:     'Creative Direction · Visual Design',
      tools:    galleryItem.tools    || '',
      platform: galleryItem.platform || '',
      steps:    buildDefaultSteps(galleryItem)
    };
  }
  if (!project) return;

  pmCurrentProject = project;
  renderProcessModal(project);
}

/* ── Close process modal ── */
function closeProcessModal() {
  var modal = document.getElementById('process-modal');
  if (modal) modal.classList.remove('open');
  var vaModal = document.getElementById('wg-viewall-modal');
  if (!vaModal || !vaModal.classList.contains('open')) document.body.style.overflow = '';
  if (pmStepObserver) { pmStepObserver.disconnect(); pmStepObserver = null; }
  /* Stop videos */
  document.querySelectorAll('#pm-steps video').forEach(function(v) {
    v.pause(); v.src = ''; v.removeAttribute('src');
  });
}

/* Alias kept for any remaining references */
function closeWorkGalleryModal() { closeProcessModal(); }

/* ── Lightbox ── */
function openFrameLightbox(src, alt) {
  var lb  = document.getElementById('pm-lightbox');
  var img = document.getElementById('pm-lightbox-img');
  if (!lb || !img) return;
  img.src = src;
  img.alt = alt || '';
  lb.classList.add('open');
}

function closeFrameLightbox() {
  var lb = document.getElementById('pm-lightbox');
  if (lb) lb.classList.remove('open');
}

/* ── Init wiring ── */
function initProcessModal() {
  /* Backdrop */
  var bd = document.getElementById('pm-backdrop');
  if (bd) bd.addEventListener('click', closeProcessModal);

  /* Close button */
  var closeBtn = document.getElementById('pm-close');
  if (closeBtn) closeBtn.addEventListener('click', closeProcessModal);

  /* Close pill */
  var closePill = document.getElementById('pm-close-pill');
  if (closePill) closePill.addEventListener('click', closeProcessModal);

  /* Prev / Next */
  var prev = document.getElementById('pm-prev');
  var next = document.getElementById('pm-next');
  if (prev) prev.addEventListener('click', function() { navigateProject(-1); });
  if (next) next.addEventListener('click', function() { navigateProject(1); });

  /* Lightbox close */
  var lbBg    = document.getElementById('pm-lightbox-bg');
  var lbClose = document.getElementById('pm-lightbox-close');
  var lbImg   = document.getElementById('pm-lightbox-img');
  if (lbBg)    lbBg.addEventListener('click',    closeFrameLightbox);
  if (lbClose) lbClose.addEventListener('click', closeFrameLightbox);
  if (lbImg)   lbImg.addEventListener('click',   closeFrameLightbox);
}

/* ── Entry points called by onclick attributes ── */
function openWorkGalleryItem(itemId) {
  openProcessModal(itemId);
}

function openWorkSnapshotItem(itemId) {
  showPage('work-gallery');
  var galleryId = snapshotToGallery[itemId] || itemId;
  setTimeout(function() { openProcessModal(galleryId); }, 160);
}

/* ESC key — close image lightbox → pm lightbox → case study modal → process modal → view-all modal */
document.addEventListener('keydown', function(e) {
  if (e.key !== 'Escape') return;
  var imgLb = document.getElementById('rk-img-lightbox');
  if (imgLb && imgLb.style.display !== 'none' && imgLb.style.display !== '') { closeImageLightbox(); return; }
  var lb = document.getElementById('pm-lightbox');
  if (lb && lb.classList.contains('open')) { closeFrameLightbox(); return; }
  var csm = document.getElementById('cs-modal');
  if (csm && csm.classList.contains('open')) { closeCaseStudyModal(); return; }
  var pm = document.getElementById('process-modal');
  if (pm && pm.classList.contains('open')) { closeProcessModal(); return; }
  closeViewAllModal();
});

/* ══════════════════════════════════════════
   CASE STUDY MODAL
   ══════════════════════════════════════════ */

var CS_DEFAULTS = [
  {
    id: 'cs-motion-campaign',
    number: '01',
    type: 'Motion Campaign',
    title: 'B2B Product Launch Video Campaign',
    businessGoal: 'Communicate B2B product value in short-form video for social media',
    role: 'Creative Direction, Storyboard, Motion Design, Final Execution',
    platform: 'LinkedIn, Instagram Reels, YouTube Shorts',
    tools: 'After Effects, Illustrator, Premiere Pro',
    description: 'Built a motion campaign to translate product messaging into a clear, fast, and visually engaging animated video for digital audiences. Includes storyboard, scene breakdown, motion direction, and final output.',
    tags: ['Storyboard', 'Motion', 'B2B', 'Social Video'],
    heroVisualClass: 'visual-motion',
    heroLabel: 'Case Study Hero',
    heroMedia: null,
    frames: [
      { visualClass: 'visual-motion', label: 'Frame 1', media: null },
      { visualClass: 'visual-social', label: 'Frame 2', media: null },
      { visualClass: 'visual-brand',  label: 'Frame 3', media: null }
    ]
  },
  {
    id: 'cs-landing-page',
    number: '02',
    type: 'Website / Landing Page',
    title: 'Digital Landing Page Experience',
    businessGoal: 'Convert traffic through clear visual hierarchy and campaign alignment',
    role: 'UI Direction, Layout Strategy, Visual Design, Responsive Direction',
    platform: 'Web (Desktop + Mobile)',
    tools: 'Figma, Adobe XD, Photoshop',
    description: 'Conversion-focused landing page with above-fold strategy, CTA placement, desktop/mobile design system, and brand consistency across campaign assets.',
    tags: ['UX Direction', 'Web Design', 'CRO', 'Responsive'],
    heroVisualClass: 'visual-web',
    heroLabel: 'Landing Page Hero',
    heroMedia: null,
    frames: []
  },
  {
    id: 'cs-social-system',
    number: '03',
    type: 'Brand + Social System',
    title: 'Social Media Creative System',
    businessGoal: 'Scalable social campaign system for consistent multi-platform publishing',
    role: 'Art Direction, Design System, Team Guidance, Campaign Delivery',
    platform: 'Instagram, LinkedIn, Twitter/X',
    tools: 'Adobe Illustrator, Photoshop, After Effects, Figma',
    description: 'Developed a complete social creative system: static posts, carousels, GIFs, and short-form videos across Instagram, LinkedIn, and Twitter with one consistent visual language.',
    tags: ['Art Direction', 'Design System', 'Social Campaign'],
    heroVisualClass: 'visual-social',
    heroLabel: 'Social Media System',
    heroMedia: null,
    frames: []
  },
  {
    id: 'cs-brand-identity',
    number: '04',
    type: 'Brand Identity',
    title: 'Brand Identity & Logo System',
    businessGoal: 'Build a distinctive brand identity for digital and print applications',
    role: 'Brand Concept, Logo Design, Typography System, Brand Guidelines',
    platform: 'Digital + Print',
    tools: 'Adobe Illustrator, Figma',
    description: 'Logo concept, variations, grid construction, typography pairing, color palette, usage rules, and digital/print brand application across platforms.',
    tags: ['Logo Design', 'Brand System', 'Typography'],
    heroVisualClass: 'visual-brand',
    heroLabel: 'Brand Identity',
    heroMedia: null,
    frames: []
  }
];

var csmCurrentId    = null;
var csmCurrentIndex = 0;

function getCaseStudyById(id) {
  try {
    var stored = JSON.parse(localStorage.getItem('rk_case_studies') || '[]');
    var found = stored.find(function(cs) { return cs.id === id; });
    if (found) return found;
  } catch(e) {}
  return CS_DEFAULTS.find(function(cs) { return cs.id === id; }) || null;
}

function getAllCaseStudiesForModal() {
  try {
    var stored = JSON.parse(localStorage.getItem('rk_case_studies') || '[]');
    if (stored.length > 0) {
      var merged = CS_DEFAULTS.map(function(d) {
        return stored.find(function(s) { return s.id === d.id; }) || d;
      });
      stored.forEach(function(s) {
        if (!merged.find(function(m) { return m.id === s.id; })) merged.push(s);
      });
      return merged;
    }
  } catch(e) {}
  return CS_DEFAULTS;
}

window.renderCaseStudyCards = function() {
  var container = document.getElementById('cs-dynamic-list');
  if (!container) return;
  function _e(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function _mu(m) { return !m ? '' : (typeof m === 'string' ? m : (m.src||'')); }
  var list = getAllCaseStudiesForModal().filter(function(cs) { return cs.status !== 'draft'; });
  container.innerHTML = list.map(function(cs, idx) {
    var num = cs.number || String(idx+1).padStart(2,'0');
    var heroUrl = _mu(cs.heroMedia);
    var heroHtml = heroUrl
      ? '<div class="cs-hero-img" style="border-radius:12px;overflow:hidden;background:#111"><img src="'+_e(heroUrl)+'" alt="'+_e(cs.title||'')+'" style="width:100%;height:100%;object-fit:cover;display:block"></div>'
      : '<div class="visual-block '+_e(cs.heroVisualClass||'visual-motion')+' cs-hero-img"><div class="visual-inner"><div class="visual-label">'+_e(cs.heroLabel||'Case Study Hero')+'</div></div></div>';
    var frames = cs.frames||[];
    var framesHtml = frames.length ? '<div class="cs-frames">'+frames.map(function(f){
      var fu = _mu(f.media);
      return fu
        ? '<div class="cs-frame" style="border-radius:8px;overflow:hidden;background:#111"><img src="'+_e(fu)+'" alt="'+_e(f.label||'')+'" style="width:100%;height:100%;object-fit:cover;display:block"></div>'
        : '<div class="visual-block '+_e(f.visualClass||'visual-motion')+' cs-frame"><div class="visual-inner"><div class="visual-label">'+_e(f.label||'')+'</div></div></div>';
    }).join('')+'</div>' : '';
    var metaHtml = [
      {label:'Business Goal',val:cs.businessGoal},
      {label:'My Role',val:cs.role},
      {label:'Platform',val:cs.platform},
      {label:'Tools',val:cs.tools}
    ].filter(function(m){return m.val;}).map(function(m){
      return '<div><div class="cs-meta-label">'+_e(m.label)+'</div><div class="cs-meta-val">'+_e(m.val)+'</div></div>';
    }).join('');
    var tagsHtml = (cs.tags||[]).map(function(t){return '<span class="tag">'+_e(t)+'</span>';}).join('');
    return '<div class="cs-full-card reveal" id="'+_e(cs.id)+'" style="cursor:pointer" onclick="openCaseStudyModal(\''+_e(cs.id)+'\')">'
      +'<div class="cs-full-grid">'
      +'<div class="cs-full-media">'+heroHtml+framesHtml+'</div>'
      +'<div class="cs-full-info">'
      +'<div class="cs-type">Case Study '+_e(num)+' — '+_e(cs.type||'')+'</div>'
      +'<h2 class="cs-h2">'+_e(cs.title||'')+'</h2>'
      +(metaHtml?'<div class="cs-meta-grid">'+metaHtml+'</div>':'')
      +(cs.description?'<p class="cs-desc">'+_e(cs.description)+'</p>':'')
      +(tagsHtml?'<div class="tag-row">'+tagsHtml+'</div>':'')
      +'<button class="btn-pill">View Full Case Study →</button>'
      +'</div></div></div>';
  }).join('');
  if (typeof window.initReveal === 'function') window.initReveal();
};

function openCaseStudyModal(id) {
  var csData = getCaseStudyById(id);
  if (!csData) return;

  var all = getAllCaseStudiesForModal();
  csmCurrentId    = id;
  csmCurrentIndex = all.findIndex(function(cs) { return cs.id === id; });

  renderCaseStudyModal(csData);

  var modal = document.getElementById('cs-modal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeCaseStudyModal() {
  var modal = document.getElementById('cs-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

function openImageLightbox(src) {
  var lb = document.getElementById('rk-img-lightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'rk-img-lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-label', 'Image preview');
    lb.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.93);z-index:2147483646;display:flex;align-items:center;justify-content:center;padding:24px;cursor:zoom-out';
    lb.innerHTML = '<button aria-label="Close preview" style="position:absolute;top:16px;right:16px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.15);color:#fff;width:38px;height:38px;border-radius:50%;cursor:pointer;font-size:20px;line-height:1;display:flex;align-items:center;justify-content:center" onclick="closeImageLightbox()">×</button>'
      + '<img id="rk-img-lightbox-img" src="" alt="Full preview" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:8px;cursor:default;box-shadow:0 24px 80px rgba(0,0,0,.7)">';
    lb.addEventListener('click', function(e) { if (e.target === lb) closeImageLightbox(); });
    document.body.appendChild(lb);
  }
  document.getElementById('rk-img-lightbox-img').src = src;
  lb.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeImageLightbox() {
  var lb = document.getElementById('rk-img-lightbox');
  if (lb) lb.style.display = 'none';
  document.getElementById('rk-img-lightbox-img').src = '';
  document.body.style.overflow = '';
}

window.openImageLightbox  = openImageLightbox;
window.closeImageLightbox = closeImageLightbox;

function renderCaseStudyModal(cs) {
  var get = function(id) { return document.getElementById(id); };
  var eyebrowText = 'Case Study ' + cs.number + ' — ' + cs.type;

  /* LEFT: project header */
  var eyebrow = get('csm-eyebrow');
  if (eyebrow) eyebrow.textContent = eyebrowText;
  var leftTitle = get('csm-left-title');
  if (leftTitle) leftTitle.textContent = cs.title || '';

  /* LEFT: stacked image cards (hero + extra frames) */
  var cardsEl = get('csm-img-cards');
  if (cardsEl) {
    cardsEl.innerHTML = '';

    /* Build all cards: hero first, then additional frames */
    var allCards = [];
    allCards.push({ media: cs.heroMedia || null, visualClass: cs.heroVisualClass || 'visual-motion', label: cs.heroLabel || cs.title });
    (cs.frames || []).forEach(function(f) {
      allCards.push({ media: f.media || null, visualClass: f.visualClass || 'visual-motion', label: f.label || '' });
    });

    allCards.forEach(function(card) {
      var cardDiv = document.createElement('div');
      cardDiv.className = 'csm__img-card';

      var frameDiv = document.createElement('div');
      frameDiv.className = 'csm__img-frame';

      var _mSrc = card.media && (typeof card.media === 'string' ? card.media : card.media.src);
      var _mType = card.media && typeof card.media === 'object' ? (card.media.type || 'image') : 'image';
      if (_mSrc) {
        frameDiv.classList.add('csm__img-frame--natural');
        if (_mType === 'video') {
          frameDiv.innerHTML = '<video src="' + _mSrc + '" autoplay muted loop playsinline style="cursor:pointer" onclick="openImageLightbox(\'' + _mSrc + '\')"></video>';
        } else {
          frameDiv.innerHTML = '<img src="' + _mSrc + '" alt="' + (card.label || '') + '" onclick="openImageLightbox(\'' + _mSrc + '\')">';
        }
      } else {
        var vb = document.createElement('div');
        vb.className = 'visual-block ' + card.visualClass;
        vb.innerHTML = '<div class="visual-inner"><div class="visual-label">' + (card.label || '') + '</div></div>';
        frameDiv.appendChild(vb);
      }

      var bottomDiv = document.createElement('div');
      bottomDiv.className = 'csm__img-card-bottom';
      bottomDiv.innerHTML = '<div class="csm__img-card-label">' + (card.label || '') + '</div>';

      cardDiv.appendChild(frameDiv);
      cardDiv.appendChild(bottomDiv);
      cardsEl.appendChild(cardDiv);
    });
  }

  /* RIGHT: type badge + title */
  var typeBadge = get('csm-type');
  if (typeBadge) typeBadge.textContent = eyebrowText;
  var titleEl = get('csm-title');  if (titleEl) titleEl.textContent = cs.title || '';

  /* RIGHT: meta */
  var goalEl  = get('csm-goal');    if (goalEl)  goalEl.textContent  = cs.businessGoal || '—';
  var roleEl  = get('csm-role');    if (roleEl)  roleEl.textContent  = cs.role || '—';
  var platEl  = get('csm-platform');if (platEl)  platEl.textContent  = cs.platform || '—';
  var toolsEl = get('csm-tools');   if (toolsEl) toolsEl.textContent = cs.tools || '—';
  var descEl  = get('csm-desc');    if (descEl)  descEl.textContent  = cs.description || '';

  var tagsEl = get('csm-tags');
  if (tagsEl) {
    tagsEl.innerHTML = '';
    (cs.tags || []).forEach(function(tag) {
      var span = document.createElement('span');
      span.className = 'tag';
      span.textContent = tag;
      tagsEl.appendChild(span);
    });
  }

  updateCsmNav();

  /* Scroll left panel back to top on navigation */
  var left = get('csm-left');
  if (left) left.scrollTop = 0;
  var panelScroll = document.querySelector('.csm__panel-scroll');
  if (panelScroll) panelScroll.scrollTop = 0;
}

function updateCsmNav() {
  var all  = getAllCaseStudiesForModal();
  var prev = document.getElementById('csm-prev');
  var next = document.getElementById('csm-next');
  if (prev) prev.disabled = csmCurrentIndex <= 0;
  if (next) next.disabled = csmCurrentIndex >= all.length - 1;
}

function navigateCaseStudy(dir) {
  var all = getAllCaseStudiesForModal();
  var newIdx = csmCurrentIndex + dir;
  if (newIdx < 0 || newIdx >= all.length) return;
  csmCurrentIndex = newIdx;
  csmCurrentId    = all[newIdx].id;
  renderCaseStudyModal(all[newIdx]);
}

function initCaseStudyModal() {
  var bd = document.getElementById('csm-backdrop');
  if (bd) bd.addEventListener('click', closeCaseStudyModal);

  var closeBtn = document.getElementById('csm-close');
  if (closeBtn) closeBtn.addEventListener('click', closeCaseStudyModal);

  var prev = document.getElementById('csm-prev');
  if (prev) prev.addEventListener('click', function() { navigateCaseStudy(-1); });

  var next = document.getElementById('csm-next');
  if (next) next.addEventListener('click', function() { navigateCaseStudy(1); });
}

/* Seek gallery card thumbnails to 1s for better first-frame */
function initVideoThumbs() {
  document.querySelectorAll('.wg-thumb-video').forEach(function(vid) {
    vid.addEventListener('loadedmetadata', function() { vid.currentTime = 1; });
  });
}

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

/* ══ GLOBAL INQUIRY MODAL ══ */

var RkModal = (function () {
  var FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';
  var el, card, backdrop, titleEl, descEl, bodyEl, footEl, submitBtn, cancelBtn, closeBtn;
  var _triggerEl = null;
  var _onSubmit = null;
  var _ready = false;

  function _init() {
    if (_ready) return;
    el = document.getElementById('rk-modal');
    if (!el) return;
    card       = document.getElementById('rkm-card');
    backdrop   = document.getElementById('rkm-backdrop');
    titleEl    = document.getElementById('rkm-title');
    descEl     = document.getElementById('rkm-desc');
    bodyEl     = document.getElementById('rkm-body');
    footEl     = document.getElementById('rkm-foot');
    submitBtn  = document.getElementById('rkm-submit');
    cancelBtn  = document.getElementById('rkm-cancel');
    closeBtn   = document.getElementById('rkm-close');

    closeBtn.addEventListener('click', close);
    cancelBtn.addEventListener('click', close);
    backdrop.addEventListener('click', close);
    submitBtn.addEventListener('click', _handleSubmit);

    document.addEventListener('keydown', function (e) {
      if (!el || el.hidden) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'Tab') _trapFocus(e);
    });

    _ready = true;
  }

  function _trapFocus(e) {
    var nodes = Array.from(card.querySelectorAll(FOCUSABLE));
    if (!nodes.length) return;
    var first = nodes[0], last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  function _handleSubmit() {
    if (_onSubmit) { _onSubmit(); return; }
    var valid = true;
    card.querySelectorAll('[required]').forEach(function (field) {
      var isEmail = field.type === 'email';
      var empty = !field.value.trim();
      var badEmail = isEmail && field.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
      var invalid = empty || badEmail;
      var err = field.parentElement.querySelector('.rkm-error');
      field.classList.toggle('has-error', invalid);
      if (err) err.classList.toggle('visible', invalid);
      if (invalid) valid = false;
    });
    if (!valid) return;
    _showSuccess();
  }

  function _showSuccess() {
    bodyEl.innerHTML = '<div class="rkm__success">'
      + '<div class="rkm__success-check">'
      + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" width="20" height="20"><polyline points="20 6 9 17 4 12"/></svg>'
      + '</div>'
      + '<p class="rkm__success-title">Message received.</p>'
      + '<p class="rkm__success-body">Thanks for reaching out — I\'ll get back to you within 1–2 business days.</p>'
      + '<button class="rkm__btn rkm__btn--secondary rkm__success-close" onclick="RkModal.close()">Close</button>'
      + '</div>';
    footEl.style.display = 'none';
    descEl.style.display = 'none';
    titleEl.textContent = '';
    closeBtn.style.display = 'none';
  }

  function open(cfg) {
    _init();
    if (!el) return;

    _triggerEl = document.activeElement;
    _onSubmit  = cfg.onSubmit || null;

    titleEl.textContent = cfg.title || '';
    descEl.textContent  = cfg.desc  || '';
    descEl.style.display = cfg.desc ? '' : 'none';
    bodyEl.innerHTML    = cfg.body  || '';
    submitBtn.textContent = cfg.primaryLabel   || 'Send inquiry';
    cancelBtn.textContent = cfg.secondaryLabel || 'Maybe later';
    footEl.style.display  = cfg.hideFooter ? 'none' : '';
    closeBtn.style.display = '';

    /* Re-init toggle buttons injected into body */
    bodyEl.querySelectorAll('.rkm-toggle').forEach(function (group) {
      group.querySelectorAll('.rkm-toggle__btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          group.querySelectorAll('.rkm-toggle__btn').forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
        });
      });
    });

    el.hidden = false;
    el.classList.remove('rkm--closing');
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(function () {
      var first = card.querySelector(FOCUSABLE);
      if (first) first.focus(); else card.focus();
    });
  }

  function close() {
    if (!el || el.hidden) return;
    el.classList.add('rkm--closing');
    setTimeout(function () {
      el.hidden = true;
      el.classList.remove('rkm--closing');
      /* Only restore scroll if no other modal is holding it */
      var vaOpen = document.getElementById('wg-viewall-modal');
      var pmOpen = document.getElementById('process-modal');
      var vaLive = vaOpen && vaOpen.classList.contains('open');
      var pmLive = pmOpen && pmOpen.classList.contains('open');
      if (!vaLive && !pmLive) document.body.style.overflow = '';
      if (_triggerEl && typeof _triggerEl.focus === 'function') _triggerEl.focus();
    }, 150);
  }

  /* ── Preset: inquiry form ── */
  function inquiry() {
    open({
      title: "Let's build something thoughtful.",
      desc:  "Share a few details about your project, and I'll get back with next steps.",
      body:
        '<div class="rkm-toggle">'
          + '<button class="rkm-toggle__btn active" type="button">Hiring enquiry</button>'
          + '<button class="rkm-toggle__btn" type="button">Creative partnership</button>'
        + '</div>'
        + '<div class="rkm-field">'
          + '<label class="rkm-label" for="rkm-f-name">Name</label>'
          + '<input class="rkm-input" id="rkm-f-name" type="text" placeholder="Your name" required autocomplete="name">'
          + '<span class="rkm-error">Please enter your name.</span>'
        + '</div>'
        + '<div class="rkm-field">'
          + '<label class="rkm-label" for="rkm-f-email">Email</label>'
          + '<input class="rkm-input" id="rkm-f-email" type="email" placeholder="you@company.com" required autocomplete="email">'
          + '<span class="rkm-error">Please enter a valid email.</span>'
        + '</div>'
        + '<div class="rkm-field">'
          + '<label class="rkm-label" for="rkm-f-company">Company / Organisation</label>'
          + '<input class="rkm-input" id="rkm-f-company" type="text" placeholder="Company name" autocomplete="organization">'
        + '</div>'
        + '<div class="rkm-field">'
          + '<label class="rkm-label" for="rkm-f-msg">Message</label>'
          + '<textarea class="rkm-textarea" id="rkm-f-msg" placeholder="Tell me about the project or role…" required></textarea>'
          + '<span class="rkm-error">Please add a brief message.</span>'
        + '</div>',
      primaryLabel:   'Send inquiry',
      secondaryLabel: 'Maybe later'
    });
  }

  return { open: open, close: close, inquiry: inquiry };
})();

/* Wire primary CTAs to inquiry modal — override inline onclick at DOM-ready */
document.addEventListener('DOMContentLoaded', function () {
  /* All "Hire Me" nav buttons */
  document.querySelectorAll('.nav-cta').forEach(function (btn) {
    btn.onclick = function (e) { e.preventDefault(); RkModal.inquiry(); };
  });
  /* Hero "Hire me" secondary button */
  document.querySelectorAll('.hero-v2__btn--secondary').forEach(function (btn) {
    btn.onclick = function (e) { e.preventDefault(); RkModal.inquiry(); };
  });
  /* Case study modal */
  initCaseStudyModal();
});

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

/* ── ADMIN INTEGRATION ── */

/* Admin category → filter-tab data-category */
var adminCatMap = {
  'motion':     'video',
  'video':      'video',
  'static':     'static',
  'image':      'static',
  'gif':        'gif',
  'logos':      'logos',
  'case study': 'case study',
  'favourites': 'favourites'
};

/* filter-category → existing section ID + grid selector */
var adminSectionMap = {
  'video':  { id: 'wgs-motion', grid: '.gallery-grid-3' },
  'static': { id: 'wgs-social', grid: '.gallery-grid-4' },
  'gif':    { id: 'wgs-gif',    grid: '.gallery-grid-3' },
  'logos':  { id: 'wgs-brand',  grid: '.gallery-grid-4' }
};

function buildAdminCard(p, item, filterCat) {
  var mediaHtml;
  if (item.thumbnail) {
    mediaHtml = '<img src="' + item.thumbnail + '" alt="' + p.title + '" style="width:100%;height:100%;object-fit:cover">';
  } else if (item.src && item.type === 'video') {
    mediaHtml = '<video src="' + item.src + '" muted loop playsinline style="width:100%;height:100%;object-fit:cover"></video>';
  } else if (item.src && item.type === 'image') {
    mediaHtml = '<img src="' + item.src + '" alt="' + p.title + '" style="width:100%;height:100%;object-fit:cover">';
  } else {
    mediaHtml = '<div class="wg-placeholder visual-motion" style="width:100%;height:100%;min-height:160px"></div>';
  }
  var card = document.createElement('div');
  card.className = 'gallery-item wg-item';
  card.dataset.category = filterCat;
  card.setAttribute('data-admin-injected', 'true');
  card.setAttribute('onclick', 'openWorkGalleryItem(\'' + p.id + '\');return false;');
  card.style.cursor = 'pointer';
  card.innerHTML = '<div class="wg-thumb" style="overflow:hidden;border-radius:10px;aspect-ratio:16/9">' + mediaHtml + '</div>'
    + '<div class="gallery-meta"><span class="gallery-tag">' + item.tag + '</span>'
    + '<div class="gallery-name">' + p.title + '</div></div>';
  return card;
}

function refreshSectionCount(sectionEl) {
  var countEl = sectionEl.querySelector('.wg-section-count');
  if (!countEl) return;
  var n = sectionEl.querySelectorAll('.gallery-item.wg-item').length;
  countEl.textContent = n + (n === 1 ? ' item' : ' items');
}

function integrateAdminProjects() {
  var raw = localStorage.getItem('rk_projects');
  if (!raw) return;
  var all;
  try { all = JSON.parse(raw); } catch (e) { return; }
  var published = all.filter(function(p) { return p.status === 'published'; });

  /* Update workGalleryItems + processProjects */
  published.forEach(function(p) {
    workGalleryItems[p.id] = {
      title:    p.title,
      tag:      (p.category || '') + (p.year ? ' · ' + p.year : ''),
      type:     (p.finalOutput && p.finalOutput.type) || 'placeholder',
      src:      (p.finalOutput && p.finalOutput.src)  || null,
      desc:     p.shortDescription || p.description || '',
      tools:    (p.tools   || []).join(' · '),
      platform: (p.platform || []).join(' · '),
      thumbnail:(p.thumbnail && p.thumbnail.src) || null,
      featured: p.featured
    };
    if (p.processSteps && p.processSteps.length) {
      processProjects[p.id] = {
        id: p.id, title: p.title, tag: workGalleryItems[p.id].tag,
        steps: p.processSteps.map(function(s) {
          return {
            step: s.step, title: s.title, description: s.description,
            thinking: s.thinking, decision: s.decision, challenge: s.challenge,
            outcome: s.outcome, tools: s.tools || [], caption: s.caption,
            isFinal: s.isFinal, frame: s.isFinal ? 'output' : (s.frame || 'concept'),
            mediaType: s.media ? s.media.type : null, mediaSrc: s.media ? s.media.src : null
          };
        })
      };
    }
  });

  /* New projects = no existing hardcoded card */
  var newProjects = published.filter(function(p) {
    return !document.querySelector('.wg-item[onclick*="' + p.id + '"]');
  });
  if (!newProjects.length) return;

  var adminSection = document.getElementById('wgs-admin');
  var adminGrid    = document.getElementById('wgs-admin-grid');
  var injectedSections = {};

  newProjects.forEach(function(p) {
    var item = workGalleryItems[p.id];
    var filterCat = adminCatMap[(p.category || '').toLowerCase()] || (p.category || 'other').toLowerCase();

    /* Try to inject into matching existing section */
    var mapped = adminSectionMap[filterCat];
    var targetGrid = null;
    if (mapped) {
      var sectionEl = document.getElementById(mapped.id);
      if (sectionEl) {
        targetGrid = sectionEl.querySelector(mapped.grid);
        injectedSections[mapped.id] = sectionEl;
      }
    }

    /* Fall back to admin catch-all section */
    if (!targetGrid && adminGrid) {
      targetGrid = adminGrid;
      injectedSections['wgs-admin'] = adminSection;
    }
    if (!targetGrid) return;

    targetGrid.appendChild(buildAdminCard(p, item, filterCat));
  });

  /* Update item counts for all touched sections */
  Object.keys(injectedSections).forEach(function(id) {
    var sec = injectedSections[id];
    if (sec) {
      refreshSectionCount(sec);
      sec.style.display = '';
    }
  });

  /* Show/hide admin catch-all based on whether it got any cards */
  if (adminSection && adminGrid) {
    var hasAdminCards = adminGrid.querySelectorAll('.gallery-item').length > 0;
    adminSection.style.display = hasAdminCards ? '' : 'none';
  }
}

/* ── REAL-TIME SYNC: update gallery when admin changes projects ── */
function resyncAdminProjects() {
  /* Collect affected sections before removing cards */
  var affectedSections = {};
  document.querySelectorAll('[data-admin-injected]').forEach(function(el) {
    var sec = el.closest('.gallery-section');
    if (sec && sec.id) affectedSections[sec.id] = sec;
    el.remove();
  });
  /* Refresh counts on sections that lost cards */
  Object.keys(affectedSections).forEach(function(id) {
    refreshSectionCount(affectedSections[id]);
  });
  integrateAdminProjects();
  applyFeaturedLimitAll();

  /* Re-apply whatever filter is currently active */
  var activeTab = document.querySelector('#pg-work-gallery .filter-tab.active');
  if (!activeTab) return;
  var filter = activeTab.textContent.trim().toLowerCase();
  if (filter === 'all') return;
  var container = document.querySelector('#pg-work-gallery .wg-gallery-section .container');
  if (!container) return;
  container.querySelectorAll('.gallery-item[data-category]').forEach(function(item) {
    item.style.display = ((item.dataset.category || '').toLowerCase() === filter) ? '' : 'none';
  });
  container.querySelectorAll('.gallery-section').forEach(function(section) {
    var visible = Array.from(section.querySelectorAll('.gallery-item[data-category]')).some(function(i) {
      return i.style.display !== 'none';
    });
    section.style.display = visible ? '' : 'none';
  });
}

/* Cross-tab sync: fires when admin (in another tab) saves to localStorage */
window.addEventListener('storage', function(e) {
  if (e.key === 'rk_projects') resyncAdminProjects();
  if (e.key === 'rk_section_order') applySectionOrder();
});

function applySectionOrder() {
  var stored;
  try { stored = JSON.parse(localStorage.getItem('rk_section_order') || 'null'); } catch(e) {}
  if (!Array.isArray(stored) || !stored.length) return;
  var first = document.getElementById(stored[0]);
  if (!first) return;
  var container = first.parentElement;
  if (!container) return;
  stored.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) container.appendChild(el);
  });
}

/* ── FEATURED LIMIT + VIEW ALL MODAL ── */

var WG_FEATURED_LIMIT = 8;

function getCardId(card) {
  var m = (card.getAttribute('onclick') || '').match(/openWorkGalleryItem\(['"]([^'"]+)['"]\)/);
  return m ? m[1] : null;
}

function applyFeaturedLimit(section) {
  var cards = Array.from(section.querySelectorAll('.gallery-item.wg-item'));
  if (!cards.length) return;

  /* Featured items first, non-featured after */
  var featured = [], nonFeatured = [];
  cards.forEach(function(c) {
    var id = getCardId(c);
    var isFeat = id && workGalleryItems[id] && workGalleryItems[id].featured;
    (isFeat ? featured : nonFeatured).push(c);
  });
  var ordered = featured.concat(nonFeatured);
  var total = ordered.length;

  ordered.forEach(function(card, i) {
    card.style.display = i < WG_FEATURED_LIMIT ? '' : 'none';
  });

  /* View All button — below the grid */
  var btn = section.querySelector('.wg-viewall-btn');
  if (!btn) {
    btn = document.createElement('button');
    btn.className = 'wg-viewall-btn';
    btn.type = 'button';
    section.appendChild(btn);
  }
  btn.textContent = 'View All (' + total + ')';
  btn.onclick = function() { openViewAllModal(section); };
  btn.style.display = total > WG_FEATURED_LIMIT ? '' : 'none';
}

function applyFeaturedLimitAll() {
  document.querySelectorAll('#pg-work-gallery .gallery-section').forEach(applyFeaturedLimit);
}

function openViewAllModal(section) {
  var titleEl = section.querySelector('.gallery-section-title');
  var cards = Array.from(section.querySelectorAll('.gallery-item.wg-item'));

  var featured = [], nonFeatured = [];
  cards.forEach(function(c) {
    var id = getCardId(c);
    var isFeat = id && workGalleryItems[id] && workGalleryItems[id].featured;
    (isFeat ? featured : nonFeatured).push(c);
  });
  var ordered = featured.concat(nonFeatured);

  var grid = document.getElementById('wg-va-grid');
  var vaTitle = document.getElementById('wg-va-title');
  var vaCount = document.getElementById('wg-va-count');
  if (!grid) return;

  if (vaTitle) vaTitle.textContent = titleEl ? titleEl.textContent.trim() : 'All Projects';
  if (vaCount) vaCount.textContent = ordered.length + ' item' + (ordered.length !== 1 ? 's' : '');

  grid.innerHTML = '';
  ordered.forEach(function(card) {
    var id = getCardId(card);
    var item = id ? workGalleryItems[id] : null;

    var thumbHtml;
    if (item && item.thumbnail) {
      thumbHtml = '<img src="' + item.thumbnail + '" alt="' + (item.title || '') + '">';
    } else if (item && item.src && item.type === 'video') {
      thumbHtml = '<video src="' + item.src + '" muted playsinline preload="metadata"></video>';
    } else if (item && item.src && item.type === 'image') {
      thumbHtml = '<img src="' + item.src + '" alt="' + (item.title || '') + '">';
    } else {
      var origThumb = card.querySelector('.wg-thumb');
      thumbHtml = origThumb ? origThumb.innerHTML : '<div style="background:#e8e8e8;width:100%;height:100%"></div>';
    }

    var isFeat = item && item.featured;
    var vaCard = document.createElement('div');
    vaCard.className = 'wg-va__card';
    vaCard.setAttribute('onclick', 'openWorkGalleryItem(\'' + id + '\');return false;');
    vaCard.innerHTML = '<div class="wg-va__thumb">' + thumbHtml + '</div>'
      + '<div class="wg-va__meta">'
      + '<div class="wg-va__name">' + (isFeat ? '<span class="wg-va__featured-dot"></span>' : '') + (item ? item.title : id || '') + '</div>'
      + '<div class="wg-va__tag">' + (item ? item.tag : '') + '</div>'
      + '</div>';
    grid.appendChild(vaCard);
  });

  var modal = document.getElementById('wg-viewall-modal');
  if (modal) { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
}

function closeViewAllModal() {
  var modal = document.getElementById('wg-viewall-modal');
  if (modal) modal.classList.remove('open');
  var pmOpen = document.getElementById('process-modal');
  if (!pmOpen || !pmOpen.classList.contains('open')) document.body.style.overflow = '';
}

/* Init view-all backdrop click */
document.addEventListener('DOMContentLoaded', function() {
  var bd = document.getElementById('wg-va-backdrop');
  if (bd) bd.addEventListener('click', closeViewAllModal);
});

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  // Mark first page button active
  const btns = document.querySelectorAll('.pg-btn');
  if (btns[0]) btns[0].classList.add('active');

  integrateAdminProjects();
  applySectionOrder();
  applyFeaturedLimitAll();
  initRkLoader();
  initRkCursor();
  initHeroV2();
  initReveal();
  initCounters();
  initNavScroll();
  initFilterTabs();
  initEnquiryToggle();
  initHamburgers();
  initVideoThumbs();
  initProcessModal();
  initAdminShortcut();
});

window.showPage = showPage;

/* ── ADMIN SHORTCUT (type "rkadmin") ── */
function initAdminShortcut() {
  var seq = '';
  var target = 'rkadmin';
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.altKey || e.metaKey) { seq = ''; return; }
    seq += e.key.toLowerCase();
    if (seq.length > target.length) seq = seq.slice(-target.length);
    if (seq === target) {
      seq = '';
      window.location.href = 'https://riteshkumaar.in/admin';
    }
  });
}
