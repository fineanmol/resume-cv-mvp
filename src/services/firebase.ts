import { initializeApp, getApp, getApps } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import type { Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";

const safeLocalGet = (key: string): string => {
  try {
    return (typeof window !== 'undefined' && window.localStorage?.getItem(key)) || "";
  } catch {
    return "";
  }
};

// Fetch configurations from environment variables or LocalStorage
export const getFirebaseConfig = () => {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || safeLocalGet("FIREBASE_API_KEY"),
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || safeLocalGet("FIREBASE_AUTH_DOMAIN"),
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || safeLocalGet("FIREBASE_PROJECT_ID"),
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || safeLocalGet("FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || safeLocalGet("FIREBASE_MESSAGING_SENDER_ID"),
    appId: import.meta.env.VITE_FIREBASE_APP_ID || safeLocalGet("FIREBASE_APP_ID"),
  };
};

const config = getFirebaseConfig();
export const isConfigured = !!config.apiKey;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(config) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
}

export { app, auth, db };
