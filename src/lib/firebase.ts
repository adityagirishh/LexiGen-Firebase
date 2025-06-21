'use client';

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// This object will hold the initialized Firebase instance.
// It's defined outside the function to act as a singleton cache.
let firebaseInstance: { app: FirebaseApp; storage: FirebaseStorage } | null = null;

function initializeFirebase(): { app: FirebaseApp | null; storage: FirebaseStorage | null; isConfigured: boolean } {
    // Guard clause to ensure this code never runs on the server.
    if (typeof window === 'undefined') {
        return { app: null, storage: null, isConfigured: false };
    }

    // If we've already initialized, return the cached instance.
    if (firebaseInstance) {
        return { ...firebaseInstance, isConfigured: true };
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

    // Check for missing configuration keys.
    const missingKeys = Object.entries(firebaseConfig)
      .filter(([key, value]) => !value && key !== 'measurementId' && key !== 'authDomain' )
      .map(([key]) => `NEXT_PUBLIC_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`);

    if (missingKeys.length > 0) {
        console.error(
            `Firebase configuration is incomplete. The following environment variables are missing: ${missingKeys.join(', ')}. Please check your .env file and RESTART the server.`
        );
        return { app: null, storage: null, isConfigured: false };
    }

    try {
        // Use the standard Firebase pattern for initialization.
        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const storage = getStorage(app);

        // Cache the initialized instance.
        firebaseInstance = { app, storage };

        return { app, storage, isConfigured: true };
    } catch (error) {
        console.error("An unexpected error occurred during Firebase initialization:", error);
        return { app: null, storage: null, isConfigured: false };
    }
}

export { initializeFirebase };
