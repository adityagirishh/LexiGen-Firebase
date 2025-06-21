'use client';

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

let firebaseInstance: { app: FirebaseApp; storage: FirebaseStorage } | null = null;

function initializeFirebase(): { app: FirebaseApp | null; storage: FirebaseStorage | null; isConfigured: boolean } {
    if (typeof window === 'undefined') {
        return { app: null, storage: null, isConfigured: false };
    }

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
            `Firebase configuration is incomplete. The following environment variables are missing: ${missingKeys
                .map(key => `NEXT_PUBLIC_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`)
                .join(', ')}. Please check your .env file and RESTART the server.`
        );
        console.log('Current config values: ', {
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
        firebaseInstance = { app, storage };
        return { app, storage, isConfigured: true };
    } catch (error) {
        console.error("An unexpected error occurred during Firebase initialization:", error);
        return { app: null, storage: null, isConfigured: false };
    }
}

export { initializeFirebase };
