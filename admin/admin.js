/* ══════════════════════════════════════════
   RITESH KUMAAR — ADMIN PANEL CORE JS
   Firebase Auth + Firestore + Storage
   ══════════════════════════════════════════ */

import { auth, db, storage }        from '../firebase-config.js';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {
  collection, doc,
  getDocs, getDoc,
  setDoc, updateDoc, deleteDoc,
  writeBatch
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
import {
  ref as sRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js';

/* ── COLLECTIONS ── */
const COLL = {
  projects:    'projects',
  media:       'media',
  settings:    'settings',
  caseStudies: 'case_studies'
};

/* ── AUTH ── */
const Auth = {
  currentUser: null,

  login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  },
  logout() {
    return signOut(auth).then(() => {
      const base = window.location.pathname.replace(/\/(?!.*\/).*$/, '/');
      window.location.href = base + 'index.html';
    });
  },
  isLoggedIn() { return !!auth.currentUser; },

  async updateCredentials(currentPassword, newEmail, newPassword) {
    const user = auth.currentUser;
    if (!user) throw new Error('Not logged in');
    const cred = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, cred);
    if (newEmail && newEmail !== user.email) await updateEmail(user, newEmail);
    if (newPassword) await updatePassword(user, newPassword);
  }
};

/* ── FIREBASE DATA LAYER ── */
const Firebase = {
  /* Projects */
  async getProjects() {
    try {
      const snap = await getDocs(collection(db, COLL.projects));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) { return []; }
  },
  async setProject(data) {
    const { id, ...rest } = data;
    await setDoc(doc(db, COLL.projects, id), rest);
  },
  async deleteProject(id) {
    await deleteDoc(doc(db, COLL.projects, id));
  },
  async bulkSetProjects(arr) {
    if (!arr.length) return;
    /* Firestore batch limit = 500 ops */
    for (let i = 0; i < arr.length; i += 400) {
      const batch = writeBatch(db);
      arr.slice(i, i + 400).forEach(p => {
        const { id, ...rest } = p;
        batch.set(doc(db, COLL.projects, id), rest);
      });
      await batch.commit();
    }
  },

  /* Case Studies */
  async getCaseStudies() {
    try {
      const snap = await getDocs(collection(db, COLL.caseStudies));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) { return []; }
  },
  async setCaseStudy(data) {
    const { id, ...rest } = data;
    await setDoc(doc(db, COLL.caseStudies, id), rest);
  },
  async deleteCaseStudy(id) {
    await deleteDoc(doc(db, COLL.caseStudies, id));
  },
  async bulkSetCaseStudies(arr) {
    if (!arr.length) return;
    const batch = writeBatch(db);
    arr.forEach(cs => {
      const { id, ...rest } = cs;
      batch.set(doc(db, COLL.caseStudies, id), rest);
    });
    await batch.commit();
  },

  /* Media */
  async getMedia() {
    try {
      const snap = await getDocs(collection(db, COLL.media));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) { return []; }
  },
  async setMedia(item) {
    const { id, ...rest } = item;
    await setDoc(doc(db, COLL.media, id), rest);
  },
  async deleteMedia(id, storagePath) {
    await deleteDoc(doc(db, COLL.media, id));
    if (storagePath) {
      try { await deleteObject(sRef(storage, storagePath)); } catch (e) { console.warn('Storage delete:', e.message); }
    }
  },

  /* Sync: list Firebase Storage → reconcile with Firestore media collection */
  async syncMediaFromStorage() {
    const mediaRef = sRef(storage, 'media');
    const result = await listAll(mediaRef);
    const existing = DB.getMedia();
    const existingPaths = new Set(existing.map(m => m.storagePath).filter(Boolean));
    let added = 0;
    for (const item of result.items) {
      if (existingPaths.has(item.fullPath)) continue;
      try {
        const url = await getDownloadURL(item);
        const name = item.name;
        const ext = name.split('.').pop().toLowerCase();
        const type = ['mp4','mov','webm','avi'].includes(ext) ? 'video'
          : ['gif'].includes(ext) ? 'gif' : 'image';
        const mediaItem = {
          id: 'sync_' + Date.now() + '_' + Math.random().toString(36).slice(2,7),
          name, type, src: url, storagePath: item.fullPath,
          size: 0, uploadedAt: new Date().toISOString().split('T')[0]
        };
        DB.addMedia(mediaItem);
        added++;
      } catch (e) { console.warn('Sync skip:', item.name, e.message); }
    }
    return added;
  },

  /* Settings */
  async getSettings() {
    try {
      const snap = await getDoc(doc(db, COLL.settings, 'main'));
      return snap.exists() ? snap.data() : null;
    } catch (e) { return null; }
  },
  async saveSettings(obj) {
    await setDoc(doc(db, COLL.settings, 'main'), obj);
  }
};

