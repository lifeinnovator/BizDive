import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const getCleanEnv = (val: string | undefined) => {
  return val ? val.trim() : undefined;
};

const firebaseConfig = {
  apiKey: getCleanEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY) || "dummy-api-key",
  authDomain: getCleanEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN) || "dummy-project.firebaseapp.com",
  projectId: getCleanEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID) || "dummy-project",
  storageBucket: getCleanEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET) || "dummy-project.appspot.com",
  messagingSenderId: getCleanEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID) || "1234567890",
  appId: getCleanEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID) || "1:1234567890:web:1234567890",
  measurementId: getCleanEnv(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || process.env.VITE_FIREBASE_MEASUREMENT_ID),
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
