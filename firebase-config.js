

/* Firebase CDN module imports — no npm required */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth }       from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore }  from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getStorage }    from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCVP0l30IPY6YZ8QCd84bs8Eluhm4WS2hU",
  authDomain: "ritesh-portfolio-b76c9.firebaseapp.com",
  projectId: "ritesh-portfolio-b76c9",
  storageBucket: "ritesh-portfolio-b76c9.firebasestorage.app",
  messagingSenderId: "508723844443",
  appId: "1:508723844443:web:d2556a5cdecdea52bb367e",
  measurementId: "G-XDCRJMBBBT"
};

const app = initializeApp(firebaseConfig);

/* Exported services used by admin/admin.js and portfolio.js */
export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);