/* ── DB (localStorage cache + Firebase sync) ── */
const DB = {
  KEY_PROJECTS:     'rk_projects',
  KEY_MEDIA:        'rk_media',
  KEY_SETTINGS:     'rk_settings',
  KEY_CASE_STUDIES: 'rk_case_studies',

  /* Projects */
  getProjects() { return JSON.parse(localStorage.getItem(this.KEY_PROJECTS) || '[]'); },
  saveProjects(arr) {
    localStorage.setItem(this.KEY_PROJECTS, JSON.stringify(arr));
    Firebase.bulkSetProjects(arr).catch(e => console.warn('FB sync:', e));
  },
  getProject(id) { return this.getProjects().find(p => p.id === id) || null; },
  addProject(data) {
    const arr = this.getProjects();
    const now = new Date().toISOString().split('T')[0];
    data.id        = data.id        || 'proj-' + Date.now();
    data.slug      = data.slug      || slugify(data.title || 'project');
    data.createdAt = data.createdAt || now;
    data.updatedAt = now;
    arr.unshift(data);
    localStorage.setItem(this.KEY_PROJECTS, JSON.stringify(arr));
    Firebase.setProject(data).catch(e => console.warn('FB add:', e));
    return data;
  },
  updateProject(id, patch) {
    const arr = this.getProjects();
    const i = arr.findIndex(p => p.id === id);
    if (i < 0) return null;
    arr[i] = { ...arr[i], ...patch, updatedAt: new Date().toISOString().split('T')[0] };
    localStorage.setItem(this.KEY_PROJECTS, JSON.stringify(arr));
    Firebase.setProject(arr[i]).catch(e => console.warn('FB update:', e));
    return arr[i];
  },
  deleteProject(id) {
    localStorage.setItem(this.KEY_PROJECTS, JSON.stringify(this.getProjects().filter(p => p.id !== id)));
    Firebase.deleteProject(id).catch(e => console.warn('FB del:', e));
  },
  getPublishedProjects() { return this.getProjects().filter(p => p.status === 'published'); },

  /* Case Studies */
  getCaseStudies() { return JSON.parse(localStorage.getItem(this.KEY_CASE_STUDIES) || '[]'); },
  saveCaseStudies(arr) {
    localStorage.setItem(this.KEY_CASE_STUDIES, JSON.stringify(arr));
    Firebase.bulkSetCaseStudies(arr).catch(e => console.warn('FB cs sync:', e));
  },
  getCaseStudy(id) { return this.getCaseStudies().find(cs => cs.id === id) || null; },
  addCaseStudy(data) {
    const arr = this.getCaseStudies();
    const now = new Date().toISOString().split('T')[0];
    data.id        = data.id        || 'cs-' + Date.now();
    data.createdAt = data.createdAt || now;
    data.updatedAt = now;
    arr.unshift(data);
    localStorage.setItem(this.KEY_CASE_STUDIES, JSON.stringify(arr));
    Firebase.setCaseStudy(data).catch(e => console.warn('FB cs add:', e));
    return data;
  },
  updateCaseStudy(id, patch) {
    const arr = this.getCaseStudies();
    const i = arr.findIndex(cs => cs.id === id);
    if (i < 0) return null;
    arr[i] = { ...arr[i], ...patch, updatedAt: new Date().toISOString().split('T')[0] };
    localStorage.setItem(this.KEY_CASE_STUDIES, JSON.stringify(arr));
    Firebase.setCaseStudy(arr[i]).catch(e => console.warn('FB cs update:', e));
    return arr[i];
  },
  deleteCaseStudy(id) {
    localStorage.setItem(this.KEY_CASE_STUDIES, JSON.stringify(this.getCaseStudies().filter(cs => cs.id !== id)));
    Firebase.deleteCaseStudy(id).catch(e => console.warn('FB cs del:', e));
  },

  /* Media */
  getMedia() { return JSON.parse(localStorage.getItem(this.KEY_MEDIA) || '[]'); },
  saveMedia(arr) { localStorage.setItem(this.KEY_MEDIA, JSON.stringify(arr)); },
  addMedia(item) {
    const arr = this.getMedia();
    item.id = item.id || 'media-' + Date.now() + '-' + Math.random().toString(36).slice(2,6);
    arr.unshift(item);
    localStorage.setItem(this.KEY_MEDIA, JSON.stringify(arr));
    Firebase.setMedia(item).catch(e => console.warn('FB media add:', e));
    return item;
  },
  deleteMedia(id) {
    const item = this.getMediaItem(id);
    localStorage.setItem(this.KEY_MEDIA, JSON.stringify(this.getMedia().filter(m => m.id !== id)));
    Firebase.deleteMedia(id, item?.storagePath).catch(e => console.warn('FB media del:', e));
  },
  getMediaItem(id) { return this.getMedia().find(m => m.id === id) || null; },

  /* Settings */
  getSettings() {
    const defaults = {
      portfolioName: 'Ritesh Kumaar',
      categories:    ['Motion', 'Static', 'GIF', 'Logos', 'Case Study', 'Favourites'],
      defaultTools:  ['Adobe Illustrator', 'After Effects', 'Premiere Pro', 'Photoshop', 'Figma', 'ElevenLabs AI']
    };
    const stored = JSON.parse(localStorage.getItem(this.KEY_SETTINGS) || '{}');
    return Object.assign({}, defaults, stored);
  },
  saveSettings(obj) {
    localStorage.setItem(this.KEY_SETTINGS, JSON.stringify(obj));
    Firebase.saveSettings(obj).catch(e => console.warn('FB settings:', e));
  }
};

