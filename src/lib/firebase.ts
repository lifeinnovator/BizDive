import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const getCleanEnv = (key: string) => {
  const val = process.env[`NEXT_PUBLIC_${key}`] || process.env[`VITE_${key}`];
  return val ? val.trim() : undefined;
};

const firebaseConfig = {
  apiKey: getCleanEnv('FIREBASE_API_KEY') || "dummy-api-key",
  authDomain: getCleanEnv('FIREBASE_AUTH_DOMAIN') || "dummy-project.firebaseapp.com",
  projectId: getCleanEnv('FIREBASE_PROJECT_ID') || "dummy-project",
  storageBucket: getCleanEnv('FIREBASE_STORAGE_BUCKET') || "dummy-project.appspot.com",
  messagingSenderId: getCleanEnv('FIREBASE_MESSAGING_SENDER_ID') || "1234567890",
  appId: getCleanEnv('FIREBASE_APP_ID') || "1:1234567890:web:1234567890",
  measurementId: getCleanEnv('FIREBASE_MEASUREMENT_ID'),
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
