/* Firebase public sync — loads published data into localStorage for portfolio.js */
import { db } from './firebase-config.js';
import { collection, getDocs, query, where, orderBy } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

async function syncPublicData() {
  try {
    /* Fetch published projects */
    const projSnap = await getDocs(collection(db, 'projects'));
    if (!projSnap.empty) {
      const projects = projSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      localStorage.setItem('rk_projects', JSON.stringify(projects));
    }

    /* Fetch published case studies */
    const csSnap = await getDocs(collection(db, 'case_studies'));
    if (!csSnap.empty) {
      const caseStudies = csSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      localStorage.setItem('rk_case_studies', JSON.stringify(caseStudies));
    }

    /* Fetch settings (for section order etc.) */
    const settSnap = await getDocs(collection(db, 'settings'));
    if (!settSnap.empty) {
      const settDoc = settSnap.docs[0];
      localStorage.setItem('rk_settings', JSON.stringify(settDoc.data()));
    }

    /* Re-trigger portfolio rendering after Firestore data is in localStorage */
    if (typeof window.renderCaseStudyCards === 'function') {
      window.renderCaseStudyCards();
    }
    if (typeof window.resyncAdminProjects === 'function') {
      window.resyncAdminProjects();
    } else if (typeof window.integrateAdminProjects === 'function') {
      window.integrateAdminProjects();
    }
  } catch (e) {
    /* Firestore unavailable — localStorage cache used as fallback */
    console.warn('Public Firebase sync failed, using cached data:', e.message);
  }
}

/* Run after DOM is ready so portfolio.js init has already fired */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', syncPublicData);
} else {
  syncPublicData();
}
