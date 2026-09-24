// ================================================================
// ARVEXA AUTH — Session helpers + guard anti-flash
// ================================================================

import { auth } from './arvexa-firebase.js';

const SESSION_KEY = 'arvexa_session';
const USER_DATA_KEY = 'arvexa_user_data';
const LAST_UID_KEY = 'arvexa_last_uid';
const READ_KEY = 'arvexa_read_parts';

// ================================================================
// SESSION CACHE
// ================================================================
export function saveSession(user) {
  if (!user) return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      uid: user.uid,
      email: user.email,
      lastActive: Date.now()
    }));
    localStorage.setItem(LAST_UID_KEY, user.uid);
  } catch (e) {}
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(LAST_UID_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  } catch (e) {}
}

export function getCachedUserData(uid) {
  try {
    const raw = localStorage.getItem(USER_DATA_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (cached._uid && cached._uid !== uid) {
      localStorage.removeItem(USER_DATA_KEY);
      return null;
    }
    return cached;
  } catch (e) { return null; }
}

export function saveUserDataToCache(data, uid) {
  try {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify({
      ...data,
      _uid: uid,
      _cachedAt: Date.now()
    }));
  } catch (e) {}
}

// ================================================================
// HELPERS
// ================================================================
export function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  if (value.seconds !== undefined) return new Date(value.seconds * 1000);
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isUserPremium(userData) {
  if (!userData) return false;
  const hasStatus = userData.premium === true ||
                    userData.isUnlocked === true ||
                    userData.hasDeposited === true;
  if (!hasStatus) return false;
  const endDate = toDate(userData.subscriptionEndDate);
  if (!endDate) return true;
  return endDate.getTime() > Date.now();
}

export function getReadParts() {
  try { return JSON.parse(localStorage.getItem(READ_KEY) || '[]'); }
  catch (e) { return []; }
}

// ================================================================
// AUTH GUARD ANTI-FLASH
// ================================================================
export function authGuard(onAuthenticated, options = {}) {
  const {
    redirectOnNoUser = 'login.html',
    useAuthChoice = false,
    maxWaitMs = 5000,
    graceMs = 600
  } = options;

  // Cacher la page tant qu'on n'est pas sûr
  document.documentElement.classList.add('arv-auth-checking');
  document.documentElement.classList.remove('arv-auth-ready');

  let isRedirecting = false;
  let isAuthResolved = false;
  let currentUid = null;
  let graceTimer = null;
  let maxTimer = null;

  function revealPage() {
    document.documentElement.classList.remove('arv-auth-checking');
    document.documentElement.classList.add('arv-auth-ready');
  }

  function redirectToLogin() {
    if (isRedirecting) return;
    isRedirecting = true;
    try {
      sessionStorage.setItem('redirectAfterLogin',
        window.location.pathname + window.location.search);
      if (useAuthChoice) {
        sessionStorage.setItem('redirectAfterAuth',
          window.location.pathname + window.location.search);
      }
    } catch (e) {}
    const target = useAuthChoice ? 'auth-choice.html' : redirectOnNoUser;
    window.location.replace(target);
  }

  auth.onAuthStateChanged(async (user) => {
    if (isAuthResolved) {
      if (user && user.uid !== currentUid) {
        currentUid = user.uid;
        saveSession(user);
        const cached = getCachedUserData(user.uid);
        await onAuthenticated(user, cached);
        revealPage();
      } else if (!user && currentUid) {
        currentUid = null;
        clearSession();
        redirectToLogin();
      }
      return;
    }

    if (!user) {
      if (graceTimer) clearTimeout(graceTimer);
      graceTimer = setTimeout(() => {
        if (isAuthResolved) return;
        if (auth.currentUser) return;

        const hasSession = localStorage.getItem(SESSION_KEY);
        const hasUserData = localStorage.getItem(USER_DATA_KEY);

        if ((hasSession || hasUserData) && !navigator.onLine) {
          setTimeout(() => {
            if (auth.currentUser) return;
            if (!isAuthResolved) redirectToLogin();
          }, 1500);
          return;
        }

        if (hasSession && hasUserData) {
          setTimeout(() => {
            if (auth.currentUser) return;
            if (!isAuthResolved) redirectToLogin();
          }, 1500);
          return;
        }

        redirectToLogin();
      }, graceMs);
      return;
    }

    if (graceTimer) { clearTimeout(graceTimer); graceTimer = null; }
    if (maxTimer) { clearTimeout(maxTimer); maxTimer = null; }

    isAuthResolved = true;
    currentUid = user.uid;
    saveSession(user);
    const cached = getCachedUserData(user.uid);
    await onAuthenticated(user, cached);
    revealPage();
  });

  maxTimer = setTimeout(() => {
    if (isAuthResolved) return;
    if (auth.currentUser) {
      isAuthResolved = true;
      currentUid = auth.currentUser.uid;
      saveSession(auth.currentUser);
      const cached = getCachedUserData(auth.currentUser.uid);
      Promise.resolve(onAuthenticated(auth.currentUser, cached)).then(revealPage);
    } else {
      redirectToLogin();
    }
  }, maxWaitMs);
}