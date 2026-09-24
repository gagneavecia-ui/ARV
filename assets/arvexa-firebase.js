// ================================================================
// ARVEXA FIREBASE — Instance partagée (idempotente)
// Import : import { app, auth, db } from './assets/arvexa-firebase.js';
// ================================================================

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyDHscOXw3rLuhV6z1Cny-bdYCumqpnG7QE",
  authDomain: "arvexa-fbf10.firebaseapp.com",
  projectId: "arvexa-fbf10",
  storageBucket: "arvexa-fbf10.firebasestorage.app",
  messagingSenderId: "920108330053",
  appId: "1:920108330053:web:f532d71cbc2c824bc7472c"
};

// Idempotent : réutilise l'app si déjà initialisée
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager()
  })
});

// Persistence auth (fire & forget)
setPersistence(auth, browserLocalPersistence).catch(() => {});

console.log('[ARVEXA] Firebase core ready');