/* ── FIREBASE STORAGE UPLOAD ── */
async function uploadToStorage(file, progressCb) {
  const path  = `media/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const fileRef = sRef(storage, path);
  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(fileRef, file);
    task.on('state_changed',
      snap => { if (progressCb) progressCb(snap.bytesTransferred / snap.totalBytes); },
      reject,
      async () => {
        const url = await getDownloadURL(fileRef);
        resolve({ url, path });
      }
    );
  });
}

/* ── FILE READER HELPER ── */
function readFileAsDataURL(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload  = e => res(e.target.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
}

function getFileType(file) {
  if (file.type.startsWith('image/gif')) return 'gif';
  if (file.type.startsWith('image/'))   return 'image';
  if (file.type.startsWith('video/'))   return 'video';
  return 'other';
}

/* ── ALL PORTFOLIO ITEMS — single source of truth ── */
const PORTFOLIO_DEFAULTS = [
  {
    id:'wg-v1', title:'Product Launch Campaign Video', slug:'product-launch-campaign-video',
    category:'Motion', type:'Video', year:'2024', featured:true, status:'published',
    shortDescription:'Short-form B2B product launch video built for LinkedIn and YouTube Shorts.',
    description:'A motion-design video created to communicate software product value clearly and fast. Covers concept, storyboard, motion design, and final delivery.',
    thumbnail:null, finalOutput:{ type:'video', src:'../Video%201.mp4' },
    tools:['Adobe Illustrator','After Effects','Premiere Pro'],
    platform:['LinkedIn','YouTube Shorts'],
    role:'Concept, Visual Design, Motion Direction, Final Edit',
    tags:['motion','b2b','product launch'],
    createdAt:'2024-01-01', updatedAt:'2024-01-01',
    processSteps:[
      { step:1, title:'Concept Planning', description:'Define the core message and creative direction.', thinking:'I wanted the video to explain the product quickly without making the viewer read too much text.', decision:'Kept the message short, direct, and benefit-focused — one idea per scene.', tools:['Notes','Reference Collection'], challenge:'Simplifying complex product messaging without losing value.', outcome:'Clear creative brief and direction for the video structure.', media:null, caption:'Message architecture and content brief.' },
      { step:2, title:'Visual Structure', description:'Plan how each screen would appear in sequence.', thinking:'I broke the message into small visual moments so each frame could support one idea.', decision:'Used simple layouts with enough negative space for readability at speed.', tools:['Adobe Illustrator'], challenge:'Maintaining visual clarity across fast-cut scenes.', outcome:'A frame-by-frame visual structure for the full video.', media:null, caption:'Frame-by-frame sequence planning.' },
      { step:3, title:'Illustrator Frame Design', description:'Create the main design frames for every scene.', thinking:'I designed each frame as a separate artboard so the animation workflow would be clean later.', decision:'Used brand colors, precise icons, typographic hierarchy, and tight spacing.', tools:['Adobe Illustrator'], challenge:'Keeping consistency across all frames.', outcome:'Complete set of static frames ready for animation.', media:null, caption:'Static frame artboards built in Illustrator.' },
      { step:4, title:'Asset Preparation', description:'Organize design elements for independent animation.', thinking:'I separated icons, text blocks, backgrounds, and visual layers so each could move independently.', decision:'Named every layer logically and grouped related elements to keep the AE timeline clean.', tools:['Adobe Illustrator','After Effects'], challenge:'Maintaining clean layer structure across complex scenes.', outcome:'Animation-ready file with a clean, organised layer structure.', media:null, caption:'Layered assets organised for motion.' },
      { step:5, title:'Motion Build', description:'Bring the static frames to life with motion.', thinking:'I focused on smooth transitions and subtle text reveals to keep the message clear without visual noise.', decision:'Used ease-in-out curves and staggered reveals instead of heavy effects.', tools:['After Effects'], challenge:'Smooth pacing without distracting from the message.', outcome:'A polished motion sequence across all scenes.', media:null, caption:'After Effects — timeline, keyframes, and easing.' },
      { step:6, title:'Final Edit', description:'Refine the timing and prepare final platform exports.', thinking:'I adjusted pacing scene by scene so every message had enough time to land.', decision:'Added final cut transitions, sound level polish, and platform-specific export presets.', tools:['Premiere Pro'], challenge:'Balancing compression quality with platform file limits.', outcome:'Platform-ready export files for LinkedIn and YouTube Shorts.', media:null, caption:'Timing polish and export prep in Premiere Pro.' },
      { step:7, title:'Final Output', description:'Completed product launch campaign video ready for publishing.', thinking:'The final output should feel clean, professional, and instantly readable on mobile.', decision:'Delivered in a short-form format optimised for LinkedIn and YouTube Shorts.', tools:['Premiere Pro'], challenge:'Ensuring quality across both platform specs.', outcome:'Completed product launch campaign video — published and live on both platforms.', media:{ type:'video', src:'../Video%201.mp4' }, caption:'Completed product launch campaign video.', isFinal:true }
    ]
  },
  {
    id:'wg-v2', title:'Social Media Reel', slug:'social-media-reel',
    category:'Motion', type:'Video', year:'2024', featured:false, status:'published',
    shortDescription:'High-energy vertical reel optimised for Instagram Reels and LinkedIn.',
    description:'Social reel crafted for maximum scroll-stop performance. Vertical-first format with kinetic typography and bold transitions.',
    thumbnail:null, finalOutput:{ type:'video', src:'../video%202.mp4' },
    tools:['After Effects','Premiere Pro'], platform:['Instagram Reels','LinkedIn'],
    role:'Motion Design, Edit', tags:['reel','social','vertical'],
    createdAt:'2024-02-01', updatedAt:'2024-02-01',
    processSteps:[
      { step:1, title:'Format & Concept', description:'Define the reel format and nail the first-frame hook.', thinking:'Vertical content needs to earn attention in the first 0.5 seconds — the hook is everything.', decision:'Led with bold kinetic typography and a single clear benefit statement per scene.', tools:['Notes','Reference Collection'], challenge:'Creating scroll-stop impact in under half a second.', outcome:'Clear vertical-first content structure with a strong opening hook.', media:null, caption:'Vertical-first content brief.' },
      { step:2, title:'Motion Build', description:'Build the motion sequence with kinetic text and sharp transitions.', thinking:'Each transition needed energy without distracting from the message.', decision:'Used snap-cuts with text-reveal timing matched to beat points.', tools:['After Effects'], challenge:'Balancing energy with message clarity.', outcome:'A high-energy motion reel ready for final edit.', media:null, caption:'Kinetic typography and bold transitions.' },
      { step:3, title:'Final Output', description:'Export at platform-correct specs and deliver.', thinking:'Instagram Reels and LinkedIn each have different optimal dimensions and file limits.', decision:'Delivered at 9:16 for Reels and 1:1 square crop for LinkedIn native video.', tools:['Premiere Pro'], challenge:'Dual format delivery without quality loss.', outcome:'Final reel published across both platforms with format-specific exports.', media:{ type:'video', src:'../video%202.mp4' }, caption:'Completed social reel — live on Instagram and LinkedIn.', isFinal:true }
    ]
  },
  {
    id:'wg-v3', title:'Brand Explainer', slug:'brand-explainer',
    category:'Motion', type:'Video', year:'2023', featured:false, status:'published',
    shortDescription:'Brand explainer video distilling complex product messaging into a compelling narrative.',
    description:'Brand explainer built to educate and convert cold traffic on landing pages and email campaigns.',
    thumbnail:null, finalOutput:{ type:'video', src:'../image2.mp4' },
    tools:['After Effects','Adobe Illustrator','ElevenLabs AI'], platform:['Landing Page','Email'],
    role:'Concept, Visual Design, Motion, Voiceover Direction', tags:['explainer','brand','motion'],
    createdAt:'2023-06-01', updatedAt:'2023-06-01',
    processSteps:[
      { step:1, title:'Script & Storyboard', description:'Write the explainer script and plan the visual storyboard.', thinking:'Complex B2B product messaging had to be distilled into simple, sequential ideas without losing nuance.', decision:'Used a problem → solution → benefit structure to guide the viewer logically through the product story.', tools:['Notes','ElevenLabs AI'], challenge:'Distilling complex product features into digestible moments.', outcome:'Approved script with AI-assisted voiceover and a full visual storyboard.', media:null, caption:'Message architecture for a complex product.' },
      { step:2, title:'Frame Design & Motion', description:'Design all frames and animate the full explainer with voiceover sync.', thinking:'Each visual moment had to match the voiceover timing exactly for the narrative to feel seamless.', decision:'Built animations keyframe-by-keyframe with AI voiceover as the timing guide.', tools:['Adobe Illustrator','After Effects'], challenge:'Precise voiceover sync across every scene.', outcome:'Fully animated explainer with precise voiceover sync.', media:null, caption:'Illustrator artboards animated in After Effects.' },
      { step:3, title:'Final Output', description:'Deliver the final explainer optimised for web and email.', thinking:'Landing page videos need fast load — exported with H.264 compression at optimal bitrate.', decision:'Delivered as MP4 with two cuts: full-length for landing page, shorter version for email.', tools:['After Effects','Premiere Pro'], challenge:'Compression quality vs. fast-loading file size.', outcome:'Completed brand explainer, deployed across landing page and email sequences.', media:{ type:'video', src:'../image2.mp4' }, caption:'Completed brand explainer — deployed on landing page.', isFinal:true }
    ]
  },
  {
    id:'wg-s1', title:'Campaign Post', slug:'campaign-post',
    category:'Static', type:'Image', year:'2024', featured:false, status:'published',
    shortDescription:'High-impact static social post designed for Instagram feed.',
    description:'Static campaign post designed for maximum feed impact. Part of a broader B2B campaign system.',
    thumbnail:null, finalOutput:{ type:'image', src:'../image1.jpg' },
    tools:['Adobe Illustrator','Photoshop'], platform:['Instagram','LinkedIn'],
    role:'Art Direction, Visual Design', tags:['social','static','b2b'],
    createdAt:'2024-03-01', updatedAt:'2024-03-01',
    processSteps:[
      { step:1, title:'Art Direction', description:'Define the visual language and composition for maximum feed impact.', thinking:'The post needed to stop the scroll and communicate the message in under two seconds.', decision:'High contrast, bold typography, single focal element — nothing competing for attention.', tools:['Notes','Reference Collection'], challenge:'Communicating the full message in one glance.', outcome:'Clear visual direction and a rough layout sketch.', media:null, caption:'Visual language and composition planning.' },
      { step:2, title:'Design Execution', description:'Build the final static post design with precise craft.', thinking:'Every element serves the message — nothing decorative without purpose.', decision:'Used brand color palette, strict grid system, and tight typographic hierarchy.', tools:['Adobe Illustrator','Photoshop'], challenge:'Balancing visual impact with message clarity.', outcome:'Final campaign post artwork ready for export.', media:null, caption:'Illustrator artboard — final static design.' },
      { step:3, title:'Final Output', description:'Export at platform-correct dimensions and deliver.', thinking:'Instagram feed and LinkedIn each require different crops and file formats.', decision:'Exported as multiple asset sizes to cover both platform requirements.', tools:['Adobe Illustrator'], challenge:'Consistent visual quality across multiple crop sizes.', outcome:'Completed campaign post, published across Instagram and LinkedIn.', media:{ type:'image', src:'../image1.jpg' }, caption:'Completed campaign post.', isFinal:true }
    ]
  },
  {
    id:'wg-s2', title:'B2B Campaign', slug:'b2b-campaign',
    category:'Static', type:'Image', year:'2024', featured:false, status:'draft',
    shortDescription:'LinkedIn B2B campaign visual for lead generation in the SaaS space.',
    description:'LinkedIn B2B campaign visual designed for lead generation in the SaaS space. Focused on clean hierarchy and direct CTAs.',
    thumbnail:null, finalOutput:null,
    tools:['Adobe Illustrator','Figma'], platform:['LinkedIn'],
    role:'Art Direction, Visual Design', tags:['b2b','linkedin','static'],
    createdAt:'2024-04-01', updatedAt:'2024-04-01', processSteps:[]
  },
  {
    id:'wg-s3', title:'Product Feature Post', slug:'product-feature-post',
    category:'Static', type:'Image', year:'2024', featured:false, status:'draft',
    shortDescription:'Product feature highlight post for Instagram feed engagement.',
    description:'Product feature highlight post designed to showcase a single capability clearly. Optimised for Instagram feed engagement.',
    thumbnail:null, finalOutput:null,
    tools:['Adobe Illustrator','Photoshop'], platform:['Instagram'],
    role:'Art Direction, Visual Design', tags:['product','instagram','static'],
    createdAt:'2024-04-01', updatedAt:'2024-04-01', processSteps:[]
  },
  {
    id:'wg-s4', title:'Promotional Post', slug:'promotional-post',
    category:'Static', type:'Image', year:'2024', featured:false, status:'draft',
    shortDescription:'Promotional campaign visual for Twitter/X with high-contrast design.',
    description:'Promotional campaign visual for Twitter/X with high-contrast design built for fast consumption.',
    thumbnail:null, finalOutput:null,
    tools:['Adobe Illustrator'], platform:['Twitter/X'],
    role:'Visual Design', tags:['promotional','twitter','static'],
    createdAt:'2024-04-01', updatedAt:'2024-04-01', processSteps:[]
  },
  {
    id:'wg-g1', title:'Campaign Animation GIF', slug:'campaign-animation-gif',
    category:'GIF', type:'GIF', year:'2024', featured:false, status:'draft',
    shortDescription:'Looping GIF animation for email newsletters and social feeds.',
    description:'Looping GIF animation built for campaign use — designed to work seamlessly in email newsletters and social feeds.',
    thumbnail:null, finalOutput:null,
    tools:['After Effects','Photoshop'], platform:['Email','Social'],
    role:'Motion Design', tags:['gif','animation','email'],
    createdAt:'2024-05-01', updatedAt:'2024-05-01', processSteps:[]
  },
  {
    id:'wg-g2', title:'Feature Highlight GIF', slug:'feature-highlight-gif',
    category:'GIF', type:'GIF', year:'2024', featured:false, status:'draft',
    shortDescription:'Product feature highlight GIF for onboarding emails and social announcements.',
    description:'Product feature highlight GIF capturing key interactions in a clean loopable format.',
    thumbnail:null, finalOutput:null,
    tools:['After Effects','Photoshop'], platform:['Email','LinkedIn'],
    role:'Motion Design', tags:['gif','product','email'],
    createdAt:'2024-05-01', updatedAt:'2024-05-01', processSteps:[]
  },
  {
    id:'wg-g3', title:'Social Asset GIF', slug:'social-asset-gif',
    category:'GIF', type:'GIF', year:'2024', featured:false, status:'draft',
    shortDescription:'Animated social media asset optimised for attention retention in the feed.',
    description:'Animated social media asset optimised for attention retention in the feed.',
    thumbnail:null, finalOutput:null,
    tools:['After Effects'], platform:['Instagram','Twitter/X'],
    role:'Motion Design', tags:['gif','social','animation'],
    createdAt:'2024-05-01', updatedAt:'2024-05-01', processSteps:[]
  },
  {
    id:'wg-l1', title:'Brand Identity System', slug:'brand-identity-system',
    category:'Logos', type:'Image', year:'2024', featured:false, status:'draft',
    shortDescription:'Complete brand identity system — logo, palette, typography, and usage guidelines.',
    description:'Complete brand identity system including primary logo, color palette, typography system, and usage guidelines — built for digital and print.',
    thumbnail:null, finalOutput:null,
    tools:['Adobe Illustrator','Figma'], platform:['Digital','Print'],
    role:'Brand Design, Art Direction', tags:['branding','logo','identity'],
    createdAt:'2024-06-01', updatedAt:'2024-06-01', processSteps:[]
  },
  {
    id:'wg-l2', title:'Brand System', slug:'brand-system',
    category:'Logos', type:'Image', year:'2024', featured:false, status:'draft',
    shortDescription:'Scalable brand system — logo variations, secondary marks, icon set, and brand patterns.',
    description:'Scalable brand system covering logo variations, secondary marks, icon set, and brand pattern applications. Built for a B2B SaaS product.',
    thumbnail:null, finalOutput:null,
    tools:['Adobe Illustrator','Figma'], platform:['Digital','Marketing'],
    role:'Brand Design', tags:['branding','saas','logo'],
    createdAt:'2024-06-01', updatedAt:'2024-06-01', processSteps:[]
  },
  {
    id:'wg-l3', title:'Visual Identity', slug:'visual-identity',
    category:'Logos', type:'Image', year:'2024', featured:false, status:'draft',
    shortDescription:'Visual identity system — logo, iconography, color strategy, and campaign visual language.',
    description:'Visual identity system developed for a tech brand — covering logo, iconography, color strategy, and campaign visual language.',
    thumbnail:null, finalOutput:null,
    tools:['Adobe Illustrator','Photoshop','Figma'], platform:['Digital','Social'],
    role:'Brand Design, Visual Strategy', tags:['identity','tech','visual'],
    createdAt:'2024-06-01', updatedAt:'2024-06-01', processSteps:[]
  },
  {
    id:'wg-l4', title:'Logo Mark Design', slug:'logo-mark-design',
    category:'Logos', type:'Image', year:'2024', featured:false, status:'draft',
    shortDescription:'Custom logo mark with grid construction, weight variations, and usage rules.',
    description:'Custom logo mark with detailed grid construction, weight variations, and usage rules for light and dark contexts.',
    thumbnail:null, finalOutput:null,
    tools:['Adobe Illustrator'], platform:['Brand Identity'],
    role:'Logo Design', tags:['logo','mark','branding'],
    createdAt:'2024-06-01', updatedAt:'2024-06-01', processSteps:[]
  }
];

/* ── SEED IF EMPTY (add missing defaults, preserve edits) ── */
function seedIfEmpty() {
  var existing = DB.getProjects();
  var existingIds = {};
  existing.forEach(function(p) { existingIds[p.id] = true; });
  var missing = PORTFOLIO_DEFAULTS.filter(function(d) { return !existingIds[d.id]; });
  var needsSave = missing.length > 0;

  existing = existing.map(function(p) {
    var patched = (p.platform || []).map(function(pl) {
      if (pl === 'Twitter / X' || pl === 'Twitter') return 'Twitter/X';
      return pl;
    });
    if (patched.join() !== (p.platform || []).join()) {
      needsSave = true;
      return Object.assign({}, p, { platform: patched });
    }
    return p;
  });

  if (!needsSave) return;
  /* Use raw localStorage to avoid Firebase batch on seed (handled separately) */
  localStorage.setItem(DB.KEY_PROJECTS, JSON.stringify(existing.concat(missing)));
}

/* ── FIREBASE SYNC ON LOGIN ── */
async function syncFromFirebase() {
  try {
    const [fbProjects, fbMedia, fbSettings, fbCS] = await Promise.all([
      Firebase.getProjects(),
      Firebase.getMedia(),
      Firebase.getSettings(),
      Firebase.getCaseStudies()
    ]);

    if (fbProjects.length > 0) {
      localStorage.setItem(DB.KEY_PROJECTS, JSON.stringify(fbProjects));
    } else {
      /* First run: seed defaults, then push to Firebase */
      seedIfEmpty();
      const seeded = DB.getProjects();
      Firebase.bulkSetProjects(seeded).catch(() => {});
    }

    if (fbMedia.length > 0) {
      localStorage.setItem(DB.KEY_MEDIA, JSON.stringify(fbMedia));
    }

    if (fbSettings) {
      localStorage.setItem(DB.KEY_SETTINGS, JSON.stringify(fbSettings));
    }

    if (fbCS.length > 0) {
      localStorage.setItem(DB.KEY_CASE_STUDIES, JSON.stringify(fbCS));
    }
  } catch (e) {
    console.warn('Firebase sync failed, using cache:', e);
    seedIfEmpty();
  }
}

/* ── UI HELPERS ── */
function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 3200);
}

function showConfirm(msg, onYes) {
  let overlay = document.getElementById('confirm-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'confirm-overlay';
    overlay.className = 'dialog-overlay';
    overlay.innerHTML = `
      <div class="dialog">
        <div class="dialog-header"><span class="dialog-title">Confirm</span></div>
        <div class="dialog-body"><p id="confirm-msg" style="font-size:14px;color:var(--a-text)"></p></div>
        <div class="dialog-footer">
          <button id="confirm-no" class="btn btn-secondary">Cancel</button>
          <button id="confirm-yes" class="btn btn-danger">Delete</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    document.getElementById('confirm-no').onclick = () => overlay.classList.remove('open');
  }
  document.getElementById('confirm-msg').textContent = msg;
  overlay.classList.add('open');
  document.getElementById('confirm-yes').onclick = () => { overlay.classList.remove('open'); onYes(); };
}

