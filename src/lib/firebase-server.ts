import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccountKeyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (serviceAccountKeyJson) {
      const credentials = JSON.parse(serviceAccountKeyJson);
      admin.initializeApp({
        credential: admin.credential.cert(credentials),
      });
    } else {
      // Fallback to local file
      const fs = require('fs');
      const path = require('path');
      const resolvedPath = path.resolve(process.cwd(), 'firebase-service-account.json');
      if (fs.existsSync(resolvedPath)) {
        const credentials = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
        admin.initializeApp({
          credential: admin.credential.cert(credentials),
        });
      } else {
        console.warn('Firebase Admin: No credentials found (FIREBASE_SERVICE_ACCOUNT_KEY or local JSON). Skipping initialization.');
      }
    }
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null as any;
export const adminDb = admin.apps.length ? admin.firestore() : null as any;
