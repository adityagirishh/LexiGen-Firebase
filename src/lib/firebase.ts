'use client';

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Module-level cache for the Firebase instances
let app: FirebaseApp | null = null;
let storage: FirebaseStorage | null = null;
let isConfigured = false;

/**
 * Initializes Firebase on the client-side if not already done.
 * This function is safe to call multiple times.
 * @returns An object containing the Firebase app, storage instance, and configuration status.
 */
function initializeFirebase(): { app: FirebaseApp | null; storage: FirebaseStorage | null; isConfigured: boolean } {
    // This function is intended for the client, so do nothing on the server.
    if (typeof window === 'undefined') {
        return { app: null, storage: null, isConfigured: false };
    }

    // If we've already initialized, return the cached instances.
    if (app && storage) {
        return { app, storage, isConfigured: true };
    }

    const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
    };

    // Check if all necessary environment variables are loaded.
    const configComplete =
      firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.storageBucket &&
      firebaseConfig.messagingSenderId &&
      firebaseConfig.appId;

    if (!configComplete) {
        console.warn("Firebase configuration is incomplete. Please check all NEXT_PUBLIC_ variables in your .env file. If you've just added them, you MUST RESTART the development server.");
        isConfigured = false;
        return { app: null, storage: null, isConfigured: false };
    }

    try {
        // Initialize the app (or get the existing one)
        const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        
        // Cache the instances
        app = firebaseApp;
        storage = getStorage(app);
        isConfigured = true;

        return { app, storage, isConfigured: true };
    } catch (error) {
        console.error("Error initializing Firebase:", error);
        isConfigured = false;
        return { app: null, storage: null, isConfigured: false };
    }
}

export { initializeFirebase };