function slugify(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { day:'numeric', month:'short', year:'numeric' });
}

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes/1024).toFixed(1) + ' KB';
  return (bytes/1048576).toFixed(1) + ' MB';
}

function categoryIcon(cat) {
  const map = { Motion:'🎬', Video:'🎬', Static:'🖼', Image:'🖼', GIF:'🎞', Logos:'✏', 'Case Study':'📋', Favourites:'⭐' };
  return map[cat] || '📁';
}

/* ── SIDEBAR ── */
function initSidebar() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar__link').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });
  const ham = document.getElementById('sidebar-toggle');
  const sb  = document.querySelector('.sidebar');
  if (ham && sb) ham.onclick = () => sb.classList.toggle('mobile-open');
  const user = auth.currentUser;
  if (user) {
    const el = document.getElementById('sidebar-email');
    if (el) el.textContent = user.email;
  }
}

/* ── TAGS INPUT WIDGET ── */
function initTagsInput(containerId, hiddenId) {
  const container = document.getElementById(containerId);
  const hidden    = document.getElementById(hiddenId);
  if (!container || !hidden) return;
  let tags = hidden.value ? JSON.parse(hidden.value) : [];

  function render() {
    container.querySelectorAll('.tag-chip').forEach(c => c.remove());
    const inp = container.querySelector('.tags-input-field');
    tags.forEach(tag => {
      const chip = document.createElement('span');
      chip.className = 'tag-chip';
      chip.innerHTML = `${tag}<button class="tag-chip-remove" data-tag="${tag}">×</button>`;
      container.insertBefore(chip, inp);
    });
    hidden.value = JSON.stringify(tags);
  }

  container.addEventListener('click', e => {
    if (e.target.classList.contains('tag-chip-remove')) {
      tags = tags.filter(t => t !== e.target.dataset.tag);
      render();
    } else {
      container.querySelector('.tags-input-field').focus();
    }
  });

  container.querySelector('.tags-input-field').addEventListener('keydown', e => {
    const val = e.target.value.trim();
    if ((e.key === 'Enter' || e.key === ',') && val) {
      e.preventDefault();
      if (!tags.includes(val)) { tags.push(val); render(); }
      e.target.value = '';
    }
    if (e.key === 'Backspace' && !e.target.value && tags.length) {
      tags.pop(); render();
    }
  });

  render();
}

