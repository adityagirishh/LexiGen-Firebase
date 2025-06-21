// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "G-XXXXXXXXXX"
};

let app: FirebaseApp;
let storage: FirebaseStorage;

// Initialize Firebase only if the configuration has been changed from the placeholder.
// This prevents the server from crashing with invalid credentials.
if (firebaseConfig.projectId !== "your-project-id") {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    storage = getStorage(app);
} else {
    console.warn("Firebase is not configured. Please update src/lib/firebase.ts with your project credentials. Document features will be disabled.");
    app = {} as FirebaseApp;
    storage = {} as FirebaseStorage;
}

export { app, storage };
