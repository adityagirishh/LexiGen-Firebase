'use client';

// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Your web app's Firebase configuration is read from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID
};

let app: FirebaseApp | null = null;
let storage: FirebaseStorage | null = null;
let isConfigured = false;

// This function initializes Firebase and is safe to call multiple times.
function initializeFirebase() {
    if (app) {
        return { app, storage, isConfigured };
    }

    isConfigured = !!firebaseConfig.projectId;

    if (isConfigured) {
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
        storage = getStorage(app);
    } else {
        console.warn("Firebase is not configured. Please update .env with your project credentials. Document features will be disabled.");
        // Provide mock objects to prevent app from crashing
        app = {} as FirebaseApp;
        storage = {} as FirebaseStorage;
    }
    
    return { app, storage, isConfigured };
}

export { initializeFirebase };