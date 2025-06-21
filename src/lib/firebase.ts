
'use client';

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// This is a safer, more robust way to initialize Firebase in a Next.js environment.
// It ensures that Firebase is initialized only once and that client-side code
// does not run on the server, which prevents server startup crashes.

let app: FirebaseApp | null = null;
let storage: FirebaseStorage | null = null;
let isConfigured = false;

function initializeFirebase() {
    // On the server, we don't initialize and return a non-configured state.
    if (typeof window === 'undefined') {
        return { app: null, storage: null, isConfigured: false };
    }

    // If already initialized, return the existing instances to avoid re-initializing.
    if (app && storage) {
        return { app, storage, isConfigured };
    }

    const envVars = {
      NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
      NEXT_PUBLIC_AUTH_DOMAIN: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
      NEXT_PUBLIC_PROJECT_ID: process.env.NEXT_PUBLIC_PROJECT_ID,
      NEXT_PUBLIC_STORAGE_BUCKET: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
      NEXT_PUBLIC_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
      NEXT_PUBLIC_APP_ID: process.env.NEXT_PUBLIC_APP_ID,
    }

    const missingVars = Object.entries(envVars)
        .filter(([, value]) => !value)
        .map(([key]) => key);


    if (missingVars.length > 0) {
        console.error(
            `[Firebase Init Error] Firebase configuration is incomplete. The following environment variables are missing: ${missingVars.join(
                ', '
            )}. Please add them to your .env file and RESTART the development server.`
        );
        isConfigured = false;
        return { app: null, storage: null, isConfigured: false };
    }

    const firebaseConfig = {
        apiKey: envVars.NEXT_PUBLIC_API_KEY,
        authDomain: envVars.NEXT_PUBLIC_AUTH_DOMAIN,
        projectId: envVars.NEXT_PUBLIC_PROJECT_ID,
        storageBucket: envVars.NEXT_PUBLIC_STORAGE_BUCKET,
        messagingSenderId: envVars.NEXT_PUBLIC_MESSAGING_SENDER_ID,
        appId: envVars.NEXT_PUBLIC_APP_ID,
    };

    try {
        // Use getApps() and getApp() to prevent re-initialization on hot reloads.
        const initializedApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        
        // Assign to our module-level variables to act as a singleton.
        app = initializedApp;
        storage = getStorage(app);
        isConfigured = true;

        return { app, storage, isConfigured };
    } catch (error) {
        console.error("[Firebase Init Error] An unexpected error occurred during Firebase initialization:", error);
        isConfigured = false;
        return { app: null, storage: null, isConfigured: false };
    }
}

export { initializeFirebase };
