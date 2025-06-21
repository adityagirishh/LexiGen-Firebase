import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

function initializeFirebase(): { app: FirebaseApp | null; storage: FirebaseStorage | null; isConfigured: boolean } {
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

    const isConfigured =
      firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.storageBucket &&
      firebaseConfig.messagingSenderId &&
      firebaseConfig.appId;

    if (!isConfigured) {
        console.warn("Firebase configuration is incomplete. Please check all NEXT_PUBLIC_ variables in your .env file and restart the development server.");
        return { app: null, storage: null, isConfigured: false };
    }

    try {
        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const storage = getStorage(app);
        return { app, storage, isConfigured: true };
    } catch (error) {
        console.error("Error initializing Firebase:", error);
        return { app: null, storage: null, isConfigured: false };
    }
}

export { initializeFirebase };
