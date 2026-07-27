import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAHg0MlK5e0SAvocMuhi2Qi7Hq6y5AYn_w',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'siramix-2e1d7.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'siramix-2e1d7',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'siramix-2e1d7.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '541912241821',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:541912241821:web:c812fac1b5cd18a773a674',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

const app = getApps().length > 0
  ? getApp()
  : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