/* ── CHECK-GROUP WIDGET ── */
function initCheckGroup(groupId, hiddenId) {
  const group  = document.getElementById(groupId);
  const hidden = document.getElementById(hiddenId);
  if (!group || !hidden) return;
  let selected = hidden.value ? JSON.parse(hidden.value) : [];

  group.querySelectorAll('.check-option').forEach(opt => {
    const val = opt.dataset.value;
    if (selected.includes(val)) opt.classList.add('selected');
    opt.addEventListener('click', () => {
      if (selected.includes(val)) {
        selected = selected.filter(v => v !== val);
        opt.classList.remove('selected');
      } else {
        selected.push(val);
        opt.classList.add('selected');
      }
      hidden.value = JSON.stringify(selected);
    });
  });
}

/* ── DROPZONE (generic) ── */
function initDropzone(dropId, onFiles) {
  const zone = document.getElementById(dropId);
  if (!zone) return;
  ['dragenter','dragover'].forEach(ev => zone.addEventListener(ev, e => { e.preventDefault(); zone.classList.add('dragover'); }));
  ['dragleave','drop'].forEach(ev => zone.addEventListener(ev, e => { e.preventDefault(); zone.classList.remove('dragover'); }));
  zone.addEventListener('drop', e => onFiles([...e.dataTransfer.files]));
  const inp = zone.querySelector('input[type=file]');
  if (inp) inp.addEventListener('change', () => onFiles([...inp.files]));
}

