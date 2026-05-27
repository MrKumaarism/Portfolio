=============================================
  HOSTINGER UPLOAD — QUICK START GUIDE
=============================================

STEP 1 — FILL IN YOUR FIREBASE CONFIG
--------------------------------------
Open firebase-config.js and replace all [PASTE_*] placeholders with
your actual Firebase project values (from Firebase Console → Project Settings).


STEP 2 — ENABLE FIREBASE SERVICES
-----------------------------------
In Firebase Console (https://console.firebase.google.com):

a) Authentication
   - Go to Authentication → Sign-in method
   - Enable Email/Password
   - Add your live domain to Authorized Domains (e.g. yourdomain.com)
   - Create your admin user under Authentication → Users

b) Firestore Database
   - Go to Firestore Database → Create database
   - Start in production mode
   - Paste the Firestore rules from firebase-rules.txt → Rules tab

c) Firebase Storage
   - Go to Storage → Get started
   - Paste the Storage rules from firebase-rules.txt → Rules tab


STEP 3 — UPLOAD TO HOSTINGER
------------------------------
1. Log in to Hostinger → File Manager → public_html
2. Upload EVERYTHING inside this project folder into public_html/
   Do NOT create an extra subfolder — files should be at the root of public_html
3. Ensure this structure in public_html/:
   public_html/
   ├── index.html
   ├── portfolio.css
   ├── portfolio.js
   ├── firebase-config.js
   ├── pages/
   └── admin/


STEP 4 — TEST
--------------
  https://yourdomain.com/                   → Portfolio homepage
  https://yourdomain.com/admin/             → Admin login page
  https://yourdomain.com/admin/dashboard.html → Admin dashboard (after login)


NOTES
------
- Do NOT upload firebase-rules.txt or README-HOSTINGER-UPLOAD.txt (these are for your reference only)
- All media uploads go to Firebase Storage — nothing is stored on Hostinger disk
- Portfolio data is served from Firestore in real-time
- The admin uses Firebase Email/Password authentication
