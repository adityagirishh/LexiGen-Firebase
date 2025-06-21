
'use client';

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// This is the idiomatic way to handle Firebase initialization in Next.js
// to avoid re-initializing the app on every hot reload.
function initializeFirebase(): { app: FirebaseApp | null; storage: FirebaseStorage | null; isConfigured: boolean } {
    if (typeof window === 'undefined') {
        // On the server, we don't want to initialize the client SDK.
        return { app: null, storage: null, isConfigured: false };
    }

    const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_APP_ID,
    };

    const requiredKeys: (keyof typeof firebaseConfig)[] = [
        'apiKey',
        'authDomain',
        'projectId',
        'storageBucket',
        'messagingSenderId',
        'appId',
    ];

    const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

    if (missingKeys.length > 0) {
        console.error(
            `[Firebase Init Error] Firebase configuration is incomplete because the following environment variables are missing: ${missingKeys.join(
                ', '
            )}. Please ensure they are correctly set in your .env file and that you have RESTARTED the development server.`
        );
         console.log('[Firebase Init] Current config values loaded by the browser:', {
             apiKey: process.env.NEXT_PUBLIC_API_KEY ? 'Loaded' : 'Missing',
             authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN ? 'Loaded' : 'Missing',
             projectId: process.env.NEXT_PUBLIC_PROJECT_ID ? 'Loaded' : 'Missing',
             storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET ? 'Loaded' : 'Missing',
             messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID ? 'Loaded' : 'Missing',
             appId: process.env.NEXT_PUBLIC_APP_ID ? 'Loaded' : 'Missing',
        });
        return { app: null, storage: null, isConfigured: false };
    }

    try {
        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const storage = getStorage(app);
        return { app, storage, isConfigured: true };
    } catch (error) {
        console.error("[Firebase Init Error] An unexpected error occurred during Firebase initialization:", error);
        return { app: null, storage: null, isConfigured: false };
    }
}

export { initializeFirebase };