/* ── PROCESS STEP BUILDER ── */
let stepCounter = 0;

function createStepCard(data = {}) {
  stepCounter++;
  const idx = stepCounter;
  const id  = 'step-' + idx;

  const card = document.createElement('div');
  card.className = 'step-card open';
  card.dataset.stepId = id;
  card.draggable = true;

  card.innerHTML = `
    <div class="step-card__header" onclick="toggleStep('${id}')">
      <span class="step-card__drag" title="Drag to reorder">⠿</span>
      <div class="step-card__num">${idx}</div>
      <span class="step-card__title">${data.title || 'Step ' + idx}</span>
      <span class="step-card__toggle" style="margin-left:auto">▾</span>
      <button type="button" class="btn btn-sm btn-ghost btn-icon" onclick="removeStep(event,'${id}')" title="Remove step">🗑</button>
    </div>
    <div class="step-card__body" id="body-${id}">
      <div class="form-grid form-grid--2" style="margin-bottom:14px">
        <div class="form-group" style="margin:0">
          <label class="form-label">Step Title <span>*</span></label>
          <input type="text" class="form-control step-title" placeholder="e.g. Concept Planning" value="${data.title || ''}">
        </div>
        <div class="form-group" style="margin:0">
          <label class="form-label">Tools Used in this Step</label>
          <input type="text" class="form-control step-tools" placeholder="After Effects, Illustrator" value="${(data.tools||[]).join(', ')}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Step Description / Objective</label>
        <textarea class="form-control step-description" rows="2" placeholder="What is this step about?">${data.description || ''}</textarea>
      </div>
      <div class="form-grid form-grid--2">
        <div class="form-group">
          <label class="form-label">Thinking Process</label>
          <textarea class="form-control step-thinking" rows="2" placeholder="What were you thinking?">${data.thinking || ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Design Decision</label>
          <textarea class="form-control step-decision" rows="2" placeholder="What did you decide and why?">${data.decision || ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Challenge Solved</label>
          <input type="text" class="form-control step-challenge" placeholder="Key problem overcome" value="${data.challenge || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Step Outcome</label>
          <input type="text" class="form-control step-outcome" placeholder="Result of this step" value="${data.outcome || ''}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Caption</label>
        <input type="text" class="form-control step-caption" placeholder="Short caption for the frame image" value="${data.caption || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Step Media (image or video)</label>
        <div class="dropzone step-dropzone" id="dropzone-${id}" style="padding:20px">
          <input type="file" accept="image/*,video/*">
          <div class="dropzone__icon">🖼</div>
          <div class="dropzone__label">Drop or <span>browse</span></div>
          <div class="dropzone__hint">JPG, PNG, WebP, MP4 — max 50 MB</div>
        </div>
        <div class="step-media-preview" id="preview-${id}"></div>
        <input type="hidden" class="step-media-data" value="${data.media ? JSON.stringify(data.media) : ''}">
      </div>
      <div class="toggle-row">
        <div class="toggle-info">
          <div class="toggle-label">Mark as Final Output</div>
          <div class="toggle-desc">This step shows the completed deliverable</div>
        </div>
        <label class="toggle">
          <input type="checkbox" class="step-is-final" ${data.isFinal ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>`;

  setTimeout(() => {
    const dz        = card.querySelector('.step-dropzone');
    const inp       = dz.querySelector('input[type=file]');
    const previewEl = card.querySelector('.step-media-preview');
    const hiddenData = card.querySelector('.step-media-data');

    async function handleFiles(files) {
      const file = files[0];
      if (!file) return;
      if (file.size > 50 * 1024 * 1024) { toast('File exceeds 50 MB', 'error'); return; }
      dz.querySelector('.dropzone__label').textContent = 'Uploading…';
      try {
        const { url, path } = await uploadToStorage(file, pct => {
          dz.querySelector('.dropzone__label').textContent = `Uploading ${Math.round(pct * 100)}%…`;
        });
        const type = getFileType(file);
        hiddenData.value = JSON.stringify({ type, src: url, name: file.name, size: file.size, storagePath: path });
        renderStepPreview(previewEl, url, type);
      } catch (e) {
        toast('Upload failed: ' + e.message, 'error');
      }
      dz.querySelector('.dropzone__label').innerHTML = 'Drop or <span>browse</span>';
    }

    ['dragenter','dragover'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add('dragover'); }));
    ['dragleave','drop'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove('dragover'); }));
    dz.addEventListener('drop', e => handleFiles([...e.dataTransfer.files]));
    inp.addEventListener('change', () => handleFiles([...inp.files]));

    if (data.media && data.media.src) {
      renderStepPreview(previewEl, data.media.src, data.media.type || 'image');
    }
  }, 0);

  card.querySelector('.step-title').addEventListener('input', function() {
    card.querySelector('.step-card__title').textContent = this.value || ('Step ' + idx);
  });

  card.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', id); card.style.opacity = '0.5'; });
  card.addEventListener('dragend', () => { card.style.opacity = '1'; });
  card.addEventListener('dragover', e => { e.preventDefault(); });
  card.addEventListener('drop', e => {
    e.preventDefault();
    const fromId = e.dataTransfer.getData('text/plain');
    const fromCard = document.querySelector(`[data-step-id="${fromId}"]`);
    const list = card.parentElement;
    if (fromCard && fromCard !== card) list.insertBefore(fromCard, card);
    renumberSteps();
  });

  return card;
}

function renderStepPreview(container, src, type) {
  container.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'media-preview-item';
  wrap.style.cssText = 'height:80px;width:120px;margin-top:8px';
  if (type === 'video') {
    wrap.innerHTML = `<video src="${src}" style="width:100%;height:100%;object-fit:cover"></video>`;
  } else {
    wrap.innerHTML = `<img src="${src}" alt="" style="width:100%;height:100%;object-fit:cover">`;
  }
  const rm = document.createElement('button');
  rm.className = 'media-preview-remove';
  rm.textContent = '×';
  rm.onclick = () => { container.innerHTML = ''; container.closest('.form-group').querySelector('.step-media-data').value = ''; };
  wrap.appendChild(rm);
  container.appendChild(wrap);
}

