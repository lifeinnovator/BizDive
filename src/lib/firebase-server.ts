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
        const credentials = require(resolvedPath);
        admin.initializeApp({
          credential: admin.credential.cert(credentials),
        });
      } else {
        admin.initializeApp();
      }
    }
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
