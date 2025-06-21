'use client';

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

let app: FirebaseApp | null = null;
let storage: FirebaseStorage | null = null;

function initializeFirebase(): { app: FirebaseApp | null; storage: FirebaseStorage | null; isConfigured: boolean } {
    if (typeof window === 'undefined') {
        return { app: null, storage: null, isConfigured: false };
    }

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

    console.log("Attempting to initialize Firebase with the following config (check for undefined values):", {
        apiKey: firebaseConfig.apiKey ? 'loaded' : undefined,
        authDomain: firebaseConfig.authDomain,
        projectId: firebaseConfig.projectId,
        storageBucket: firebaseConfig.storageBucket,
        messagingSenderId: firebaseConfig.messagingSenderId,
        appId: firebaseConfig.appId,
    });

    const missingKeys = Object.entries(firebaseConfig)
      .filter(([key, value]) => !value && key !== 'measurementId' && key !== 'authDomain' ) 
      .map(([key]) => `NEXT_PUBLIC_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`);

    if (missingKeys.length > 0) {
        console.error(`Firebase configuration is incomplete. The following environment variables are missing or undefined: ${missingKeys.join(', ')}. Please check your .env file and ensure the development server has been RESTARTED since the last change.`);
        return { app: null, storage: null, isConfigured: false };
    }

    try {
        app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        storage = getStorage(app);
        console.log("Firebase initialized successfully.");
        return { app, storage, isConfigured: true };
    } catch (error) {
        console.error("An unexpected error occurred during Firebase initialization:", error);
        return { app: null, storage: null, isConfigured: false };
    }
}

export { initializeFirebase };