function toggleStep(id) {
  const card = document.querySelector(`[data-step-id="${id}"]`);
  if (card) card.classList.toggle('open');
}

function removeStep(e, id) {
  e.stopPropagation();
  const card = document.querySelector(`[data-step-id="${id}"]`);
  if (card) { card.remove(); renumberSteps(); }
}

function renumberSteps() {
  document.querySelectorAll('.step-card').forEach((card, i) => {
    card.querySelector('.step-card__num').textContent = i + 1;
  });
}

function addStep(data = {}) {
  const list = document.getElementById('step-list');
  if (!list) return;
  list.appendChild(createStepCard(data));
}

function collectSteps() {
  return [...document.querySelectorAll('.step-card')].map((card, i) => ({
    step:        i + 1,
    title:       card.querySelector('.step-title')?.value?.trim() || '',
    description: card.querySelector('.step-description')?.value?.trim() || '',
    thinking:    card.querySelector('.step-thinking')?.value?.trim() || '',
    decision:    card.querySelector('.step-decision')?.value?.trim() || '',
    challenge:   card.querySelector('.step-challenge')?.value?.trim() || '',
    outcome:     card.querySelector('.step-outcome')?.value?.trim() || '',
    tools:       (card.querySelector('.step-tools')?.value || '').split(',').map(t=>t.trim()).filter(Boolean),
    caption:     card.querySelector('.step-caption')?.value?.trim() || '',
    media:       (() => { try { return JSON.parse(card.querySelector('.step-media-data')?.value || ''); } catch { return null; } })(),
    isFinal:     card.querySelector('.step-is-final')?.checked || false,
    frame:       'concept'
  }));
}

/* ── SINGLE MEDIA UPLOAD (thumbnail / final output) — Firebase Storage ── */
function initSingleMediaUpload(dropId, previewId, hiddenId, accept) {
  const dz      = document.getElementById(dropId);
  const preview = document.getElementById(previewId);
  const hidden  = document.getElementById(hiddenId);
  if (!dz || !preview || !hidden) return;

  async function handleFiles(files) {
    const file = files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { toast('File exceeds 50 MB', 'error'); return; }

    const labelEl = dz.querySelector('.dropzone__label');
    if (labelEl) labelEl.textContent = 'Uploading…';
    try {
      const { url, path } = await uploadToStorage(file, pct => {
        if (labelEl) labelEl.textContent = `Uploading ${Math.round(pct * 100)}%…`;
      });
      const type = getFileType(file);
      hidden.value = JSON.stringify({ type, src: url, name: file.name, size: file.size, storagePath: path });
      renderSinglePreview(preview, url, type, () => {
        hidden.value = '';
        preview.innerHTML = `<div class="media-thumb-placeholder"><span style="font-size:28px;opacity:.3">📁</span><span>No file selected</span></div>`;
      });
      DB.addMedia({ name: file.name, type, size: file.size, src: url, storagePath: path, uploadedAt: new Date().toISOString().split('T')[0] });
    } catch (e) {
      toast('Upload failed: ' + e.message, 'error');
    }
    if (labelEl) labelEl.innerHTML = 'Drop or <span>browse</span>';
  }

  ['dragenter','dragover'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add('dragover'); }));
  ['dragleave','drop'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove('dragover'); }));
  dz.addEventListener('drop', e => handleFiles([...e.dataTransfer.files]));
  const inp = dz.querySelector('input[type=file]');
  if (inp) inp.addEventListener('change', () => handleFiles([...inp.files]));

  if (hidden.value) {
    try {
      const d = JSON.parse(hidden.value);
      if (d.src) renderSinglePreview(preview, d.src, d.type, () => {
        hidden.value = '';
        preview.innerHTML = `<div class="media-thumb-placeholder"><span style="font-size:28px;opacity:.3">📁</span><span>No file selected</span></div>`;
      });
    } catch {}
  }
}

function renderSinglePreview(container, src, type, onRemove) {
  container.innerHTML = '';
  const el = type === 'video'
    ? Object.assign(document.createElement('video'), { src, controls: true })
    : Object.assign(document.createElement('img'), { src, alt: 'Preview' });
  el.style.cssText = 'width:100%;height:100%;object-fit:cover';
  const rm = document.createElement('button');
  rm.className = 'media-thumb-remove';
  rm.innerHTML = '×';
  rm.onclick = onRemove;
  container.appendChild(el);
  container.appendChild(rm);
}

/* ── COLLECT PROJECT FORM DATA ── */
function collectProjectForm() {
  const get = id => (document.getElementById(id) || {}).value || '';
  const getChecked = id => (document.getElementById(id) || {}).checked || false;
  const parseJSON = v => { try { return JSON.parse(v); } catch { return v || null; } };

  return {
    title:            get('field-title').trim(),
    shortDescription: get('field-short-desc').trim(),
    description:      get('field-description').trim(),
    category:         get('field-category'),
    type:             get('field-type'),
    year:             get('field-year'),
    clientName:       get('field-client').trim(),
    role:             get('field-role').trim(),
    tools:            parseJSON(get('hidden-tools')) || [],
    platform:         parseJSON(get('hidden-platform')) || [],
    tags:             parseJSON(get('hidden-tags')) || [],
    featured:         getChecked('field-featured'),
    status:           getChecked('field-published') ? 'published' : 'draft',
    thumbnail:        parseJSON(get('hidden-thumbnail')),
    finalOutput:      parseJSON(get('hidden-final-output')),
    processSteps:     collectSteps()
  };
}

