'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// This is a singleton to ensure we only initialize Firebase once.
let firebaseApp: FirebaseApp | null = null;

function initializeFirebase() {
  // Read config at the time of function call
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID
  };

  const isConfigured = !!firebaseConfig.projectId;

  if (!isConfigured) {
    console.warn("Firebase is not configured. Please update .env with your project credentials. Document features will be disabled.");
    return { app: null, storage: null, isConfigured: false };
  }
  
  if (!firebaseApp) {
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  }
  
  const storage = getStorage(firebaseApp);
  
  return { app: firebaseApp, storage, isConfigured: true };
}

export { initializeFirebase };