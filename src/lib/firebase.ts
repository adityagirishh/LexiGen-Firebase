
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

function initializeFirebase(): { app: FirebaseApp | null; storage: FirebaseStorage | null; isConfigured: boolean } {
    // This check ensures this code only runs on the client-side
    if (typeof window === 'undefined') {
        return { app: null, storage: null, isConfigured: false };
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

    const isConfigured = !!firebaseConfig.projectId;
    if (!isConfigured) {
        console.warn("Firebase is not configured. Please update .env and restart the application.");
        return { app: null, storage: null, isConfigured: false };
    }

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const storage = getStorage(app);

    return { app, storage, isConfigured };
}

export { initializeFirebase };