/* ── POPULATE EDIT FORM ── */
function populateProjectForm(p) {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  set('field-title',       p.title);
  set('field-short-desc',  p.shortDescription);
  set('field-description', p.description);
  set('field-category',    p.category);
  set('field-type',        p.type);
  set('field-year',        p.year);
  set('field-client',      p.clientName);
  set('field-role',        p.role);

  const ft = document.getElementById('field-featured');
  if (ft) ft.checked = p.featured;
  const fp = document.getElementById('field-published');
  if (fp) fp.checked = p.status === 'published';

  const setHidden = (id, val) => { const el = document.getElementById(id); if (el) el.value = JSON.stringify(val || []); };
  setHidden('hidden-tools', p.tools || []);
  setHidden('hidden-platform', p.platform || []);
  setHidden('hidden-tags', p.tags || []);

  if (p.thumbnail) {
    const el = document.getElementById('hidden-thumbnail');
    if (el) el.value = JSON.stringify(p.thumbnail);
    const prev = document.getElementById('thumb-preview');
    if (prev && p.thumbnail.src) renderSinglePreview(prev, p.thumbnail.src, p.thumbnail.type || 'image', () => { el.value=''; prev.innerHTML='<div class="media-thumb-placeholder"><span style="font-size:28px;opacity:.3">📁</span><span>No file selected</span></div>'; });
  }
  if (p.finalOutput) {
    const el = document.getElementById('hidden-final-output');
    if (el) el.value = JSON.stringify(p.finalOutput);
    const prev = document.getElementById('output-preview');
    if (prev && p.finalOutput.src) renderSinglePreview(prev, p.finalOutput.src, p.finalOutput.type || 'video', () => { el.value=''; prev.innerHTML='<div class="media-thumb-placeholder"><span style="font-size:28px;opacity:.3">📁</span><span>No file</span></div>'; });
  }

  setTimeout(() => {
    initCheckGroup('group-tools', 'hidden-tools');
    initCheckGroup('group-platform', 'hidden-platform');
    initTagsInput('tags-container', 'hidden-tags');

    const list = document.getElementById('step-list');
    if (list && p.processSteps) {
      list.innerHTML = '';
      stepCounter = 0;
      p.processSteps.forEach(s => addStep(s));
    }
  }, 0);
}

/* ── PORTFOLIO DATA EXPORT ── */
function getPortfolioData() {
  return DB.getPublishedProjects().map(p => ({
    id:           p.id,
    title:        p.title,
    tag:          `${p.category} · ${p.year}`,
    category:     p.category.toLowerCase(),
    type:         (p.type || '').toLowerCase(),
    src:          p.finalOutput?.src || null,
    desc:         p.shortDescription || p.description,
    tools:        (p.tools || []).join(' · '),
    platform:     (p.platform || []).join(' · '),
    thumbnail:    p.thumbnail?.src || null,
    featured:     p.featured,
    processSteps: p.processSteps || []
  }));
}

/* ── initAdminPage — called by pages that haven't migrated yet ── */
function initAdminPage() {
  initSidebar();
}

/* ── EXPOSE ALL GLOBALS ── */
window.Auth           = Auth;
window.DB             = DB;
window.Firebase       = Firebase;
window.toast          = toast;
window.showConfirm    = showConfirm;
window.slugify        = slugify;
window.formatDate     = formatDate;
window.formatSize     = formatSize;
window.categoryIcon   = categoryIcon;
window.initSidebar    = initSidebar;
window.initTagsInput  = initTagsInput;
window.initCheckGroup = initCheckGroup;
window.initDropzone   = initDropzone;
window.addStep        = addStep;
window.removeStep     = removeStep;
window.toggleStep     = toggleStep;
window.renumberSteps  = renumberSteps;
window.collectSteps   = collectSteps;
window.createStepCard = createStepCard;
window.renderStepPreview      = renderStepPreview;
window.initSingleMediaUpload  = initSingleMediaUpload;
window.renderSinglePreview    = renderSinglePreview;
window.collectProjectForm     = collectProjectForm;
window.populateProjectForm    = populateProjectForm;
window.getPortfolioData       = getPortfolioData;
window.initAdminPage          = initAdminPage;
window.readFileAsDataURL      = readFileAsDataURL;
window.getFileType            = getFileType;
window.uploadToStorage        = uploadToStorage;

/* ── SHARED MEDIA PICKER (used by upload.html, edit.html, case-studies.html) ── */
let _mediaPickerCallback = null;
function openSharedMediaPicker(callback, typeFilter) {
  _mediaPickerCallback = callback;
  const overlay = document.getElementById('shared-media-picker');
  if (!overlay) return;
  renderSharedPickerGrid(typeFilter || 'all');
  overlay.classList.add('open');
  const search = document.getElementById('smp-search');
  if (search) {
    search.value = '';
    search.oninput = () => renderSharedPickerGrid(typeFilter || 'all');
  }
}
function closeSharedMediaPicker() {
  const overlay = document.getElementById('shared-media-picker');
  if (overlay) overlay.classList.remove('open');
  _mediaPickerCallback = null;
}
function renderSharedPickerGrid(typeFilter) {
  const q = (document.getElementById('smp-search')?.value || '').toLowerCase();
  let items = DB.getMedia();
  if (typeFilter === 'image') items = items.filter(m => m.type === 'image' || m.type === 'gif');
  if (q) items = items.filter(m => (m.name || '').toLowerCase().includes(q));
  const grid = document.getElementById('smp-grid');
  const empty = document.getElementById('smp-empty');
  if (!grid) return;
  if (!items.length) { grid.innerHTML = ''; grid.style.display = 'none'; if (empty) empty.style.display = 'block'; return; }
  if (empty) empty.style.display = 'none';
  grid.style.display = '';
  grid.innerHTML = items.map(m => {
    const thumb = m.type === 'video'
      ? `<video src="${m.src}" muted style="width:100%;height:100%;object-fit:cover;pointer-events:none"></video>`
      : `<img src="${m.src}" alt="${m.name||''}" style="width:100%;height:100%;object-fit:cover">`;
    return `<div onclick="selectSharedMedia('${m.id}')" title="${m.name||''}" style="cursor:pointer;border-radius:8px;overflow:hidden;aspect-ratio:1;background:#111;border:2px solid transparent;transition:border-color .15s" onmouseover="this.style.borderColor='#3b82f6'" onmouseout="this.style.borderColor='transparent'">${thumb}</div>`;
  }).join('');
}
function selectSharedMedia(id) {
  const m = DB.getMediaItem(id);
  if (!m || !_mediaPickerCallback) return;
  _mediaPickerCallback(m);
  closeSharedMediaPicker();
}
window.openSharedMediaPicker  = openSharedMediaPicker;
window.closeSharedMediaPicker = closeSharedMediaPicker;
window.selectSharedMedia      = selectSharedMedia;
window.renderSharedPickerGrid = renderSharedPickerGrid;

/* ── AUTH STATE — main entry point ── */
/* Use DOM presence instead of URL string matching — works regardless of how Hostinger serves the URL */
const IS_LOGIN_PAGE = !!document.getElementById('login-form');

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    if (!IS_LOGIN_PAGE) {
      const base = window.location.pathname.replace(/\/(?!.*\/).*$/, '/');
      window.location.href = base + 'index.html';
    }
    return;
  }

  Auth.currentUser = user;

  if (IS_LOGIN_PAGE) {
    /* Use absolute path so redirect works regardless of trailing-slash URL variants */
    const base = window.location.pathname.replace(/\/?(?:index\.html)?$/, '/');
    window.location.href = base + 'dashboard.html';
    return;
  }

  /* Sync Firestore → localStorage cache */
  await syncFromFirebase();

  /* Setup sidebar */
  initSidebar();

  /* Trigger page-specific init */
  if (typeof window.initPage === 'function') {
    window.initPage();
  }
});
