import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  Firestore,
  serverTimestamp
} from 'firebase/firestore';
import { AppState } from '../types';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const FIREBASE_CONFIG_STORAGE_KEY = 'mealcraft_firebase_custom_config';

// Load stored config or environment config
export function getFirebaseConfig(): FirebaseConfig {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.apiKey && parsed.projectId) {
          return parsed;
        }
      }
    } catch {
      // Ignore JSON parse error
    }
  }

  return {
    apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || '',
    authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || 'mealcraft-app-b3ec5.firebaseapp.com',
    projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || 'mealcraft-app-b3ec5',
    storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || 'mealcraft-app-b3ec5.firebasestorage.app',
    messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || '',
  };
}

export function saveCustomFirebaseConfig(config: FirebaseConfig): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
  }
}

export function isFirebaseConfigured(config?: FirebaseConfig): boolean {
  const c = config || getFirebaseConfig();
  return Boolean(c.apiKey && c.projectId && c.apiKey.length > 10);
}

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firestoreDb: Firestore | null = null;

export function initFirebase(customConfig?: FirebaseConfig): {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
} {
  const config = customConfig || getFirebaseConfig();

  if (!isFirebaseConfigured(config)) {
    return { app: null, auth: null, db: null };
  }

  try {
    if (!getApps().length) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApp();
    }
    firebaseAuth = getAuth(firebaseApp);
    firestoreDb = getFirestore(firebaseApp);
    return { app: firebaseApp, auth: firebaseAuth, db: firestoreDb };
  } catch (err) {
    console.error('[Firebase] Initialization error:', err);
    return { app: null, auth: null, db: null };
  }
}

// Initial attempt
initFirebase();

export { firebaseAuth as auth, firestoreDb as db };

// Auth helpers
export async function signUpWithEmail(email: string, pass: string): Promise<User> {
  const { auth: currentAuth } = initFirebase();
  if (!currentAuth) throw new Error('Firebase is not configured yet. Please configure your Firebase keys.');
  const cred = await createUserWithEmailAndPassword(currentAuth, email, pass);
  return cred.user;
}

export async function signInWithEmail(email: string, pass: string): Promise<User> {
  const { auth: currentAuth } = initFirebase();
  if (!currentAuth) throw new Error('Firebase is not configured yet. Please configure your Firebase keys.');
  const cred = await signInWithEmailAndPassword(currentAuth, email, pass);
  return cred.user;
}

export async function signOutUser(): Promise<void> {
  const { auth: currentAuth } = initFirebase();
  if (!currentAuth) return;
  await signOut(currentAuth);
}

export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
  const { auth: currentAuth } = initFirebase();
  if (!currentAuth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(currentAuth, callback);
}

// Firestore Sync helpers
export async function saveUserDataToCloud(userId: string, state: AppState): Promise<void> {
  const { db: currentDb } = initFirebase();
  if (!currentDb || !userId) return;

  try {
    const userDocRef = doc(currentDb, 'users', userId);

    // Sanitize heavy base64 strings if necessary to keep Firestore docs performant (<1MB limit)
    const sanitizedState = {
      ...state,
      lastUpdated: new Date().toISOString(),
      updatedAtServer: serverTimestamp(),
      bloodReports: (state.bloodReports || []).map(r => ({
        ...r,
        // If fileData is massive (>500KB), keep metadata in cloud and file on device
        fileData: (r.fileData && r.fileData.length > 500000) ? undefined : r.fileData,
      }))
    };

    await setDoc(userDocRef, sanitizedState, { merge: true });
  } catch (err) {
    console.warn('[Firebase Sync] Save to cloud warning:', err);
  }
}

export async function fetchUserDataFromCloud(userId: string): Promise<Partial<AppState> | null> {
  const { db: currentDb } = initFirebase();
  if (!currentDb || !userId) return null;

  try {
    const userDocRef = doc(currentDb, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as Partial<AppState>;
    }
  } catch (err) {
    console.error('[Firebase Sync] Error fetching cloud data:', err);
  }
  return null;
}

export function subscribeToCloudUserData(
  userId: string,
  onUpdate: (data: Partial<AppState>) => void
): () => void {
  const { db: currentDb } = initFirebase();
  if (!currentDb || !userId) return () => {};

  try {
    const userDocRef = doc(currentDb, 'users', userId);
    return onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<AppState>;
          onUpdate(data);
        }
      },
      (err) => {
        console.warn('[Firebase Sync] Snapshot listener warning:', err);
      }
    );
  } catch (err) {
    console.warn('[Firebase Sync] Error setting up snapshot listener:', err);
    return () => {};
  }
}
